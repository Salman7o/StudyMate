import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, DollarSign, MessageSquare, Star } from "lucide-react";
import { Booking, User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ReviewForm from "@/components/ReviewForm";
import { BOOKING_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";

const Dashboard = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  
  const { data: studentBookings = [], isLoading: isStudentBookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings/student"],
    enabled: isAuthenticated && user?.userType === "student",
  });
  
  const { data: tutorBookings = [], isLoading: isTutorBookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings/tutor"],
    enabled: isAuthenticated && user?.userType === "tutor",
  });
  
  const updateBookingStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest("PUT", `/api/bookings/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/student"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/tutor"] });
      toast({
        title: "Status updated",
        description: "The booking status has been updated successfully.",
      });
      setIsCancelDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating status",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  if (isLoading || isStudentBookingsLoading || isTutorBookingsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p>Loading dashboard...</p>
      </div>
    );
  }
  
  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case BOOKING_STATUSES.PENDING:
        return "outline";
      case BOOKING_STATUSES.CONFIRMED:
        return "secondary";
      case BOOKING_STATUSES.COMPLETED:
        return "default";
      case BOOKING_STATUSES.CANCELLED:
        return "destructive";
      default:
        return "outline";
    }
  };
  
  const getPaymentStatusBadgeVariant = (status: string) => {
    return status === PAYMENT_STATUSES.PAID ? "default" : "destructive";
  };
  
  const handleCancelBooking = () => {
    if (!selectedBooking) return;
    
    updateBookingStatusMutation.mutate({
      id: selectedBooking.id,
      status: BOOKING_STATUSES.CANCELLED,
    });
  };
  
  const handleConfirmBooking = (booking: Booking) => {
    updateBookingStatusMutation.mutate({
      id: booking.id,
      status: BOOKING_STATUSES.CONFIRMED,
    });
  };
  
  const handleCompleteBooking = (booking: Booking) => {
    updateBookingStatusMutation.mutate({
      id: booking.id,
      status: BOOKING_STATUSES.COMPLETED,
    });
  };
  
  const pendingBookings = user.userType === "student" 
    ? studentBookings.filter(b => b.status === BOOKING_STATUSES.PENDING)
    : tutorBookings.filter(b => b.status === BOOKING_STATUSES.PENDING);
  
  const upcomingBookings = user.userType === "student"
    ? studentBookings.filter(b => b.status === BOOKING_STATUSES.CONFIRMED)
    : tutorBookings.filter(b => b.status === BOOKING_STATUSES.CONFIRMED);
  
  const completedBookings = user.userType === "student"
    ? studentBookings.filter(b => b.status === BOOKING_STATUSES.COMPLETED)
    : tutorBookings.filter(b => b.status === BOOKING_STATUSES.COMPLETED);
  
  const cancelledBookings = user.userType === "student"
    ? studentBookings.filter(b => b.status === BOOKING_STATUSES.CANCELLED)
    : tutorBookings.filter(b => b.status === BOOKING_STATUSES.CANCELLED);
  
  const renderBookingCard = (booking: Booking, actions: boolean = true) => (
    <Card key={booking.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between flex-wrap gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold">{booking.subject}</h3>
            <p className="text-gray-500 text-sm">
              Booking ID: {booking.id}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={getStatusBadgeVariant(booking.status)}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
            <Badge variant={getPaymentStatusBadgeVariant(booking.paymentStatus)}>
              {booking.paymentStatus === PAYMENT_STATUSES.PAID ? "Paid" : "Unpaid"}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <span>{format(new Date(booking.date), "EEEE, MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span>{booking.startTime} - {booking.endTime}</span>
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            <span>{user.userType === "student" ? `Tutor #${booking.tutorId}` : `Student #${booking.studentId}`}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
            <span>${booking.totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        {actions && (
          <div className="flex flex-wrap gap-2 justify-end">
            {user.userType === "student" && booking.status === BOOKING_STATUSES.PENDING && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  setSelectedBooking(booking);
                  setIsCancelDialogOpen(true);
                }}
              >
                Cancel
              </Button>
            )}
            
            {user.userType === "tutor" && booking.status === BOOKING_STATUSES.PENDING && (
              <>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    setSelectedBooking(booking);
                    setIsCancelDialogOpen(true);
                  }}
                >
                  Decline
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleConfirmBooking(booking)}
                >
                  Confirm
                </Button>
              </>
            )}
            
            {user.userType === "tutor" && booking.status === BOOKING_STATUSES.CONFIRMED && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => handleCompleteBooking(booking)}
              >
                Mark as Completed
              </Button>
            )}
            
            {user.userType === "student" && booking.status === BOOKING_STATUSES.COMPLETED && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => {
                  setSelectedBooking(booking);
                  setIsReviewDialogOpen(true);
                }}
              >
                Leave Review
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/messages/${user.userType === "student" ? booking.tutorId : booking.studentId}`)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-inter">Dashboard</h1>
        {user.userType === "student" && (
          <Button className="btn-primary" asChild>
            <a href="/tutors">Find a Tutor</a>
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {pendingBookings.length}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Upcoming</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {upcomingBookings.length}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {completedBookings.length}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Cancelled</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {cancelledBookings.length}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {pendingBookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No pending bookings</p>
              </CardContent>
            </Card>
          ) : (
            pendingBookings.map(booking => renderBookingCard(booking))
          )}
        </TabsContent>
        
        <TabsContent value="upcoming">
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No upcoming bookings</p>
              </CardContent>
            </Card>
          ) : (
            upcomingBookings.map(booking => renderBookingCard(booking))
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {completedBookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No completed bookings</p>
              </CardContent>
            </Card>
          ) : (
            completedBookings.map(booking => renderBookingCard(booking))
          )}
        </TabsContent>
        
        <TabsContent value="cancelled">
          {cancelledBookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No cancelled bookings</p>
              </CardContent>
            </Card>
          ) : (
            cancelledBookings.map(booking => renderBookingCard(booking, false))
          )}
        </TabsContent>
      </Tabs>
      
      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience with this tutor to help other students
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <ReviewForm 
              tutorId={selectedBooking.tutorId} 
              bookingId={selectedBooking.id}
              onReviewSubmitted={() => setIsReviewDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {user.userType === "student" ? "Cancel Booking" : "Decline Booking"}
            </DialogTitle>
            <DialogDescription>
              {user.userType === "student" 
                ? "Are you sure you want to cancel this booking? This action cannot be undone."
                : "Are you sure you want to decline this booking request? This action cannot be undone."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Reason (optional)
              </label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for cancellation"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={updateBookingStatusMutation.isPending}
            >
              {updateBookingStatusMutation.isPending
                ? "Processing..."
                : user.userType === "student" ? "Cancel Booking" : "Decline Booking"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
