"use client";
import { useEffect, useState } from "react";
import { FaImage, FaPlay } from "react-icons/fa";
import { Fancybox as NativeFancybox } from "@fancyapps/ui";
import { getReportFileUrl } from "@/api/problem";

type FetchUrl = (kind: "image" | "voice", fileName: string) => Promise<string>;

// File requests use responseType "blob", so a JSON error body arrives as a Blob too
async function fileErrorMessage(err: any): Promise<string> {
  const data = err?.response?.data;
  const status = err?.response?.status;
  if (data instanceof Blob) {
    try {
      const body = JSON.parse(await data.text());
      if (body?.message) return `${status}: ${body.message}`;
    } catch {
      /* not JSON */
    }
  }
  return status ? `HTTP ${status}` : err?.message || "network error";
}

// Files need the auth header, so they can't be a plain src.
// autoLoad fetches right away; otherwise the user clicks to load.
const Attachment = ({
  kind,
  fileName,
  fetchUrl,
  autoLoad,
  compact,
}: {
  kind: "image" | "voice";
  fileName: string;
  fetchUrl: FetchUrl;
  autoLoad: boolean;
  compact: boolean;
}) => {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requested, setRequested] = useState(autoLoad);

  useEffect(() => {
    if (!requested) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    fetchUrl(kind, fileName)
      .then((u) => {
        objectUrl = u;
        if (cancelled) URL.revokeObjectURL(u);
        else setUrl(u);
      })
      .catch(async (err) => {
        const message = await fileErrorMessage(err);
        if (!cancelled) setError(message);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [requested, kind, fileName, fetchUrl]);

  if (error) {
    return (
      <span className="text-xs text-red" title={fileName}>
        Could not load {kind} ({error})
      </span>
    );
  }

  if (!requested) {
    return (
      <button
        type="button"
        onClick={() => setRequested(true)}
        className="text-sm flex items-center gap-1 underline hover:no-underline"
      >
        {kind === "voice" ? <FaPlay /> : <FaImage />}
        {kind === "voice" ? "Play voice note" : "View image"}
      </button>
    );
  }

  if (!url) {
    return <span className="text-xs text-gray-500">Loading {kind}…</span>;
  }

  if (kind === "voice") {
    return (
      <audio
        controls
        autoPlay={!autoLoad}
        src={url}
        className={compact ? "h-9 w-56 max-w-full" : "w-full"}
      />
    );
  }

  if (compact) {
    // Small thumbnail; the full image opens in a lightbox.
    // type "image" is needed because a blob: URL has no file extension.
    return (
      <button
        type="button"
        onClick={() => NativeFancybox.show([{ src: url, type: "image" }])}
        className="shrink-0 rounded border border-secondary/20 overflow-hidden cursor-zoom-in hover:ring-2 hover:ring-primary/50"
        title="View image"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Report attachment" className="size-12 object-cover" />
      </button>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="Report attachment" className="max-h-48 rounded" />
  );
};

// fetchUrl: pass getReportFileUrlAdmin on admin pages (they use the admin token)
// compact: one-line layout for table rows (small player + thumbnail)
const ReportAttachments = ({
  report,
  fetchUrl = getReportFileUrl,
  autoLoad = false,
  compact = false,
  className,
}: {
  report: any;
  fetchUrl?: FetchUrl;
  autoLoad?: boolean;
  compact?: boolean;
  className?: string;
}) => {
  if (!report.voice && !report.image) return null;
  const layout =
    className ??
    (compact
      ? "flex items-center gap-2"
      : "flex flex-col gap-3 px-5 pb-5");
  return (
    <div className={layout}>
      {report.voice && (
        <Attachment
          kind="voice"
          fileName={report.voice}
          fetchUrl={fetchUrl}
          autoLoad={autoLoad}
          compact={compact}
        />
      )}
      {report.image && (
        <Attachment
          kind="image"
          fileName={report.image}
          fetchUrl={fetchUrl}
          autoLoad={autoLoad}
          compact={compact}
        />
      )}
    </div>
  );
};

export default ReportAttachments;
