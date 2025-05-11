import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute, useLocation } from "wouter";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, Clock, User } from "lucide-react";
import { Booking } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

const BookingConfirmation = () => {
  const [, params] = useRoute("/booking/:id/confirmation");
  const bookingId = parseInt(params?.id || "0");
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  
  const { data: booking, isLoading: isBookingLoading } = useQuery<Booking>({
    queryKey: [`/api/bookings/${bookingId}`],
    enabled: !!bookingId && isAuthenticated,
  });
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }
    
    // Redirect to dashboard if no booking id
    if (!isLoading && isAuthenticated && !bookingId) {
      navigate("/dashboard");
    }
  }, [bookingId, isAuthenticated, isLoading, navigate]);
  
  if (isLoading || isBookingLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated || !booking) {
    return null; // Will be redirected
  }
  
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-green-100 text-secondary p-2 rounded-full w-16 h-16 flex items-center justify-center">
            <CheckCircle className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold font-inter">Booking Successful!</CardTitle>
          <CardDescription>
            Your session has been booked and confirmed.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-4">Session Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-gray-600">
                      {format(new Date(booking.date), "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-gray-600">
                      {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Tutor</p>
                    <p className="text-gray-600">
                      Tutor #{booking.tutorId}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-4">Payment Summary</h3>
              
              <div className="flex justify-between mb-2">
                <p className="text-gray-600">Session Fee</p>
                <p>${booking.totalAmount.toFixed(2)}</p>
              </div>
              
              <div className="flex justify-between mb-2">
                <p className="text-gray-600">Payment Method</p>
                <p>Online Payment</p>
              </div>
              
              <div className="flex justify-between font-bold pt-2 border-t">
                <p>Total Paid</p>
                <p>${booking.totalAmount.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-2 text-primary">What's Next?</h3>
              <p className="text-gray-600 mb-2">
                You can message your tutor to confirm details or prepare for your session.
              </p>
              <p className="text-gray-600">
                Visit your dashboard to view all upcoming sessions and manage your bookings.
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="w-full sm:w-auto" variant="outline" asChild>
            <Link href={`/messages/${booking.tutorId}`}>
              Message Tutor
            </Link>
          </Button>
          <Button className="w-full sm:w-auto btn-primary" asChild>
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BookingConfirmation;
