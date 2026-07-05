"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { MdDelete } from "react-icons/md";

type Props = {
  deleteText?: String;
  deleteIcon?: boolean;
  id?: String;
};

const DeleteBtn = ({ deleteIcon, deleteText, id }: Props) => {
  const [showPopup, setShowPopup] = useState(false);
  const [confirmed, setConfirmed] = useState("");
  const router = useRouter();
  
  const deleteProblem = (id: any) => {
    setConfirmed(id);
    setShowPopup(true);
  };
  const confirmDelete = async () => {
    await fetch(`/api/problems?id=${id}`, {
      method: "DELETE",
    });
    setShowPopup(false);
    router.refresh();
  };

  return (
    <>
      {deleteIcon && (
        <a href="#" onClick={deleteProblem}>
          <MdDelete size={24} />
        </a>
      )}
      {deleteText && (
        <a href="#" className="delete-btn" onClick={deleteProblem}>
          {deleteText}
        </a>
      )}
      {showPopup && (
        <div className="fixed inset-0 w-full bg-black/80 flex items-center justify-center">
          <div className="bg-white p-5 w-full max-w-md text-center mx-auto rounded">
            <h2 className="h4 text-red"> Delete Problem?</h2>
            <p className="text-black/60 mt-2">
              This action cannot be undone. Are you sure you want to permanently
              delete this problem?
            </p>
            <div className="flex justify-center gap-3 mt-4">
              <button onClick={confirmDelete} className="btn btn-green">
                Yes
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="delete-btn"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteBtn;
