import { Skeleton } from "@/components/ui/skeleton";

export default function EventsDashboardLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-9 w-28 rounded-sm" />
      </div>
      <Skeleton className="h-44 w-full rounded-lg" />
    </div>
  );
}
