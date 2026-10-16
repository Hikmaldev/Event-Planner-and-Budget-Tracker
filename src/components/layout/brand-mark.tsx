export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Event Planner & Budget Tracker"
    >
      <rect width="64" height="64" rx="14" fill="var(--primary)" />
      <rect x="20" y="12" width="6" height="12" rx="3" fill="var(--card)" />
      <rect x="38" y="12" width="6" height="12" rx="3" fill="var(--card)" />
      <rect x="14" y="19" width="36" height="31" rx="6" fill="var(--card)" />
      <path
        d="M23 34.5 L30.5 42 L42 28"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
