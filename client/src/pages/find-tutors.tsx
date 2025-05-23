import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Search, BookOpen, Building, Clock } from "lucide-react";
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

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading tutors...</p>
        </div>
      ) : tutors.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No tutors found</h3>
          <p className="text-sm text-muted-foreground">
            No tutors currently match your learning criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutors.slice(0, visibleTutors).map((tutor: any) => (
            <div key={tutor.id} className="rounded-lg border border-red-200 dark:border-red-800/30 overflow-hidden bg-white dark:bg-red-950/10">
              <div className="p-6">
                {/* Tutor Header Section */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center">
                    <span className="text-xl font-bold">
                      {tutor.user.fullName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{tutor.user.fullName}</h3>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 mt-1">
                      <Building className="h-4 w-4" />
                      <span className="text-sm">{tutor.user.university || "szabist University"}</span>
                    </div>
                    <div className="text-green-600 dark:text-green-500 font-medium mt-1">
                      Rate: Rs. {tutor.hourlyRate}/hour
                    </div>
                  </div>
                </div>

                {/* Academic Profile Section */}
                <div className="bg-gray-50 dark:bg-gray-900/60 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-red-500 mb-3">
                    <BookOpen className="h-5 w-5" />
                    <span className="font-medium">Academic Profile</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4">
                    <div>
                      <div className="text-gray-700 dark:text-gray-400 font-medium">Program:</div>
                      <div className="text-gray-900 dark:text-gray-300">{tutor.user.program || "Computer Science"}</div>
                    </div>
                    <div>
                      <div className="text-gray-700 dark:text-gray-400 font-medium">University:</div>
                      <div className="text-gray-900 dark:text-gray-300">{tutor.user.university || "szabist University"}</div>
                    </div>
                    <div>
                      <div className="text-gray-700 dark:text-gray-400 font-medium">Semester:</div>
                      <div className="text-gray-900 dark:text-gray-300">{tutor.user.semester || "6 Semester"}</div>
                    </div>
                    <div>
                      <div className="text-gray-700 dark:text-gray-400 font-medium">Hourly Rate:</div>
                      <div className="text-green-600 dark:text-green-500">Rs. {tutor.hourlyRate}/hour</div>
                    </div>
                  </div>
                </div>

                {/* Subjects and Availability Sections */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-900/60 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-500 mb-3">
                      <BookOpen className="h-5 w-5" />
                      <span className="font-medium">Subjects</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tutor.subjects?.map((subject: string, index: number) => (
                        <Badge
                          key={index}
                          className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-800/70 border-0 rounded-full px-3 py-1"
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/60 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-500 mb-3">
                      <Clock className="h-5 w-5" />
                      <span className="font-medium">Availability</span>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      {tutor.availability || "tuesday 3-5pm"}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <Button
                    className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-md flex-1 h-12"
                    onClick={() => handleMessage(tutor.user.id)}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400 rounded-md flex-1 h-12"
                    onClick={() => handleViewProfile(tutor.user.id)}
                  >
                    View Profile
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-md flex-1 h-12"
                    onClick={() => handleBookSession(tutor)}
                  >
                    Book Session
                  </Button>
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
            className="bg-white border-gray-300 hover:bg-gray-50"
          >
            Load More Tutors
          </Button>
        </div>
      )}

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
