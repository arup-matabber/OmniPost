import { format } from "date-fns";
import { FaInstagram, FaTwitter, FaLinkedin, FaFacebook, FaYoutube, FaTiktok } from 'react-icons/fa';
import { Badge } from "@/components/ui/badge";

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  instagram: <FaInstagram className="text-pink-500" />,
  twitter: <FaTwitter className="text-blue-400" />,
  linkedin: <FaLinkedin className="text-blue-700" />,
  facebook: <FaFacebook className="text-blue-600" />,
  youtube: <FaYoutube className="text-red-600" />,
  tiktok: <FaTiktok className="text-black dark:text-white" />
};

export function PostCard({ post }: { post: any }) {
  const isScheduled = post.status === 'scheduled';
  
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:shadow-md transition-all duration-300 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex gap-2">
          {post.platformTargets?.map((p: string) => (
            <span key={p} className="text-lg" title={p}>
              {PLATFORM_ICONS[p] || <span className="text-xs uppercase bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{p}</span>}
            </span>
          ))}
        </div>
        <Badge variant={post.status === 'published' || post.status === 'posted' ? 'default' : post.status === 'draft' ? 'secondary' : 'outline'}>
          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
        </Badge>
      </div>
      
      <p className="text-zinc-700 dark:text-zinc-300 line-clamp-3 text-sm">
        {post.content || <span className="italic text-zinc-400">Media only post...</span>}
      </p>

      <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
        <span>
          {isScheduled ? 'Scheduled for ' : 'Created '}
          {format(new Date(isScheduled && post.scheduledAt ? post.scheduledAt : post.createdAt), 'MMM d, yyyy h:mm a')}
        </span>
        {post.mediaUrls?.length > 0 && (
          <span>{post.mediaUrls.length} media file(s)</span>
        )}
      </div>
    </div>
  );
}
