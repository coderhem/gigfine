import type { Metadata } from "next";
import Link from "next/link";
import {
  FaBiking,
  FaCheckCircle,
  FaClipboardList,
  FaMicrophone,
  FaMoneyBillWave,
  FaShieldAlt,
  FaUser,
  FaUserPlus,
} from "react-icons/fa";
import {
  MdCameraAlt,
  MdEditNote,
  MdOutlineReportProblem,
  MdSupportAgent,
  MdTrackChanges,
} from "react-icons/md";
import LoginForm from "@/app/components/forms/loginForm";
import GuestOnly from "@/app/components/landing/guestOnly";
import {
  FAQS,
  RIDE_SHARING_APPS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "./seo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const AUDIENCES = [
  {
    icon: FaUser,
    title: "For Passengers",
    text: "Had a bad ride? Tell us what happened — even if you only remember the rider's name or number plate.",
    points: [
      "Unsafe driving or harassment",
      "Overcharging or fare disputes",
      "Rude behaviour or cancelled rides",
      "Lost items and other incidents",
    ],
  },
  {
    icon: FaBiking,
    title: "For Riders",
    text: "Your work deserves a voice. Report problems with passengers, apps or payments in one place.",
    points: [
      "Payment not received or cut",
      "Unfair account blocks or penalties",
      "Abusive or unsafe passengers",
      "Problems with the app or company",
    ],
  },
];

const STEPS = [
  {
    icon: FaUserPlus,
    title: "Create a free account",
    text: "Sign up in a minute as a passenger or a rider.",
  },
  {
    icon: MdEditNote,
    title: "Report the problem",
    text: "Pick the app and service, then describe it in text, record a voice note, or add a photo.",
  },
  {
    icon: MdTrackChanges,
    title: "Track until it's resolved",
    text: "Follow your report from Pending to Under Review to Resolved from your dashboard.",
  },
];

const FEATURES = [
  {
    icon: FaMicrophone,
    title: "Voice notes",
    text: "Record right from your phone — no typing needed.",
  },
  {
    icon: MdCameraAlt,
    title: "Photo evidence",
    text: "Attach a screenshot or photo to support your report.",
  },
  {
    icon: FaClipboardList,
    title: "Status tracking",
    text: "Always know where your report stands.",
  },
  {
    icon: FaShieldAlt,
    title: "Safety first",
    text: "Incidents and safety concerns get looked at, not lost.",
  },
  {
    icon: FaMoneyBillWave,
    title: "Payment issues",
    text: "Riders can raise unpaid or wrong payouts.",
  },
  {
    icon: MdSupportAgent,
    title: "Free for everyone",
    text: "No cost for passengers or riders.",
  },
];

// Organization + WebSite + FAQPage structured data for rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      areaServed: { "@type": "Country", name: "Nepal" },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

