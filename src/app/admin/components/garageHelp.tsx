"use client";

import {
  getChatVoiceUrl,
  getGarageChat,
  getGarageMediaUrl,
  getGarageRequests,
  getGarages,
  getGarageStats,
} from "@/api/admin";
import { apiErrorMessage } from "@/api/config";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { mapsLink } from "@/app/rent/_components/locationMap";
import { Fancybox as NativeFancybox } from "@fancyapps/ui";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// Breakdown help (the app's Garage tab): a rider's vehicle broke down, nearby garages were told,
// the first to accept went. Admins see both sides, the search radius, and the rider's rating;
// and every garage / workshop with its pin, online state and rating.

type Tab = "requests" | "garages";

const STATUSES = ["OPEN", "ACCEPTED", "COMPLETED", "CANCELLED", "EXPIRED"] as const;

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Looking",
  ACCEPTED: "Garage coming",
  COMPLETED: "Done",
  CANCELLED: "Cancelled",
  EXPIRED: "No garage accepted",
};

const STATUS_BADGE: Record<string, string> = {
  OPEN: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-700",
  EXPIRED: "bg-red-100 text-red-800",
};

const VEHICLE_LABEL: Record<string, string> = { BIKE: "Bike", SCOOTER: "Scooter", CAR: "Car", OTHER: "Other" };

type GarageRequest = {
  id: number;
  vehicleType: string;
  note?: string;
  image?: string;
  voice?: string;
  status: string;
  createdAt?: string;
  acceptedAt?: string;
  closedAt?: string;
  notifiedCount?: number;
  radiusKm?: number;
  latitude?: number;
  longitude?: number;
  requesterId?: number;
  requesterName?: string;
  requesterPhone?: string;
  garageName?: string;
  garagePhone?: string;
  ratingStars?: number;
  ratingComment?: string;
};

type ChatMessage = { id: number; senderId: number; kind: string; text?: string; voice?: string; sentAt?: string };

// The chat opened in the modal: whose request, and its messages
type ChatView = { request: GarageRequest; messages: ChatMessage[]; voices: Record<number, string> };

type Garage = {
  userId: number;
  name: string;
  phone?: string;
  address?: string;
  status: string;
  latitude?: number;
  longitude?: number;
  online: boolean;
  ratingAverage?: number;
  ratingCount: number;
  jobsDone: number;
};

const when = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "-");

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

async function openPhoto(fileName: string) {
  try {
    const url = await getGarageMediaUrl(fileName);
    NativeFancybox.show([{ src: url, type: "image" }], { on: { destroy: () => URL.revokeObjectURL(url) } });
  } catch (err) {
    toast.error(apiErrorMessage(err, "Failed to load the photo"));
  }
}

