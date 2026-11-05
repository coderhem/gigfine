import { FaEye, FaUserFriends } from "react-icons/fa";

// "Viewed by 120 · 5 people requested a visit" — public social proof on room cards and pages.
// Zero counts are left out; nothing shows for a brand-new room.
export default function PostStats({ post, className = "" }: {
  post: { viewCount?: number | null; visitRequestCount?: number | null };
  className?: string;
}) {
  const views = post.viewCount ?? 0;
  const requests = post.visitRequestCount ?? 0;
  if (!views && !requests) return null;
  return (
    <p className={`text-xs text-gray-500 mb-0 flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      {views > 0 && (
        <span className="flex items-center gap-1">
          <FaEye className="shrink-0" /> Viewed by {views.toLocaleString("en-IN")}
        </span>
      )}
      {requests > 0 && (
        <span className="flex items-center gap-1 text-primary">
          <FaUserFriends className="shrink-0" />
          {requests.toLocaleString("en-IN")} {requests === 1 ? "person" : "people"} requested a visit
        </span>
      )}
    </p>
  );
}
