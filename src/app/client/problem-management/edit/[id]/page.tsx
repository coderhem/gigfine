"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { getProblemById } from "@/api/problem";
import ProblemForm from "@/app/components/forms/problemForm";
import LoadingSvg from "@/app/components/loader/loadingSvg";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const UpdateProblemPage = ({ params }: Props) => {
  const { id } = use(params);

  const [problem, setProblem] = useState<any>(null);

  useEffect(() => {
    async function fetchProblem() {
      const data = await getProblemById(id);
      setProblem(data);
    }

    fetchProblem();
  }, [id]);

  return (
    <section className="flex h-full items-center max-w-2xl mx-auto">
      <div className="container">
        <div className="bg-white shadow-lg p-10 rounded">
          <div className="mb-5">
            <h2>Update Problem</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eligendi
              reprehenderit sit
            </p>
          </div>
          {!problem ? (
            <div className="flex justify-center items-center">
              <LoadingSvg />
            </div>
          ) : (
            <ProblemForm problem={problem.problem} />
          )}
        </div>
      </div>
    </section>
  );
};

export default UpdateProblemPage;
