"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import notificationValidation from "@/validation/notification.schema.js";
import { useDispatch } from "react-redux";
import { addNotificationAPI, updateProblemApi } from "@/redux/auth/authActions";
import toast from "react-hot-toast";
import { Fancybox as NativeFancybox } from "@fancyapps/ui";
import { useState } from "react";
import LoadingSvg from "../loader/loadingSvg";
import { useRouter } from "next/navigation";
import { readNotification } from "@/api/notification";

interface NotificationType {
  _id: string;
  notification: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

type Props = {
  refreshNotifications: () => void;
};

const AdminNotificationsForm = ({
  onSuccess,
  problem,
  refreshNotifications,
}: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(notificationValidation),
  });

  const dispatch = useDispatch<any>();

  async function submitForm(data: any) {
    setIsLoading(true);

    try {
      if (problem?._id) {
        // UPDATE
        await dispatch(
          updateProblemApi({
            id: problem._id,
            ...data,
          }),
        ).unwrap();

        toast.success("Problem updated successfully!");
        router.push("/home");
      } else {
        // ADD
        await dispatch(addNotificationAPI(data)).unwrap();

        toast.success("Notification added successfully!");
        reset();
        if (refreshNotifications) {
          await refreshNotifications();
        }
      }

      if (onSuccess) {
        await onSuccess();
      }

      // NativeFancybox.close();
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  const handleRead = async (id: string) => {
    try {
      await readNotification(id);

      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, read: true } : item)),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <>
      <form
        className="problem-form text-start"
        onSubmit={handleSubmit(submitForm)}
      >
        <div className="form-group">
          <label htmlFor="message">Notifications</label>
          <textarea
            id="message"
            className="form-control min-h-30"
            placeholder="Describe Notifications Here"
            {...register("notification")}
          />
          {errors.notification && (
            <p className="text-red text-sm mt-1">
              {String(errors.notification.message)}
            </p>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-full">
          {isLoading ? (
            <>
              Submitting &nbsp;
              <LoadingSvg />
            </>
          ) : problem ? (
            "Update Problem "
          ) : (
            "Add Notifications +"
          )}
        </button>
      </form>
    </>
  );
};

export default AdminNotificationsForm;
