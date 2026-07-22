import { PostCard } from "./PostCard";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PostsList({ posts, emptyMessage }: { posts: any[], emptyMessage?: string }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full mb-4">
          <PlusCircle className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">No posts found</h3>
        <p className="text-zinc-500 text-center max-w-sm mb-6">
          {emptyMessage || "You don't have any posts in this category yet. Create one to get started."}
        </p>
        <Link href="/compose">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Create Post
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
