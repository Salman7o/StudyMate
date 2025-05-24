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
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface TutorBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: number;
    fullName: string;
    program?: string;
    semester?: string;
  };
}

export function TutorBookingModal({ isOpen, onClose, student }: TutorBookingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [sessionType, setSessionType] = useState("One-on-One Tutoring");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("14:00");
  const [duration, setDuration] = useState("60");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("Calculus");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Tutors should set their own hourly rate when booking a student
  const [hourlyRate, setHourlyRate] = useState(1000);
  
  const durationInHours = parseInt(duration) / 60;
  const totalAmount = hourlyRate * durationInHours;

  const handleSubmit = async () => {
    if (!user || !date) {
      toast({
        title: "Missing information", 
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create session directly (without payment step)
      const startDateTime = new Date(date);
      const [hours, minutes] = startTime.split(':');
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const sessionData = {
        studentId: student.id,
        tutorId: user.id,
        subject: subject,
        sessionType: sessionType,
        date: startDateTime.toISOString(),
        startTime: startTime,
        duration: parseInt(duration),
        totalAmount: totalAmount,
        description: description,
        status: "pending",
      };

      console.log("Creating session with data:", sessionData);
      
      await apiRequest("POST", "/api/sessions", sessionData);

      // Show confirmation and update UI
      setIsConfirmed(true);
      
      // Invalidate sessions cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });

      // Show confirmation message
      toast({
        title: "Session Request Sent",
        description: `You've requested a session with ${student.fullName}. They will need to confirm the booking.`,
      });

      // Close modal after a delay
      setTimeout(() => {
        onClose();
        setIsConfirmed(false);
      }, 2000);

    } catch (error) {
      console.error("Failed to create session:", error);
      toast({
        title: "Session booking failed",
        description: "There was an error booking this session. Please try again.",
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
            {isConfirmed 
              ? "Your session request has been sent successfully!" 
              : "Please select your preferred date, time, and session details."}
          </DialogDescription>
        </DialogHeader>

        {isConfirmed ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-16 w-16 bg-green-100 flex items-center justify-center rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Session Request Sent!</h3>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Your session request has been sent to {student.fullName}.
            </p>
            <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
              They will need to confirm the session.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="subject" className="mb-1 block">Subject</Label>
              <Select onValueChange={setSubject} defaultValue={subject}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Calculus">Calculus</SelectItem>
                  <SelectItem value="Discrete Mathematics">Discrete Mathematics</SelectItem>
                  <SelectItem value="Data Structures">Data Structures</SelectItem>
                  <SelectItem value="Algorithms">Algorithms</SelectItem>
                  <SelectItem value="Linear Algebra">Linear Algebra</SelectItem>
                  <SelectItem value="Probability & Statistics">Probability & Statistics</SelectItem>
                  <SelectItem value="Database Systems">Database Systems</SelectItem>
                  <SelectItem value="Operating Systems">Operating Systems</SelectItem>
                  <SelectItem value="Computer Networks">Computer Networks</SelectItem>
                  <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                  <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                  <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                  <SelectItem value="Computer Graphics">Computer Graphics</SelectItem>
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
              <Label htmlFor="hourly-rate" className="mb-1 block">Hourly Rate (Rs.)</Label>
              <Input
                id="hourly-rate"
                type="number"
                min="500"
                step="100"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="description" className="mb-1 block">Topic/Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what you'll help with..."
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
        )}

        <DialogFooter>
          {!isConfirmed && (
            <>
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Request Session"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}