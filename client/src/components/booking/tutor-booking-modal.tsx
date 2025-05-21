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

interface TutorBookingModalProps {
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

export function TutorBookingModal({ isOpen, onClose, student }: TutorBookingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [sessionType, setSessionType] = useState("One-on-One Tutoring");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("14:00");
  const [duration, setDuration] = useState("60");
  const [subject, setSubject] = useState(student.subjects[0] || "");
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("easypaisa");
  
  // Payment confirmation flow states
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  
  // Calculate the total amount based on session duration and tutor's hourly rate
  const hourlyRate = user?.role === "tutor" ? user.hourlyRate || 1000 : 1000; // Default rate if not available
  const hours = parseInt(duration) / 60;
  const totalAmount = hourlyRate * hours;

  const resetForm = () => {
    setSessionType("One-on-One Tutoring");
    setDate(new Date());
    setStartTime("14:00");
    setDuration("60");
    setSubject(student.subjects[0] || "");
    setDescription("");
    setPhoneNumber("");
    setPaymentMethod("easypaisa");
    setIsSubmitting(false);
    setIsPaymentSuccess(false);
    setIsBookingSuccess(false);
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
      
      // Show payment processing simulation
      toast({
        title: "Processing Payment...",
        description: "Please wait while we process your payment.",
      });

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show payment success immediately (simulated payment)
      setIsPaymentSuccess(true);
      
      // Show payment success toast
      toast({
        title: "Payment Successful!",
        description: "Your payment has been processed successfully.",
        variant: "default",
      });

      // Simulate a short delay before API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Tutor booking with student ID:", student.id, "and tutor ID:", user.id);

      // Format session data to exactly match the schema requirements
      const sessionData = {
        studentId: Number(student.id),
        tutorId: Number(user.id),
        subject: subject || "General Tutoring", // Default value if empty
        sessionType: sessionType || "online", // Default value if empty
        date: date.toISOString(), // ISO string for proper date handling
        startTime: startTime || "09:00", // Default if empty
        duration: parseInt(duration) || 60, // Default if parsing fails
        totalAmount: Math.round(totalAmount) || 1000, // Default if calculation fails
        description: description || "",
        status: "pending" // Initial status
      };

      // Create the session
      const response = await apiRequest("/api/sessions", {
        method: "POST",
        data: sessionData
      });

      console.log("Session created:", response);
      
      // Set booking success and update UI
      setIsBookingSuccess(true);
      
      // Show booking success
      toast({
        title: "Booking Confirmed!",
        description: "Your session has been scheduled successfully.",
        variant: "default",
      });
      
      // Invalidate sessions cache to reflect the new booking
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/tutor"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/student"] });
      
      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
      
    } catch (error) {
      console.error("Failed to book session:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error booking your session. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const goToPayment = () => {
    if (!date) {
      toast({
        title: "Missing Date",
        description: "Please select a date for your session.",
        variant: "destructive",
      });
      return;
    }
    
    if (!subject) {
      toast({
        title: "Missing Subject",
        description: "Please select a subject for your session.",
        variant: "destructive",
      });
      return;
    }
    
    setStep(2);
  };
  
  const goBackToDetails = () => {
    setStep(1);
  };

  // Render different content based on the current step
  if (isBookingSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-center">
              Your session with {student.fullName} has been scheduled.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <div className="space-y-3 text-center">
            <p>
              <span className="font-semibold">Student:</span> {student.fullName}
            </p>
            <p>
              <span className="font-semibold">Date:</span> {date ? format(date, "PPP") : "Not selected"}
            </p>
            <p>
              <span className="font-semibold">Time:</span> {startTime}
            </p>
            <p>
              <span className="font-semibold">Subject:</span> {subject}
            </p>
            <p>
              <span className="font-semibold">Duration:</span> {duration} minutes
            </p>
          </div>
          <DialogFooter>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (isPaymentSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">Payment Successful!</DialogTitle>
            <DialogDescription className="text-center">
              Your payment has been processed. Confirming your booking...
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Book a Session" : "Payment Details"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? `Schedule a tutoring session with ${student.fullName}` 
              : "Complete payment to confirm your booking"}
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 ? (
          // Step 1: Session details
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject
              </Label>
              <Select 
                value={subject} 
                onValueChange={setSubject}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {student.subjects.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sessionType" className="text-right">
                Session Type
              </Label>
              <Select 
                value={sessionType} 
                onValueChange={setSessionType}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="One-on-One Tutoring">
                    One-on-One Tutoring
                  </SelectItem>
                  <SelectItem value="Group Study">
                    Group Study
                  </SelectItem>
                  <SelectItem value="Exam Preparation">
                    Exam Preparation
                  </SelectItem>
                  <SelectItem value="Homework Help">
                    Homework Help
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Start Time
              </Label>
              <Select 
                value={startTime} 
                onValueChange={setStartTime}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(14)].map((_, i) => {
                    const hour = 8 + i;
                    const time = `${hour.toString().padStart(2, '0')}:00`;
                    return (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration
              </Label>
              <Select 
                value={duration} 
                onValueChange={setDuration}
              >
                <SelectTrigger className="col-span-3">
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Notes
              </Label>
              <Textarea
                id="description"
                placeholder="Add details about what you want to cover in this session"
                className="col-span-3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right"></div>
              <div className="col-span-3 font-medium">
                Total: Rs. {totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        ) : (
          // Step 2: Payment details
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment-method" className="text-right">
                Payment Method
              </Label>
              <div className="col-span-3">
                <RadioGroup 
                  defaultValue="easypaisa" 
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="easypaisa" id="easypaisa" />
                    <Label htmlFor="easypaisa" className="flex items-center cursor-pointer">
                      <div className="w-6 h-6 mr-2 bg-green-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">EP</div>
                      Easypaisa
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="jazzcash" id="jazzcash" />
                    <Label htmlFor="jazzcash" className="flex items-center cursor-pointer">
                      <div className="w-6 h-6 mr-2 bg-red-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">JC</div>
                      JazzCash
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone Number
              </Label>
              <Input
                id="phone"
                placeholder="03XX XXXXXXX"
                className="col-span-3"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right"></div>
              <div className="col-span-3">
                <div className="text-sm text-muted-foreground mb-2">
                  Booking Summary:
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex justify-between py-1">
                    <span>Student:</span>
                    <span className="font-medium">{student.fullName}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Subject:</span>
                    <span className="font-medium">{subject}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Date:</span>
                    <span className="font-medium">{date ? format(date, "PPP") : "Not selected"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Time:</span>
                    <span className="font-medium">{startTime}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Duration:</span>
                    <span className="font-medium">{duration} minutes</span>
                  </div>
                  <div className="border-t border-border mt-2 pt-2 flex justify-between font-medium">
                    <span>Total:</span>
                    <span>Rs. {totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          {step === 1 ? (
            <Button onClick={goToPayment}>
              Proceed to Payment
            </Button>
          ) : (
            <div className="flex w-full gap-2">
              <Button 
                variant="outline" 
                onClick={goBackToDetails} 
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !phoneNumber} 
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span> Processing...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}