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
  return <div aria-hidden="true" className={`shimmer ${radii[rounded]} ${className}`} />;
}

export function MissionCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
      <Skeleton className="h-11 w-11 shrink-0" rounded="full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3.5 w-1/3" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6" role="status" aria-label="Cargando tus misiones">
      <div className="rounded-3xl border border-line bg-surface p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3.5 w-28" />
          </div>
          <Skeleton className="h-10 w-24" rounded="lg" />
        </div>
        <Skeleton className="h-2 w-full" rounded="full" />
        <div className="mt-5 grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-7" />)}
        </div>
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-line p-3.5">
            <Skeleton className="h-10 w-10 shrink-0" rounded="md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3.5 w-52" />
            </div>
          </div>
          <MissionCardSkeleton />
          <MissionCardSkeleton />
        </div>
      ))}
    </div>
  );
}
