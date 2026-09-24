import type { Metadata } from "next";
import Link from "next/link";
import { FaArrowLeft, FaVoicemail } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with GIGFINE — questions about a ride-sharing report, partnerships, or support for passengers and riders in Nepal.",
  alternates: { canonical: "/contact-us" },
  openGraph: { url: "/contact-us" },
};
import { MdEmail, MdLocationOn, MdMap, MdPhone, MdPin } from "react-icons/md";

const ContactUs = () => {
  const today = new Date().toLocaleDateString("en-NP");

  return (
    <>
      <section className="mt-6">
        <div className="container">
          <div className="text-center bg-secondary/15 p-6 rounded-xl shadow">
            <h1 className="h2">Contact Us</h1>
            <div className="max-w-3xl mx-auto">
              <p>
                We'd love to hear from you — whether you're a gig worker with
                something to raise, a company interested in partnering with us,
                or just curious about what we're building.
              </p>
            </div>
            <div className="flex gap-3 items-center justify-center">
              <Link
                href={"/"}
                className="flex gap-2 items-center justify-center"
              >
                <FaArrowLeft /> Back to Home{" "}
              </Link>
            </div>
          </div>
          <div className="flex h-auto my-8">
            <div className="w-1/2 bg-white shadow-xl rounded-md py-4 px-6 h-auto">
              <h3 className="h4">Get in Touch</h3>
              <div className="flex gap-4 items-center relative mb-5 group max-w-max">
                <div className="group-hover:bg-secondary group-hover:text-white bg-secondary/20 p-2 rounded inline-flex justify-center items-center text-xl text-secondary transition-all duration-300">
                  <MdEmail />
                </div>
                <a
                  href="mailto:support.gigfine@gmail.com"
                  className="text-secondary hover:text-primary stretched-link"
                >
                  support.gigfine@gmail.com
                </a>
              </div>
              <div className="flex gap-4 items-center relative mb-5 group max-w-max">
                <div className="group-hover:bg-secondary group-hover:text-white bg-secondary/20 p-2 rounded inline-flex justify-center items-center text-xl text-secondary transition-all duration-300">
                  <MdPhone />
                </div>
                <a
                  href="tel:9868222043"
                  className="text-secondary hover:text-primary stretched-link"
                >
                  9868222043
                </a>
              </div>
              <div className="flex gap-4 items-center relative mb-5 group max-w-max">
                <div className="group-hover:bg-secondary group-hover:text-white bg-secondary/20 p-2 rounded inline-flex justify-center items-center text-xl text-secondary transition-all duration-300">
                  <MdLocationOn />
                </div>
                <a
                  href="#"
                  className="text-secondary hover:text-primary stretched-link"
                >
                  Banasthali, Kathmandu, Nepal
                </a>
              </div>
            </div>
            <div className="w-1/2 p-5 bg-secondary text-white h-full">
              <h4>Contact Form</h4>
              <strong>
                Have a complaint, question, or feedback about a company?
              </strong>
              <div className="contact-form bg-white rounded mt-5 p-7">
                <form action="">
                  <div className="form-group">
                    <input type="text" className="form-control" placeholder="Enter your name"/>
                  </div>
                  <div className="form-group">
                    <input type="text" className="form-control" placeholder="Enter your phone number"/>
                  </div>
                  <div className="form-group h-30!">
                    <textarea className="form-control h-30!" placeholder="Enter your message"/>
                  </div>
                  <button type="submit" className="btn btn-primary">Submit</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactUs;
