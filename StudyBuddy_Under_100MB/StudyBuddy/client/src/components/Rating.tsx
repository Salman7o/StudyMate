import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Rating({ value, size = "md", className }: RatingProps) {
  // Calculate full and partial stars
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  // Determine star size based on prop
  const starSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }[size];
  
  return (
    <div className={cn("flex items-center", className)}>
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star 
          key={`full-${i}`} 
          className={cn(starSize, "text-accent fill-current")} 
        />
      ))}
      
      {/* Half star */}
      {hasHalfStar && (
        <div className="relative">
          <Star className={cn(starSize, "text-accent")} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={cn(starSize, "text-accent fill-current")} />
          </div>
        </div>
      )}
      
      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star 
          key={`empty-${i}`} 
          className={cn(starSize, "text-accent")} 
        />
      ))}
    </div>
  );
}
