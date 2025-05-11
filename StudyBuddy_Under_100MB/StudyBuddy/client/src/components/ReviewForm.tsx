import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/ui/star-rating";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ReviewFormProps {
  tutorId: number;
  bookingId: number;
  onReviewSubmitted: () => void;
}

const ReviewForm = ({ tutorId, bookingId, onReviewSubmitted }: ReviewFormProps) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  
  const reviewMutation = useMutation({
    mutationFn: (data: { tutorId: number; bookingId: number; rating: number; comment: string }) => 
      apiRequest("POST", "/api/reviews", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/reviews/${tutorId}`] });
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      onReviewSubmitted();
    },
    onError: (error) => {
      toast({
        title: "Failed to submit review",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating < 1) {
      toast({
        title: "Rating required",
        description: "Please provide a rating from 1 to 5 stars",
        variant: "destructive",
      });
      return;
    }
    
    reviewMutation.mutate({
      tutorId,
      bookingId,
      rating,
      comment
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Rate your experience</label>
        <div className="flex items-center">
          <StarRating 
            rating={rating} 
            size="lg" 
            readOnly={false} 
            onRatingChange={setRating} 
          />
          <span className="ml-2 text-gray-600">{rating} out of 5</span>
        </div>
      </div>
      
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">Your review (optional)</label>
        <Textarea
          id="comment"
          placeholder="Share your experience with this tutor..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
      </div>
      
      <Button 
        type="submit" 
        className="btn-primary w-full"
        disabled={reviewMutation.isPending}
      >
        {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
};

export default ReviewForm;
