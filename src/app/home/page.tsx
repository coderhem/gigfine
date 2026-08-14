"use client";
import { deleteProblem, getAllProblem, getProblem } from "@/api/problem";
import DeleteBtn from "@/app/components/crudOperationBtns/deleteBtn";
import UpdateBtn from "@/app/components/crudOperationBtns/updateBtn";
import ProblemForm from "@/app/components/forms/problemForm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCalendarAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import LoadingSvg from "../components/loader/loadingSvg";
import Image from "next/image";
import protestImg from "@/public/images/protest-image-home.jpeg";
import protestImg1 from "@/public/images/admin-protest-photo-1.jpeg";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const Home = () => {
  const { loading, error, user } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProblems = async () => {
    try {
      const data = await getProblem();
      setProblems(data.problems || data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  const handleDelete = async (id: any) => {
    try {
      await deleteProblem(id);
      toast.success("Problem deleted successfully.");
      await fetchProblems();
    } catch (error: any) {
      toast.error(error);
    }
  };

  return (
    <>
      <section className="h-full flex justify-center items-center max-w-4xl mx-auto">
        <div className="container">
          {/* <div className="p-0.5 relative overflow-hidden max-w-170 mx-auto">
            <div className="bg-white shadow-secondary/5 p-4 œtext-center relative before:absolute before:-left-5 before:size-20 before:rounded-full before:bg-primary/30 before:-bottom-5 after:absolute after:inset-0 after:bg-[conic-gradient(#ef4444,#f97316,#eab308,#ef4444)] after:animate-spin after:-z-1">
              <h1 className="h3 text-primary mb-5 text-center">
                Join Protest✊
              </h1>

              <Swiper
                slidesPerView={1}
                centeredSlides={true}
                autoplay={{
                  delay: 2500,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                }}
                loop={true}
                navigation={true}
                modules={[Autoplay]}
                className="mySwiper"
              >
                <SwiperSlide className="h-auto!">
                  {" "}
                  <Image
                    src={protestImg}
                    width={600}
                    height={400}
                    alt="Protest Image"
                    loading="lazy"
                    className="w-full h-full"
                  />
                </SwiperSlide>
              </Swiper>
            </div>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#4285F4,#34A853,#FBBC05,#EA4335,#4285F4)] animate-[spin_3s_linear_infinite] -z-1" />

            <div className="absolute -z-1 inset-0 blur-xl opacity-60 bg-[conic-gradient(from_0deg,#4285F4,#34A853,#FBBC05,#EA4335,#4285F4)] animate-[spin_3s_linear_infinite]" />
          </div> */}

          <div className="flex flex-col mt-10">
            <div className="flex-1 overflow-y-auto bg-secondary/1 backdrop-blur-sm rounded sm:px-3 py-4 h-full">
              <div
                id="popup"
                className="hidden rounded-2xl p-3! sm:p-7! w-full max-w-11/12 md:max-w-4/5 lg:max-w-3/5 xl:max-w-2/5"
              >
                <div className="bg-secondary/10 p-4 rounded w-full">
                  <div className="mb-5 text-secondary text-center">
                    <h2 className="h3 mb-2">Share your problem</h2>
                    <p className="font-medium">
                      Tell us about your ride-sharing issues.
                    </p>
                  </div>
                  <ProblemForm onSuccess={fetchProblems} />
                </div>
              </div>
              <h1 className="h3 text-secondary text-center mb-7">
                Recent Problems
              </h1>
              <div className="relative border border-dashed border-secondary px-2 sm:px-4 py-7 [&_p]:mb-0 text-secondary font-medium">
                {isLoading ? (
                  <LoadingSvg
                    className={"absolute left-1/2 top-1/2 -translate-1/2"}
                  />
                ) : problems.length === 0 ? (
                  <div className="text-center">
                    <p>No problems have been posted yet. Bet the first</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-w-4xl mx-auto max-h-80 overflow-y-auto">
                    {problems.map((item: any) => (
                      <div
                        className="border border-secondary/20 mb-5 rounded"
                        key={item._id}
                      >
                        <span className="text-secondary text-sm flex items-center gap-1 justify-end px-5 py-3">
                          <FaCalendarAlt />
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                        <div className="mb-0 px-5 pb-5">
                          <strong>{item.problem}</strong>
                        </div>
                        <div className="mt-2 bg-secondary/20 py-2 px-3 flex gap-1 sm:gap-5 justify-between items-center max-sm:text-sm">
                          {/* <div className="flex justify-between gap-4 items-center p-5"> */}
                          <div className="flex items-center gap-2 bg-">
                            <span className="font-bold capitalize bg-secondary text-white mb-0 px-2 py-1 rounded ca">
                              {item.company}
                            </span>
                            <span className="text-secondary font-medium p-1 rounded">
                              Submitted
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 sm:gap-3 items-center">
                            {/* <DeleteBtn
                              className="max-sm:w-full"
                              deleteText={"Delete"}
                              onConfirm={() => handleDelete(item._id)}
                            /> */}
                            <UpdateBtn
                              customClass="max-sm:w-full"
                              updateText={"Edit"}
                              btnLink={`/client/problem-management/edit/${item._id}`}
                            />
                          </div>
                        </div>
                        {/* </div> */}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-6">
                <a
                  href="#popup"
                  className="text-end btn btn-primary w-full py-4 focus:ring-0 focus:ring-transparent focus:bg-primary focus:text-white focus:border-primary"
                  data-fancybox
                >
                  Share Your Problem +
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
