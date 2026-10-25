"use client";
import { apiErrorMessage } from "@/api/config";
import { getMyNotifications, markNotificationsSeen } from "@/api/notification";
import { getUserMode } from "@/api/user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FaBell } from "react-icons/fa";
import LoadingSvg from "../components/loader/loadingSvg";

const timeAgo = (value: string) => {
  const seconds = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(value).toLocaleDateString();
};

// Logged-in user's feed. The backend picks what matches their current mode
// (rider or passenger) plus notifications for everyone.
const Notifications = () => {
  const { user } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const mode = getUserMode(user);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    setIsLoading(true);
    getMyNotifications()
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : []);
        markNotificationsSeen();
      })
      .catch((err) => toast.error(apiErrorMessage(err, "Failed to load notifications")))
      .finally(() => setIsLoading(false));
  }, [user, mode, router]);

  return (
    <section className="py-10 mt-5 bg-secondary/10 h-full">
      <div className="container max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
          <h1 className="h3 text-secondary mb-0">Notifications</h1>
          <span className="text-sm text-gray-500">
            Showing updates for {mode === "RIDER" ? "riders" : "passengers"}
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSvg />
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-10 bg-white rounded-xl shadow text-center text-black/60">
            <FaBell className="mx-auto mb-3 text-3xl text-secondary/40" />
            <p className="mb-0">No notifications right now.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((item) => (
              <article
                key={item.id}
                className="px-4 py-4 bg-white rounded-xl shadow border-l-4 border-secondary text-black/70"
              >
                <div className="flex flex-wrap justify-between gap-2 mb-1">
                  <h2 className="text-base font-semibold text-secondary mb-0 break-words">{item.title}</h2>
                  <time
                    dateTime={item.createdAt}
                    title={new Date(item.createdAt).toLocaleString()}
                    className="text-xs text-gray-500 whitespace-nowrap"
                  >
                    {timeAgo(item.createdAt)}
                  </time>
                </div>
                <p className="mb-2 whitespace-pre-line break-words">{item.message}</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-secondary/10 text-secondary">
                  From {item.senderName}
                </span>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Notifications;
