import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface StudentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: number;
    fullName: string;
    program: string;
    semester: string;
    subjects: string[];
  };
}

export function StudentBookingModal({ isOpen, onClose, student }: StudentBookingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [sessionType, setSessionType] = useState("One-on-One Tutoring");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("14:00");
  const [duration, setDuration] = useState("60");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState(student.subjects[0] || "");
  const [paymentMethod, setPaymentMethod] = useState("easypaisa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState(1); // Step 1: Session details, Step 2: Payment
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hourlyRate, setHourlyRate] = useState(1000); // Default hourly rate
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  // Get the tutor's hourly rate from their profile
  useState(() => {
    if (user?.id) {
      const fetchTutorRate = async () => {
        try {
          const response = await fetch(`/api/tutors/profile/${user.id}`, {
            credentials: "include",
          });
          if (response.ok) {
            const profile = await response.json();
            if (profile && profile.hourlyRate) {
              setHourlyRate(profile.hourlyRate);
            }
          }
        } catch (error) {
          console.error("Failed to fetch tutor rate:", error);
        }
      };

      fetchTutorRate();
    }
  });

  const durationInHours = parseInt(duration) / 60;
  const totalAmount = hourlyRate * durationInHours;

  const handleContinue = () => {
    if (!date || !subject) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields before continuing.",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!user || !date || !phoneNumber) {
      toast({
        title: "Missing information", 
        description: "Please enter a phone number for payment.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Show payment success immediately (simulated payment)
      setIsPaymentSuccess(true);

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const sessionData = {
        studentId: student.id,
        tutorId: user.id,
        subject: subject,
        sessionType: sessionType,
        date: date.toISOString(),
        startTime: startTime,
        duration: parseInt(duration),
        totalAmount: totalAmount,
        description: description,
        status: "upcoming", // Auto-confirm for prototype
        paymentMethod: paymentMethod,
        paymentStatus: "paid"
      };

      await apiRequest("POST", "/api/sessions", sessionData);

      // Show payment success message
      toast({
        title: "Payment Successful!",
        description: "Your payment has been processed.",
      });

      // Show booking confirmation after payment success
      setTimeout(() => {
        toast({
          title: "Booking Confirmed!",
          description: "Your session has been booked successfully.",
        });
      }, 1000);

      // Invalidate sessions cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });

      // Close modal and redirect after messages are shown
      setTimeout(() => {
        onClose();
        window.location.href = '/my-sessions';
      }, 2000);
    } catch (error) {
      console.error("Failed to book session:", error);
      toast({
        title: "Booking failed",
        description: "There was an error booking your session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Book a Session with {student.fullName}</DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Please select your preferred date, time, and session details."
              : "Complete payment to confirm your booking."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="subject" className="mb-1 block">Subject</Label>
              <Select onValueChange={setSubject} defaultValue={subject}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {student.subjects?.map((subj) => (
                    <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="session-type" className="mb-1 block">Session Type</Label>
              <Select onValueChange={setSessionType} defaultValue={sessionType}>
                <SelectTrigger id="session-type">
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="One-on-One Tutoring">One-on-One Tutoring</SelectItem>
                  <SelectItem value="Group Session">Group Session</SelectItem>
                  <SelectItem value="Homework Help">Homework Help</SelectItem>
                  <SelectItem value="Exam Preparation">Exam Preparation</SelectItem>
                  <SelectItem value="Project Assistance">Project Assistance</SelectItem>
                  <SelectItem value="Concept Clarification">Concept Clarification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date" className="mb-1 block">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time" className="mb-1 block">Start Time</Label>
                <Select onValueChange={setStartTime} defaultValue={startTime}>
                  <SelectTrigger id="start-time">
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="13:00">1:00 PM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                    <SelectItem value="16:00">4:00 PM</SelectItem>
                    <SelectItem value="17:00">5:00 PM</SelectItem>
                    <SelectItem value="18:00">6:00 PM</SelectItem>
                    <SelectItem value="19:00">7:00 PM</SelectItem>
                    <SelectItem value="20:00">8:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration" className="mb-1 block">Duration</Label>
                <Select onValueChange={setDuration} defaultValue={duration}>
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="mb-1 block">Topic/Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what you'll be teaching..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Session Rate:</span>
                <span className="font-medium">Rs. {hourlyRate} / hour</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Total:</span>
                <span className="font-bold text-lg">Rs. {totalAmount}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="mb-2">
              <h3 className="font-medium text-lg mb-2">Payment Method</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Please select your preferred payment method. You will receive payment instructions after the session is confirmed.
              </p>

              <RadioGroup defaultValue={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                <div className="flex items-center space-x-2 border p-3 rounded-md">
                  <RadioGroupItem value="easypaisa" id="easypaisa" />
                  <Label htmlFor="easypaisa" className="flex items-center">
                    <div className="h-8 w-8 flex items-center justify-center bg-green-500 rounded-full mr-2">
                      <i className="fas fa-mobile-alt text-white"></i>
                    </div>
                    <span>EasyPaisa</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 border p-3 rounded-md">
                  <RadioGroupItem value="jazzcash" id="jazzcash" />
                  <Label htmlFor="jazzcash" className="flex items-center">
                    <div className="h-8 w-8 flex items-center justify-center bg-red-500 rounded-full mr-2">
                      <i className="fas fa-wallet text-white"></i>
                    </div>
                    <span>JazzCash</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="phone" className="mb-1 block">Phone Number</Label>
              <Input 
                id="phone" 
                placeholder="Enter your mobile number" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                This number will be used for the {paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} transaction.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
              <h4 className="font-medium mb-2">Booking Summary</h4>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subject:</span>
                <span className="font-medium">{subject}</span>

                <span className="text-gray-600 dark:text-gray-400">Session Type:</span>
                <span className="font-medium">{sessionType}</span>

                <span className="text-gray-600 dark:text-gray-400">Date & Time:</span>
                <span className="font-medium">
                  {date ? format(date, "PPP") : ''} at {startTime.includes(':') ? 
                    parseInt(startTime) > 12 ? 
                      `${parseInt(startTime) - 12}:${startTime.split(':')[1]} PM` : 
                      `${startTime} AM` : 
                    startTime}
                </span>

                <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                <span className="font-medium">{parseInt(duration) / 60} hour(s)</span>

                <span className="text-gray-600 dark:text-gray-400 col-span-2 mt-2 border-t pt-2">Total Payment:</span>
                <span className="font-bold text-lg col-span-2 text-primary">Rs. {totalAmount}</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleContinue}>
                Continue to Payment
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Confirm Booking"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}