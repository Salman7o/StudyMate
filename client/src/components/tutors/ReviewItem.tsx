import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ReviewWithStudent } from "@/lib/types";

interface ReviewItemProps {
  review: ReviewWithStudent;
}

export default function ReviewItem({ review }: ReviewItemProps) {
  const { student, rating, comment, createdAt } = review;
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
      />
    ));
  };

  const getInitials = () => {
    if (!student.firstName && !student.lastName) return "S";
    return `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`;
  };

  return (
    <div className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-start">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage 
            src={student.profileImageUrl} 
            alt={`${student.firstName} ${student.lastName}`} 
          />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div>
              <p className="font-medium text-gray-900">
                {student.firstName} {student.lastName}
              </p>
              <div className="flex items-center">
                <div className="flex mr-2">
                  {renderStars(rating)}
                </div>
                <span className="text-xs text-gray-500">
                  {createdAt ? format(new Date(createdAt), 'MMM d, yyyy') : ''}
                </span>
              </div>
            </div>
          </div>
          
          {comment && (
            <p className="mt-2 text-gray-700">{comment}</p>
          )}
        </div>
      </div>
    </div>
  );
}
