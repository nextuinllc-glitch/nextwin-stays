import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  className?: string;
};

export function StarRating({ rating, reviewCount, size = "sm", className }: Props) {
  const iconClass = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <span className={cn("star-rating", className)}>
      {/* Airbnb-style: solid black star, not amber. */}
      <Star className={cn(iconClass, "fill-ink text-ink")} />
      <span className="tabular-nums">{rating.toFixed(2)}</span>
      {typeof reviewCount === "number" && (
        <span className="font-normal text-ink-soft">({reviewCount})</span>
      )}
    </span>
  );
}
