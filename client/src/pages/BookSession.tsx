import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, Redirect } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { TutorProfile } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format, addDays, isPast, isSameDay, isAfter, parseISO, setHours, setMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Clock, Check, User, Star } from "lucide-react";
import BookingModal from "@/components/BookingModal";

// Form schema
const bookingSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }).refine(
    (date) => !isPast(date) || isSameDay(date, new Date()),
    {
      message: "Date cannot be in the past",
    }
  ),
  time: z.string({
    required_error: "Please select a time",
  }),
  duration: z.string({
    required_error: "Please select session duration",
  }),
  subject: z.string().min(2, {
    message: "Subject must be at least 2 characters",
  }),
  notes: z.string().optional(),
  paymentMethod: z.enum(["JazzCash", "EasyPaisa"], {
    required_error: "Please select a payment method",
  }),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookSession() {
  const { id } = useParams<{ id: string }>();
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const tutorId = parseInt(id);

  // Fetch tutor data
  const { data: tutor, isLoading } = useQuery<any>({
    queryKey: [`/api/tutors/${tutorId}`],
    enabled: !!tutorId,
  });

  // Form setup
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: addDays(new Date(), 1),
      duration: "60",
      subject: "",
      notes: "",
    },
  });

  // Define available time slots based on tutor availability
  const getAvailableTimeSlots = () => {
    if (!tutor) return [];

    const selectedDate = form.getValues("date");
    const weekday = format(selectedDate, "EEEE");
    
    // Check if tutor is available on selected day
    if (!tutor.profile.availableDays.includes(weekday)) {
      return [];
    }

    // Parse tutor's available hours
    const startTime = tutor.profile.availableTimeStart;
    const endTime = tutor.profile.availableTimeEnd;
    
    if (!startTime || !endTime) return [];

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    
    // Generate time slots in 30-minute increments
    const slots = [];
    const start = new Date();
    start.setHours(startHour, startMinute, 0, 0);
    
    const end = new Date();
    end.setHours(endHour, endMinute, 0, 0);
    
    // Subtract session duration from end time
    const duration = parseInt(form.getValues("duration") || "60");
    const adjustedEnd = new Date(end);
    adjustedEnd.setMinutes(adjustedEnd.getMinutes() - duration);
    
    while (start <= adjustedEnd) {
      slots.push(format(start, "HH:mm"));
      start.setMinutes(start.getMinutes() + 30);
    }
    
    return slots;
  };

  // Calculate session price
  const calculatePrice = () => {
    if (!tutor) return 0;
    
    const duration = parseInt(form.getValues("duration") || "60");
    const hourlyRate = tutor.profile.hourlyRate;
    
    return (hourlyRate * duration) / 60;
  };

  // Calculate platform fee (5% of session price)
  const calculatePlatformFee = () => {
    const price = calculatePrice();
    return Math.round(price * 0.05);
  };

  // Calculate total price
  const calculateTotal = () => {
    return calculatePrice() + calculatePlatformFee();
  };

  // Book session mutation
  const bookSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/sessions", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/sessions`] });
      setSummary(data);
      setIsModalOpen(true);
    },
    onError: () => {
      toast({
        title: "Booking failed",
        description: "Failed to book the session. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = (values: BookingFormValues) => {
    if (!user || !tutor) return;
    
    const { date, time, duration, subject, notes, paymentMethod } = values;
    
    // Combine date and time
    const [hours, minutes] = time.split(":").map(Number);
    const sessionDate = new Date(date);
    sessionDate.setHours(hours, minutes, 0, 0);
    
    // Calculate price
    const price = calculatePrice();
    
    // Create session data
    const sessionData = {
      studentId: user.id,
      tutorId: tutor.id,
      subject: subject,
      sessionType: "online", // Added required field
      date: sessionDate, 
      startTime: time, // Added required field
      duration: parseInt(duration),
      totalAmount: price, // Renamed to match schema
      description: notes, // Renamed to match schema
      status: "confirmed", // Auto-confirm for demo purposes
    };
    
    bookSessionMutation.mutate(sessionData);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsBookingComplete(true);
  };

  // Check if user is logged in
  if (!user) {
    return <Redirect to={`/login?redirect=/book-session/${id}`} />;
  }

  // If user is the tutor, redirect to tutor profile
  if (user.id === tutorId) {
    return <Redirect to="/my-profile" />;
  }

  // Redirect after successful booking
  if (isBookingComplete) {
    return <Redirect to="/my-sessions" />;
  }

  if (isLoading || !tutor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="w-full h-[600px] bg-gray-100 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Available time slots based on selected date
  const timeSlots = getAvailableTimeSlots();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex flex-col items-start mb-8">
        <Button variant="outline" size="sm" onClick={() => navigate(`/tutor/${id}`)} className="mb-4">
          ← Back to Tutor Profile
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Book a Session</h1>
        <p className="text-muted-foreground mt-2">
          Schedule a tutoring session with {tutor.firstName} {tutor.lastName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tutor info card */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Tutor Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={tutor.profileImage || ""} alt={`${tutor.firstName} ${tutor.lastName}`} />
                <AvatarFallback>{tutor.firstName?.[0]}{tutor.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <p className="text-lg font-semibold">{tutor.firstName} {tutor.lastName}</p>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-accent fill-current mr-1" />
                  <span className="text-sm">{tutor.profile.rating.toFixed(1)} ({tutor.profile.reviewCount} reviews)</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{tutor.program}, {tutor.semester}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-lg font-medium">₹{tutor.profile.hourlyRate}/hour</p>
              <p className="text-sm text-muted-foreground flex items-center">
                <User className="h-4 w-4 mr-1" /> {tutor.userType === "tutor" ? "Tutor" : "Student"}
              </p>
              <p className="text-sm text-muted-foreground flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" /> Available on: {tutor.profile.availableDays.join(", ")}
              </p>
              <p className="text-sm text-muted-foreground flex items-center">
                <Clock className="h-4 w-4 mr-1" /> {tutor.profile.availableTimeStart} - {tutor.profile.availableTimeEnd}
              </p>
            </div>

            <Separator className="my-4" />

            <div>
              <h4 className="font-medium mb-2">Subjects</h4>
              <div className="flex flex-wrap gap-1 mb-4">
                {tutor.profile.subjects.map((subject, index) => (
                  <div 
                    key={index} 
                    className="px-2 py-1 bg-blue-100 text-primary text-xs rounded-full"
                  >
                    {subject}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>
              Fill in the details to book your session with {tutor.firstName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Session Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => isPast(date) || !tutor.profile.availableDays.includes(format(date, "EEEE"))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Available on: {tutor.profile.availableDays.join(", ")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a time slot" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.length > 0 ? (
                            timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              No available time slots for this day
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Available times: {tutor.profile.availableTimeStart} - {tutor.profile.availableTimeEnd}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Duration</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="60">1 hour - ₹{tutor.profile.hourlyRate}</SelectItem>
                          <SelectItem value="90">1.5 hours - ₹{(tutor.profile.hourlyRate * 1.5).toFixed(0)}</SelectItem>
                          <SelectItem value="120">2 hours - ₹{tutor.profile.hourlyRate * 2}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic/Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Java Programming, Data Structures" {...field} />
                      </FormControl>
                      <FormDescription>
                        Specify what you'd like to cover in this session
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes for Tutor</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what you'd like to cover in this session"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div>
                  <h3 className="text-base font-medium text-foreground mb-3">Payment Summary</h3>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">
                      {form.watch("duration") === "60" ? "1 hour" : 
                       form.watch("duration") === "90" ? "1.5 hours" : 
                       "2 hours"} session @ ₹{tutor.profile.hourlyRate}/hour
                    </span>
                    <span className="font-medium text-foreground">₹{calculatePrice()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-muted-foreground">Platform fee (5%)</span>
                    <span className="font-medium text-foreground">₹{calculatePlatformFee()}</span>
                  </div>
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">₹{calculateTotal()}</span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="JazzCash" />
                            </FormControl>
                            <FormLabel className="font-normal">JazzCash</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="EasyPaisa" />
                            </FormControl>
                            <FormLabel className="font-normal">EasyPaisa</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={bookSessionMutation.isPending}
                >
                  {bookSessionMutation.isPending ? "Processing Payment..." : `Confirm & Pay ₹${calculateTotal()}`}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By confirming, you agree to our <a href="#" className="text-primary hover:text-primary/80">terms and conditions</a>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Booking Confirmation Modal */}
      <BookingModal
        open={isModalOpen} 
        onOpenChange={handleModalClose}
        tutor={tutor}
        summary={summary}
      />
    </div>
  );
}
