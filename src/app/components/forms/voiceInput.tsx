"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaMicrophone, FaStop, FaTrash, FaUpload } from "react-icons/fa";
import { VOICE_EXTENSIONS, VOICE_MAX_MB } from "@/api/problem";

// Keeps a recording well under the backend's 10MB limit
const MAX_RECORD_SECONDS = 180;

type Props = {
  value: File | null;
  onChange: (file: File | null) => void;
  // Object URL of the voice note already saved on the report (edit mode)
  existingUrl?: string | null;
};

// Browsers record in different containers: Chrome/Firefox → webm, Safari → mp4
function pickRecorderType() {
  const candidates = [
    { mime: "audio/webm", ext: "webm" },
    { mime: "audio/mp4", ext: "m4a" },
    { mime: "audio/ogg", ext: "ogg" },
  ];
  return (
    candidates.find((c) => MediaRecorder.isTypeSupported(c.mime)) ?? {
      mime: "",
      ext: "webm",
    }
  );
}

const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

const VoiceInput = ({ value, onChange, existingUrl }: Props) => {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview for the newly picked / recorded file
  const previewUrl = useMemo(
    () => (value ? URL.createObjectURL(value) : null),
    [value],
  );
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  // Release the microphone if the form closes mid-recording
  useEffect(() => () => stopTracks(), []);

  function stopTracks() {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("Voice recording is not supported in this browser. Upload a file instead.");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast.error("Microphone permission denied.");
      return;
    }

    const { mime, ext } = pickRecorderType();
    const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      stopTracks();
      setRecording(false);
      const type = recorder.mimeType || mime || "audio/webm";
      const blob = new Blob(chunks, { type });
      if (blob.size === 0) return;
      onChange(new File([blob], `voice-${Date.now()}.${ext}`, { type }));
    };

    streamRef.current = stream;
    recorderRef.current = recorder;
    recorder.start();

    let elapsed = 0;
    setSeconds(0);
    setRecording(true);
    timerRef.current = setInterval(() => {
      elapsed += 1;
      setSeconds(elapsed);
      if (elapsed >= MAX_RECORD_SECONDS) stopRecording();
    }, 1000);
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!VOICE_EXTENSIONS.includes(ext)) {
      toast.error(`Allowed voice files: ${VOICE_EXTENSIONS.join(", ")}`);
      return;
    }
    if (file.size > VOICE_MAX_MB * 1024 * 1024) {
      toast.error(`Voice file must be less than ${VOICE_MAX_MB}MB`);
      return;
    }
    onChange(file);
  }

  const playUrl = previewUrl ?? existingUrl ?? null;

  return (
    <div className="border border-secondary/20 rounded p-3 bg-white">
      <div className="flex flex-wrap gap-3 items-center">
        {recording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="btn btn-primary text-sm flex items-center gap-2 py-2!"
          >
            <FaStop /> Stop ({formatTime(seconds)})
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={startRecording}
              className="btn btn-outline text-sm flex items-center gap-2 py-2!"
            >
              <FaMicrophone /> {playUrl ? "Record again" : "Record"}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-outline text-sm flex items-center gap-2 py-2!"
            >
              <FaUpload /> Upload
            </button>
          </>
        )}
        {value && !recording && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-red text-sm flex items-center gap-1"
          >
            <FaTrash /> Remove
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={`audio/*,${VOICE_EXTENSIONS.map((e) => "." + e).join(",")}`}
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {recording && (
        <p className="text-sm text-primary mt-2 mb-0">
          ● Recording… max {formatTime(MAX_RECORD_SECONDS)}
        </p>
      )}

      {playUrl && !recording && (
        <div className="mt-3">
          <audio controls src={playUrl} className="w-full" />
          {!value && existingUrl && (
            <p className="text-xs text-secondary/70 mt-1 mb-0">
              Saved voice note. Record or upload to replace it.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
