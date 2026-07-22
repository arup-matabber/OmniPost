"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostsList } from "./PostsList";
import { Loader2 } from "lucide-react";

function PostsDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get('status') || 'all';

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/posts?status=${currentTab}`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts);
        }
      } catch (err) {
        console.error("Failed to fetch posts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [currentTab]);

  const handleTabChange = (val: string) => {
    router.push(`?status=${val}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Posts</h1>
          <p className="text-zinc-500 mt-1">Manage and track all your social media content.</p>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="posted">Posted</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <>
            <TabsContent value="all" className="mt-0">
              <PostsList posts={posts} />
            </TabsContent>
            <TabsContent value="draft" className="mt-0">
              <PostsList posts={posts} emptyMessage="You don't have any drafts currently." />
            </TabsContent>
            <TabsContent value="posted" className="mt-0">
              <PostsList posts={posts} emptyMessage="You haven't posted anything yet." />
            </TabsContent>
            <TabsContent value="scheduled" className="mt-0">
              <PostsList posts={posts} emptyMessage="No posts are currently scheduled. Get ahead by scheduling your next post." />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>}>
      <PostsDashboard />
    </Suspense>
  );
}
