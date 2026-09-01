"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { getProblemById } from "@/api/problem";
import ProblemForm from "@/app/components/forms/problemForm";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import PassengerRegisterForm from "@/app/components/forms/passengerForm";
import { getAllPassenger, getPassengerById } from "@/api/passenger";
import { useRouter } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const UpdatePassenger = ({ params }: Props) => {
  const { id } = use(params);
  const router = useRouter();
  const [passenger, setPassenger] = useState<any>(null);

  useEffect(() => {
    async function fetchPassenger() {
      const data = await getPassengerById(id);
      const selectedPassenger = data.passenger.find(
        (item: any) => item._id === id,
      );
      setPassenger(selectedPassenger);
    }
    
    fetchPassenger();
  }, [id]);

  return (
    <section className="flex h-full items-center max-w-2xl mx-auto">
      <div className="container">
        <div className="bg-secondary/10 shadow-lg p-10 rounded">
          <div className="mb-5 text-secondary text-center">
            <h2 className="h3">Update Passenger</h2>
            <p>Update passenger data.</p>
          </div>
          {!passenger ? (
            <div className="flex justify-center items-center">
              <LoadingSvg />
            </div>
          ) : (
            <PassengerRegisterForm passenger={passenger} />
          )}
        </div>
      </div>
    </section>
  );
};

export default UpdatePassenger;
