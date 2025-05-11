import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ChatModal } from "@/components/chat/chat-modal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Calendar,
  Clock,
  MessageSquare,
  Video,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  DollarSign,
  Star,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { z } from "zod";
import { cn } from "@/lib/utils";

// Form schema for reviews
const reviewFormSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, "Please provide feedback"),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

// Payment form schema
const paymentFormSchema = z.object({
  method: z.string().min(1, "Payment method is required"),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export default function Sessions() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatUser, setChatUser] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Fetch sessions
  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['/api/sessions'],
  });

  // Review form
  const reviewForm = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  // Payment form
  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      method: "",
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const reviewData = {
        sessionId: selectedSession.id,
        tutorId: selectedSession.tutorId,
        rating: data.rating,
        comment: data.comment,
      };
      const res = await apiRequest("POST", "/api/reviews", reviewData);
      return await res.json();
    },
    onSuccess: () => {
      setShowReviewModal(false);
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      reviewForm.reset();
    },
  });

  // Submit payment mutation
  const submitPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormValues) => {
      const paymentData = {
        sessionId: selectedSession.id,
        tutorId: selectedSession.tutorId,
        amount: selectedSession.amount,
        method: data.method,
        status: "completed",
        transactionId: `TRX-${Date.now()}`,
      };
      const res = await apiRequest("POST", "/api/payments", paymentData);
      return await res.json();
    },
    onSuccess: () => {
      setShowPaymentModal(false);
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      paymentForm.reset();
    },
  });

  // Cancel session mutation
  const cancelSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/sessions/${selectedSession.id}`, {
        status: "cancelled",
      });
      return await res.json();
    },
    onSuccess: () => {
      setShowCancelModal(false);
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    },
  });

  // Update session status mutation (for tutors to confirm/complete sessions)
  const updateSessionStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/sessions/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    },
  });

  const handleMessageClick = (sessionUser: any) => {
    setChatUser(sessionUser);
    setShowChatModal(true);
  };

  const handleReviewSession = (session: any) => {
    setSelectedSession(session);
    setShowReviewModal(true);
  };

  const handlePayForSession = (session: any) => {
    setSelectedSession(session);
    setShowPaymentModal(true);
  };

  const handleCancelSession = (session: any) => {
    setSelectedSession(session);
    setShowCancelModal(true);
  };

  const handleConfirmSession = (sessionId: number) => {
    updateSessionStatusMutation.mutate({ id: sessionId, status: "confirmed" });
  };

  const handleCompleteSession = (sessionId: number) => {
    updateSessionStatusMutation.mutate({ id: sessionId, status: "completed" });
  };

  const onSubmitReview = (data: ReviewFormValues) => {
    submitReviewMutation.mutate(data);
  };

  const onSubmitPayment = (data: PaymentFormValues) => {
    submitPaymentMutation.mutate(data);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Filter sessions by status
  const upcomingSessions = sessions?.filter(
    (session: any) => session.status === "pending" || session.status === "confirmed"
  ) || [];
  
  const completedSessions = sessions?.filter(
    (session: any) => session.status === "completed"
  ) || [];
  
  const cancelledSessions = sessions?.filter(
    (session: any) => session.status === "cancelled"
  ) || [];

  // Format date and time
  const formatSessionDate = (dateString: string) => {
    return format(parseISO(dateString), "EEEE, MMMM d, yyyy");
  };

  const formatSessionTime = (start: string, end: string) => {
    return `${format(parseISO(start), "h:mm a")} - ${format(parseISO(end), "h:mm a")}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "confirmed":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Sessions</h1>
            <p className="text-gray-600">Manage your tutoring sessions</p>
          </div>
        </div>

        <Tabs 
          defaultValue="upcoming" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">
              Upcoming
              {upcomingSessions.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {upcomingSessions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              {completedSessions.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {completedSessions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled
              {cancelledSessions.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {cancelledSessions.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-700">
              <div className="flex">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>Error loading sessions: {error.message}</p>
              </div>
            </div>
          ) : (
            <>
              <TabsContent value="upcoming">
                {upcomingSessions.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No upcoming sessions
                      </h3>
                      <p className="text-gray-500 mb-4 text-center max-w-md">
                        You don't have any upcoming sessions scheduled. Find a tutor to book your first session.
                      </p>
                      <Button asChild>
                        <a href="/find-tutors">Find a Tutor</a>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {upcomingSessions.map((session: any) => (
                      <Card key={session.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                {user?.role === 'student' ? (
                                  session.tutor?.profileImage ? (
                                    <AvatarImage src={session.tutor.profileImage} alt={session.tutor.fullName} />
                                  ) : (
                                    <AvatarFallback>{getInitials(session.tutor.fullName)}</AvatarFallback>
                                  )
                                ) : (
                                  session.student?.profileImage ? (
                                    <AvatarImage src={session.student.profileImage} alt={session.student.fullName} />
                                  ) : (
                                    <AvatarFallback>{getInitials(session.student.fullName)}</AvatarFallback>
                                  )
                                )}
                              </Avatar>
                              <div>
                                <h3 className="font-medium">
                                  {user?.role === 'student' ? session.tutor?.fullName : session.student?.fullName}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {session.subject}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "capitalize",
                                getStatusColor(session.status)
                              )}
                            >
                              {session.status}
                            </Badge>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-md">
                              <div className="flex items-center text-gray-700 mb-1">
                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                {formatSessionDate(session.startTime)}
                              </div>
                              <div className="flex items-center text-gray-700">
                                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                {formatSessionTime(session.startTime, session.endTime)}
                              </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md">
                              <div className="flex items-center text-gray-700 mb-1">
                                <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                                Amount: ${session.amount}
                              </div>
                              <div className="flex items-center text-gray-700">
                                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                Payment Status: {session.paymentStatus ? 'Paid' : 'Pending'}
                              </div>
                            </div>
                          </div>
                          
                          {session.notes && (
                            <div className="mt-4 bg-blue-50 p-3 rounded-md text-gray-700">
                              <h4 className="font-medium text-sm mb-1">Session Notes:</h4>
                              <p className="text-sm">{session.notes}</p>
                            </div>
                          )}
                          
                          <div className="mt-4 flex flex-wrap gap-2 justify-end">
                            {user?.role === 'student' && session.status === 'confirmed' && !session.paymentStatus && (
                              <Button
                                onClick={() => handlePayForSession(session)}
                                variant="secondary"
                              >
                                <DollarSign className="mr-1 h-4 w-4" />
                                Pay Now
                              </Button>
                            )}
                            
                            {user?.role === 'tutor' && session.status === 'pending' && (
                              <Button
                                onClick={() => handleConfirmSession(session.id)}
                                variant="outline"
                                className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Confirm
                              </Button>
                            )}
                            
                            {user?.role === 'tutor' && session.status === 'confirmed' && (
                              <Button
                                onClick={() => handleCompleteSession(session.id)}
                                variant="outline"
                                className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Mark as Completed
                              </Button>
                            )}
                            
                            {session.status === 'pending' && (
                              <Button
                                onClick={() => handleCancelSession(session)}
                                variant="outline"
                                className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Cancel
                              </Button>
                            )}
                            
                            {session.status === 'confirmed' && (
                              <Button disabled variant="outline">
                                <Video className="mr-1 h-4 w-4" />
                                Join Session
                              </Button>
                            )}
                            
                            <Button
                              onClick={() => handleMessageClick(
                                user?.role === 'student' ? session.tutor : session.student
                              )}
                            >
                              <MessageSquare className="mr-1 h-4 w-4" />
                              Message
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed">
                {completedSessions.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
                      <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No completed sessions
                      </h3>
                      <p className="text-gray-500 max-w-md text-center">
                        You haven't completed any sessions yet. Once your sessions are marked as completed, they will appear here.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {completedSessions.map((session: any) => (
                      <Card key={session.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                {user?.role === 'student' ? (
                                  session.tutor?.profileImage ? (
                                    <AvatarImage src={session.tutor.profileImage} alt={session.tutor.fullName} />
                                  ) : (
                                    <AvatarFallback>{getInitials(session.tutor.fullName)}</AvatarFallback>
                                  )
                                ) : (
                                  session.student?.profileImage ? (
                                    <AvatarImage src={session.student.profileImage} alt={session.student.fullName} />
                                  ) : (
                                    <AvatarFallback>{getInitials(session.student.fullName)}</AvatarFallback>
                                  )
                                )}
                              </Avatar>
                              <div>
                                <h3 className="font-medium">
                                  {user?.role === 'student' ? session.tutor?.fullName : session.student?.fullName}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {session.subject}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "capitalize",
                                getStatusColor(session.status)
                              )}
                            >
                              {session.status}
                            </Badge>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-md">
                              <div className="flex items-center text-gray-700 mb-1">
                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                {formatSessionDate(session.startTime)}
                              </div>
                              <div className="flex items-center text-gray-700">
                                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                {formatSessionTime(session.startTime, session.endTime)}
                              </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md">
                              <div className="flex items-center text-gray-700 mb-1">
                                <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                                Amount: ${session.amount}
                              </div>
                              <div className="flex items-center text-gray-700">
                                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                Payment Status: {session.paymentStatus ? 'Paid' : 'Pending'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex flex-wrap gap-2 justify-end">
                            {user?.role === 'student' && !session.paymentStatus && (
                              <Button
                                onClick={() => handlePayForSession(session)}
                                variant="secondary"
                              >
                                <DollarSign className="mr-1 h-4 w-4" />
                                Pay Now
                              </Button>
                            )}
                            
                            {user?.role === 'student' && (
                              <Button
                                onClick={() => handleReviewSession(session)}
                                variant="outline"
                              >
                                <Star className="mr-1 h-4 w-4" />
                                Leave Review
                              </Button>
                            )}
                            
                            <Button
                              onClick={() => handleMessageClick(
                                user?.role === 'student' ? session.tutor : session.student
                              )}
                            >
                              <MessageSquare className="mr-1 h-4 w-4" />
                              Message
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cancelled">
                {cancelledSessions.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
                      <XCircle className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No cancelled sessions
                      </h3>
                      <p className="text-gray-500 max-w-md text-center">
                        You don't have any cancelled sessions. If a session gets cancelled, it will appear here.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {cancelledSessions.map((session: any) => (
                      <Card key={session.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                {user?.role === 'student' ? (
                                  session.tutor?.profileImage ? (
                                    <AvatarImage src={session.tutor.profileImage} alt={session.tutor.fullName} />
                                  ) : (
                                    <AvatarFallback>{getInitials(session.tutor.fullName)}</AvatarFallback>
                                  )
                                ) : (
                                  session.student?.profileImage ? (
                                    <AvatarImage src={session.student.profileImage} alt={session.student.fullName} />
                                  ) : (
                                    <AvatarFallback>{getInitials(session.student.fullName)}</AvatarFallback>
                                  )
                                )}
                              </Avatar>
                              <div>
                                <h3 className="font-medium">
                                  {user?.role === 'student' ? session.tutor?.fullName : session.student?.fullName}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {session.subject}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "capitalize",
                                getStatusColor(session.status)
                              )}
                            >
                              {session.status}
                            </Badge>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-md">
                              <div className="flex items-center text-gray-700 mb-1">
                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                {formatSessionDate(session.startTime)}
                              </div>
                              <div className="flex items-center text-gray-700">
                                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                {formatSessionTime(session.startTime, session.endTime)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex flex-wrap gap-2 justify-end">
                            <Button
                              onClick={() => handleMessageClick(
                                user?.role === 'student' ? session.tutor : session.student
                              )}
                            >
                              <MessageSquare className="mr-1 h-4 w-4" />
                              Message
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      {/* Chat Modal */}
      {showChatModal && chatUser && (
        <ChatModal
          user={chatUser}
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
        />
      )}

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience with {selectedSession?.tutor?.fullName}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...reviewForm}>
            <form onSubmit={reviewForm.handleSubmit(onSubmitReview)} className="space-y-6">
              <FormField
                control={reviewForm.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            className="focus:outline-none"
                            onClick={() => field.onChange(value)}
                          >
                            <Star
                              className={cn(
                                "h-8 w-8",
                                field.value >= value
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              )}
                            />
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
                    <FormLabel>Feedback</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your experience with this tutor..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitReviewMutation.isPending}
                >
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

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
            <DialogDescription>
              Complete your payment for the session with {selectedSession?.tutor?.fullName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="border rounded-md p-4 mb-4 bg-gray-50">
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Session Date:</span>
              <span className="font-medium">
                {selectedSession && formatSessionDate(selectedSession.startTime)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Session Time:</span>
              <span className="font-medium">
                {selectedSession && formatSessionTime(selectedSession.startTime, selectedSession.endTime)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Subject:</span>
              <span className="font-medium">
                {selectedSession?.subject}
              </span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total Amount:</span>
              <span>${selectedSession?.amount}</span>
            </div>
          </div>
          
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(onSubmitPayment)} className="space-y-6">
              <FormField
                control={paymentForm.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="jazzCash">JazzCash</SelectItem>
                        <SelectItem value="easyPaisa">EasyPaisa</SelectItem>
                        <SelectItem value="creditCard">Credit/Debit Card</SelectItem>
                        <SelectItem value="bankTransfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitPaymentMutation.isPending}
                >
                  {submitPaymentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Complete Payment"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Cancel Session Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cancel Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this session?
            </DialogDescription>
          </DialogHeader>
          
          <div className="border rounded-md p-4 mb-4 bg-red-50">
            <div className="flex items-start">
              <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-700">This action cannot be undone</h4>
                <p className="text-sm text-red-600">
                  Cancelling a session may affect your reputation on the platform.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border rounded-md p-4 mb-4 bg-gray-50">
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Session with:</span>
              <span className="font-medium">
                {user?.role === 'student' 
                  ? selectedSession?.tutor?.fullName 
                  : selectedSession?.student?.fullName}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Date:</span>
              <span className="font-medium">
                {selectedSession && formatSessionDate(selectedSession.startTime)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Time:</span>
              <span className="font-medium">
                {selectedSession && formatSessionTime(selectedSession.startTime, selectedSession.endTime)}
              </span>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCancelModal(false)}
            >
              Keep Session
            </Button>
            <Button
              variant="destructive"
              disabled={cancelSessionMutation.isPending}
              onClick={() => cancelSessionMutation.mutate()}
            >
              {cancelSessionMutation.isPending ? (
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
    </MainLayout>
  );
}
