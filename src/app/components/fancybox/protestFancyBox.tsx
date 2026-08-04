import Image from "next/image";
import protestImage from "@/public/images/protest-image.jpeg";
import Link from "next/link";

type Props = {};

const ProtestFancyBox = (props: Props) => {
  return (
    <>
      <div className="text-center bg-[url('./assets/images/bg-img.png')] p-5 rounded-xl">
        <h1 className="h3 text-secondary mb-1">✊ Join the Protest</h1>
        <strong> Join the Campaign for Better Ride-Sharing in Nepal</strong>
        <div className="shadow p-1 mt-5 flex justify-center">
          <Image
            src={protestImage}
            width={1536}
            height={1024}
            alt="Protest Image"
            loading="lazy"
          />
        </div>
        <div className="pt-4">
          <Link href="/register" className="btn btn-primary w-full">Join Now</Link>
        </div>
      </div>
    </>
  );
};

export default ProtestFancyBox;
