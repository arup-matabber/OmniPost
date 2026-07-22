import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { OAUTH_CONFIGS, Platform, getRedirectUri } from "@/lib/social/oauth-config";
import { checkPlanLimit } from "@/lib/billing/checkPlanLimit";

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function generateCodeChallenge(verifier: string) {
  return crypto.createHash('sha256').update(verifier).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platform } = await params;

  try {
    const limitCheck = await checkPlanLimit(userId, 'accounts');
    if (!limitCheck.allowed) {
      return NextResponse.redirect(new URL(`/dashboard?error=plan_limit_reached&reason=accounts`, req.nextUrl.origin));
    }
  } catch (error) {
    console.error("Billing limit check failed:", error);
    return NextResponse.json({ error: "Internal error checking billing status" }, { status: 500 });
  }
  
  if (!OAUTH_CONFIGS[platform as Platform]) {
    return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
  }

  const config = OAUTH_CONFIGS[platform as Platform];
  const clientId = config.clientId;

  const redirectUri = getRedirectUri(platform as Platform);

  if (!clientId) {
    const mockRedirectUrl = `${redirectUri}?code=mock_code_for_dev_mode&state=mock_state`;
    return NextResponse.redirect(mockRedirectUrl);
  }

  const state = crypto.randomBytes(16).toString("hex");

  const authUrl = new URL(config.authUrl);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("redirect_uri", redirectUri);
  // Strictly join scopes by space character
  authUrl.searchParams.append("scope", config.scopes.join(" "));
  authUrl.searchParams.append("state", state);
  
  if (platform === "youtube") {
    authUrl.searchParams.append("access_type", "offline");
    authUrl.searchParams.append("prompt", "consent");
  } else if (platform === "twitter") {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    const cookieStore = await cookies();
    
    cookieStore.set('twitter_oauth_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10 
    });
    cookieStore.set('twitter_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10
    });

    authUrl.searchParams.append("code_challenge", codeChallenge);
    authUrl.searchParams.append("code_challenge_method", "s256");
  }

  return NextResponse.redirect(authUrl.toString());
}
