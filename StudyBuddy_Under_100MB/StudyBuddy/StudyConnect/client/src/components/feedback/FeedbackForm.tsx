import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface FeedbackFormProps {
  sessionId: number;
  tutorName: string;
  onSuccess?: () => void;
}

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, "Please provide more detailed feedback").max(500, "Comment is too long"),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export default function FeedbackForm({ sessionId, tutorName, onSuccess }: FeedbackFormProps) {
  const { toast } = useToast();
  const [hoveredStar, setHoveredStar] = useState(0);
  
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async (data: FeedbackFormValues) => {
      return apiRequest("POST", "/api/feedback", {
        sessionId,
        ...data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/student"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to submit feedback",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: FeedbackFormValues) {
    feedbackMutation.mutate(data);
  }

  const handleStarClick = (rating: number) => {
    form.setValue("rating", rating);
  };

  const handleStarHover = (rating: number) => {
    setHoveredStar(rating);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  const rating = form.watch("rating");
  const displayRating = hoveredStar || rating;
  
  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Average";
      case 4: return "Good";
      case 5: return "Excellent";
      default: return "Rate your experience";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-2">Rate Your Session</h2>
      <p className="text-gray-500 mb-6">How was your experience with {tutorName}?</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="flex flex-col items-center">
                  <div className="flex space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => handleStarHover(star)}
                        onMouseLeave={handleStarLeave}
                        className="text-2xl focus:outline-none"
                      >
                        <i className={`${
                          displayRating >= star ? 'fas text-yellow-400' : 'far text-gray-300'
                        } fa-star`}></i>
                      </button>
                    ))}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {getRatingText(displayRating)}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Feedback</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us what you liked or what could be improved..."
                    className="resize-none h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button
            type="submit"
            className="w-full"
            disabled={feedbackMutation.isPending || rating === 0}
          >
            {feedbackMutation.isPending ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </div>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
