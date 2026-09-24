import type { Metadata } from "next";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How GIGFINE collects, uses and protects the information passengers and riders share when reporting ride-sharing problems.",
  alternates: { canonical: "/privacy-policy" },
  openGraph: { url: "/privacy-policy" },
};

const PrivacyPolicy = () => {
  const today = new Date().toLocaleDateString("en-NP");

  return (
    <>
      <section className="mt-6">
        <div className="container">
          <div className="text-center bg-secondary/15 p-6 rounded-xl shadow">
            <h1 className="h2">Privacy Policy</h1>
            <div className="max-w-3xl mx-auto">
              <p>
                At gigfine.com, we take your privacy seriously. This policy
                explains what information we collect, how we use it, and the
                choices you have.
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
          <div className="bg-white shadow-xl rounded-md py-4 px-6 my-6">
            <div className="mb-6">
              <h2 className="h4">Information We Collect</h2>
              <ul className="list-disc pl-8">
                <li>
                  Information you provide directly, such as your name, contact
                  details, and the content of any complaint, query, or feedback
                  you submit.
                </li>
                <li>
                  Basic usage information, such as how you interact with our
                  platform, to help us improve it.
                </li>
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="h4">How We Use Your Information</h2>
              <ul className="list-disc pl-8">
                <li>
                  To process and forward your complaints, queries, or feedback
                  to the relevant company.
                </li>
                <li>
                  To communicate with you about the status of your submission.
                </li>
                <li>To improve gigfine.com and better understand the issues gig workers face.</li>
                <li>To share aggregated, anonymized insights with partner companies (never your personal identity without your consent.</li>
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="h4">Your Choices</h2>
              <ul className="list-disc pl-8">
                <li>
                 You can ask us what information we hold about you, request corrections, or ask us to delete your data, subject to any legal or operational requirements.
                </li>
              </ul>
            </div>
            <div className="mb-6">
              <h2 className="h4"> Data Security</h2>
              <ul className="list-disc pl-8">
                <li>
                 We take reasonable steps to protect your information, but no online platform can guarantee complete security. Please avoid sharing sensitive information (such as financial details) unless necessary.
                </li>
              </ul>
            </div>
            <div className="mb-6">
              <h2 className="h4">Changes to This Policy</h2>
              <ul className="list-disc pl-8">
                <li>
                 We may update this policy as gigfine.com grows. We'll post any changes here with an updated date.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PrivacyPolicy;
