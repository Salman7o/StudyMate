import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { insertSessionSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface BookSessionFormProps {
  tutorId: number;
  tutorName: string;
  hourlyRate: number;
  onSuccess?: () => void;
}

const bookingSchema = z.object({
  tutorId: z.number(),
  startTime: z.date({
    required_error: "Please select a date and time",
  }),
  endTime: z.date({
    required_error: "Please select an end time",
  }),
  subject: z.string({
    required_error: "Please select a subject",
  }),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookSessionForm({
  tutorId,
  tutorName,
  hourlyRate,
  onSuccess,
}: BookSessionFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      tutorId,
      notes: "",
    },
  });

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      return apiRequest("POST", "/api/sessions", {
        ...data,
        studentId: user!.id,
        status: "pending",
        startTime: data.startTime.toISOString(),
        endTime: data.endTime.toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Session booked",
        description: "Your session has been booked. The tutor will be notified.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/student"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Booking failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: BookingFormValues) {
    if (step === 1) {
      setStep(2);
      return;
    }
    
    bookingMutation.mutate(data);
  }

  // Generate time slots for the selected date
  const generateTimeSlots = () => {
    const slots = [];
    const date = form.watch("startTime");
    
    if (date) {
      const startHour = 8; // 8 AM
      const endHour = 20; // 8 PM
      
      for (let hour = startHour; hour < endHour; hour++) {
        const time = new Date(date);
        time.setHours(hour, 0, 0, 0);
        slots.push(time);
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const calculateDuration = () => {
    const startTime = form.watch("startTime");
    const endTime = form.watch("endTime");
    
    if (startTime && endTime) {
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      return durationHours;
    }
    
    return 0;
  };

  const duration = calculateDuration();
  const totalCost = duration * hourlyRate;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">Book a Session with {tutorName}</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 ? (
            <>
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
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
                          disabled={(date) => date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch("startTime") && (
                <>
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const date = new Date(value);
                            field.onChange(date);
                          }}
                          value={field.value?.toISOString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select start time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time.toISOString()} value={time.toISOString()}>
                                {format(time, "h:mm a")}
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
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const date = new Date(value);
                            field.onChange(date);
                          }}
                          value={field.value?.toISOString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select end time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots
                              .filter((time) => {
                                const startTime = form.watch("startTime");
                                return startTime && time > startTime;
                              })
                              .map((time) => (
                                <SelectItem key={time.toISOString()} value={time.toISOString()}>
                                  {format(time, "h:mm a")}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects?.map((subject) => (
                          <SelectItem key={subject.id} value={subject.name}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full">Next</Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-3">Session Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Date:</div>
                    <div>{format(form.watch("startTime"), "PPP")}</div>
                    
                    <div className="text-gray-500">Time:</div>
                    <div>{format(form.watch("startTime"), "h:mm a")} - {format(form.watch("endTime"), "h:mm a")}</div>
                    
                    <div className="text-gray-500">Duration:</div>
                    <div>{duration.toFixed(1)} hours</div>
                    
                    <div className="text-gray-500">Subject:</div>
                    <div>{form.watch("subject")}</div>
                    
                    <div className="text-gray-500">Tutor:</div>
                    <div>{tutorName}</div>
                    
                    <div className="text-gray-500">Rate:</div>
                    <div>${hourlyRate}/hour</div>
                    
                    <div className="text-gray-500 font-medium">Total Cost:</div>
                    <div className="font-medium">${totalCost.toFixed(2)}</div>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Let the tutor know what you'd like to focus on in this session..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-2 flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={bookingMutation.isPending}
                  >
                    {bookingMutation.isPending ? (
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                      </div>
                    ) : (
                      "Confirm Booking"
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </form>
      </Form>
    </div>
  );
}
