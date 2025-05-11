import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format, addDays, isAfter, isBefore } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";

interface BookingFormProps {
  tutorId: number;
  tutorName: string;
  hourlyRate: number;
  subjects: string[];
  onSuccess: () => void;
}

type FormValues = {
  subject: string;
  duration: string;
};

export default function BookingForm({
  tutorId,
  tutorName,
  hourlyRate,
  subjects,
  onSuccess,
}: BookingFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  
  const form = useForm<FormValues>({
    defaultValues: {
      subject: subjects[0] || "",
      duration: "60",
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: {
      tutorId: number;
      subject: string;
      date: Date;
      duration: number;
      totalAmount: number;
    }) => {
      const res = await apiRequest("POST", "/api/sessions", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Session booked successfully",
        description: `Your tutoring session with ${tutorName} has been scheduled.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to book session",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
      console.error("Booking error:", error);
    },
  });

  const onSubmit = (values: FormValues) => {
    if (!selectedDate) {
      toast({
        title: "Please select a date",
        description: "A date is required to book a session",
        variant: "destructive",
      });
      return;
    }

    const duration = parseInt(values.duration);
    const totalAmount = (duration / 60) * hourlyRate;

    bookingMutation.mutate({
      tutorId,
      subject: values.subject,
      date: selectedDate,
      duration,
      totalAmount,
    });
  };

  // Get the total cost based on duration and hourly rate
  const totalCost = form.watch("duration")
    ? (parseInt(form.watch("duration")) / 60) * hourlyRate
    : 0;

  // Date filtering function - only allow dates in the future 
  // (and not more than 30 days in advance)
  const disableDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thirtyDaysFromNow = addDays(today, 30);
    
    return isBefore(date, today) || isAfter(date, thirtyDaysFromNow);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
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
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="180">3 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-4 mt-6">
              <h3 className="font-medium text-lg mb-2">Booking Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-gray-600">Date:</p>
                  <p className="font-medium">
                    {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Not selected"}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Duration:</p>
                  <p className="font-medium">{form.watch("duration") ? `${parseInt(form.watch("duration")) / 60} hour(s)` : "-"}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Hourly Rate:</p>
                  <p className="font-medium">${hourlyRate.toFixed(2)}</p>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <p className="text-gray-800 font-medium">Total:</p>
                  <p className="text-primary font-semibold">${totalCost.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4">
              <FormLabel>Select Date</FormLabel>
              <div className="border rounded-md p-2 mt-1">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disableDate}
                  className="rounded-md border"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={bookingMutation.isPending}>
            {bookingMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              "Book Session"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
