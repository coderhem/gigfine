"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import problemValidation from "@/validation/problem.schema.js";
import { useDispatch } from "react-redux";
import { addProblemApi, updateProblemApi } from "@/redux/auth/authActions";
import toast from "react-hot-toast";
import { Fancybox as NativeFancybox } from "@fancyapps/ui";
import { useState } from "react";
import LoadingSvg from "../loader/loadingSvg";
import { useRouter } from "next/navigation";

const ProblemForm = ({ onSuccess, problem }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(problemValidation),
    defaultValues: {
      company: problem?.company || "",
      problem: problem?.problem || "",
    },
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
        await dispatch(addProblemApi(data)).unwrap();

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
            <option value="Tootle">Tootle</option>
            <option value="Sajilo">Sajilo</option>
            <option value="JunJum">JunJum</option>
            <option value="Other">Other</option>
          </select>
          {errors.company && (
            <p className="text-red text-sm  mt-1">
              {String(errors.company.message)}
            </p>
          )}
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
          ) : problem ? (
            "Update Problem "
          ) : (
            "Add Problem +"
          )}
        </button>
      </form>
    </>
  );
};

export default ProblemForm;