export default function GarageHelp() {
  const [tab, setTab] = useState<Tab>("requests");
  const [status, setStatus] = useState("");
  const [requests, setRequests] = useState<GarageRequest[]>([]);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  // request id -> blob URL of its voice note, once played
  const [voices, setVoices] = useState<Record<number, string>>({});
  const [chat, setChat] = useState<ChatView | null>(null);

  const openChat = async (r: GarageRequest) => {
    try {
      setChat({ request: r, messages: await getGarageChat(r.id), voices: {} });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load the chat"));
    }
  };

  const playChatVoice = async (m: ChatMessage) => {
    try {
      const url = await getChatVoiceUrl(m.voice!);
      setChat((c) => (c ? { ...c, voices: { ...c.voices, [m.id]: url } } : c));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load the voice message"));
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const [s, list] = await Promise.all([
        getGarageStats(),
        tab === "requests" ? getGarageRequests(status || undefined) : getGarages(),
      ]);
      setStats(s);
      if (tab === "requests") setRequests(list);
      else setGarages(list);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load garage help"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tab, status]);

  const playVoice = async (id: number, fileName: string) => {
    try {
      const url = await getGarageMediaUrl(fileName);
      setVoices((prev) => ({ ...prev, [id]: url }));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load the voice note"));
    }
  };

  const tabBtn = (t: Tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      className={`px-4 py-2 rounded-lg cursor-pointer ${
        tab === t ? "bg-secondary text-white" : "bg-gray-200 text-secondary"
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      {/* Counts per status: a tap filters the requests */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setTab("requests");
              setStatus(status === s ? "" : s);
            }}
            className={`bg-white rounded-xl shadow p-3 text-left cursor-pointer border-2 ${
              status === s && tab === "requests" ? "border-primary" : "border-transparent"
            }`}
          >
            <div className="text-2xl font-bold text-secondary">{stats[s] ?? 0}</div>
            <div className="text-xs text-gray-500">{STATUS_LABEL[s]}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {tabBtn("requests", "Requests")}
        {tabBtn("garages", "Garages")}
        {tab === "requests" && (
          <select className="form-control py-2! w-auto!" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        )}
        <button className="btn py-2" onClick={load}>
          Refresh
        </button>
      </div>

      <div className="relative rounded-xl bg-white px-3 lg:px-6 pt-6 pb-6 shadow">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-6">
              <LoadingSvg />
            </div>
          ) : tab === "requests" ? (
            <table className="min-w-full w-full border-collapse text-sm">
              <thead className="bg-secondary/20 text-secondary">
                <tr>
                  <th className="px-3 py-3 text-start">Asked</th>
                  <th className="px-3 py-3 text-start">Vehicle</th>
                  <th className="px-3 py-3 text-start">Rider</th>
                  <th className="px-3 py-3 text-start">Where</th>
                  <th className="px-3 py-3 text-start">Reach</th>
                  <th className="px-3 py-3 text-start">Garage</th>
                  <th className="px-3 py-3 text-start">Status</th>
                  <th className="px-3 py-3 text-start">Rating</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="pt-6 text-center text-gray-500">
                      No help requests here.
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="border-b border-secondary/20 align-top">
                      <td className="px-3 py-3 whitespace-nowrap">
                        #{r.id}
                        <div className="text-xs text-gray-500">{when(r.createdAt)}</div>
                      </td>
                      <td className="px-3 py-3">
                        <b>{VEHICLE_LABEL[r.vehicleType] ?? r.vehicleType}</b>
                        {r.note && <div className="text-xs">{r.note}</div>}
                        <div className="flex flex-col gap-1 mt-1">
                          {r.image && (
                            <button className="text-xs underline text-secondary w-fit" onClick={() => openPhoto(r.image!)}>
                              Photo
                            </button>
                          )}
                          {r.voice &&
                            (voices[r.id] ? (
                              <audio controls src={voices[r.id]} className="h-8 w-48" />
                            ) : (
                              <button
                                className="text-xs underline text-secondary w-fit"
                                onClick={() => playVoice(r.id, r.voice!)}
                              >
                                Voice note
                              </button>
                            ))}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {r.requesterName}
                        <div className="text-xs text-gray-500">{r.requesterPhone}</div>
                      </td>
                      <td className="px-3 py-3">
                        {r.latitude != null && (
                          <a href={mapsLink(r.latitude, r.longitude!)} target="_blank" rel="noreferrer">
                            Vehicle on map
                          </a>
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {r.radiusKm} km
                        <div className="text-xs text-gray-500">{r.notifiedCount} garage(s) told</div>
                      </td>
                      <td className="px-3 py-3">
                        {r.garageName ? (
                          <>
                            {r.garageName}
                            <div className="text-xs text-gray-500">{r.garagePhone}</div>
                            <div className="text-xs text-gray-500">Accepted {when(r.acceptedAt)}</div>
                            <button className="text-xs underline text-secondary" onClick={() => openChat(r)}>
                              Chat history
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_BADGE[r.status] ?? ""}`}>
                          {STATUS_LABEL[r.status] ?? r.status}
                        </span>
                        {r.closedAt && <div className="text-xs text-gray-500 mt-1">{when(r.closedAt)}</div>}
                      </td>
                      <td className="px-3 py-3">
                        {r.ratingStars ? (
                          <>
                            <span className="text-amber-500">{stars(r.ratingStars)}</span>
                            {r.ratingComment && <div className="text-xs">“{r.ratingComment}”</div>}
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full w-full border-collapse text-sm">
              <thead className="bg-secondary/20 text-secondary">
                <tr>
                  <th className="px-3 py-3 text-start">Garage</th>
                  <th className="px-3 py-3 text-start">Approval</th>
                  <th className="px-3 py-3 text-start">Online</th>
                  <th className="px-3 py-3 text-start">Map pin</th>
                  <th className="px-3 py-3 text-start">Rating</th>
                  <th className="px-3 py-3 text-start">Jobs done</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {garages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="pt-6 text-center text-gray-500">
                      No garages yet. Set a business&apos;s type to &quot;Garage / Workshop&quot; in Businesses.
                    </td>
                  </tr>
                ) : (
                  garages.map((g) => (
                    <tr key={g.userId} className="border-b border-secondary/20">
                      <td className="px-3 py-3">
                        {g.name}
                        <div className="text-xs text-gray-500">{g.phone}</div>
                        <div className="text-xs text-gray-500">{g.address}</div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            g.status === "APPROVED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {g.status === "APPROVED" ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={g.online ? "text-green-700 font-semibold" : "text-gray-400"}>
                          ● {g.online ? "Online" : "Offline"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {g.latitude != null ? (
                          <a href={mapsLink(g.latitude, g.longitude!)} target="_blank" rel="noreferrer">
                            View pin
                          </a>
                        ) : (
                          <span className="text-yellow-700">No pin: riders cannot find it</span>
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {g.ratingAverage != null ? (
                          <>
                            <span className="text-amber-500">★</span> {g.ratingAverage.toFixed(1)}{" "}
                            <span className="text-xs text-gray-500">({g.ratingCount})</span>
                          </>
                        ) : (
                          <span className="text-gray-400">No ratings</span>
                        )}
                      </td>
                      <td className="px-3 py-3">{g.jobsDone}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {chat && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-4 max-h-[85vh] flex flex-col">
            <h3 className="h6 mb-1">
              Chat #{chat.request.id}: {chat.request.requesterName} ↔ {chat.request.garageName}
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              The rider and the garage see a chat for 1 day; admins can read it for 7 days after the accept.
            </p>
            <div className="flex-1 overflow-y-auto flex flex-col gap-2">
              {chat.messages.length === 0 ? (
                <p className="text-gray-500 text-sm">No messages (or older than 7 days).</p>
              ) : (
                chat.messages.map((m) => {
                  // The rider on the left, the garage on the right
                  const fromRider = m.senderId === chat.request.requesterId;
                  return (
                    <div key={m.id} className={`flex ${fromRider ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`rounded-xl px-3 py-2 text-sm max-w-[80%] ${
                          fromRider ? "bg-gray-100" : "bg-secondary text-white"
                        }`}
                      >
                        <div className="text-[10px] opacity-70">
                          {fromRider ? chat.request.requesterName : chat.request.garageName} · {when(m.sentAt)}
                        </div>
                        {m.kind === "VOICE" ? (
                          chat.voices[m.id] ? (
                            <audio controls src={chat.voices[m.id]} className="h-8 w-48" />
                          ) : (
                            <button className="underline" onClick={() => playChatVoice(m)}>
                              Voice message
                            </button>
                          )
                        ) : (
                          m.text
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex justify-end mt-3">
              <button className="btn py-1! px-3! text-sm" onClick={() => setChat(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
