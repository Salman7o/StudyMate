import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Star } from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    id: number;
    tutorId: number;
    studentId: number;
    tutor?: {
      id: number;
      fullName: string;
    };
    student?: {
      id: number;
      fullName: string;
    };
  };
  isStudent: boolean;
}

export function ReviewModal({ isOpen, onClose, session, isStudent }: ReviewModalProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async () => {
    if (!comment || comment.trim().length < 5) {
      toast({
        title: "Invalid feedback",
        description: "Please provide a comment with at least 5 characters.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (isStudent) {
        // Student submits review with rating
        await apiRequest("POST", "/api/reviews", {
          tutorId: session.tutorId,
          studentId: session.studentId,
          sessionId: session.id,
          rating: rating, // Keep the 1-5 scale for consistency
          comment,
        });
        
        // Also update tutor profile with the new rating
        queryClient.invalidateQueries({ queryKey: [`/api/tutors/${session.tutorId}`] });
      } else {
        // Tutor provides feedback
        await apiRequest("POST", "/api/sessions/feedback", {
          sessionId: session.id,
          studentId: session.studentId,
          comment,
        });
        
        // Update student profile to show the feedback
        queryClient.invalidateQueries({ queryKey: [`/api/students/${session.studentId}`] });
      }

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      if (isStudent) {
        queryClient.invalidateQueries({ queryKey: ['/api/tutors'] });
      }

      onClose();
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-8 w-8 cursor-pointer ${
              star <= (hoveredRating || rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
          />
        ))}
        <span className="ml-2 text-lg">{rating}/5</span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isStudent
              ? `Rate your session with ${session.tutor?.fullName}`
              : `Provide feedback for session with ${session.student?.fullName}`}
          </DialogTitle>
          <DialogDescription>
            {isStudent
              ? "Please rate your experience and provide any feedback."
              : "Please provide feedback about this session."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {isStudent && renderStars()}

          <div>
            <Label htmlFor="comment" className="mb-1 block">
              {isStudent ? "Comments & Feedback" : "Feedback"}
            </Label>
            <Textarea
              id="comment"
              placeholder={
                isStudent
                  ? "What did you think of this tutoring session? Was it helpful?"
                  : "Provide feedback on this session. What went well? Any areas for improvement?"
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}