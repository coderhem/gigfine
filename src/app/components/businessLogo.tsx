"use client";
import { imageFileError } from "@/api/business";
import { apiErrorMessage } from "@/api/config";
import { getProfileImageUrl, uploadProfileImage } from "@/api/user";
import { setUser } from "@/redux/auth/authSlice";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaBuilding } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import LoadingSvg from "./loader/loadingSvg";

// The logged-in business's logo (stored as the user's profile image).
// editable adds an "Upload / Change logo" button.
const BusinessLogo = ({ editable = false, size = "size-20" }: { editable?: boolean; size?: string }) => {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const [url, setUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const imageName = user?.imageName;

  useEffect(() => {
    if (!imageName) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    getProfileImageUrl(imageName)
      .then((u) => {
        objectUrl = u;
        if (cancelled) URL.revokeObjectURL(u);
        else setUrl(u);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageName]);

  const handleChange = async (file: File | undefined) => {
    if (!file || !user) return;
    const error = imageFileError(file);
    if (error) {
      toast.error(error);
      return;
    }
    setUploading(true);
    try {
      dispatch(setUser(await uploadProfileImage(user.userId, file)));
      toast.success("Logo updated.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Logo upload failed"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${size} shrink-0 rounded-full border border-secondary/20 bg-white overflow-hidden flex items-center justify-center text-secondary/50`}
      >
        {imageName && url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={`${user?.name} logo`} className="size-full object-contain" />
        ) : (
          <FaBuilding className="text-2xl" />
        )}
      </div>
      {editable && (
        <label className="btn py-1! px-3! text-sm cursor-pointer flex items-center gap-2">
          {uploading ? <LoadingSvg /> : imageName ? "Change logo" : "Upload logo"}
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              handleChange(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
};

export default BusinessLogo;
