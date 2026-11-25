"use client";

import {
  getAllUsers,
  getUserPhotoUrlAdmin,
  getVerifiedProfile,
  getVerifiedProfiles,
  saveVerifiedProfile,
  setVerifiedStatus,
  uploadUserPhotoAdmin,
} from "@/api/admin";
import { apiErrorMessage } from "@/api/config";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { MdVerified } from "react-icons/md";

// Blue tick (verified) people: a ride-sharing company's CEO, manager, ... In the app their name shows
// with the tick, designation and organization on their posts, and other users can follow them.
// The user can ask from the app (PENDING) or an admin fills the form here and verifies in one step.

type Status = "PENDING" | "VERIFIED" | "REJECTED" | "REVOKED";

export type VerifiedProfile = {
  userId: number;
  name: string;
  photo?: string;
  designation?: string;
  organization?: string;
  bio?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  verified: boolean;
  followerCount: number;
  postCount: number;
  status?: Status;
  adminNote?: string;
  updatedAt?: string;
  verifiedAt?: string;
  email?: string;
  mobile?: string;
};

const STATUS_LABEL: Record<Status, string> = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  REVOKED: "Removed",
};
const STATUS_BADGE: Record<Status, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  VERIFIED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  REVOKED: "bg-gray-100 text-gray-700",
};

const LINKS: { key: keyof VerifiedProfile; label: string; placeholder: string }[] = [
  { key: "facebookUrl", label: "Facebook", placeholder: "facebook.com/name" },
  { key: "youtubeUrl", label: "YouTube", placeholder: "youtube.com/@channel" },
  { key: "linkedinUrl", label: "LinkedIn", placeholder: "linkedin.com/in/name" },
  { key: "instagramUrl", label: "Instagram", placeholder: "instagram.com/name" },
  { key: "tiktokUrl", label: "TikTok", placeholder: "tiktok.com/@name" },
  { key: "twitterUrl", label: "X (Twitter)", placeholder: "x.com/name" },
  { key: "websiteUrl", label: "Website", placeholder: "company.com" },
];

const when = (iso?: string) => (iso ? new Date(iso).toLocaleString("en-NP") : "");

export const BlueTick = ({ className = "" }: { className?: string }) => (
  <MdVerified className={`inline text-[#1D9BF0] ${className}`} title="Verified" />
);

