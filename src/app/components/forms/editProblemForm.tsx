"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EditProblemForm = ({ id, company, problem }: any) => {
  const [newCompany, setNewCompany] = useState("");
  const [newProblem, setNewProblem] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (company) setNewCompany(company);
    if (problem) setNewProblem(problem);
  }, [company, problem]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const problemList = await fetch(
      `http://localhost:3000/api/problems/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company: newCompany, problem: newProblem }),
      },
    );
    if (!problemList.ok) {
      throw new Error("Failed to update the problem");
    }
    router.push("/home");
  };
  return (
    <>
      <form className="problem-form text-start" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="company">Which company is this regarding?</label>
          <select
            id="company"
            className="form-control py-3!"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
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
        </div>

        <div className="form-group">
          <label htmlFor="message">What problem are you facing?</label>
          <textarea
            onChange={(e) => setNewProblem(e.target.value)}
            value={newProblem}
            id="message"
            className="form-control min-h-30"
            placeholder="Describe Problem Here"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          // disabled={isSubmitting}
        >
          Update
          {/* {isSubmitting ? "Submitting..." : "Submit"} */}
        </button>
      </form>
    </>
  );
};

export default EditProblemForm;
