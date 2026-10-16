import { Check } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";

const HIGHLIGHTS = [
  "Kelola vendor, kontrak, dan status pembayaran",
  "Bandingkan rencana vs aktual dalam Rupiah",
  "Checklist dan timeline H-30 sampai H-day",
];

export function LoginBrandPanel() {
  return (
    <aside
      aria-label="Tentang aplikasi"
      className="hidden rounded-lg bg-primary p-8 text-white lg:flex lg:flex-col lg:justify-between lg:gap-10"
    >
      <div className="flex items-center gap-3">
        <BrandMark className="size-10 shrink-0" />
        <span className="type-heading-sm">
          Event Planner &amp; Budget Tracker
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="type-metric-xl">
          Satu tempat untuk vendor, anggaran, dan hari-H.
        </h2>
        <p className="type-body text-white/80">
          Kelola kontrak vendor, pantau rencana vs aktual dalam Rupiah, dan
          pastikan tidak ada tugas yang terlewat.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {HIGHLIGHTS.map((highlight) => (
          <li
            key={highlight}
            className="flex items-start gap-2 type-body text-white/90"
          >
            <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>

      <p className="type-caption text-white/70">
        H-30 · H-7 · H-1 · H-day — posisi acara Anda selalu terlihat.
      </p>
    </aside>
  );
}
