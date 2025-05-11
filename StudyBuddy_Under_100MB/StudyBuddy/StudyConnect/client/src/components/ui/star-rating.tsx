import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const StarRating = ({
  rating,
  maxRating = 5,
  size = "md",
  readOnly = true,
  onRatingChange,
  className,
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };
  
  const handleMouseEnter = (index: number) => {
    if (!readOnly) {
      setHoverRating(index);
    }
  };
  
  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };
  
  const handleClick = (index: number) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(index);
    }
  };
  
  const renderStar = (index: number) => {
    const filled = (hoverRating || rating) >= index;
    
    return (
      <Star
        key={index}
        className={cn(
          sizes[size],
          filled ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
          !readOnly && "cursor-pointer"
        )}
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleClick(index)}
      />
    );
  };
  
  return (
    <div className={cn("flex", className)}>
      {[...Array(maxRating)].map((_, i) => renderStar(i + 1))}
    </div>
  );
};

export default StarRating;
