"use client";

import { apiErrorMessage } from "@/api/config";
import { createHouse, getMyHouses, getMyLandlord } from "@/api/rental";
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

  // Needs a landlord profile with both citizenship photos first. One house per landlord
  // for now (the backend allows more) — someone who has one is sent to it.
  useEffect(() => {
    if (!ready) return;
    Promise.all([getMyLandlord(user.userId), getMyHouses(user.userId)])
      .then(([landlord, houses]) => {
        if (!landlord) router.replace("/rent/landlord");
        else if (!landlord.citizenshipFrontImage || !landlord.citizenshipBackImage) {
          toast.error("Upload both sides of your citizenship before adding a house.");
          router.replace("/rent/landlord");
        }
        else if (houses?.length) router.replace(`/rent/landlord/houses/${houses[0].id}`);
        else setAllowed(true);
      })
      .catch((err) => toast.error(apiErrorMessage(err, "Failed to load your landlord profile")));
  }, [ready]);

  if (!allowed) {
    return <LoadingSvg className="absolute left-1/2 top-1/2 -translate-1/2 size-20" />;
  }

  return (
    <section className="py-8 md:py-11">
      <div className="container max-w-3xl">
        <Link href="/rent/landlord" className="text-sm underline">← My houses</Link>
        <h2 className="h3 mt-3 mb-1">Add a house</h2>
        <p className="text-sm text-gray-500 mb-6">
          After saving, upload a photo of the house and a photo of the road in front of it. An admin reviews
          the house before you can post rooms.
        </p>
        <div className="bg-white rounded-xl shadow p-5">
          <HouseForm
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