export default function VerifiedUsers() {
  const [status, setStatus] = useState<Status | "">("PENDING");
  const [rows, setRows] = useState<VerifiedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [reloads, setReloads] = useState(0);
  const [editing, setEditing] = useState<{ userId: number; name: string } | null>(null);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    let live = true;
    getVerifiedProfiles(status || undefined)
      .then((r) => live && setRows(r))
      .catch((e) => live && toast.error(apiErrorMessage(e, "Could not load verified profiles")))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [status, reloads]);

  const load = () => {
    setLoading(true);
    setReloads((n) => n + 1);
  };

  const changeStatus = async (r: VerifiedProfile, next: Status) => {
    let note: string | undefined;
    if (next === "REJECTED" || next === "REVOKED") {
      const answer = window.prompt(
        next === "REJECTED" ? "Why is it rejected? (the user sees this)" : "Why is the blue tick removed? (the user sees this)",
        "",
      );
      if (answer === null) return;
      note = answer;
    }
    setBusy(r.userId);
    try {
      await setVerifiedStatus(r.userId, next, note);
      toast.success(`${r.name}: ${STATUS_LABEL[next]}`);
      load();
    } catch (e) {
      toast.error(apiErrorMessage(e, "Could not update"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <p className="text-sm text-gray-600 mb-4">
        People of ride-sharing companies (CEO, manager, …). Verified people show with the <BlueTick /> blue tick,
        designation and company on their posts in the app, and anyone can follow them. Only the follower count is
        shown, never who follows.
      </p>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <select
          className="form-control py-2! w-auto!"
          value={status}
          onChange={(e) => {
            setLoading(true);
            setStatus(e.target.value as Status | "");
          }}
        >
          <option value="">All</option>
          {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button className="btn py-2" onClick={load}>
          Refresh
        </button>
        <button className="btn btn-primary py-2" onClick={() => setPicking(true)}>
          + Verify a user
        </button>
      </div>

      <div className="relative rounded-xl bg-white px-3 lg:px-6 pt-6 pb-6 shadow">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-6">
              <LoadingSvg />
            </div>
          ) : (
            <table className="min-w-full w-full border-collapse text-sm">
              <thead className="bg-secondary/20 text-secondary">
                <tr>
                  <th className="px-3 py-3 text-start">Person</th>
                  <th className="px-3 py-3 text-start">Designation / company</th>
                  <th className="px-3 py-3 text-start">Contact</th>
                  <th className="px-3 py-3 text-start">Followers</th>
                  <th className="px-3 py-3 text-start">Status</th>
                  <th className="px-3 py-3 text-start">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="pt-6 text-center text-gray-500">
                      Nobody here.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.userId} className="border-b border-secondary/20 align-top">
                      <td className="px-3 py-3">
                        <b>{r.name}</b> {r.verified && <BlueTick />}
                        <div className="text-xs text-gray-500">#{r.userId}</div>
                      </td>
                      <td className="px-3 py-3">
                        {r.designation}
                        <div className="text-xs text-gray-600">{r.organization}</div>
                        {r.bio && <div className="text-xs text-gray-500 mt-1 max-w-xs line-clamp-2">{r.bio}</div>}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {r.mobile && (
                          <a href={`tel:${r.mobile}`} className="underline text-secondary">
                            {r.mobile}
                          </a>
                        )}
                        <div>{r.email}</div>
                      </td>
                      <td className="px-3 py-3">
                        {r.followerCount}
                        <div className="text-xs text-gray-500">{r.postCount} posts</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {r.status && (
                          <span className={`px-2 py-1 rounded text-xs ${STATUS_BADGE[r.status]}`}>
                            {STATUS_LABEL[r.status]}
                          </span>
                        )}
                        <div className="text-xs text-gray-500 mt-1">{when(r.updatedAt)}</div>
                        {r.adminNote && <div className="text-xs text-gray-500 mt-1 max-w-[10rem]">Note: {r.adminNote}</div>}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-2 w-36">
                          <button className="btn py-1! text-xs" onClick={() => setEditing({ userId: r.userId, name: r.name })}>
                            Edit
                          </button>
                          {r.status !== "VERIFIED" && (
                            <button
                              className="btn btn-primary py-1! text-xs"
                              disabled={busy === r.userId}
                              onClick={() => changeStatus(r, "VERIFIED")}
                            >
                              Verify
                            </button>
                          )}
                          {r.status === "PENDING" && (
                            <button className="btn py-1! text-xs" disabled={busy === r.userId} onClick={() => changeStatus(r, "REJECTED")}>
                              Reject
                            </button>
                          )}
                          {r.status === "VERIFIED" && (
                            <button
                              className="btn py-1! text-xs bg-red-600! text-white!"
                              disabled={busy === r.userId}
                              onClick={() => changeStatus(r, "REVOKED")}
                            >
                              Remove tick
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {picking && (
        <UserPicker
          onClose={() => setPicking(false)}
          onPick={(u) => {
            setPicking(false);
            setEditing(u);
          }}
        />
      )}
      {editing && (
        <VerifyUserModal
          userId={editing.userId}
          userName={editing.name}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </>
  );
}

type UserRow = { userId: number; name: string; email?: string; mobile?: string };

// Search every account by name, phone or email, then open the form for the chosen one
function UserPicker({ onClose, onPick }: { onClose: () => void; onPick: (u: { userId: number; name: string }) => void }) {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let live = true;
    getAllUsers()
      .then((u: UserRow[]) => live && setUsers(u))
      .catch((e) => {
        toast.error(apiErrorMessage(e, "Could not load users"));
        if (live) setUsers([]);
      });
    return () => {
      live = false;
    };
  }, []);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!users) return [];
    return users
      .filter((u) => !t || [u.name, u.email, u.mobile].some((v) => v?.toLowerCase().includes(t)))
      .slice(0, 30);
  }, [users, q]);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-secondary mb-3">Choose the user to verify</h3>
        <input
          autoFocus
          className="form-control mb-3"
          placeholder="Name, phone or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="max-h-80 overflow-y-auto divide-y">
          {users === null ? (
            <div className="flex justify-center py-6">
              <LoadingSvg />
            </div>
          ) : shown.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No user found.</p>
          ) : (
            shown.map((u) => (
              <button
                key={u.userId}
                className="w-full text-left py-2 px-2 hover:bg-gray-50"
                onClick={() => onPick({ userId: u.userId, name: u.name })}
              >
                <b>{u.name}</b> <span className="text-xs text-gray-500">#{u.userId}</span>
                <div className="text-xs text-gray-600">
                  {u.mobile} {u.email && `· ${u.email}`}
                </div>
              </button>
            ))
          )}
        </div>
        <div className="text-right mt-3">
          <button className="btn py-2" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

type Form = Record<
  "designation" | "organization" | "bio" | "facebookUrl" | "youtubeUrl" | "linkedinUrl" | "instagramUrl" | "tiktokUrl" | "twitterUrl" | "websiteUrl",
  string
>;

const EMPTY: Form = {
  designation: "",
  organization: "",
  bio: "",
  facebookUrl: "",
  youtubeUrl: "",
  linkedinUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  twitterUrl: "",
  websiteUrl: "",
};

// The blue tick form for one user: designation, company, bio, social links, photo.
// "Save & verify" gives the tick at once; "Save" keeps the current status (new = Pending).
export function VerifyUserModal({
  userId,
  userName,
  onClose,
  onSaved,
}: {
  userId: number;
  userName: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [current, setCurrent] = useState<VerifiedProfile | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let live = true;
    getVerifiedProfile(userId)
      .then((p: VerifiedProfile | null) => {
        if (!live) return;
        setCurrent(p);
        if (p) {
          setForm(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, (p[k as keyof VerifiedProfile] as string) ?? ""])) as Form);
          if (p.photo) {
            getUserPhotoUrlAdmin(p.photo)
              .then((url) => (live ? setPhotoUrl(url) : URL.revokeObjectURL(url)))
              .catch(() => {});
          }
        }
      })
      .catch((e) => toast.error(apiErrorMessage(e, "Could not load the profile")))
      .finally(() => live && setLoaded(true));
    return () => {
      live = false;
    };
  }, [userId]);

  useEffect(() => () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
  }, [photoUrl]);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const pickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.(jpe?g|png)$/i.test(file.name) || file.size > 5 * 1024 * 1024) {
      toast.error("Photo: jpg or png under 5 MB");
      return;
    }
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  };

  const save = async (verify: boolean) => {
    if (!form.designation.trim() || !form.organization.trim()) {
      toast.error("Designation and company are required");
      return;
    }
    setSaving(true);
    try {
      if (photoFile) await uploadUserPhotoAdmin(userId, photoFile);
      await saveVerifiedProfile(userId, { ...form, ...(verify ? { status: "VERIFIED" } : {}) });
      toast.success(verify ? `${userName} is verified` : "Saved");
      onSaved();
    } catch (e) {
      toast.error(apiErrorMessage(e, "Could not save"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/50 flex justify-center items-start overflow-y-auto p-2 sm:p-6" onClick={onClose}>
      <div className="bg-white rounded-xl shadow w-full max-w-2xl p-5 my-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-secondary mb-1">
          Blue tick: {userName} {current?.verified && <BlueTick />}
        </h3>
        {current?.status && (
          <p className="text-xs mb-3">
            <span className={`px-2 py-1 rounded ${STATUS_BADGE[current.status]}`}>{STATUS_LABEL[current.status]}</span>{" "}
            <span className="text-gray-500">{current.followerCount} followers</span>
          </p>
        )}
        {!loaded ? (
          <div className="flex justify-center py-6">
            <LoadingSvg />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-2xl text-secondary">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </div>
              <label className="btn py-1! text-xs cursor-pointer">
                {photoUrl ? "Change photo" : "Add photo"}
                <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={pickPhoto} />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="flex flex-col text-sm">
                Designation *
                <input className="form-control" maxLength={100} placeholder="CEO" value={form.designation} onChange={set("designation")} />
              </label>
              <label className="flex flex-col text-sm">
                Company / organization *
                <input
                  className="form-control"
                  maxLength={120}
                  placeholder="Pathao Nepal"
                  value={form.organization}
                  onChange={set("organization")}
                />
              </label>
            </div>
            <label className="flex flex-col text-sm mt-3">
              Bio
              <textarea className="form-control" rows={3} maxLength={500} value={form.bio} onChange={set("bio")} />
            </label>

            <h4 className="text-sm font-semibold text-secondary mt-4 mb-2">Social media links</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              {LINKS.map((l) => (
                <label key={l.key} className="flex flex-col text-sm">
                  {l.label}
                  <input
                    className="form-control"
                    maxLength={300}
                    placeholder={l.placeholder}
                    value={form[l.key as keyof Form]}
                    onChange={set(l.key as keyof Form)}
                  />
                </label>
              ))}
            </div>

            <div className="flex flex-wrap justify-end gap-2 mt-5">
              <button className="btn py-2" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button className="btn py-2" onClick={() => save(false)} disabled={saving}>
                Save
              </button>
              {!current?.verified && (
                <button className="btn btn-primary py-2" onClick={() => save(true)} disabled={saving}>
                  Save &amp; verify
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
