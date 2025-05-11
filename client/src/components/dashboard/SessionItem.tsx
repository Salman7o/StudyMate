import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { 
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Session } from "@/lib/types";
import { 
  Star, 
  Calendar, 
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  DollarSign,
  Loader2
} from "lucide-react";

interface SessionItemProps {
  session: Session;
  userType: 'student' | 'tutor';
}

// Schema for review form
const reviewSchema = z.object({
  rating: z.string().min(1, "Rating is required"),
  comment: z.string().optional(),
});

type ReviewData = z.infer<typeof reviewSchema>;

export default function SessionItem({ session, userType }: SessionItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  
  const otherPerson = userType === 'student' ? session.tutor : session.student;
  const sessionDate = new Date(session.date);
  
  // Status badge color mapping
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  
  // Payment status badge color mapping
  const paymentStatusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    refunded: "bg-gray-100 text-gray-800",
  };
  
  // Form for reviews
  const reviewForm = useForm<ReviewData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: "5",
      comment: "",
    },
  });
  
  // Update session status mutation
  const updateSessionMutation = useMutation({
    mutationFn: async (data: { status: string }) => {
      const res = await apiRequest("PUT", `/api/sessions/${session.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "Session updated",
        description: "The session status has been updated successfully.",
      });
      setIsCancelDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating session",
        description: "Failed to update session status. Please try again.",
        variant: "destructive",
      });
      console.error("Session update error:", error);
    },
  });
  
  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (data: { tutorId: number; sessionId: number; rating: number; comment?: string }) => {
      const res = await apiRequest("POST", "/api/reviews", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: [`/api/tutors/${session.tutorId}`] });
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      setIsReviewDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error submitting review",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
      console.error("Review submission error:", error);
    },
  });
  
  // Handle review submission
  const onReviewSubmit = (data: ReviewData) => {
    submitReviewMutation.mutate({
      tutorId: session.tutorId,
      sessionId: session.id,
      rating: parseInt(data.rating),
      comment: data.comment,
    });
  };
  
  // Handle session cancellation
  const cancelSession = () => {
    updateSessionMutation.mutate({ status: "cancelled" });
  };
  
  // Handle session confirmation (for tutors)
  const confirmSession = () => {
    updateSessionMutation.mutate({ status: "confirmed" });
  };
  
  // Handle session completion (for tutors)
  const completeSession = () => {
    updateSessionMutation.mutate({ status: "completed" });
  };
  
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`;
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={otherPerson?.profileImageUrl} 
                alt={`${otherPerson?.firstName} ${otherPerson?.lastName}`} 
              />
              <AvatarFallback>
                {getInitials(otherPerson?.firstName, otherPerson?.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">
                {userType === 'student' ? 'Tutor' : 'Student'}: {otherPerson?.firstName} {otherPerson?.lastName}
              </h3>
              <p className="text-sm text-gray-500">Subject: {session.subject}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="outline" 
              className={statusColors[session.status as keyof typeof statusColors]}
            >
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </Badge>
            <Badge 
              variant="outline" 
              className={paymentStatusColors[session.paymentStatus as keyof typeof paymentStatusColors]}
            >
              {session.paymentStatus.charAt(0).toUpperCase() + session.paymentStatus.slice(1)}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-500 mr-2" />
            <span>{format(sessionDate, "MMMM d, yyyy")}</span>
          </div>
          
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-500 mr-2" />
            <span>{format(sessionDate, "h:mm a")} ({session.duration} min)</span>
          </div>
          
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
            <span>${parseFloat(session.totalAmount.toString()).toFixed(2)}</span>
          </div>
        </div>
        
        {/* Action buttons based on user type and session status */}
        <div className="mt-4 flex flex-wrap gap-2">
          {userType === 'student' && session.status === 'completed' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsReviewDialogOpen(true)}
            >
              <Star className="h-4 w-4 mr-1" /> Leave Review
            </Button>
          )}
          
          {userType === 'tutor' && session.status === 'pending' && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-green-600"
                onClick={confirmSession}
                disabled={updateSessionMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-1" /> Confirm
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600"
                onClick={() => setIsCancelDialogOpen(true)}
                disabled={updateSessionMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </>
          )}
          
          {userType === 'tutor' && session.status === 'confirmed' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-green-600"
              onClick={completeSession}
              disabled={updateSessionMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Mark as Completed
            </Button>
          )}
          
          {(userType === 'student' && session.status === 'pending') && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600"
              onClick={() => setIsCancelDialogOpen(true)}
              disabled={updateSessionMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-1" /> Cancel
            </Button>
          )}
          
          <Button variant="ghost" size="sm">
            <MessageSquare className="h-4 w-4 mr-1" /> Message
          </Button>
        </div>
      </CardContent>
      
      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience with {otherPerson?.firstName} {otherPerson?.lastName}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...reviewForm}>
            <form onSubmit={reviewForm.handleSubmit(onReviewSubmit)} className="space-y-4">
              <FormField
                control={reviewForm.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <div className="flex space-x-4">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <div key={num} className="flex flex-col items-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className={`p-0 h-auto ${
                                parseInt(field.value) >= num ? "text-yellow-400" : "text-gray-300"
                              }`}
                              onClick={() => field.onChange(num.toString())}
                            >
                              <Star className={`h-8 w-8 ${parseInt(field.value) >= num ? "fill-yellow-400" : ""}`} />
                            </Button>
                            <span className="text-xs mt-1">{num}</span>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={reviewForm.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share details about your experience... What went well? What could have been better?"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReviewDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitReviewMutation.isPending}>
                  {submitReviewMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Cancel Session Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for cancellation (optional)</label>
              <Textarea
                placeholder="Please provide a reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={cancelSession}
              disabled={updateSessionMutation.isPending}
            >
              {updateSessionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Session"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
