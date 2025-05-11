import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import TutorProfileHeader from "@/components/TutorProfileHeader";
import BookingCalendar from "@/components/BookingCalendar";
import ReviewsList from "@/components/ReviewsList";
import PaymentModal from "@/components/PaymentModal";
import { TutorWithProfile } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const TutorProfile = () => {
  const [, params] = useRoute("/tutors/:id");
  const tutorId = parseInt(params?.id || "0");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ startTime: string; endTime: string } | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const { data: tutor, isLoading, error } = useQuery<TutorWithProfile>({
    queryKey: [`/api/tutors/${tutorId}`],
  });
  
  const handleTimeSlotSelect = (date: Date, startTime: string, endTime: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot({ startTime, endTime });
  };
  
  const calculateSessionDuration = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    return (endMinutes - startMinutes) / 60; // Duration in hours
  };
  
  const handleBookSession = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in or register to book a session",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedDate || !selectedTimeSlot) {
      toast({
        title: "No time slot selected",
        description: "Please select a date and time for your session",
        variant: "destructive",
      });
      return;
    }
    
    if (!tutor) return;
    
    try {
      const duration = calculateSessionDuration(
        selectedTimeSlot.startTime,
        selectedTimeSlot.endTime
      );
      
      const amount = tutor.profile.hourlyRate * duration;
      setTotalAmount(amount);
      
      const response = await apiRequest("POST", "/api/bookings", {
        tutorId: tutor.id,
        subject: tutor.subjects[0]?.name || "General tutoring",
        date: selectedDate.toISOString(),
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        status: "pending",
        totalAmount: amount,
        paymentStatus: "unpaid"
      });
      
      const booking = await response.json();
      setBookingId(booking.id);
      setIsPaymentModalOpen(true);
      
      // Invalidate bookings queries
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/student"] });
    } catch (error) {
      toast({
        title: "Booking failed",
        description: error instanceof Error ? error.message : "Failed to book session",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="flex space-x-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="w-full md:w-auto">
                <div className="h-10 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !tutor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error loading tutor profile</h2>
          <p className="text-gray-600 mb-4">
            We couldn't load this tutor's profile. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TutorProfileHeader 
        tutor={tutor} 
        onBookSession={() => {
          const element = document.getElementById("booking-section");
          element?.scrollIntoView({ behavior: "smooth" });
        }} 
      />
      
      <Tabs defaultValue="booking" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="booking">Book a Session</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({tutor.reviewCount})</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>
        
        <TabsContent value="booking" id="booking-section">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 font-inter">Book a Session with {tutor.fullName}</h2>
            
            <BookingCalendar
              availabilitySlots={tutor.availabilitySlots}
              onSelectTimeSlot={handleTimeSlotSelect}
            />
            
            {selectedDate && selectedTimeSlot && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-bold text-lg mb-2">Session Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium">{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">
                      {calculateSessionDuration(selectedTimeSlot.startTime, selectedTimeSlot.endTime)} hours
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="font-bold text-lg">
                      ${(tutor.profile.hourlyRate * calculateSessionDuration(selectedTimeSlot.startTime, selectedTimeSlot.endTime)).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <Button 
                  className="btn-primary w-full mt-4" 
                  onClick={handleBookSession}
                >
                  Proceed to Payment
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="reviews">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 font-inter">Student Reviews</h2>
            <ReviewsList tutorId={tutor.id} />
          </div>
        </TabsContent>
        
        <TabsContent value="availability">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 font-inter">Weekly Availability</h2>
            
            {tutor.availabilitySlots.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                No regular availability has been set by this tutor. Please contact them directly.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                  const daySlots = tutor.availabilitySlots.filter(
                    slot => slot.day.toLowerCase() === day.toLowerCase()
                  );
                  
                  return (
                    <div key={day} className="border rounded-md p-4">
                      <h3 className="font-bold mb-2">{day}</h3>
                      {daySlots.length === 0 ? (
                        <p className="text-gray-500 text-sm">Not available</p>
                      ) : (
                        <ul className="space-y-1">
                          {daySlots.map((slot, index) => (
                            <li key={index} className="text-sm">
                              {slot.startTime} - {slot.endTime}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {bookingId && (
        <PaymentModal 
          isOpen={isPaymentModalOpen} 
          onClose={() => setIsPaymentModalOpen(false)} 
          bookingId={bookingId} 
          amount={totalAmount}
        />
      )}
    </div>
  );
};

export default TutorProfile;
