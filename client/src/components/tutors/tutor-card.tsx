import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { BookingModal } from "@/components/booking/booking-modal";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Star, MessageSquare } from "lucide-react";

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
    setLocation(`/tutor-profile/${tutor.user.id}`);
  };

  // Convert rating from 0-50 scale to 0-5 scale
  const ratingOutOfFive = tutor.rating / 10;

  return (
    <>
      <div className="border rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 p-6 hover:border-primary transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center mr-3">
                {tutor.user.profileImage ? (
                  <img
                    src={tutor.user.profileImage}
                    alt={tutor.user.fullName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-lg font-medium">
                    {tutor.user.fullName.split(" ").map(n => n[0]).join("")}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-medium text-lg">
                  {tutor.user.fullName}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>{tutor.subjects.join(", ")} Specialist</span>
                </div>
                <div className="mt-1 flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= ratingOutOfFive 
                          ? "text-yellow-500 fill-current" 
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {ratingOutOfFive.toFixed(1)} ({tutor.reviewCount} reviews)
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <span className="font-medium text-green-600 dark:text-green-500">
                    Rate: Rs. {tutor.hourlyRate.toLocaleString()}/hour
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Experience</h4>
                <p className="text-sm text-muted-foreground">
                  {tutor.experience || "Not specified"}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Subjects</h4>
                <div className="flex flex-wrap gap-1">
                  {tutor.subjects.map((subject, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg py-2 px-3">
                <span className="text-sm font-medium">Status: </span>
                {tutor.isAvailableNow ? (
                  <span className="text-green-600 font-medium text-sm inline-flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-600 mr-1"></span>
                    Available Now
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium text-sm inline-flex items-center">
                    <span className="h-2 w-2 rounded-full bg-amber-600 mr-1"></span>
                    Unavailable
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleBookSession}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Book Session
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleViewProfile}
                className="border-primary text-primary hover:bg-primary/10"
              >
                View Profile
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleMessage}
                className="text-gray-700 dark:text-gray-300"
              >
                <span className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Message
                </span>
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