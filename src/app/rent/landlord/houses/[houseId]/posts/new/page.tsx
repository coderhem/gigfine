"use client";

import { apiErrorMessage } from "@/api/config";
import { createPost, getHouse } from "@/api/rental";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PostForm from "../../../../../_components/postForm";
import { useRentalSession } from "../../../../../_components/useRentalSession";

export default function NewPost() {
  const { houseId } = useParams<{ houseId: string }>();
  const { user, ready } = useRentalSession();
  const router = useRouter();
  const [house, setHouse] = useState<any>(null);

  useEffect(() => {
    if (!ready) return;
    getHouse(user.userId, houseId)
      .then((h) => {
        // Backend refuses posts under a house that isn't approved
        if (h.status !== "APPROVED" || h.landlordStatus !== "APPROVED") {
          toast.error("This house is not approved yet.");
          router.replace(`/rent/landlord/houses/${houseId}`);
          return;
        }
        setHouse(h);
      })
      .catch((err) => {
        toast.error(apiErrorMessage(err, "Failed to load house"));
        router.replace("/rent/landlord");
      });
  }, [ready, houseId]);

  if (!house) {
    return <LoadingSvg className="absolute left-1/2 top-1/2 -translate-1/2 size-20" />;
  }

  return (
    <section className="py-8 md:py-11">
      <div className="container max-w-3xl">
        <Link href={`/rent/landlord/houses/${house.id}`} className="text-sm underline">← {house.name}</Link>
        <h2 className="h3 mt-3 mb-1">Post a room / flat</h2>
        <p className="text-sm text-gray-500 mb-6">
          Location and facilities come from {house.name}. You can add photos and videos after saving.
        </p>
        <div className="bg-white rounded-xl shadow p-5">
          <PostForm
            totalFloors={house.totalFloors}
            submitLabel="Save and add photos"
            onSubmit={async (data) => {
              try {
                const post = await createPost(user.userId, house.id, data);
                toast.success(data.type === "FLAT"
                  ? "Posted! Now add photos of the bedroom, kitchen and bathroom."
                  : "Posted! Now add photos so tenants can see it.");
                router.push(`/rent/landlord/houses/${house.id}/posts/${post.id}`);
              } catch (err) {
                toast.error(apiErrorMessage(err, "Failed to post"));
              }
            }}
          />
        </div>
      </div>
    </section>
  );
}
