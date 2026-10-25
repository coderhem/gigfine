"use client";

import { isBusiness } from "@/api/business";
import {
  createNotification,
  deleteNotification,
  getManagedNotifications,
  updateNotification,
} from "@/api/notification";
import { getMyProfile } from "@/api/user";
import BusinessLogo from "@/app/components/businessLogo";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import NotificationManager, { type NotificationApi } from "@/app/components/notificationManager";
import { logout, setUser } from "@/redux/auth/authSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const NOTIFICATION_API: NotificationApi = {
  list: getManagedNotifications,
  create: createNotification,
  update: updateNotification,
  remove: deleteNotification,
};

// Business panel: notifications this business sends to riders / passengers
const BusinessNotifications = () => {
  const { user } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user || !localStorage.getItem("token")) {
      dispatch(logout());
      router.replace("/business/login");
      return;
    }
    getMyProfile()
      .then((profile) => dispatch(setUser(profile)))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const approved = isBusiness(user);

  useEffect(() => {
    if (!checking && !approved) router.replace("/business/apply");
  }, [checking, approved, router]);

  if (!user || checking || !approved) {
    return <LoadingSvg className="absolute left-1/2 top-1/2 -translate-1/2 size-20" />;
  }

  return (
    <section className="py-8 md:py-11">
      <div className="container">
        <div className="flex items-center gap-4 mb-6">
          <BusinessLogo size="size-16" />
          <div>
            <h2 className="h3 mb-1">
              <span className="text-primary">{user.name}</span> — Notifications
            </h2>
            <p className="text-sm text-gray-500 mb-0">
              Send updates to all GIGFINE users, only passengers, or only riders. They appear under your
              business name.
            </p>
          </div>
        </div>
        <NotificationManager api={NOTIFICATION_API} />
      </div>
    </section>
  );
};

export default BusinessNotifications;
