"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { getReportById, REPORT_EDIT_HOURS } from "@/api/problem";
import { apiErrorMessage } from "@/api/config";
import ProblemForm from "@/app/components/forms/problemForm";
import LoadingSvg from "@/app/components/loader/loadingSvg";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const UpdateProblemPage = ({ params }: Props) => {
  const { id } = use(params);
  const { user } = useSelector((state: any) => state.auth);

  const [problem, setProblem] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProblem() {
      try {
        setProblem(await getReportById(id));
      } catch (err) {
        setError(apiErrorMessage(err, "Could not load the report"));
      }
    }

    fetchProblem();
  }, [id]);

  // The backend enforces the same rules; this just explains why the form is hidden
  const isOwner = problem && user?.userId === problem.reporter?.userId;
  const blockedReason = !problem
    ? null
    : !isOwner
      ? "You can only edit your own reports."
      : !problem.editable
        ? `Reports can only be edited within ${REPORT_EDIT_HOURS} hours of posting, while they are still pending.`
        : null;

  return (
    <section className="flex h-full items-center max-w-2xl mx-auto">
      <div className="container">
        <div className="bg-secondary/10 shadow-lg p-10 rounded">
          <div className="mb-5 text-secondary text-center">
            <h2 className="h3">Update Problem</h2>
            <p>
              Update your ride-sharing issues.
            </p>
          </div>
          {error || blockedReason ? (
            <div className="text-center">
              <p className="text-red">{error ?? blockedReason}</p>
              <Link href="/home" className="btn btn-primary">
                Back to home
              </Link>
            </div>
          ) : !problem ? (
            <div className="flex justify-center items-center">
              <LoadingSvg />
            </div>
          ) : (
            <ProblemForm mode={problem.reporterMode} problem={problem} />
          )}
        </div>
      </div>
    </section>
  );
};

export default UpdateProblemPage;
