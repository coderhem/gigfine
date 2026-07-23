"use client";
import { useState } from "react";
import { MdDelete } from "react-icons/md";

type Props = {
  deleteIcon?: boolean;
  deleteText?: string;
  className?: string;
  onConfirm: () => void;
};

const DeleteBtn = ({ deleteIcon, deleteText, className, onConfirm }: Props) => {
  const [showPopup, setShowPopup] = useState(false);

  const openPopup = () => {
    setShowPopup(true);
  };

  const confirmDelete = () => {
    onConfirm();
    setShowPopup(false);
  };

  return (
    <>
      {deleteIcon && <MdDelete className={`text-red hover:text-red/70 transition-all duration-300 cursor-pointer inline-block text-4xl ${className}`} size={24} onClick={openPopup} />}
      {deleteText && (
        <div className={`delete-btn ${className} cursor-pointer`} onClick={openPopup}>
          {deleteText}
        </div>
      )}
      {showPopup && (
        <div className="fixed inset-0 w-full bg-black/80 flex items-center justify-center">
          <div className="bg-white p-5 w-full max-w-md text-center mx-auto rounded">
            <h2 className="h4 text-red"> Delete Problem?</h2>
            <p className="text-black/60 mt-2">
              This action cannot be undone. Are you sure you want to permanently
              delete this?
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
