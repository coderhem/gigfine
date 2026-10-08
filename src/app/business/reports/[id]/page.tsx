"use client";

import { updateBusinessReportStatus } from "@/api/business";
import { apiErrorMessage } from "@/api/config";
import { getReportById, NEXT_STATUSES } from "@/api/problem";
import { getProfileImageUrl } from "@/api/user";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import ReportAttachments from "@/app/components/reportAttachments";
import { Fancybox as NativeFancybox } from "@fancyapps/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft, FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";
import { formatDate, MODE_LABEL, STATUS_BADGE, STATUS_LABEL } from "../../_components/reportMeta";

type Props = { params: Promise<{ id: string }> };

// Reporter's profile photo; click opens it in the lightbox
const ProfilePhoto = ({ imageName, name }: { imageName?: string; name?: string }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageName) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    getProfileImageUrl(imageName)
      .then((u) => {
        objectUrl = u;
        if (cancelled) URL.revokeObjectURL(u);
        else setUrl(u);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageName]);

  if (!url) {
    return (
      <div className="size-24 rounded-full bg-secondary/10 flex items-center justify-center text-4xl text-secondary/50">
        <FaUser />
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => NativeFancybox.show([{ src: url, type: "image" }])}
      className="cursor-zoom-in"
      title="View photo"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={name ?? "Reporter"} className="size-24 rounded-full object-cover" />
    </button>
  );
};

// Label / value row
const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:gap-3 py-2 border-b border-secondary/10 last:border-0">
    <dt className="sm:w-44 shrink-0 text-gray-500 text-sm">{label}</dt>
    <dd className="text-sm break-words">{children || "-"}</dd>
  </div>
);

const Card = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="bg-white rounded-xl shadow border border-secondary/10 p-5">
    <h3 className="h6 mb-3">{title}</h3>
    {children}
  </div>
);

// Everything about one forwarded report: the report, its attachments,
// the reporter's profile (users table) and their rider profile when they have one.
const BusinessReportDetail = ({ params }: Props) => {
  const { id } = use(params);
  const { user } = useSelector((state: any) => state.auth);
  const router = useRouter();

  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !localStorage.getItem("token")) {
      router.replace("/business/login");
      return;
    }
    getReportById(id)
      .then(setReport)
      .catch((err) => setError(apiErrorMessage(err, "Could not load the report")));
  }, [id]);

  const handleStatus = async (status: string) => {
    setSaving(true);
    try {
      setReport(await updateBusinessReportStatus(report.reportId, status));
      toast.success(`Report marked as ${STATUS_LABEL[status]}.`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update status"));
    } finally {
      setSaving(false);
    }
  };

  const back = (
    <Link href="/business" className="inline-flex items-center gap-2 text-sm mb-5 hover:text-primary">
      <FaArrowLeft /> Back to reports
    </Link>
  );

  if (error) {
    return (
      <section className="py-8 md:py-11">
        <div className="container">
          {back}
          <p className="text-red">{error}</p>
        </div>
      </section>
    );
  }

  if (!report) {
    return <LoadingSvg className="absolute left-1/2 top-1/2 -translate-1/2 size-20" />;
  }

  const reporter = report.reporter ?? {};
  const isPassengerReport = report.reporterMode === "PESSENGER";
  const hasRiderProfile = report.reporterVehicleNumber || report.reporterLicenseNumber;
  const next: string[] = NEXT_STATUSES[report.status as keyof typeof NEXT_STATUSES] ?? [];

  return (
    <section className="py-8 md:py-11">
      <div className="container">
        {back}

        {/* Header: what + status */}
        <div className="flex flex-wrap gap-4 items-start justify-between mb-6">
          <div>
            <h2 className="h3 mb-1 capitalize">
              {report.company} · {report.service}
            </h2>
            <p className="text-sm text-gray-500 mb-0">
              Report #{report.reportId} · reported {formatDate(report.createdAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`text-sm font-semibold px-3 py-1 rounded ${
                STATUS_BADGE[report.status] ?? "bg-secondary/10"
              }`}
            >
              {STATUS_LABEL[report.status] ?? report.status}
            </span>
            {next.length > 0 && (
              <div className="flex gap-2">
                {next.map((s) => (
                  <button
                    key={s}
                    className="btn btn-primary py-1! px-3! text-sm"
                    disabled={saving}
                    onClick={() => handleStatus(s)}
                  >
                    Mark {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Report */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <Card title="Problem">
              <p className="whitespace-pre-line mb-4">
                {report.problem || "No written description — listen to the voice note."}
              </p>
              <ReportAttachments report={report} autoLoad className="flex flex-col gap-4" />
            </Card>

            {isPassengerReport && (
              <Card title="Rider being reported">
                <dl>
                  <Field label="Rider name">{report.riderName}</Field>
                  <Field label="Vehicle number">
                    <span className="uppercase">{report.vehicleNumber}</span>
                  </Field>
                </dl>
              </Card>
            )}

            <Card title="Timeline">
              <dl>
                <Field label="Reported">{formatDate(report.createdAt)}</Field>
                <Field label="Forwarded to you">{formatDate(report.forwardedAt)}</Field>
                <Field label="Under review since">{formatDate(report.reviewedAt)}</Field>
                <Field label="Resolved / rejected">{formatDate(report.resolvedAt)}</Field>
              </dl>
            </Card>
          </div>

          {/* Reporter */}
          <div className="flex flex-col gap-5">
            <Card title="Reported by">
              <div className="flex flex-col items-center text-center mb-4">
                <ProfilePhoto imageName={reporter.imageName} name={reporter.name} />
                <p className="font-semibold mt-3 mb-0">{reporter.name}</p>
                <p className="text-sm text-gray-500 mb-0">
                  {MODE_LABEL[report.reporterMode] ?? report.reporterMode} at the time of reporting
                </p>
              </div>
              <dl>
                <Field label="User ID">{reporter.userId}</Field>
                <Field label="Phone">
                  {reporter.mobile && (
                    <a href={`tel:${reporter.mobile}`} className="underline">
                      {reporter.mobile}
                    </a>
                  )}
                </Field>
                <Field label="Email">
                  {reporter.email && (
                    <a href={`mailto:${reporter.email}`} className="underline">
                      {reporter.email}
                    </a>
                  )}
                </Field>
                <Field label="Current mode">{MODE_LABEL[reporter.modes] ?? reporter.modes}</Field>
              </dl>
            </Card>

            {hasRiderProfile && (
              <Card title="Reporter's rider profile">
                <dl>
                  <Field label="Vehicle number">
                    <span className="uppercase">{report.reporterVehicleNumber}</span>
                  </Field>
                  <Field label="License number">
                    <span className="uppercase">{report.reporterLicenseNumber}</span>
                  </Field>
                </dl>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessReportDetail;
