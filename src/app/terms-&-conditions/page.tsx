import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

const TermsAndCondition = () => {
  const today = new Date().toLocaleDateString("en-NP");

  return (
    <>
      <section className="mt-6">
        <div className="container">
          <div className="text-center bg-secondary/15 p-6 rounded-xl shadow">
            <h1 className="h2">Terms & Conditions</h1>
            <div className="max-w-3xl mx-auto">
              <p>
                Welcome to gigfine.com, by using our platform, you agree to the
                following terms.
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
              <h2 className="h4">What We Do</h2>
              <p>
                gigfine.com is a platform that allows users — including gig
                workers — to raise complaints, ask queries, and give feedback
                about companies. We make reasonable efforts to pass this
                information along to the relevant company, and where possible,
                help facilitate a resolution.
              </p>
            </div>
            <div className="mb-6">
              <h2 className="h4">What We Don't Guarantee</h2>
              <p>
                While we do our best to ensure your complaint or feedback
                reaches the company involved, gigfine.com cannot guarantee that
                any company will respond, act, or resolve the issue. We are a
                channel and an advocate — not a court, regulator, or the company
                itself.
              </p>
            </div>

            <div className="mb-6">
              <h2 className="h4">User Responsibilities</h2>
              <ul className="list-disc pl-8">
                <li>You agree to submit honest, accurate information.</li>
                <li>
                  You agree not to use gigfine.com to post false, defamatory, or
                  malicious content about any company or individual.
                </li>
                <li>
                  You are responsible for the accuracy of anything you submit
                  through our platform
                </li>
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="h4">Company Listings</h2>
              <p>
                gigfine.com may list companies operating in Nepal's gig economy
                for the purpose of enabling worker feedback, whether or not that
                company has formally partnered with us. If you are a company
                representative and have concerns about your listing, please
                contact us directly.
              </p>
            </div>
            <div className="mb-6">
              <h2 className="h4">Intellectual Property</h2>
              <p>
                All content on gigfine.com, including our branding, design, and
                platform features, belongs to gigfine.com unless otherwise
                stated.
              </p>
            </div>
            <div className="mb-6">
              <h2 className="h4"> Limitation of Liability</h2>
              <p>
                gigfine.com is provided "as is." We are not liable for any loss,
                damage, or dispute arising from the use of our platform,
                including the outcome (or lack of outcome) of any complaint
                submitted.
              </p>
            </div>
            <div className="mb-6">
              <h2 className="h4"> Changes to These Terms</h2>
              <p>
                We may update these terms as our platform evolves. Continued use
                of gigfine.com after changes means you accept the updated terms.
              </p>
            </div>
            <div className="mb-6">
              <h2 className="h4"> Governing Law</h2>
              <p>These terms are governed by the laws of Nepal.</p>
            </div>
            <div className="mb-6">
              <h2 className="h4">Changes to This Policy</h2>
              <p>
                We may update this policy as gigfine.com grows. We'll post any
                changes here with an updated date.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TermsAndCondition;
