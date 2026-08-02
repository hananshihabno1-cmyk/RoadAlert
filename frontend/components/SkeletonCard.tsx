export default function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-asphalt-lighter ${className}`} />
  );
}
