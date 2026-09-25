interface Props {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

const radii = {
  sm:   "rounded",
  md:   "rounded-xl",
  lg:   "rounded-2xl",
  full: "rounded-full",
};

export function Skeleton({ className = "", rounded = "md" }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`shimmer ${radii[rounded]} ${className}`}
    />
  );
}

export function MissionCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <Skeleton className="h-9 w-9 shrink-0" rounded="full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-4 w-4" rounded="sm" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Progress card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-20" rounded="full" />
        </div>
        <Skeleton className="h-3 w-full" rounded="full" />
      </div>
      {/* Track groups */}
      {[0,1,2].map((i) => (
        <div key={i} className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 shrink-0" rounded="md" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          <div className="space-y-2">
            <MissionCardSkeleton />
            <MissionCardSkeleton />
          </div>
        </div>
      ))}
    </div>
  );
}
