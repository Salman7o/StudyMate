import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Search, Clock, School, BookOpen, Star } from "lucide-react";
import { BookingModal } from "@/components/booking/booking-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function FindTutors() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [visibleTutors, setVisibleTutors] = useState(6);
  const [bookingTutor, setBookingTutor] = useState<any>(null);
  
  // Redirect if not authenticated or if user is a tutor
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/auth/login");
      return;
    }
    
    if (user?.role === "tutor") {
      setLocation("/profile");
      return;
    }
  }, [isAuthenticated, user, setLocation]);

  // Fetch tutors based on the student's profile data (subjects, program, semester)
  const { data: tutors = [], isLoading } = useQuery({
    queryKey: ['/api/tutors'],
    queryFn: async () => {
      const response = await fetch('/api/tutors', {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch tutors");
      }
      return response.json();
    },
    enabled: isAuthenticated && user?.role === "student", // Only run query if authenticated and student
  });

  const loadMore = () => {
    setVisibleTutors(prevCount => prevCount + 6);
  };

  const handleBookSession = (tutor: any) => {
    setBookingTutor(tutor);
  };

  const handleMessage = async (tutorUserId: number) => {
    try {
      // Create conversation or get existing one
      const response = await apiRequest("POST", "/api/conversations", {
        participantOneId: user?.id,
        participantTwoId: tutorUserId,
      });

      // Redirect to messages page with the conversation open
      const conversationId = response && response.id ? response.id : "";
      setLocation(`/messages?conversation=${conversationId}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewProfile = (tutorUserId: number) => {
    console.log(`Navigating to tutor profile: /tutor-profile/${tutorUserId}`);
    setLocation(`/tutor-profile/${tutorUserId}`);
  };

  // If not authenticated or user is a tutor, don't render the page content
  if (!isAuthenticated || user?.role === "tutor") {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Tutors</CardTitle>
          <CardDescription>
            Tutors are automatically matched based on your subjects, program, and semester
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Showing tutors who match your learning needs and academic profile.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Matched Tutors</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading your matched tutors..."
              : `Found ${tutors.length} tutors matching your criteria`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading tutors...</p>
            </div>
          ) : tutors.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No tutors found</h3>
              <p className="text-sm text-muted-foreground">
                No tutors currently match your learning criteria.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tutors.slice(0, visibleTutors).map((tutor: any) => (
                <Card key={tutor.id} className="border border-gray-200">
                  <CardContent className="p-6">
                    {/* Tutor Name and Avatar Header */}
                    <div className="mb-2">
                      <div className="flex items-center">
                        <div className="w-16 h-16 rounded-full bg-red-700 flex items-center justify-center text-white text-xl font-medium mr-4">
                          <span>
                            {tutor.user.fullName
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toLowerCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-normal">
                            {tutor.user.fullName}
                          </h3>
                          <div className="flex items-center text-gray-600 gap-2 mt-1">
                            <School className="h-4 w-4" />
                            <span>{tutor.user.program || "Computer Science"}</span>
                          </div>
                          <div className="mt-1 flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= (tutor.rating / 10)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-gray-500 text-sm">
                              {(tutor.rating / 10).toFixed(1)} ({tutor.reviewCount} reviews)
                            </span>
                          </div>
                          <div className="mt-2">
                            <span className="font-medium text-green-600">
                              Rate: Rs. {tutor.hourlyRate.toLocaleString()}/hour
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tutor Profile Section */}
                    <div>
                      <div className="flex items-center text-red-400 mt-4 mb-3">
                        <BookOpen className="h-5 w-5 mr-2" />
                        <h4 className="text-lg font-normal">Tutor Profile</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-gray-700 mb-1">Program:</p>
                          <p className="mb-4">{tutor.user.program || "Computer Science"}</p>
                          
                          <p className="text-gray-700 mb-1">Experience:</p>
                          <p>{tutor.experience || "New tutor on the platform"}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-700 mb-1">Hourly Rate:</p>
                          <p className="text-green-600 mb-4">Rs. {tutor.hourlyRate.toLocaleString()}/hour</p>
                          
                          <p className="text-gray-700 mb-1">Status:</p>
                          {tutor.isAvailableNow ? (
                            <p className="flex items-center text-green-600">
                              <span className="h-2 w-2 rounded-full bg-green-600 mr-2"></span>
                              Available Now
                            </p>
                          ) : (
                            <p className="flex items-center text-amber-600">
                              <span className="h-2 w-2 rounded-full bg-amber-600 mr-2"></span>
                              Unavailable
                            </p>
                          )}
                          
                          <p className="text-gray-700 mt-4 mb-1">Availability:</p>
                          <p>{tutor.availability || "tuesday 3-5pm"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Subjects and Availability Sections */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <div className="flex items-center text-red-400 mb-3">
                          <BookOpen className="h-5 w-5 mr-2" />
                          <h4 className="text-lg font-normal">Subjects</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tutor.subjects?.map((subject: string, index: number) => (
                            <span
                              key={index}
                              className="bg-red-100 text-red-800 px-4 py-1 rounded-full"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center text-red-400 mb-3">
                          <Clock className="h-5 w-5 mr-2" />
                          <h4 className="text-lg font-normal">Availability</h4>
                        </div>
                        <p className="text-gray-700">
                          {tutor.isAvailableNow 
                            ? "Available now for immediate sessions." 
                            : "Contact tutor for availability."}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="default"
                        className="bg-red-700 hover:bg-red-800 text-white"
                        onClick={() => handleMessage(tutor.user.id)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-200 text-gray-700 hover:bg-red-50"
                        onClick={() => handleViewProfile(tutor.user.id)}
                      >
                        View Profile
                      </Button>
                      <Button
                        variant="default"
                        className="bg-green-600 hover:bg-green-700 ml-auto"
                        onClick={() => handleBookSession(tutor)}
                      >
                        Book Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {visibleTutors < tutors.length && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={loadMore}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Load More Tutors
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {bookingTutor && (
        <BookingModal
          isOpen={!!bookingTutor}
          onClose={() => setBookingTutor(null)}
          tutor={bookingTutor}
        />
      )}
    </div>
  );
}
