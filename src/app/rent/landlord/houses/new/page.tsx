"use client";

import { apiErrorMessage } from "@/api/config";
import { createHouse, getMyHouses, getMyLister } from "@/api/rental";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import HouseForm from "../../../_components/houseForm";
import { useRentalSession } from "../../../_components/useRentalSession";

export default function NewHouse() {
  const { user, ready } = useRentalSession();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [isAgent, setIsAgent] = useState(false);

  // Needs a landlord / agent profile with both citizenship photos first. One house per landlord
  // for now (the backend allows more) — a landlord who has one is sent to it. Agents add many.
  useEffect(() => {
    if (!ready) return;
    Promise.all([getMyLister(user.userId), getMyHouses(user.userId)])
      .then(([profile, houses]) => {
        const agent = profile?.type === "AGENT";
        if (!profile) router.replace("/rent/landlord");
        else if (!profile.citizenshipFrontImage || !profile.citizenshipBackImage) {
          toast.error("Upload both sides of your citizenship before adding a house.");
          router.replace("/rent/landlord");
        }
        else if (!agent && houses?.length) router.replace(`/rent/landlord/houses/${houses[0].id}`);
        else {
          setIsAgent(agent);
          setAllowed(true);
        }
      })
      .catch((err) => toast.error(apiErrorMessage(err, "Failed to load your profile")));
  }, [ready]);

  if (!allowed) {
    return <LoadingSvg className="absolute left-1/2 top-1/2 -translate-1/2 size-20" />;
  }

  return (
    <section className="py-8 md:py-11">
      <div className="container max-w-3xl">
        <Link href="/rent/landlord" className="text-sm underline">← {isAgent ? "My listings" : "My houses"}</Link>
        <h2 className="h3 mt-3 mb-1">Add a house</h2>
        <p className="text-sm text-gray-500 mb-6">
          After saving, upload a photo of the house and a photo of the road in front of it. An admin reviews
          the house before you can post rooms.
        </p>
        <div className="bg-white rounded-xl shadow p-5">
          <HouseForm
            agent={isAgent}
            submitLabel="Save house"
            onSubmit={async (data) => {
              try {
                const house = await createHouse(user.userId, data);
                toast.success("House saved. Now upload the house photo and the road photo.");
                router.push(`/rent/landlord/houses/${house.id}`);
              } catch (err) {
                toast.error(apiErrorMessage(err, "Failed to save house"));
              }
            }}
          />
        </div>
      </div>
    </section>
  );
}
