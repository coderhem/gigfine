"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PassengerProblemValidation from "@/validation/passenger.problem.schema";
import { useDispatch } from "react-redux";
import { addPassengerProblemApi, registerPassengerApi, updatePassengerApi, updateProblemApi } from "@/redux/auth/authActions";
import toast from "react-hot-toast";
import { Fancybox as NativeFancybox } from "@fancyapps/ui";
import { useState } from "react";
import LoadingSvg from "../loader/loadingSvg";
import { useRouter } from "next/navigation";

const PassengerProblemForm = ({ onSuccess, passengerProblem }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(PassengerProblemValidation),
    defaultValues: {
      company: passengerProblem?.company || "",
      driverName: passengerProblem?.driverName || "",
      vehicleNumber: passengerProblem?.vehicleNumber || "",
      problem: passengerProblem?.problem || "",
    },
  });

  const dispatch = useDispatch<any>();

  async function submitForm(data: any) {
    setIsLoading(true);

    try {
      if (passengerProblem?._id) {
        // UPDATE
        await dispatch(
          updatePassengerApi({
            id: passengerProblem._id,
            ...data,
          }),
        ).unwrap();

        toast.success("Problem updated successfully!");
        router.push("/home");
      } else {
        // ADD
        await dispatch(addPassengerProblemApi(data)).unwrap();

        toast.success("Problem added successfully!");
        reset();
      }

      if (onSuccess) {
        await onSuccess();
      }

      NativeFancybox.close();
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <form
        className="problem-form text-start"
        onSubmit={handleSubmit(submitForm)}
      >
        <div className="form-group">
          <label htmlFor="company">Which company is this regarding?</label>
          <select
            id="company"
            className="form-control py-3!"
            {...register("company")}
          >
            <option value="">Select Company</option>
            <option value="Pathao">Pathao</option>
            <option value="inDrive">Indrive</option>
            <option value="Yango">Yango</option>
            <option value="Sajilo">Sajilo</option>
            <option value="Firiri">Firiri</option>
            {/* <option value="IDF">IDF</option>
            <option value="ChiyaCut">ChiyaCut</option> */}
          </select>
          {errors.company && (
            <p className="text-red text-sm  mt-1">
              {String(errors.company.message)}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="driverName">Driver Name</label>
          <input
            id="driverName"
            className="form-control"
            placeholder="Driver Name Here"
            {...register("driverName")}
          />
          
        </div>
        <div className="form-group">
          <label htmlFor="vehicleNumber">Vehicle Number</label>
          <input
            id="vehicleNumber"
            className="form-control"
            placeholder="Vehicle Number Here"
            {...register("vehicleNumber")}
          />
          <p className="text-xs px-1 text-secondary/70 mb-0">
            e.g. ba 2 pa 1234
          </p>
        </div>
        <div className="form-group">
          <label htmlFor="message">What problem are you facing?</label>
          <textarea
            id="message"
            className="form-control min-h-30"
            placeholder="Describe Problem Here"
            {...register("problem")}
          />
          {errors.problem && (
            <p className="text-red text-sm mt-1">
              {String(errors.problem.message)}
            </p>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-full">
          {isLoading ? (
            <>
              Submitting &nbsp;
              <LoadingSvg />
            </>
          ) : passengerProblem ? (
            "Update Problem "
          ) : (
            "Add Problem +"
          )}
        </button>
      </form>
    </>
  );
};

export default PassengerProblemForm;
