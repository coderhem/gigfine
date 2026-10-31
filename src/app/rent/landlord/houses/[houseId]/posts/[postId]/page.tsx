"use client";

import { apiErrorMessage } from "@/api/config";
import {
  deletePost,
  deletePostMedia,
  getHousePost,
  POST_STATUS_LABEL,
  updatePost,
  updatePostStatus,
  uploadPostMedia,
} from "@/api/rental";
import DeleteBtn from "@/app/components/crudOperationBtns/deleteBtn";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pills, StatusBadge } from "../../../../../_components/formBits";
import PostForm from "../../../../../_components/postForm";
import { MediaGallery, MediaUploader } from "../../../../../_components/rentalMedia";
import { useRentalSession } from "../../../../../_components/useRentalSession";

const STATUS_HINT: Record<string, string> = {
  ACTIVE: "Tenants can find this post.",
  RENTED: "Hidden from search. Set it Active again when the room is free.",
  INACTIVE: "Hidden from search.",
};

export default function EditPost() {
  const { houseId, postId } = useParams<{ houseId: string; postId: string }>();
  const { user, ready } = useRentalSession();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    if (!ready) return;
    getHousePost(user.userId, houseId, postId)
      .then(setPost)
      .catch((err) => {
        toast.error(apiErrorMessage(err, "Failed to load post"));
        router.replace(`/rent/landlord/houses/${houseId}`);
      });
  }, [ready, houseId, postId]);

  if (!post) {
    return <LoadingSvg className="absolute left-1/2 top-1/2 -translate-1/2 size-20" />;
  }

  const changeStatus = async (status: string) => {
    try {
      setPost(await updatePostStatus(user.userId, houseId, post.id, status));
      toast.success(`Marked as ${(POST_STATUS_LABEL as Record<string, string>)[status]}.`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to change status"));
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(user.userId, houseId, post.id);
      toast.success("Post deleted.");
      router.replace(`/rent/landlord/houses/${houseId}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to delete"));
    }
  };

  return (
    <section className="py-8 md:py-11">
      <div className="container">
        <Link href={`/rent/landlord/houses/${houseId}`} className="text-sm underline">← {post.houseName}</Link>
        <div className="flex flex-wrap items-start justify-between gap-3 mt-3 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="h3 mb-0">{post.title}</h2>
            <StatusBadge status={post.status} kind="post" />
          </div>
          <div className="flex items-center gap-3">
            {post.status === "ACTIVE" && post.houseStatus === "APPROVED" && (
              <Link href={`/rent/posts/${post.id}`} className="text-sm underline">View as tenant</Link>
            )}
            <DeleteBtn deleteText="Delete post" confirmTitle="Delete this post?" onConfirm={handleDelete} />
          </div>
        </div>

        {post.houseStatus !== "APPROVED" && (
          <p className="text-sm rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 p-3">
            The house is waiting for admin review, so this post is hidden from tenants for now.
          </p>
        )}

        <div className="grid lg:grid-cols-5 gap-5 items-start">
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-3">
              <h3 className="h5 mb-0">Status</h3>
              <Pills options={POST_STATUS_LABEL} value={post.status} onChange={changeStatus} />
              <p className="text-xs text-gray-500 mb-0">{STATUS_HINT[post.status]}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-3">
              <h3 className="h5 mb-0">Photos & videos</h3>
              {post.type === "FLAT" && post.media.filter((m: any) => m.type === "IMAGE").length < 3 && (
                <div className="text-sm rounded-lg bg-blue-50 border border-blue-200 text-blue-900 p-3">
                  <p className="font-medium mb-1">Required photos</p>
                  <ol className="list-decimal pl-5 mb-0">
                    <li>Bedroom</li>
                    <li>Kitchen</li>
                    <li>Bathroom</li>
                  </ol>
                </div>
              )}
              <MediaGallery
                media={post.media}
                emptyText="Posts with photos get many more calls."
                onDelete={async (m) => {
                  try {
                    await deletePostMedia(user.userId, houseId, post.id, m.id);
                    setPost((p: any) => ({ ...p, media: p.media.filter((x: any) => x.id !== m.id) }));
                  } catch (err) {
                    toast.error(apiErrorMessage(err, "Failed to delete"));
                  }
                }}
              />
              <MediaUploader
                upload={(file) => uploadPostMedia(user.userId, houseId, post.id, file)}
                onUploaded={(m) => setPost((p: any) => ({ ...p, media: [...p.media, m] }))}
              />
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-xl shadow p-5">
            <h3 className="h5 mb-4">Details</h3>
            <PostForm
              post={post}
              totalFloors={post.totalFloors}
              submitLabel="Save changes"
              onSubmit={async (data) => {
                try {
                  setPost(await updatePost(user.userId, houseId, post.id, data));
                  toast.success("Saved.");
                } catch (err) {
                  toast.error(apiErrorMessage(err, "Failed to save"));
                }
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
