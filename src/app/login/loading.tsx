import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div
      className="grid w-full gap-10 lg:grid-cols-2"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="hidden h-[440px] w-full rounded-lg lg:block" />
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 lg:mx-0 lg:max-w-none lg:justify-center">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-11 w-11 rounded-sm lg:hidden" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-80 w-full rounded-lg" />
      </div>
    </div>
  );
}
