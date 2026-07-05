// 'use client'
import DeleteBtn from "@/app/components/crudOperationBtns/deleteBtn";
import UpdateBtn from "@/app/components/crudOperationBtns/updateBtn";
import ProblemForm from "@/app/components/forms/problemForm";
import { FaCalendarAlt } from "react-icons/fa";

const Home = async () => {
  return (
    <>
      <section className="h-full flex justify-center items-center max-w-4xl mx-auto">
        <div className="container">
          <div className="flex flex-col mt-10">
            <div className="flex-1 overflow-y-auto bg-secondary/1 backdrop-blur-sm rounded px-3 py-4 h-full">
              <div
                id="popup"
                className="hidden rounded-2xl p-3! sm:p-7! w-full max-w-11/12 md:max-w-4/5 lg:max-w-3/5 xl:max-w-2/5"
              >
                <div className="bg-secondary/10 p-4 rounded w-full text-center">
                  <h2 className="h4 mb-0">Share your problem</h2>
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  </p>
                  <ProblemForm />
                </div>
              </div>
              <h1 className="h3 text-secondary text-center mb-7">
                Recent Problems
              </h1>
              <div className="border border-dashed border-secondary px-4 py-7 [&_p]:mb-0 text-secondary font-medium">
                <div className="text-center">
                  <p>No problems have been posted yet. Bet the first</p>
                </div>
                <div className="overflow-x-auto max-w-4xl mx-auto max-h-80 overflow-y-auto">
                  <div className="border border-secondary/20 mb-5 rounded">
                    <span className="text-secondary text-sm flex items-center gap-1 justify-end px-5 py-3">
                      <FaCalendarAlt />
                    </span>
                    <div className="mb-0 px-5 pb-5">
                      <strong>problem</strong>
                    </div>
                    <div className="mt-2 bg-secondary/20 py-2 px-3 flex gap-5 justify-between items-center">
                      {/* <div className="flex justify-between gap-4 items-center p-5"> */}
                      <div className="flex items-center gap-2 bg-">
                        <span className="font-bold capitalize bg-secondary text-white mb-0 px-2 py-1 rounded ca">
                          company
                        </span>
                        <span className="text-secondary font-medium p-1 rounded">
                          Submitted
                        </span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <DeleteBtn deleteText={"Delete"} />
                        <UpdateBtn updateText={"Edit"} btnLink={``} />
                      </div>
                    </div>
                    {/* </div> */}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <a
                  href="#popup"
                  className="text-end btn btn-primary w-full py-4 focus:ring-0 focus:ring-transparent focus:bg-primary focus:text-white focus:border-primary"
                  data-fancybox
                >
                  + Share Your Problem
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
