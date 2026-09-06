import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800 relative overflow-hidden',
        className
      )}
      {...props}
    />
  );
};

export const ShuttleCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col h-full animate-pulse">
      {/* Photo skeleton */}
      <div className="relative h-44 bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmerSweep_1.8s_infinite]" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Badge & Rating */}
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>

          {/* Title */}
          <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />

          {/* Origin -> Destination */}
          <div className="flex items-center gap-2 pt-1">
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-4 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="h-7 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
};

export const CityCardSkeleton = () => {
  return (
    <div className="flex-shrink-0 w-64 sm:w-72 bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200/80 flex flex-col h-full animate-pulse">
      <div className="relative h-48 bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmerSweep_1.8s_infinite]" />
      </div>
      <div className="p-4 space-y-2.5">
        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  );
};
