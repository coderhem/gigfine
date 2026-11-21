"use client";

import { requestAccountDeletion } from "@/api/accountDeletion";
import { apiErrorMessage } from "@/api/config";
import Link from "next/link";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { FaArrowLeft, FaCheckCircle, FaTrashAlt } from "react-icons/fa";
import { MdEmail, MdPhone } from "react-icons/md";

// Public page Google Play links to as the "Delete account URL" (both apps). No login needed:
// someone who already uninstalled the app can still ask. The office checks the request against
// the account and deletes it from the admin panel (Account deletion).

type AppName = "GIGFINE" | "RENTAL";

const APP_LABEL: Record<AppName, string> = {
  GIGFINE: "GigFine (ride sharing)",
  RENTAL: "GigFine Rentals",
};

const PHONE = /^9\d{9}$/;

// ?app=RENTAL, or opened on rent.gigfine.com → the rentals app is picked first
function appFromUrl(): AppName {
  const q = new URLSearchParams(window.location.search).get("app")?.toUpperCase();
  if (q === "RENTAL" || q === "GIGFINE") return q;
  return window.location.hostname.startsWith("rent.") ? "RENTAL" : "GIGFINE";
}
const noSubscribe = () => () => {};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function DeleteAccount() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const urlApp = useSyncExternalStore(noSubscribe, appFromUrl, () => "GIGFINE" as AppName);
  const [picked, setApp] = useState<AppName | null>(null);
  const app = picked ?? urlApp;
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sentId, setSentId] = useState<number | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = "Enter your full name.";
    if (!PHONE.test(phone.trim())) e.phone = "Enter the 10-digit mobile number of your account (e.g. 98XXXXXXXX).";
    if (email.trim() && !EMAIL.test(email.trim())) e.email = "Enter a valid email, or leave it empty.";
    if (!confirm) e.confirm = "Please tick the box to confirm.";
    return e;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSending(true);
    try {
      const res = await requestAccountDeletion({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        app,
        reason: reason.trim() || undefined,
        confirm: true,
      });
      setSentId(res.id);
    } catch (err) {
      setErrors({ form: apiErrorMessage(err, "Could not send your request. Please try again.") });
    } finally {
      setSending(false);
    }
  };

  const fieldError = (k: string) =>
    errors[k] ? <p className="text-red-600 text-sm mt-1 mb-0">{errors[k]}</p> : null;

  return (
    <section className="py-8 md:py-11">
      <div className="container max-w-4xl">
        <Link href="/" className="text-sm underline flex items-center gap-1">
          <FaArrowLeft /> Home
        </Link>

        <div className="bg-secondary/15 p-6 rounded-xl shadow mt-4">
          <h1 className="h2 mb-2">Delete your account</h1>
          <p className="mb-0">
            Use this page to ask GIGFINE to delete your account in the <b>GigFine</b> app (ride sharing) or the{" "}
            <b>GigFine Rentals</b> app, and the personal data linked to it. You do not need to log in.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* What happens */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
            <div>
              <h2 className="h5 mb-2">How it works</h2>
              <ol className="list-decimal pl-5 flex flex-col gap-1 mb-0">
                <li>Fill in the form with the name and mobile number of your account.</li>
                <li>Our team checks that the account is yours. We may call that number to confirm.</li>
                <li>We delete the account within 7 days and tell you by phone or email.</li>
              </ol>
            </div>

            <div>
              <h2 className="h5 mb-2">What we delete</h2>
              <ul className="list-disc pl-5 flex flex-col gap-1 mb-0">
                <li>Your account: name, mobile number, email, password and profile photo</li>
                <li>Rider details: vehicle number and driving licence number</li>
                <li>Your posts and comments on the Home feed, and their photos and voice notes</li>
                <li>Garage help requests, their photos and voice notes, and chat messages</li>
                <li>Room visit requests, saved listings and landlord / agent details (Rentals)</li>
                <li>Notifications and the device token used to send them</li>
              </ul>
            </div>

            <div>
              <h2 className="h5 mb-2">What we may keep</h2>
              <ul className="list-disc pl-5 flex flex-col gap-1 mb-0">
                <li>
                  Problem reports already forwarded to a ride-sharing company may be kept without your name or
                  contact details, so the company&apos;s case history stays complete.
                </li>
                <li>Records we must keep by law, or to deal with fraud or abuse, for as long as the law requires.</li>
                <li>Server backups, which are overwritten within 30 days.</li>
              </ul>
            </div>

            <div className="text-sm text-gray-600">
              <p className="mb-1">Questions? Contact us:</p>
              <p className="flex items-center gap-2 mb-1">
                <MdEmail className="text-secondary" />
                <a href="mailto:support.gigfine@gmail.com" className="text-secondary hover:text-primary">
                  support.gigfine@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-2 mb-0">
                <MdPhone className="text-secondary" />
                <a href="tel:9868222043" className="text-secondary hover:text-primary">
                  9868222043
                </a>
              </p>
            </div>
          </div>

          {/* The form */}
          <div className="bg-white rounded-xl shadow p-6">
            {sentId !== null ? (
              <div className="text-center py-6">
                <FaCheckCircle className="text-5xl text-green-600 mx-auto mb-4" />
                <h2 className="h4">Request received</h2>
                <p>
                  Your request number is <b>#{sentId}</b>. We will check it and delete your account within 7 days.
                  We may call {phone} to confirm it is you.
                </p>
                <Link href="/" className="btn btn-primary">
                  Back to Home
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="flex flex-col gap-4">
                <h2 className="h5 mb-0 flex items-center gap-2">
                  <FaTrashAlt className="text-red-600" /> Account deletion request
                </h2>

                <div>
                  <label htmlFor="del-app" className="block text-sm font-semibold mb-1">
                    App
                  </label>
                  <select
                    id="del-app"
                    className="form-control"
                    value={app}
                    onChange={(e) => setApp(e.target.value as AppName)}
                  >
                    {(Object.keys(APP_LABEL) as AppName[]).map((a) => (
                      <option key={a} value={a}>
                        {APP_LABEL[a]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="del-name" className="block text-sm font-semibold mb-1">
                    Full name
                  </label>
                  <input
                    id="del-name"
                    className="form-control"
                    value={name}
                    maxLength={100}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name on your account"
                  />
                  {fieldError("name")}
                </div>

                <div>
                  <label htmlFor="del-phone" className="block text-sm font-semibold mb-1">
                    Mobile number of the account
                  </label>
                  <input
                    id="del-phone"
                    className="form-control"
                    inputMode="numeric"
                    value={phone}
                    maxLength={10}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="98XXXXXXXX"
                  />
                  {fieldError("phone")}
                </div>

                <div>
                  <label htmlFor="del-email" className="block text-sm font-semibold mb-1">
                    Email of the account (optional)
                  </label>
                  <input
                    id="del-email"
                    type="email"
                    className="form-control"
                    value={email}
                    maxLength={150}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                  {fieldError("email")}
                </div>

                <div>
                  <label htmlFor="del-reason" className="block text-sm font-semibold mb-1">
                    Why are you leaving? (optional)
                  </label>
                  <textarea
                    id="del-reason"
                    className="form-control h-24!"
                    value={reason}
                    maxLength={1000}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={confirm}
                    onChange={(e) => setConfirm(e.target.checked)}
                  />
                  <span>
                    I want my {APP_LABEL[app]} account and its data deleted. I understand this cannot be undone.
                  </span>
                </label>
                {fieldError("confirm")}
                {fieldError("form")}

                <button type="submit" className="btn btn-primary" disabled={sending}>
                  {sending ? "Sending…" : "Request account deletion"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
