"use client";

import { IMAGE_MAX_MB, mediaFileError, publicMediaUrl, VIDEO_MAX_MB } from "@/api/rental";
import { API_BASE_URL, apiErrorMessage } from "@/api/config";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { Fancybox as NativeFancybox } from "@fancyapps/ui";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaImage, FaTrash, FaUpload } from "react-icons/fa";

export type Media = { id: number; type: "IMAGE" | "VIDEO"; fileName: string };
type FetchUrl = (fileName: string) => Promise<string>;

// Public photos go through Next's image optimizer: resized to the size shown, WebP, lazy-loaded
// and cached. In `next dev` the API is proxied same-origin, which the optimizer can't fetch,
// so dev shows the originals.
const OPTIMIZE = !!API_BASE_URL;

// Lightbox: a 1920px optimized copy instead of the (often 3–5 MB) original
const lightboxUrl = (fileName: string) =>
  OPTIMIZE
    ? `/_next/image?url=${encodeURIComponent(publicMediaUrl(fileName))}&w=1920&q=75`
    : publicMediaUrl(fileName);

const PublicImage = ({ fileName, sizes, preload, onError }: {
  fileName: string;
  sizes: string;
  preload?: boolean;
  onError?: () => void;
}) => (
  <Image src={publicMediaUrl(fileName)} alt="" fill sizes={sizes} preload={preload} unoptimized={!OPTIMIZE}
    className="object-cover" onError={onError} />
);

// Private files (PAN / citizenship, admin views) need the auth header, so they are fetched as a blob
function useObjectUrl(fileName: string, fetchUrl: FetchUrl) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    fetchUrl(fileName)
      .then((u) => {
        objectUrl = u;
        if (cancelled) URL.revokeObjectURL(u);
        else setUrl(u);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileName, fetchUrl]);

  return { url, failed };
}

const LoadFailed = () => (
  <div className="h-full flex items-center justify-center text-xs text-gray-500 p-2 text-center">
    Could not load file
  </div>
);

// Public file: plain URL, so the browser / optimizer cache does the work
const PublicTileBody = ({ media, large, onOpen }: { media: Media; large?: boolean; onOpen: (url: string) => void }) => {
  const [failed, setFailed] = useState(false);
  if (failed) return <LoadFailed />;
  if (media.type === "VIDEO") {
    return <video src={publicMediaUrl(media.fileName)} controls preload="metadata" className="w-full h-full object-cover bg-black" />;
  }
  return (
    <button type="button" onClick={() => onOpen(lightboxUrl(media.fileName))}
      className="relative block w-full h-full cursor-zoom-in">
      {/* The big first photo is the page's main image, so it loads first */}
      <PublicImage fileName={media.fileName} preload={large} onError={() => setFailed(true)}
        sizes={large ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 768px) 17vw, 33vw"} />
    </button>
  );
};

const PrivateTileBody = ({ media, fetchUrl, onOpen }: { media: Media; fetchUrl: FetchUrl; onOpen: (url: string) => void }) => {
  const { url, failed } = useObjectUrl(media.fileName, fetchUrl);
  if (failed) return <LoadFailed />;
  if (!url) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSvg />
      </div>
    );
  }
  if (media.type === "VIDEO") {
    return <video src={url} controls preload="metadata" className="w-full h-full object-cover bg-black" />;
  }
  return (
    <button type="button" onClick={() => onOpen(url)} className="w-full h-full cursor-zoom-in">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="w-full h-full object-cover" />
    </button>
  );
};

const Tile = ({
  media,
  fetchUrl,
  large,
  onOpen,
  onDelete,
}: {
  media: Media;
  // Omitted for public house / room media
  fetchUrl?: FetchUrl;
  large?: boolean;
  onOpen: (url: string) => void;
  onDelete?: () => void;
}) => {
  const size = large ? "h-56 md:h-80" : "h-28";

  return (
    <div className={`relative rounded-lg overflow-hidden bg-secondary/10 ${size}`}>
      {fetchUrl
        ? <PrivateTileBody media={media} fetchUrl={fetchUrl} onOpen={onOpen} />
        : <PublicTileBody media={media} large={large} onOpen={onOpen} />}
      {onDelete && (
        <button
          type="button"
          title="Delete"
          onClick={onDelete}
          className="absolute top-1 right-1 bg-white/90 text-red rounded-full p-1.5 shadow cursor-pointer hover:bg-white"
        >
          <FaTrash size={12} />
        </button>
      )}
    </div>
  );
};

