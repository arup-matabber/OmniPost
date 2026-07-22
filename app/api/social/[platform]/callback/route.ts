import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { socialAccounts } from "@/lib/db/schema";
import { encryptToken } from "@/lib/encryption";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { Platform, getRedirectUri } from "@/lib/social/oauth-config";

export async function GET(req: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl.origin));
  }

  const { platform } = await params;
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const redirectUri = getRedirectUri(platform as Platform);

  if (error || !code || !state) {
    console.error(`OAuth error from ${platform}:`, error || "Missing code/state");
    return NextResponse.redirect(new URL(`/dashboard?error=${error || "invalid_oauth_response"}`, baseUrl));
  }

  try {
    if (platform === "twitter") {
      const cookieStore = await cookies();
      const savedState = cookieStore.get("twitter_oauth_state")?.value;
      const codeVerifier = cookieStore.get("twitter_oauth_verifier")?.value;

      if (!savedState || !codeVerifier) {
        console.error("Missing state or code_verifier in cookies.");
        return NextResponse.redirect(new URL("/dashboard?error=session_expired", baseUrl));
      }

      if (state !== savedState) {
        console.error("State mismatch. Potential CSRF attack.");
        return NextResponse.redirect(new URL("/dashboard?error=csrf_detected", baseUrl));
      }

      const clientId = process.env.TWITTER_CLIENT_ID;
      const clientSecret = process.env.TWITTER_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error("Missing Twitter OAuth credentials in environment variables.");
      }

      // 1. Exchange code for tokens
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${basicAuth}`
        },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          client_id: clientId,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier
        })
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("Twitter token exchange failed:", errorText);
        throw new Error(`Token exchange failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      const refreshToken = tokenData.refresh_token;
      // expires_in is in seconds
      const expiresIn = tokenData.expires_in || 7200; 

      // 2. Fetch the user's Twitter profile to get their ID and Username
      const profileResponse = await fetch("https://api.twitter.com/2/users/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error("Twitter profile fetch failed:", errorText);
        throw new Error(`Profile fetch failed: ${profileResponse.status}`);
      }

      const profileData = await profileResponse.json();
      const twitterUserId = profileData.data.id;
      const twitterUsername = profileData.data.username; // e.g., @username without the @

      // 3. Encrypt the tokens before storing
      const encryptedAccessToken = encryptToken(accessToken);
      const encryptedRefreshToken = refreshToken ? encryptToken(refreshToken) : null;
      
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // 4. Upsert the connection into the database
      const existing = await db.select().from(socialAccounts).where(
        and(
          eq(socialAccounts.userId, userId),
          eq(socialAccounts.platform, "twitter"),
          eq(socialAccounts.platformAccountId, twitterUserId)
        )
      );

      if (existing.length > 0) {
        await db.update(socialAccounts)
          .set({
            accessToken: encryptedAccessToken,
            refreshToken: encryptedRefreshToken,
            tokenExpiresAt: expiresAt,
            platformAccountName: twitterUsername,
            updatedAt: new Date()
          })
          .where(eq(socialAccounts.id, existing[0].id));
      } else {
        await db.insert(socialAccounts).values({
          userId,
          platform: "twitter",
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          tokenExpiresAt: expiresAt,
          platformAccountId: twitterUserId,
          platformAccountName: twitterUsername
        });
      }

      // Clean up the cookies
      cookieStore.delete("twitter_oauth_state");
      cookieStore.delete("twitter_oauth_verifier");

      return NextResponse.redirect(new URL("/dashboard?success=twitter_connected", baseUrl));
    } else if (platform === "youtube") {
      const clientId = process.env.YOUTUBE_CLIENT_ID;
      const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error("Missing YouTube OAuth credentials in environment variables.");
      }

      // 1. Exchange code for tokens
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri
        })
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("YouTube token exchange failed:", errorText);
        throw new Error(`Token exchange failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      const refreshToken = tokenData.refresh_token;
      const expiresIn = tokenData.expires_in || 3600;

      // 2. Fetch YouTube Channel Info
      let youtubeUserId = "";
      let youtubeUsername = "";

      const channelResponse = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (channelResponse.ok) {
        const channelData = await channelResponse.json();
        if (channelData.items && channelData.items.length > 0) {
          youtubeUserId = channelData.items[0].id;
          youtubeUsername = channelData.items[0].snippet.title;
        }
      }

      // Fallback to Google Profile if no channel is found or channel fetch failed
      if (!youtubeUserId) {
        const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!profileResponse.ok) {
          const errorText = await profileResponse.text();
          console.error("Google profile fetch failed:", errorText);
          throw new Error(`Profile fetch failed: ${profileResponse.status}`);
        }

        const profileData = await profileResponse.json();
        youtubeUserId = profileData.sub;
        youtubeUsername = profileData.name || "Unknown YouTube Account";
      }

      // 3. Encrypt the tokens before storing
      const encryptedAccessToken = encryptToken(accessToken);
      const encryptedRefreshToken = refreshToken ? encryptToken(refreshToken) : null;
      
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // 4. Upsert the connection into the database
      const existing = await db.select().from(socialAccounts).where(
        and(
          eq(socialAccounts.userId, userId),
          eq(socialAccounts.platform, "youtube"),
          eq(socialAccounts.platformAccountId, youtubeUserId)
        )
      );

      if (existing.length > 0) {
        await db.update(socialAccounts)
          .set({
            accessToken: encryptedAccessToken,
            ...(encryptedRefreshToken ? { refreshToken: encryptedRefreshToken } : {}),
            tokenExpiresAt: expiresAt,
            platformAccountName: youtubeUsername,
            updatedAt: new Date()
          })
          .where(eq(socialAccounts.id, existing[0].id));
      } else {
        await db.insert(socialAccounts).values({
          userId,
          platform: "youtube",
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          tokenExpiresAt: expiresAt,
          platformAccountId: youtubeUserId,
          platformAccountName: youtubeUsername
        });
      }

      return NextResponse.redirect(new URL("/dashboard?success=youtube_connected", baseUrl));
    }

    // --- Placeholder fallback for other platforms ---
    const mockAccessToken = `mock_access_token_${platform}_${Date.now()}`;
    const mockRefreshToken = `mock_refresh_token_${platform}_${Date.now()}`;
    const mockExpiresIn = 3600; 
    
    const encryptedAccessToken = encryptToken(mockAccessToken);
    const encryptedRefreshToken = encryptToken(mockRefreshToken);
    const expiresAt = new Date(Date.now() + mockExpiresIn * 1000);

    const mockPlatformAccountId = `id_${platform}_${Math.floor(Math.random() * 1000000)}`;
    const mockPlatformAccountName = `My ${platform.charAt(0).toUpperCase() + platform.slice(1)} Account`;

    const existing = await db.select().from(socialAccounts).where(
      and(eq(socialAccounts.userId, userId), eq(socialAccounts.platform, platform), eq(socialAccounts.platformAccountId, mockPlatformAccountId))
    );

    if (existing.length > 0) {
      await db.update(socialAccounts).set({
        accessToken: encryptedAccessToken, refreshToken: encryptedRefreshToken, tokenExpiresAt: expiresAt, platformAccountName: mockPlatformAccountName, updatedAt: new Date()
      }).where(eq(socialAccounts.id, existing[0].id));
    } else {
      await db.insert(socialAccounts).values({
        userId, platform, accessToken: encryptedAccessToken, refreshToken: encryptedRefreshToken, tokenExpiresAt: expiresAt, platformAccountId: mockPlatformAccountId, platformAccountName: mockPlatformAccountName
      });
    }

    return NextResponse.redirect(new URL("/dashboard?success=true", baseUrl));
  } catch (err) {
    console.error(`Failed to connect ${platform}:`, err);
    return NextResponse.redirect(new URL(`/dashboard?error=connection_failed`, baseUrl));
  }
}
