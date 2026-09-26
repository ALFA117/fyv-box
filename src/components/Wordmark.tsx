const SIZES = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
} as const;

export function Wordmark({ size = "md", className = "" }: { size?: keyof typeof SIZES; className?: string }) {
  return (
    <span className={`whitespace-nowrap font-display font-extrabold tracking-[-0.03em] text-cream ${SIZES[size]} ${className}`}>
      FYV<span className="text-gold"> Box</span>
    </span>
  );
}
