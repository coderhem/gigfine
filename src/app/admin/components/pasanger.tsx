"use client";
import { deletePassenger, getAllPassenger } from "@/api/passenger";
import DeleteBtn from "@/app/components/crudOperationBtns/deleteBtn";
import UpdateBtn from "@/app/components/crudOperationBtns/updateBtn";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

type Props = {};

const PassengerDetails = (props: Props) => {
  //   const { passenger } = useSelector((state: any) => state.auth);
  const [passenger, setPassenger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPassenger()
      .then((data) => {
        setPassenger(data.passenger || data.passenger || data || []);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [passenger]);

  const handleDelete = async (id: any) => {
    try {
      await deletePassenger(id);
      // setPassenger(id);

      toast.success("Passenger deleted successfully.");
      // router.refresh();
    } catch (error: any) {
      toast.error(error);
    }
  };

  return (
    <>
      <div className="pt-8 counter-wrapper">
        <h1 className="mb-6 pt-18 text-3xl font-bold text-[#0C589C]">
          Passenger Details
        </h1>

        <div className="rounded-xl bg-white px-6 pt-6 pb-14 shadow relative">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-start">S.No.</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Created Date</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <LoadingSvg
                      className={"absolute bottom-5 left-1/2 -translate-x-1/2"}
                    />
                  </tr>
                ) : passenger?.length > 0 ? (
                  passenger.map((item: any) => (
                    <tr key={item._id}>
                      <td className="p-3 counter"></td>
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">{item.roles}</td>
                      <td className="p-3">{item.phone}</td>
                      <td className="p-3">{item.email}</td>
                      <td className="p-3">
                        {" "}
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-center">
                          <div>
                            <DeleteBtn
                              deleteIcon
                              onConfirm={() => handleDelete(item._id)}
                            />
                          </div>
                          <div>
                            <UpdateBtn
                              updateIcon
                              customClass="min-w-full"
                              btnLink={`/admin/passenger-management/edit/${item._id}`}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="pt-6 text-center text-gray-500">
                      There are no passengers at this time.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default PassengerDetails;
