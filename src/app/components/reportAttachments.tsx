"use client";
import { useEffect, useState } from "react";
import { FaImage, FaPlay } from "react-icons/fa";
import { getReportFileUrl } from "@/api/problem";

type FetchUrl = (kind: "image" | "voice", fileName: string) => Promise<string>;

// Files need the auth header, so they are fetched only when the user asks for them
const Attachment = ({
  kind,
  fileName,
  fetchUrl,
}: {
  kind: "image" | "voice";
  fileName: string;
  fetchUrl: FetchUrl;
}) => {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  async function load() {
    try {
      setUrl(await fetchUrl(kind, fileName));
    } catch {
      setFailed(true);
    }
  }

  if (failed) {
    return <span className="text-xs text-red">Could not load {kind}</span>;
  }

  if (!url) {
    return (
      <button
        type="button"
        onClick={load}
        className="text-sm flex items-center gap-1 underline hover:no-underline"
      >
        {kind === "voice" ? <FaPlay /> : <FaImage />}
        {kind === "voice" ? "Play voice note" : "View image"}
      </button>
    );
  }

  return kind === "voice" ? (
    <audio controls autoPlay src={url} className="w-full" />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="Report attachment" className="max-h-48 rounded" />
  );
};

// fetchUrl: pass getReportFileUrlAdmin on admin pages (they use the admin token)
const ReportAttachments = ({
  report,
  fetchUrl = getReportFileUrl,
  className = "flex flex-col gap-3 px-5 pb-5",
}: {
  report: any;
  fetchUrl?: FetchUrl;
  className?: string;
}) => {
  if (!report.voice && !report.image) return null;
  return (
    <div className={className}>
      {report.voice && (
        <Attachment kind="voice" fileName={report.voice} fetchUrl={fetchUrl} />
      )}
      {report.image && (
        <Attachment kind="image" fileName={report.image} fetchUrl={fetchUrl} />
      )}
    </div>
  );
};

export default ReportAttachments;
