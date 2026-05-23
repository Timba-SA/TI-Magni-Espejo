export function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="border-t border-[#F8F8F8]/[0.06] py-8 flex justify-between items-start animate-pulse"
        >
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-2/3 bg-[#F8F8F8]/[0.08] rounded-md" />
            </div>
            <div className="h-4 w-1/3 bg-[#F8F8F8]/[0.04] rounded-md" />
            <div className="h-12 w-3/4 bg-[#F8F8F8]/[0.03] rounded-md mt-2" />
          </div>
          <div className="flex items-center gap-4 ml-4">
            <div className="h-8 w-16 bg-[#F8F8F8]/[0.08] rounded-md" />
            <div className="h-8 w-8 bg-[#F8F8F8]/[0.08] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
