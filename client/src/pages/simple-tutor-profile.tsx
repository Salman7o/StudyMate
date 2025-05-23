import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Loader2, ChevronLeft } from "lucide-react";
import { BookingModal } from "@/components/booking/booking-modal";
import { ChatModal } from "@/components/chat/chat-modal";

export default function SimpleTutorProfile() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [tutor, setTutor] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    const fetchTutorProfile = async () => {
      try {
        const response = await apiRequest("GET", `/api/tutors/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tutor profile");
        }
        const data = await response.json();
        console.log("Tutor profile data:", data);
        setTutor(data);
      } catch (error) {
        console.error("Error fetching tutor profile:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTutorProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Button onClick={() => setLocation("/find-tutors")} variant="outline" className="mb-6">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Find Tutors
          </Button>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Profile</h1>
                <p className="text-gray-600">{error || "Tutor profile not found"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button onClick={() => setLocation("/find-tutors")} variant="outline" className="mb-6">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Find Tutors
        </Button>

        <Card className="bg-gradient-to-br from-black to-red-900 text-white">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                {tutor.user?.profileImage ? (
                  <AvatarImage src={tutor.user.profileImage} alt={tutor.user.fullName} />
                ) : (
                  <AvatarFallback className="text-3xl">
                    {tutor.user?.fullName?.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>

              <h2 className="text-2xl font-bold mb-2">{tutor.user?.fullName}</h2>
              <p className="text-gray-300 mb-2">{tutor.user?.program} • Semester {tutor.user?.semester}</p>
              <p className="text-gray-300 mb-4">{tutor.subjects?.join(", ")} Specialist</p>

              <div className="flex items-center mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= (tutor.rating / 10)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-400"
                    }`}
                  />
                ))}
                <span className="ml-2">
                  {(tutor.rating/10).toFixed(1)} ({tutor.reviewCount || 0} reviews)
                </span>
              </div>

              <div className="flex space-x-4 w-full max-w-xs">
                <Button 
                  className="flex-1" 
                  onClick={() => {
                    try {
                      setShowBookingModal(true);
                    } catch (error) {
                      console.error("Authentication required for booking");
                      setLocation("/auth/login?redirect=/tutor-profile/" + id);
                    }
                  }}
                >
                  Book Session
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    try {
                      setShowChatModal(true);
                    } catch (error) {
                      console.error("Authentication required for messaging");
                      setLocation("/auth/login?redirect=/tutor-profile/" + id);
                    }
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">About</h3>
                <p className="text-gray-300">{tutor.bio || "No bio available"}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {tutor.subjects?.map((subject: string) => (
                    <Badge key={subject} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Experience</h4>
                <p className="text-gray-300">{tutor.experience || "Not specified"}</p>
              </div>
              
              <div className="bg-black/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Hourly Rate</h4>
                <p className="text-gray-300">Rs. {tutor.hourlyRate}/hour</p>
              </div>
              
              <div className="bg-black/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Availability</h4>
                <p className="text-gray-300">{tutor.availability || "Not specified"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showBookingModal && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          tutor={tutor}
        />
      )}

      {showChatModal && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          user={tutor.user}
        />
      )}
    </div>
  );
}