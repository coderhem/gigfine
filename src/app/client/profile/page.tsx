"use client"
import { FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";

type Props = {};

const ProfilePage = (props: Props) => {
    const { loading, error, user } = useSelector((state: any) => state.auth);

  return <>
  <section className="h-full flex items-center justify-center text-center">
    <div className="container">
      <div className="flex justify-center items-center size-30 mx-auto bg-white shadow rounded-full text-7xl text-gray-600 mb-7">
        <FaUser/>
      </div>
      <h2>Dear, <span className="text-primary">{user.name}</span></h2>
      <h3 className="h4">New updates are on the way 🚀</h3>
    </div>
  </section>
  </>;
};

export default ProfilePage;
