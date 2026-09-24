"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import problemValidation from "@/validation/problem.schema.js";
import toast from "react-hot-toast";
import { Fancybox as NativeFancybox } from "@fancyapps/ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaImage, FaTrash } from "react-icons/fa";
import LoadingSvg from "../loader/loadingSvg";
import VoiceInput from "./voiceInput";
import { useRouter } from "next/navigation";
import {
  addProblem,
  getReportFileUrl,
  IMAGE_EXTENSIONS,
  IMAGE_MAX_MB,
  updateReport,
  uploadReportImage,
  uploadReportVoice,
} from "@/api/problem";
import { apiErrorMessage } from "@/api/config";

type Props = {
  // "RIDER" | "PESSENGER" — passengers can also name the rider and vehicle
  mode: string;
  // Existing ReportDto when editing
  problem?: any;
  onSuccess?: () => void | Promise<void>;
};

// Loads a saved report image/voice (needs the auth header) as an object URL
function useReportFileUrl(kind: "image" | "voice", fileName?: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!fileName) return;
    let objectUrl: string | null = null;
    getReportFileUrl(kind, fileName)
      .then((u) => {
        objectUrl = u;
        setUrl(u);
      })
      .catch(() => setUrl(null));
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [kind, fileName]);
  return url;
}

const ProblemForm = ({ mode, problem, onSuccess }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isEdit = !!problem?.reportId;
  const isPassenger = mode === "PESSENGER";

  const savedImageUrl = useReportFileUrl("image", problem?.image);
  const savedVoiceUrl = useReportFileUrl("voice", problem?.voice);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(problemValidation),
    defaultValues: {
      service: problem?.service || "ride",
      company: problem?.company || "",
      problem: problem?.problem || "",
      riderName: problem?.riderName || "",
      vehicleNumber: problem?.vehicleNumber || "",
    },
  });

  const imagePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile],
  );
  useEffect(
    () => () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    },
    [imagePreview],
  );

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!IMAGE_EXTENSIONS.includes(ext)) {
      toast.error(`Allowed images: ${IMAGE_EXTENSIONS.join(", ")}`);
      return;
    }
    if (file.size > IMAGE_MAX_MB * 1024 * 1024) {
      toast.error(`Image must be less than ${IMAGE_MAX_MB}MB`);
      return;
    }
    setImageFile(file);
  }

  async function submitForm(data: any) {
    const hasVoice = !!voiceFile || !!problem?.voice;
    if (!data.problem && !hasVoice) {
      setError("problem", {
        message: "Describe the problem or add a voice note.",
      });
      return;
    }

    const payload = {
      service: data.service,
      company: data.company,
      problem: data.problem || null,
      riderName: isPassenger ? data.riderName || null : null,
      vehicleNumber: isPassenger ? data.vehicleNumber || null : null,
    };

    setIsLoading(true);
    try {
      if (isEdit) {
        // Voice first: the backend rejects an empty description while the report has no voice
        if (voiceFile) await uploadReportVoice(problem.reportId, voiceFile);
        if (imageFile) await uploadReportImage(problem.reportId, imageFile);
        await updateReport(problem.reportId, payload);

        toast.success("Problem updated successfully!");
        router.push("/home");
      } else {
        const created = await addProblem(payload);
        await uploadAttachments(created.reportId);

        toast.success("Problem added successfully!");
        reset();
        setVoiceFile(null);
        setImageFile(null);
      }

      if (onSuccess) {
        await onSuccess();
      }

      NativeFancybox.close();
    } catch (err: any) {
      toast.error(apiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  // The report already exists at this point, so report upload failures without undoing it
  async function uploadAttachments(reportId: number) {
    const uploads: [string, File | null, (id: number, f: File) => Promise<any>][] = [
      ["Voice", voiceFile, uploadReportVoice],
      ["Image", imageFile, uploadReportImage],
    ];
    for (const [label, file, upload] of uploads) {
      if (!file) continue;
      try {
        await upload(reportId, file);
      } catch (err) {
        toast.error(`Report saved, but ${label.toLowerCase()} upload failed: ${apiErrorMessage(err)}`);
      }
    }
  }

  const shownImage = imagePreview ?? savedImageUrl;

  return (
    <>
      <form
        className="problem-form text-start"
        onSubmit={handleSubmit(submitForm)}
      >
        <div className="form-group">
          <label htmlFor="service">Which service was it?</label>
          <select
            id="service"
            className="form-control py-3!"
            {...register("service")}
          >
            <option value="ride">Ride</option>
            <option value="delivery">Delivery</option>
          </select>
          {errors.service && (
            <p className="text-red text-sm  mt-1">
              {String(errors.service.message)}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="company">Which company is this regarding?</label>
          <select
            id="company"
            className="form-control py-3!"
            {...register("company")}
          >
            <option value="">Select Company</option>
            <option value="Pathao">Pathao</option>
            <option value="inDrive">Indrive</option>
            <option value="Yango">Yango</option>
            <option value="Sajilo">Sajilo</option>
            <option value="Firiri">Firiri</option>
            {/* <option value="IDF">IDF</option>
            <option value="ChiyaCut">ChiyaCut</option> */}
          </select>
          {errors.company && (
            <p className="text-red text-sm  mt-1">
              {String(errors.company.message)}
            </p>
          )}
        </div>

        {isPassenger && (
          <>
            <div className="form-group">
              <label htmlFor="riderName">
                Rider Name <span className="text-secondary/60">(optional)</span>
              </label>
              <input
                id="riderName"
                className="form-control"
                placeholder="Rider Name Here"
                {...register("riderName")}
              />
            </div>
            <div className="form-group">
              <label htmlFor="vehicleNumber">
                Vehicle Number{" "}
                <span className="text-secondary/60">(optional)</span>
              </label>
              <input
                id="vehicleNumber"
                className="form-control"
                placeholder="Vehicle Number Here"
                {...register("vehicleNumber")}
              />
              <p className="text-xs px-1 text-secondary/70 mb-0">
                e.g. ba 2 pa 1234
              </p>
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="message">What problem are you facing?</label>
          <textarea
            id="message"
            className="form-control min-h-30"
            placeholder="Describe Problem Here"
            {...register("problem")}
          />
          <p className="text-xs px-1 text-secondary/70 mb-0">
            Optional if you add a voice note.
          </p>
          {errors.problem && (
            <p className="text-red text-sm mt-1">
              {String(errors.problem.message)}
            </p>
          )}
        </div>

        <div className="form-group">
          <label>
            Voice Note{" "}
            <span className="text-secondary/60">
              (optional if you describe the problem)
            </span>
          </label>
          <VoiceInput
            value={voiceFile}
            onChange={setVoiceFile}
            existingUrl={savedVoiceUrl}
          />
        </div>

        <div className="form-group">
          <label>
            Image <span className="text-secondary/60">(optional)</span>
          </label>
          <div className="border border-secondary/20 rounded p-3 bg-white">
            <div className="flex flex-wrap gap-3 items-center">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="btn btn-outline text-sm flex items-center gap-2 py-2!"
              >
                <FaImage /> {shownImage ? "Change image" : "Add image"}
              </button>
              {imageFile && (
                <button
                  type="button"
                  onClick={() => setImageFile(null)}
                  className="text-red text-sm flex items-center gap-1"
                >
                  <FaTrash /> Remove
                </button>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept={IMAGE_EXTENSIONS.map((e) => "." + e).join(",")}
                className="hidden"
                onChange={handleImage}
              />
            </div>
            {shownImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shownImage}
                alt="Report attachment"
                className="mt-3 max-h-48 rounded"
              />
            )}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              Submitting &nbsp;
              <LoadingSvg />
            </>
          ) : isEdit ? (
            "Update Problem "
          ) : (
            "Add Problem +"
          )}
        </button>
      </form>
    </>
  );
};

export default ProblemForm;
