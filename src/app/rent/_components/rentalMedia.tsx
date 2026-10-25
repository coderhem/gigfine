"use client";

import { getRentalMediaUrl, IMAGE_MAX_MB, mediaFileError, VIDEO_MAX_MB } from "@/api/rental";
import { apiErrorMessage } from "@/api/config";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { Fancybox as NativeFancybox } from "@fancyapps/ui";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaImage, FaTrash, FaUpload } from "react-icons/fa";

export type Media = { id: number; type: "IMAGE" | "VIDEO"; fileName: string };
type FetchUrl = (fileName: string) => Promise<string>;

// Media needs the auth header, so each file is fetched as a blob
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

const Tile = ({
  media,
  fetchUrl,
  large,
  onOpen,
  onDelete,
}: {
  media: Media;
  fetchUrl: FetchUrl;
  large?: boolean;
  onOpen: (url: string) => void;
  onDelete?: () => void;
}) => {
  const { url, failed } = useObjectUrl(media.fileName, fetchUrl);
  const size = large ? "h-56 md:h-80" : "h-28";

  return (
    <div className={`relative rounded-lg overflow-hidden bg-secondary/10 ${size}`}>
      {failed ? (
        <div className="h-full flex items-center justify-center text-xs text-gray-500 p-2 text-center">
          Could not load file
        </div>
      ) : !url ? (
        <div className="h-full flex items-center justify-center">
          <LoadingSvg />
        </div>
      ) : media.type === "VIDEO" ? (
        <video src={url} controls preload="metadata" className="w-full h-full object-cover bg-black" />
      ) : (
        <button type="button" onClick={() => onOpen(url)} className="w-full h-full cursor-zoom-in">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="w-full h-full object-cover" />
        </button>
      )}
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
    <div className={`bg-secondary/10 overflow-hidden ${className}`}>
      {image ? <CoverImage fileName={image.fileName} /> : (
        <div className="h-full flex items-center justify-center text-secondary/30">
          <FaImage size={36} />
        </div>
      )}
    </div>
  );
}

const CoverImage = ({ fileName }: { fileName: string }) => {
  const { url } = useObjectUrl(fileName, getRentalMediaUrl);
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="w-full h-full object-cover" />
  ) : (
    <div className="h-full animate-pulse bg-secondary/10" />
  );
};

// Photos open in a lightbox; videos play inline. The first item is shown big when `hero` is set.
export function MediaGallery({
  media,
  fetchUrl = getRentalMediaUrl,
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
