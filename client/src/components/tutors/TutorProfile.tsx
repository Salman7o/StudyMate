import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarClock,
  Clock,
  DollarSign,
  MessageSquare,
  Star,
  Calendar as CalendarIcon,
  GraduationCap,
  BookOpen,
  Check,
} from "lucide-react";
import ReviewItem from "./ReviewItem";
import BookingForm from "./BookingForm";
import { TutorProfile as ITutorProfile, Session } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface TutorProfileProps {
  tutorId: number;
}

export default function TutorProfile({ tutorId }: TutorProfileProps) {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("60");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const { data: tutorData, isLoading } = useQuery<ITutorProfile & { reviews: any[] }>({
    queryKey: [`/api/tutors/${tutorId}`],
  });

  useEffect(() => {
    if (tutorData && tutorData.subjects.length > 0) {
      setSelectedSubject(tutorData.subjects[0]);
    }
  }, [tutorData]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-40 bg-gray-200 rounded-lg mb-6"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
              <div className="h-24 bg-gray-200 rounded mb-6"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="flex gap-2 mb-6">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            <div className="md:w-1/3">
              <div className="h-64 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tutorData) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Tutor Not Found</h2>
        <p className="text-gray-600 mb-6">The tutor profile you're looking for doesn't exist or has been removed.</p>
        <Link href="/tutors">
          <Button>Browse Tutors</Button>
        </Link>
      </div>
    );
  }

  const { 
    user: tutorUser, 
    subjects, 
    bio, 
    rate, 
    academicLevel, 
    program, 
    availability,
    averageRating,
    reviewCount,
    reviews = []
  } = tutorData;

  if (!tutorUser) return null;

  const { firstName, lastName, profileImageUrl } = tutorUser;
  
  const getInitials = () => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`;
  };

  const availabilityText = Object.entries(availability)
    .filter(([_, isAvailable]) => isAvailable)
    .map(([time]) => time.charAt(0).toUpperCase() + time.slice(1))
    .join(", ");

  const handleStartConversation = async () => {
    if (!isAuthenticated) {
      setLocation("/login?redirect=" + encodeURIComponent(`/tutors/${tutorId}`));
      return;
    }

    try {
      const res = await apiRequest("GET", `/api/conversations/with/${tutorId}`);
      const conversation = await res.json();
      setLocation(`/messages/${conversation.id}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const handleBookSession = () => {
    if (!isAuthenticated) {
      setLocation("/login?redirect=" + encodeURIComponent(`/tutors/${tutorId}`));
      return;
    }
    
    setBookingDialogOpen(true);
  };

  const totalCost = selectedDuration && rate 
    ? (Number(selectedDuration) / 60) * parseFloat(rate) 
    : 0;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-primary text-white rounded-xl p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-white">
            <AvatarImage src={profileImageUrl} alt={`${firstName} ${lastName}`} />
            <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
          </Avatar>
          
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{firstName} {lastName}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
              <p className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-1" />
                {program}
              </p>
              <p className="flex items-center">
                <BookOpen className="h-5 w-5 mr-1" />
                {academicLevel}
              </p>
              <div className="flex items-center bg-blue-600 px-2 py-1 rounded-md">
                <Star className="h-4 w-4 text-yellow-400 mr-1 fill-yellow-400" />
                <span>{averageRating} ({reviewCount} reviews)</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {subjects.slice(0, 6).map((subject, index) => (
                <Badge key={index} variant="outline" className="bg-blue-600 text-white border-blue-500">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2">
          <Card>
            <Tabs defaultValue="about">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviewCount})</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="p-6">
                <h2 className="text-xl font-semibold mb-4">About {firstName}</h2>
                <p className="text-gray-700 mb-6 whitespace-pre-line">{bio}</p>
                
                <h3 className="text-lg font-medium mb-3">Subjects</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {subjects.map((subject, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      {subject}
                    </Badge>
                  ))}
                </div>
                
                <h3 className="text-lg font-medium mb-3">Education</h3>
                <p className="text-gray-700 mb-3">{program} • {academicLevel}</p>
              </TabsContent>
              
              <TabsContent value="reviews" className="p-6">
                <h2 className="text-xl font-semibold mb-4">Student Reviews</h2>
                
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <ReviewItem key={review.id} review={review} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="availability" className="p-6">
                <h2 className="text-xl font-semibold mb-4">Availability</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {Object.entries(availability).map(([time, isAvailable]) => (
                    <div 
                      key={time} 
                      className={`p-4 rounded-md border ${isAvailable 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50 opacity-60'}`}
                    >
                      <div className="flex items-center">
                        {isAvailable ? (
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <div className="h-5 w-5 mr-2" />
                        )}
                        <span className={isAvailable ? 'text-gray-800' : 'text-gray-500'}>
                          {time.charAt(0).toUpperCase() + time.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="text-gray-600 italic">
                  Note: Specific hours and days can be discussed directly with the tutor.
                </p>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
        
        <div className="col-span-1">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Booking Information</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-gray-700 font-medium">${rate}/hour</p>
                    <p className="text-gray-500 text-sm">Hourly rate</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <CalendarClock className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-gray-700 font-medium">{availabilityText}</p>
                    <p className="text-gray-500 text-sm">Availability</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-gray-700 font-medium">1-3 hours</p>
                    <p className="text-gray-500 text-sm">Session duration</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={handleBookSession}
                  className="w-full"
                  size="lg"
                >
                  Book a Session
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  size="lg"
                  onClick={handleStartConversation}
                >
                  <MessageSquare className="h-4 w-4 mr-2" /> Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle>Book a Session with {firstName} {lastName}</DialogTitle>
            <DialogDescription>
              Select date, subject, and duration to schedule your tutoring session.
            </DialogDescription>
          </DialogHeader>
          
          <BookingForm 
            tutorId={tutorId} 
            tutorName={`${firstName} ${lastName}`}
            hourlyRate={parseFloat(rate)}
            subjects={subjects}
            onSuccess={() => setBookingDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
