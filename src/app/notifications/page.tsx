"use client";
import { getAllNotification } from "@/api/notification";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import LoadingSvg from "../components/loader/loadingSvg";

type Props = {};

const Notifications = (props: Props) => {
  const { user } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const [notification, setNotification] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
    fetchNotification();
  }, [user, router]);

  const fetchNotification = async () => {
    setIsLoading(true);
    try {
      const data = await getAllNotification();
      setNotification(data.notification || data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <section className="py-10 mt-5 bg-secondary/10 h-full">
        <div className="container">
          <h1 className="h3 text-secondary">Notifications</h1>

          <div className="bg-secondary/40 p-3">
            <div className="text-lg max-h-100 scrollbar-none overflow-scroll  p-3 rounded">
              {isLoading ? (
                <LoadingSvg />
              ) : notification.length === 0 ? (
                <div className="mb-3 px-3 py-5 bg-white rounded shadow border border-secondary/30 text-black/70">
                  <p className="mb-0">No notifications found.</p>
                </div>
              ) : (
                notification.map((item: any) => (
                  <div
                    key={item._id}
                    className="mb-3 px-3 py-5 bg-white rounded shadow border border-secondary/30 text-black/70"
                  >
                    <span className="text-sm flex justify-end max-w-max ml-auto bg-secondary text-white rounded p-1 mb-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                    <p className="mb-0">{item.notification}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Notifications;
