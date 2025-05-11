import { useState, useEffect } from "react";
import { useParams, useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useChatState } from "@/lib/utils/chat";
import MainLayout from "@/components/layout/MainLayout";
import BookSessionForm from "@/components/tutor/BookSessionForm";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TutorDetails {
  id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  profileImageUrl?: string;
  university?: string;
  program?: string;
  semester?: string;
  profile: {
    id: number;
    specialization: string;
    hourlyRate: number;
    availableWeekdays: boolean;
    availableWeekends: boolean;
    rating: number;
    sessionsCompleted: number;
  };
  subjects: {
    id: number;
    name: string;
    category: string;
  }[];
  feedback?: {
    id: number;
    rating: number;
    comment: string;
    fromStudentId: number;
    student?: {
      name: string;
      profileImageUrl?: string;
    };
  }[];
}

export default function TutorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [_, params] = useRoute('/tutor/:id');
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { openChat } = useChatState();
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  
  // Parse URL query parameters to check if booking dialog should be opened
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('book') === 'true') {
      setIsBookingDialogOpen(true);
    }
  }, []);

  // Fetch tutor details
  const { data: tutor, isLoading, error } = useQuery<TutorDetails>({
    queryKey: [`/api/tutors/${id}`],
    enabled: !!id,
  });

  const handleBookSession = () => {
    if (user) {
      setIsBookingDialogOpen(true);
    } else {
      toast({
        title: "Authentication required",
        description: "Please log in to book a session",
        variant: "destructive",
      });
      setLocation("/auth");
    }
  };

  const handleContactTutor = () => {
    if (user) {
      if (tutor) {
        openChat(tutor.id);
      }
    } else {
      toast({
        title: "Authentication required",
        description: "Please log in to message tutors",
        variant: "destructive",
      });
      setLocation("/auth");
    }
  };

  const getAvailabilityText = (tutor: TutorDetails) => {
    if (tutor.profile.availableWeekdays && tutor.profile.availableWeekends) {
      return "Weekdays & Weekends";
    } else if (tutor.profile.availableWeekdays) {
      return "Weekdays Only";
    } else if (tutor.profile.availableWeekends) {
      return "Weekends Only";
    }
    return "Not specified";
  };

  return (
    <MainLayout title="Tutor Profile">
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 p-8 flex flex-col items-center justify-center border-r border-gray-200">
              <Skeleton className="h-48 w-48 rounded-full mb-6" />
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="flex space-x-2 mb-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-6 w-6 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-10 w-full mb-3" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            <div className="md:w-2/3 p-8">
              <Skeleton className="h-10 w-32 mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error loading tutor profile</h2>
          <p className="text-red-600 mb-4">Please try again later</p>
          <Button variant="outline" onClick={() => setLocation("/find-tutors")}>
            Back to Find Tutors
          </Button>
        </div>
      ) : tutor ? (
        <>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="md:flex">
              <div className="md:w-1/3 p-8 flex flex-col items-center justify-center border-r border-gray-200">
                <img 
                  src={tutor.profileImageUrl || "https://via.placeholder.com/192?text=Tutor"} 
                  alt={`${tutor.name}'s profile`}
                  className="h-48 w-48 rounded-full object-cover mb-6"
                />
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{tutor.name}</h1>
                <p className="text-lg text-gray-600 mb-4">{tutor.profile.specialization}</p>
                
                <div className="flex items-center mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i 
                      key={i} 
                      className={`fas fa-star text-yellow-400 text-lg ${
                        i < Math.floor(tutor.profile.rating) 
                          ? '' 
                          : i < tutor.profile.rating 
                            ? 'fa-star-half-alt' 
                            : 'far fa-star'
                      }`}
                    ></i>
                  ))}
                  <span className="ml-2 text-gray-700">
                    {tutor.profile.rating.toFixed(1)} ({tutor.profile.sessionsCompleted} sessions)
                  </span>
                </div>
                
                <Button 
                  className="w-full mb-3" 
                  onClick={handleBookSession}
                  disabled={user?.id === tutor.id}
                >
                  Book a Session
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleContactTutor}
                  disabled={user?.id === tutor.id}
                >
                  <i className="fas fa-comment-alt mr-2"></i> Message
                </Button>
              </div>
              
              <div className="md:w-2/3 p-8">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="subjects">Subjects</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="about" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Bio</h3>
                      <p className="text-gray-700">
                        {tutor.bio || "No bio provided"}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Details</h3>
                        <ul className="space-y-3">
                          <li className="flex justify-between">
                            <span className="text-gray-500">University:</span>
                            <span className="text-gray-900 font-medium">{tutor.university || "Not specified"}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-500">Program/Major:</span>
                            <span className="text-gray-900 font-medium">{tutor.program || "Not specified"}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-500">Semester:</span>
                            <span className="text-gray-900 font-medium">{tutor.semester || "Not specified"}</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Tutoring Details</h3>
                        <ul className="space-y-3">
                          <li className="flex justify-between">
                            <span className="text-gray-500">Hourly Rate:</span>
                            <span className="text-gray-900 font-medium">${tutor.profile.hourlyRate}/hour</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-500">Availability:</span>
                            <span className="text-gray-900 font-medium">{getAvailabilityText(tutor)}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-500">Sessions Completed:</span>
                            <span className="text-gray-900 font-medium">{tutor.profile.sessionsCompleted}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="subjects">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Subjects</h3>
                    
                    {tutor.subjects.length === 0 ? (
                      <p className="text-gray-500">No subjects listed</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tutor.subjects.map(subject => (
                          <div key={subject.id} className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900">{subject.name}</h4>
                            <p className="text-sm text-gray-500">{subject.category}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="reviews">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Reviews</h3>
                    
                    {!tutor.feedback || tutor.feedback.length === 0 ? (
                      <div className="bg-gray-50 p-6 rounded-lg text-center">
                        <p className="text-gray-500">No reviews yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {tutor.feedback.map(review => (
                          <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                              <img 
                                src={review.student?.profileImageUrl || "https://via.placeholder.com/40?text=S"}
                                alt="Student profile" 
                                className="h-10 w-10 rounded-full mr-2" 
                              />
                              <div>
                                <p className="font-medium text-gray-900">{review.student?.name || "Anonymous Student"}</p>
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <i 
                                      key={i} 
                                      className={`fas fa-star text-yellow-400 text-xs ${i >= review.rating ? 'far fa-star' : ''}`}
                                    ></i>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
          
          {/* Session Booking Dialog */}
          <Dialog 
            open={isBookingDialogOpen} 
            onOpenChange={setIsBookingDialogOpen}
          >
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Book a Session with {tutor.name}</DialogTitle>
                <DialogDescription>
                  Select a date, time, and subject for your tutoring session
                </DialogDescription>
              </DialogHeader>
              
              <BookSessionForm
                tutorId={tutor.id}
                tutorName={tutor.name}
                hourlyRate={tutor.profile.hourlyRate}
                onSuccess={() => setIsBookingDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </>
      ) : null}
    </MainLayout>
  );
}
