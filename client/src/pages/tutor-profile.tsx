import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { MainLayout } from "@/components/layout/main-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ChatModal } from "@/components/chat/chat-modal";
import { format, addDays, addHours, isBefore, isAfter, parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import {
  Star,
  StarHalf,
  Calendar as CalendarIcon,
  User,
  BookOpen,
  Clock,
  DollarSign,
  Award,
  Briefcase,
  MessageSquare,
  Loader2
} from "lucide-react";

interface Review {
  id: number;
  rating: number;
  comment: string;
  timestamp: string;
  studentId: number;
  studentName?: string;
}

// Form schema for booking a session
const bookingFormSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  startTime: z.string().min(1, "Start time is required"),
  duration: z.number().min(1, "Duration is required"),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function TutorProfile() {
  const params = useParams();
  const [location, setLocation] = useLocation();
  const [showChatModal, setShowChatModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const tutorId = params.id ? parseInt(params.id) : 0;

  // Check if the URL has a query parameter to open the booking dialog
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('action') === 'book') {
      setShowBookingModal(true);
    }
  }, []);

  // Fetch tutor data  -  Improved data fetching using the edited code's style
  const [tutor, setTutor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const res = await apiRequest("GET", `/api/tutors/${tutorId}`);
        const data = await res.json();
        setTutor(data);
      } catch (err) {
        setError("Failed to load tutor profile");
      } finally {
        setLoading(false);
      }
    };

    if (tutorId) {
      fetchTutor();
    }
  }, [tutorId]);


  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="text-yellow-400" fill="currentColor" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="text-yellow-400" fill="currentColor" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-yellow-400 text-opacity-30" />);
    }

    return stars;
  };

  // Booking form
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      subject: "",
      date: new Date(),
      startTime: "09:00",
      duration: 60,
      notes: "",
    },
  });

  const bookSessionMutation = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      try {
        // Show payment processing simulation
        toast({
          title: "Processing Payment...",
          description: "Please wait while we process your payment.",
        });

        // Prepare date properly
        const startTime = new Date(data.date);
        const [hours, minutes] = data.startTime.split(':').map(Number);
        startTime.setHours(hours, minutes, 0, 0);

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + data.duration);

        // Format date as ISO string for consistent handling
        const formattedDate = startTime.toISOString();

        // Prepare the session data according to schema requirements
        const sessionData = {
          studentId: Number(user?.id), // Ensure it's a number
          tutorId: Number(tutorId),    // Ensure it's a number
          subject: data.subject || "General Tutoring", // Default value if missing
          sessionType: 'online',
          date: formattedDate, // ISO string
          startTime: data.startTime || "14:00", // Default if missing
          duration: Number(data.duration) || 60, // Ensure it's a number
          totalAmount: Math.round(tutor.tutorProfile.hourlyRate * (data.duration / 60)) || 1000, // Default if calculation fails
          status: 'pending', // Start as pending for proper flow simulation
          description: data.notes || "",
        };

        console.log("Sending session data:", sessionData);
        
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show payment success
        toast({
          title: "Payment Successful!",
          description: "Your payment has been processed successfully.",
          variant: "default",
        });
        
        // Simulate a short delay before API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Now send API request
        const res = await apiRequest("POST", "/api/sessions", sessionData);
        return await res.json();
      } catch (error) {
        console.error("Error in session API request:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Session created successfully:", data);
      
      // Show booking confirmation message with delay
      setTimeout(() => {
        toast({
          title: "Booking Confirmed!",
          description: "Your session has been booked successfully.",
          variant: "default",
        });
      }, 1000);
      
      // Close modal after a short delay to allow user to see the success message
      setTimeout(() => {
        setShowBookingModal(false);
        // Redirect to my-sessions page
        setLocation("/my-sessions");
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      }, 2500);
    },
    onError: (error) => {
      console.error('Booking error:', error);
      toast({
        title: "Booking Error",
        description: "There was a problem with your booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: BookingFormValues) => {
    bookSessionMutation.mutate(data);
  };

  // Generate available time slots based on tutor availability
  const getAvailableTimeSlots = () => {
    const timeSlots = [];
    // Default time slots from 8 AM to 8 PM
    for (let hour = 8; hour <= 20; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 20) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return timeSlots;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error || !tutor) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Card>
            <CardContent className="pt-6">
              <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Tutor Profile</h1>
              <p>{error?.message || "Tutor not found"}</p>
              <Button onClick={() => window.history.back()} className="mt-4">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Tutor Profile Card */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-32 w-32 mb-4">
                    {tutor.profileImage ? (
                      <AvatarImage src={tutor.profileImage} alt={tutor.fullName} />
                    ) : (
                      <AvatarFallback className="text-3xl">
                        {getInitials(tutor.fullName)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <h2 className="text-2xl font-bold">{tutor.fullName}</h2>
                  <p className="text-gray-500 mb-2">{tutor.tutorProfile.specialization}</p>

                  <div className="flex items-center mb-4">
                    {renderRatingStars(tutor.tutorProfile.rating)}
                    <span className="ml-2 text-gray-700">
                      {tutor.tutorProfile.rating.toFixed(1)} ({tutor.tutorProfile.sessionCount} sessions)
                    </span>
                  </div>

                  {user?.role === 'student' && (
                    <div className="flex flex-col w-full space-y-2 mt-2">
                      <Button onClick={() => setShowBookingModal(true)}>
                        Book a Session
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowChatModal(true)}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Hourly Rate</h3>
                      <p className="text-gray-700">${tutor.tutorProfile.hourlyRate}/hour</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <BookOpen className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Subjects</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tutor.tutorProfile.subjects.map((subject, index) => (
                          <Badge key={index} variant="secondary">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Award className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Education</h3>
                      <p className="text-gray-700">{tutor.tutorProfile.education}</p>
                    </div>
                  </div>

                  {tutor.tutorProfile.experience && (
                    <div className="flex items-start space-x-3">
                      <Briefcase className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Experience</h3>
                        <p className="text-gray-700">{tutor.tutorProfile.experience}</p>
                      </div>
                    </div>
                  )}

                  {tutor.tutorProfile.availability && tutor.tutorProfile.availability.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Availability</h3>
                        <p className="text-gray-700">{tutor.tutorProfile.availability.join(', ')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Bio and Reviews */}
          <div className="md:col-span-2">
            <Tabs defaultValue="about">
              <TabsList className="mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="about">
                <Card>
                  <CardHeader>
                    <CardTitle>About {tutor.fullName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tutor.bio ? (
                      <div className="prose max-w-none">
                        <p>{tutor.bio}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">
                        This tutor hasn't added a bio yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Reviews</CardTitle>
                    <CardDescription>
                      See what other students have to say about {tutor.fullName}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tutor.reviews && tutor.reviews.length > 0 ? (
                      <div className="space-y-6">
                        {tutor.reviews.map((review) => (
                          <div key={review.id} className="pb-6 border-b last:border-0">
                            <div className="flex items-center mb-2">
                              <div className="flex">
                                {renderRatingStars(review.rating)}
                              </div>
                              <span className="ml-2 font-medium">
                                {review.rating.toFixed(1)}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-2">{review.comment}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <User className="h-3 w-3 mr-1" />
                              <span>
                                {review.studentName || 'Student'} • {format(new Date(review.timestamp), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No reviews yet.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChatModal && (
        <ChatModal
          user={tutor}
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
        />
      )}

      {/* Booking Dialog */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book a Session with {tutor.fullName}</DialogTitle>
            <DialogDescription>
              Fill out the form below to schedule a tutoring session.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tutor.tutorProfile.subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        isBefore(date, new Date()) ||
                        isAfter(date, addDays(new Date(), 30))
                      }
                      className="rounded-md border"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getAvailableTimeSlots().map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="90">90 minutes</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional information for the tutor"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Hourly Rate:</span>
                  <span className="font-medium">${tutor.tutorProfile.hourlyRate}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Duration:</span>
                  <span className="font-medium">
                    {form.watch("duration")} minutes ({(form.watch("duration") / 60).toFixed(1)} hours)
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${Math.round(tutor.tutorProfile.hourlyRate * (form.watch("duration") / 60))}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Payment will be collected after the tutor confirms your session.
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBookingModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={bookSessionMutation.isPending}
                >
                  {bookSessionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Book Session"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}