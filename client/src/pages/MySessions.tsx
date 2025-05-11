import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../App";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Session, User, TutorWithProfile, Review } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Calendar, Clock, User as UserIcon, FileText, Clock3, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import Rating from "@/components/Rating";
import { format } from "date-fns";

// Schemas
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, { message: "Comment must be at least 5 characters" }).max(500),
});

export default function MySessions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("upcoming");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);

  // Fetch sessions for the authenticated user
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: user ? [`/api/users/${user.id}/sessions`] : null,
    enabled: !!user,
  });

  // Form for review
  const reviewForm = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  // Mutations
  const cancelSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest(
        "PATCH", 
        `/api/sessions/${sessionId}`, 
        { status: "cancelled" }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/sessions`] });
      toast({
        title: "Session cancelled",
        description: "The session has been cancelled successfully.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel session. Please try again.",
        variant: "destructive",
      });
    }
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: { sessionId: number, studentId: number, tutorId: number, rating: number, comment: string }) => {
      const response = await apiRequest("POST", "/api/reviews", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/sessions`] });
      setIsReviewModalOpen(false);
      reviewForm.reset();
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handlers
  const handleCancelSession = (sessionId: number) => {
    if (confirm("Are you sure you want to cancel this session?")) {
      cancelSessionMutation.mutate(sessionId);
    }
  };

  const handleOpenReviewModal = (session: Session) => {
    setSelectedSession(session);
    setIsReviewModalOpen(true);
  };

  const onReviewSubmit = (data: z.infer<typeof reviewSchema>) => {
    if (!selectedSession || !user) return;
    
    submitReviewMutation.mutate({
      sessionId: selectedSession.id,
      studentId: user.id,
      tutorId: selectedSession.tutorId,
      rating: data.rating,
      comment: data.comment,
    });
  };

  // Filter sessions by status
  const upcomingSessions = sessions?.filter(
    session => ["pending", "confirmed"].includes(session.status) && new Date(session.date) >= new Date()
  ) || [];
  
  const pastSessions = sessions?.filter(
    session => session.status === "completed" || new Date(session.date) < new Date()
  ) || [];
  
  const cancelledSessions = sessions?.filter(
    session => session.status === "cancelled"
  ) || [];

  // Helper to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case "confirmed":
        return <Badge className="bg-blue-100 text-primary">Confirmed</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-secondary">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-600">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[200px] bg-gray-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col items-start mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Sessions</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your tutoring sessions
        </p>
      </div>

      <Tabs defaultValue={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <Clock3 className="h-4 w-4" /> Past ({pastSessions.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" /> Cancelled ({cancelledSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingSessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No upcoming sessions</h3>
                <p className="text-muted-foreground text-center max-w-md mt-2">
                  You don't have any upcoming tutoring sessions. Browse tutors to book a session.
                </p>
                <Button className="mt-6" asChild>
                  <a href="/find-tutors">Find a Tutor</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {upcomingSessions.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  userType={user.userType}
                  onCancel={() => handleCancelSession(session.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastSessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No past sessions</h3>
                <p className="text-muted-foreground text-center max-w-md mt-2">
                  You haven't completed any tutoring sessions yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {pastSessions.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  userType={user.userType}
                  isPast={true}
                  onReview={() => handleOpenReviewModal(session)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          {cancelledSessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No cancelled sessions</h3>
                <p className="text-muted-foreground text-center max-w-md mt-2">
                  You don't have any cancelled tutoring sessions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {cancelledSessions.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  userType={user.userType}
                  isCancelled={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your feedback about the session. Your review helps other students find great tutors.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...reviewForm}>
            <form onSubmit={reviewForm.handleSubmit(onReviewSubmit)} className="space-y-6">
              <FormField
                control={reviewForm.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`text-2xl ${star <= field.value ? 'text-accent' : 'text-gray-300'}`}
                            onClick={() => {
                              field.onChange(star);
                              setReviewRating(star);
                            }}
                          >
                            ★
                          </button>
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
                    <FormLabel>Your Feedback</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Share your experience with the tutor..."
                        className="min-h-[100px]"
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
                  onClick={() => setIsReviewModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitReviewMutation.isPending}
                >
                  {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface SessionCardProps {
  session: Session;
  userType: string;
  isPast?: boolean;
  isCancelled?: boolean;
  onCancel?: () => void;
  onReview?: () => void;
}

function SessionCard({ session, userType, isPast = false, isCancelled = false, onCancel, onReview }: SessionCardProps) {
  const isStudent = userType === "student";
  const counterpartId = isStudent ? session.tutorId : session.studentId;
  const sessionDate = new Date(session.date);
  
  // Fetch counterpart user info (either tutor or student)
  const { data: counterpart } = useQuery<User>({
    queryKey: [`/api/users/${counterpartId}`],
  });
  
  // For students viewing past sessions, check if they've already left a review
  const { data: reviews } = useQuery<Review[]>({
    queryKey: isStudent && isPast ? [`/api/tutors/${session.tutorId}/reviews`] : null,
    enabled: isStudent && isPast,
  });
  
  const hasReviewed = reviews?.some(review => 
    review.sessionId === session.id && review.studentId === session.studentId
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{session.subject}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              {format(sessionDate, "EEEE, MMM d, yyyy")} at {format(sessionDate, "h:mm a")}
              <span className="mx-2">•</span>
              <Clock className="h-4 w-4 mr-1" />
              {session.duration} minutes
            </CardDescription>
          </div>
          {getStatusBadge(session.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage src={counterpart?.profileImage || ""} alt={counterpart?.username} />
            <AvatarFallback>{counterpart?.firstName?.[0]}{counterpart?.lastName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <p className="font-medium">{counterpart?.firstName} {counterpart?.lastName}</p>
            <p className="text-sm text-muted-foreground">
              {isStudent ? "Tutor" : "Student"}
            </p>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="font-medium">₹{session.price}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payment Method</p>
            <p className="font-medium">{session.paymentMethod || "Not paid yet"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payment Status</p>
            <p className="font-medium capitalize">{session.paymentStatus}</p>
          </div>
        </div>
        
        {session.notes && (
          <>
            <Separator className="my-4" />
            <div>
              <p className="text-sm text-muted-foreground flex items-center">
                <FileText className="h-4 w-4 mr-1" /> Notes
              </p>
              <p className="mt-1">{session.notes}</p>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2">
        {!isPast && !isCancelled && onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel Session
          </Button>
        )}
        
        {isPast && isStudent && !hasReviewed && onReview && (
          <Button onClick={onReview}>
            Leave Review
          </Button>
        )}
        
        {isPast && isStudent && hasReviewed && (
          <Badge className="bg-green-100 text-secondary">Reviewed</Badge>
        )}
      </CardFooter>
    </Card>
  );
}