const SectionHeading = ({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) => (
  <div className="text-center max-w-2xl mx-auto mb-10">
    <p className="text-primary font-semibold uppercase tracking-wide text-sm mb-2">
      {eyebrow}
    </p>
    <h2 className="h2 text-secondary mb-3">{title}</h2>
    {text && <p className="text-gray-600 mb-0">{text}</p>}
  </div>
);

export default function Landing() {
  return (
    <GuestOnly>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Hero + login */}
      <section className="py-10 lg:py-16">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold text-sm px-3 py-1 rounded-full mb-5">
                <MdOutlineReportProblem /> Nepal&apos;s ride-sharing
                complaint platform
              </p>
              <h1 className="h1 text-secondary mb-5 normal-case">
                Report ride-sharing problems in Nepal —{" "}
                <span className="text-primary">and get them resolved.</span>
              </h1>
              <p className="text-lg text-gray-700 mb-3">
                GIGFINE is where passengers and riders of every ride-sharing
                app in Nepal report incidents, safety concerns and payment
                issues — and follow each report until it&apos;s solved.
              </p>
              <p className="text-gray-600 mb-6" lang="ne">
                राइड-सेयरिङका हरेक समस्या — यात्री र राइडर दुवैका लागि, एउटै
                ठाउँमा।
              </p>
              <ul
                className="flex flex-wrap gap-2 mb-7"
                aria-label="Supported ride-sharing apps"
              >
                {RIDE_SHARING_APPS.map((app) => (
                  <li
                    key={app}
                    className="bg-white border border-secondary/15 text-secondary font-semibold text-sm px-3 py-1 rounded-full shadow-sm"
                  >
                    {app}
                  </li>
                ))}
                <li className="text-secondary/70 text-sm px-2 py-1">
                  & more
                </li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link href="/register" className="btn btn-primary">
                  Create free account
                </Link>
                <a href="#how-it-works" className="btn btn-outline">
                  How it works
                </a>
              </div>
            </div>

            <div
              id="login"
              className="bg-white rounded-2xl shadow-2xl border border-secondary/10 p-6 sm:p-8 w-full max-w-md mx-auto lg:ml-auto"
            >
              <h2 className="h3 normal-case text-center mb-1">
                Login to <span className="text-primary">GIGFINE</span>
              </h2>
              <p className="text-center text-sm text-gray-500 mb-6">
                Use your phone number or email
              </p>
              <LoginForm />
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-14 bg-white/80">
        <div className="container">
          <SectionHeading
            eyebrow="Who it's for"
            title="One platform for passengers and riders"
            text="Whichever side of the ride you're on, and whichever app you use, your problem can be heard here."
          />
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {AUDIENCES.map(({ icon: Icon, title, text, points }) => (
              <article
                key={title}
                className="bg-white rounded-2xl border border-secondary/10 shadow-md p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="size-12 rounded-xl bg-secondary text-white flex items-center justify-center text-xl">
                    <Icon aria-hidden />
                  </span>
                  <h3 className="h3 mb-0 normal-case text-secondary">
                    {title}
                  </h3>
                </div>
                <p className="text-gray-600">{text}</p>
                <ul className="space-y-2 mb-0">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <FaCheckCircle
                        className="text-primary mt-1 shrink-0"
                        aria-hidden
                      />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-14 scroll-mt-28">
        <div className="container">
          <SectionHeading
            eyebrow="How it works"
            title="From problem to resolution in 3 steps"
          />
          <ol className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li
                key={title}
                className="relative bg-white rounded-2xl shadow-md border border-secondary/10 p-6 text-center"
              >
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 size-8 rounded-full bg-primary text-white font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <Icon
                  className="text-secondary text-4xl mx-auto mt-3 mb-4"
                  aria-hidden
                />
                <h3 className="text-xl font-bold normal-case text-secondary mb-2">
                  {title}
                </h3>
                <p className="text-gray-600 mb-0">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 bg-secondary text-white">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-primary font-semibold uppercase tracking-wide text-sm mb-2">
              Why GIGFINE
            </p>
            <h2 className="h2 text-white mb-0">
              Reporting made simple — however you want to say it
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl bg-white/10 p-5 flex gap-4 items-start"
              >
                <Icon className="text-2xl text-primary shrink-0 mt-1" aria-hidden />
                <div>
                  <h3 className="text-lg font-bold normal-case text-white mb-1">
                    {title}
                  </h3>
                  <p className="text-white/80 mb-0">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 bg-white/80">
        <div className="container">
          <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group bg-white rounded-xl border border-secondary/10 shadow-sm p-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="cursor-pointer font-semibold text-secondary flex justify-between items-center gap-4 list-none">
                  {f.q}
                  <span className="text-primary text-xl transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="text-gray-600 mt-3 mb-0">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center bg-white rounded-2xl shadow-xl border border-secondary/10 p-8 sm:p-12">
            <h2 className="h2 text-secondary mb-3">
              Faced a problem on your last ride?
            </h2>
            <p className="text-gray-600 mb-6">
              Don&apos;t let it go unheard. Report it on GIGFINE — it takes
              less than two minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/register" className="btn btn-primary">
                Report a problem
              </Link>
              <a href="#login" className="btn btn-outline">
                I already have an account
              </a>
            </div>
          </div>
        </div>
      </section>
    </GuestOnly>
  );
}
