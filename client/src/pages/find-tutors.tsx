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
                <div
                  key={tutor.id}
                  className="border rounded-lg p-6 hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-black text-white flex items-center justify-center mr-3">
                          <span className="text-md font-medium">
                            {tutor.user.fullName
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">
                            {tutor.user.fullName}
                          </h3>
                          <div className="flex items-center text-sm text-muted-foreground gap-2">
                            <School className="h-4 w-4" />
                            <span>{tutor.user.program}</span>
                          </div>
                          <div className="mt-1 flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= (tutor.rating / 10)
                                    ? "text-yellow-500 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-xs text-muted-foreground">
                              {(tutor.rating / 10).toFixed(1)} ({tutor.reviewCount} reviews)
                            </span>
                          </div>
                          <div className="mt-2 text-sm">
                            <span className="font-medium text-green-600 dark:text-green-500">
                              Rate: Rs. {tutor.hourlyRate.toLocaleString()}/hour
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2 text-primary">
                            <BookOpen className="h-5 w-5" />
                            Tutor Profile
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">
                                  Program:
                                </span>
                                <div className="font-medium">
                                  {tutor.user.program || "Not specified"}
                                </div>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">
                                  Experience:
                                </span>
                                <div className="font-medium">
                                  {tutor.experience || "Not specified"}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">
                                  Hourly Rate:
                                </span>
                                <div className="font-medium text-green-600 dark:text-green-500">
                                  Rs. {tutor.hourlyRate.toLocaleString()}/hour
                                </div>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">
                                  Status:
                                </span>
                                <div className="font-medium">
                                  {tutor.isAvailableNow ? (
                                    <span className="flex items-center text-green-600">
                                      <span className="h-2 w-2 rounded-full bg-green-600 mr-1"></span>
                                      Available Now
                                    </span>
                                  ) : (
                                    <span className="flex items-center text-amber-600">
                                      <span className="h-2 w-2 rounded-full bg-amber-600 mr-1"></span>
                                      Unavailable
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                            <h4 className="font-medium mb-3 flex items-center gap-2 text-primary">
                              <BookOpen className="h-5 w-5" />
                              Subjects
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {tutor.subjects?.map((subject: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="px-2 py-1"
                                >
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                            <h4 className="font-medium mb-3 flex items-center gap-2 text-primary">
                              <Clock className="h-5 w-5" />
                              Availability
                            </h4>
                            <p className="text-sm">
                              {tutor.isAvailableNow ? "Available now for immediate sessions." : "Check with tutor for availability."}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-start gap-2">
                        <Button
                          size="sm"
                          className="flex items-center bg-gradient-to-r from-red-500 to-black hover:from-red-600 hover:to-gray-900"
                          onClick={() => handleMessage(tutor.user.id)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          <span>Message</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleViewProfile(tutor.user.id)}
                        >
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleBookSession(tutor)}
                        >
                          Book Session
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
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