// First photo as a card cover
export function MediaCover({ media, className = "h-44" }: { media?: Media[]; className?: string }) {
  const image = media?.find((m) => m.type === "IMAGE");
  return (
    <div className={`relative bg-secondary/10 overflow-hidden ${className}`}>
      {image ? (
        // Card width in the 1 / 2 / 3 column grid
        <PublicImage fileName={image.fileName} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
      ) : (
        <div className="h-full flex items-center justify-center text-secondary/30">
          <FaImage size={36} />
        </div>
      )}
    </div>
  );
}

// Photos open in a lightbox; videos play inline. The first item is shown big when `hero` is set.
// fetchUrl: only for private files (ID documents, admin) — leave it out for house / room media.
export function MediaGallery({
  media,
  fetchUrl,
  onDelete,
  hero,
  emptyText = "No photos yet.",
}: {
  media: Media[];
  fetchUrl?: FetchUrl;
  onDelete?: (m: Media) => void;
  hero?: boolean;
  emptyText?: string;
}) {
  const urls = useRef(new Map<number, string>());

  if (media.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-secondary/30 p-6 text-center text-sm text-gray-500">
        <FaImage className="mx-auto mb-2 text-2xl text-secondary/30" />
        {emptyText}
      </div>
    );
  }

  // Lightbox over every loaded photo, starting at the clicked one
  const open = (m: Media, url: string) => {
    urls.current.set(m.id, url);
    const images = media.filter((x) => x.type === "IMAGE" && urls.current.has(x.id));
    NativeFancybox.show(
      images.map((x) => ({ src: urls.current.get(x.id)!, type: "image" as const })),
      { startIndex: Math.max(0, images.findIndex((x) => x.id === m.id)) },
    );
  };

  const [first, ...rest] = media;
  const tile = (m: Media, large = false) => (
    <Tile
      key={m.id}
      media={m}
      fetchUrl={fetchUrl}
      large={large}
      onOpen={(url) => open(m, url)}
      onDelete={onDelete ? () => onDelete(m) : undefined}
    />
  );

  return hero ? (
    <div className="flex flex-col gap-2">
      {tile(first, true)}
      {rest.length > 0 && <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">{rest.map((m) => tile(m))}</div>}
    </div>
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">{media.map((m) => tile(m))}</div>
  );
}

// Picks several files and uploads them one by one (the backend takes one file per request)
export function MediaUploader({
  upload,
  onUploaded,
  imagesOnly,
  label = "Add photos / videos",
}: {
  upload: (file: File) => Promise<Media>;
  onUploaded: (m: Media) => void;
  imagesOnly?: boolean;
  label?: string;
}) {
  const [progress, setProgress] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    for (const [i, file] of list.entries()) {
      const error = mediaFileError(file, { imagesOnly });
      if (error) {
        toast.error(error);
        continue;
      }
      setProgress(`Uploading ${i + 1}/${list.length}…`);
      try {
        onUploaded(await upload(file));
      } catch (err) {
        toast.error(apiErrorMessage(err, `${file.name}: upload failed`));
      }
    }
    setProgress(null);
  };

  return (
    <label
      className={`flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-secondary/30 px-4 py-4 text-sm text-secondary ${
        progress ? "opacity-70" : "cursor-pointer hover:border-primary hover:text-primary"
      }`}
    >
      {progress ? <LoadingSvg /> : <FaUpload />}
      <span>{progress ?? label}</span>
      <span className="text-xs text-gray-400 max-sm:hidden">
        (photos ≤{IMAGE_MAX_MB}MB{imagesOnly ? "" : `, videos ≤${VIDEO_MAX_MB}MB`})
      </span>
      <input
        type="file"
        multiple={!imagesOnly}
        className="hidden"
        disabled={!!progress}
        accept={imagesOnly ? "image/jpeg,image/png,image/webp" : "image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );
}
