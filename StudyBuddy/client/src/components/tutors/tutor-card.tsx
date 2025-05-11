import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BookingModal } from "@/components/booking/booking-modal";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Star } from "lucide-react";

interface TutorCardProps {
  tutor: {
    id: number;
    user: {
      id: number;
      fullName: string;
      profileImage?: string;
      program: string;
    };
    subjects: string[];
    hourlyRate: number;
    experience: string;
    isAvailableNow: boolean;
    rating: number;
    reviewCount: number;
  };
}

export function TutorCard({ tutor }: TutorCardProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleBookSession = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to book a session",
        variant: "destructive",
      });
      setLocation("/auth/login");
      return;
    }
    setIsBookingModalOpen(true);
  };

  const handleMessage = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to send a message",
        variant: "destructive",
      });
      setLocation("/auth/login");
      return;
    }

    try {
      // Create conversation or get existing one
      const res = await apiRequest("POST", "/api/conversations", {
        participantOneId: user?.id,
        participantTwoId: tutor.user.id,
      });

      const conversation = await res.json();

      // Redirect to messages page with the conversation open
      setLocation(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewProfile = () => {
    setLocation(`/tutors/${tutor.user.id}`);
  };

  // Convert rating from 0-50 scale to 0-5 scale
  const ratingOutOfFive = tutor.rating / 10;

  return (
    <>
      <div className="bg-gradient-to-br from-black to-red-900 rounded-lg shadow overflow-hidden text-white">
        <div className="relative">
          <img
            src={`https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=150&q=80`}
            alt="Tutor background"
            className="w-full h-24 object-cover opacity-80"
          />
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <div className="w-16 h-16 rounded-full ring-4 ring-white dark:ring-gray-800 bg-gray-200 transform translate-y-1/2 overflow-hidden">
              {tutor.user.profileImage ? (
                <img
                  src={tutor.user.profileImage}
                  alt={tutor.user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-red-800 text-white flex items-center justify-center">
                  <span className="text-lg font-medium">
                    {tutor.user.fullName.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="pt-10 p-6">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-white">{tutor.user.fullName}</h3>
            <p className="text-gray-300 text-sm">
              {tutor.subjects.join(", ")} Specialist
            </p>
            <div className="flex items-center justify-center mt-1">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= ratingOutOfFive;
                  const isHalf = !isFilled && star - 0.5 <= ratingOutOfFive;

                  return (
                    <span key={star} className="mx-0.5">
                      {isFilled ? (
                        <Star className="h-4 w-4 fill-current" />
                      ) : isHalf ? (
                        <span className="relative">
                          <Star className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                          <span className="absolute top-0 left-0 overflow-hidden w-1/2">
                            <Star className="h-4 w-4 fill-current" />
                          </span>
                        </span>
                      ) : (
                        <Star className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                      )}
                    </span>
                  );
                })}
              </div>
              <span className="ml-1 text-sm text-gray-300">
                {ratingOutOfFive.toFixed(1)} ({tutor.reviewCount} reviews)
              </span>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Subject:</span>
              <span className="font-medium text-white">{tutor.subjects.join(", ")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Experience:</span>
              <span className="font-medium text-white">{tutor.experience}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Rate:</span>
              <span className="font-medium text-white">Rs. {tutor.hourlyRate}/hour</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Availability:</span>
              {tutor.isAvailableNow ? (
                <span className="text-green-400 font-medium flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-400 mr-1"></span>
                  Available Now
                </span>
              ) : (
                <span className="text-red-400 font-medium flex items-center">
                  <span className="h-2 w-2 rounded-full bg-red-400 mr-1"></span>
                  Busy
                </span>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              className="flex-1 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white"
              onClick={handleBookSession}>
              Book Session
            </Button>
            <Button
              variant="secondary"
              className="border border-red-500 bg-transparent hover:bg-red-800/20 text-white"
              onClick={handleMessage}
            >
              Message
            </Button>
            <div className="ml-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 px-2 border-red-500 text-white hover:bg-red-800/20" 
                onClick={handleViewProfile}>
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        tutor={tutor}
      />
    </>
  );
}