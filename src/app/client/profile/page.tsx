"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaCamera, FaUser } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  getMyProfile,
  getProfileImageUrl,
  updateMyProfile,
  uploadProfileImage,
} from "@/api/user";
import { apiErrorMessage } from "@/api/config";
import { setUser } from "@/redux/auth/authSlice";
import LoadingSvg from "@/app/components/loader/loadingSvg";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // matches backend limit

const ProfilePage = () => {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch<any>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", mobile: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    getMyProfile()
      .then((data) => {
        setProfile(data);
        dispatch(setUser(data));
      })
      .catch((err) => toast.error(apiErrorMessage(err, "Could not load profile")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch the image whenever the stored file name changes
  useEffect(() => {
    if (!profile?.imageName) {
      setImageUrl(null);
      return;
    }
    let objectUrl: string | null = null;
    getProfileImageUrl(profile.imageName)
      .then((url) => {
        objectUrl = url;
        setImageUrl(url);
      })
      .catch(() => setImageUrl(null));
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [profile?.imageName]);

  function startEditing() {
    setForm({
      name: profile?.name || "",
      email: profile?.email || "",
      mobile: profile?.mobile || "",
    });
    setIsEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateMyProfile(profile.userId, form);
      setProfile(updated);
      dispatch(setUser(updated));
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not update profile"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPG and PNG images are allowed");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const updated = await uploadProfileImage(profile.userId, file);
      setProfile(updated);
      dispatch(setUser(updated));
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not upload image"));
    } finally {
      setIsUploading(false);
    }
  }

  const displayUser = profile || user;

  return (
    <>
      <section className="h-full flex items-center justify-center text-center">
        <div className="container max-w-md">
          <div className="relative size-30 mx-auto mb-7">
            <div className="flex justify-center items-center size-30 bg-white shadow rounded-full text-7xl text-gray-600 overflow-hidden">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={displayUser?.name || "Profile picture"}
                  className="size-full object-cover"
                />
              ) : (
                <FaUser />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!profile || isUploading}
              title={imageUrl ? "Change profile picture" : "Add profile picture"}
              className="absolute bottom-0 right-0 flex justify-center items-center size-10 rounded-full bg-primary text-white shadow text-base"
            >
              {isUploading ? <LoadingSvg /> : <FaCamera />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {displayUser && (
            <h2>
              Dear, <span className="text-primary">{displayUser.name}</span>
            </h2>
          )}

          {!profile ? (
            <p className="mt-4">Loading profile...</p>
          ) : isEditing ? (
            <form className="text-start mt-6" onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="mobile">Mobile</label>
                <input
                  id="mobile"
                  className="form-control"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="btn w-full"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      Saving &nbsp;
                      <LoadingSvg />
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 text-start bg-white shadow rounded-2xl p-6">
              <p className="mb-2">
                <strong>Email:</strong> {profile.email || "—"}
              </p>
              <p className="mb-4">
                <strong>Mobile:</strong> {profile.mobile || "—"}
              </p>
              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={startEditing}
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ProfilePage;
