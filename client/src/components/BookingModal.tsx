import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { TutorWithProfile } from "@shared/schema";
import { CheckCircle2, Calendar, Clock, BookOpen, User } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutor: TutorWithProfile;
  summary: any;
}

export default function BookingModal({ open, onOpenChange, tutor, summary }: BookingModalProps) {
  if (!summary) return null;

  const sessionDate = new Date(summary.date);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-secondary" />
          </div>
          <DialogTitle className="text-center text-xl mt-4">Booking Confirmed!</DialogTitle>
          <DialogDescription className="text-center">
            Your tutoring session has been successfully booked.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <Avatar className="h-12 w-12">
                <AvatarImage src={tutor.profileImage || ""} alt={tutor.firstName} />
                <AvatarFallback>{tutor.firstName?.[0]}{tutor.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="font-medium">{tutor.firstName} {tutor.lastName}</p>
                <p className="text-sm text-muted-foreground">{tutor.program}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-100 text-secondary">
              Confirmed
            </Badge>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-primary mr-3 mt-0.5" />
              <div>
                <p className="font-medium">Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {format(sessionDate, "EEEE, MMMM d, yyyy")} at {format(sessionDate, "h:mm a")}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-primary mr-3 mt-0.5" />
              <div>
                <p className="font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">
                  {summary.duration} minutes
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <BookOpen className="h-5 w-5 text-primary mr-3 mt-0.5" />
              <div>
                <p className="font-medium">Subject</p>
                <p className="text-sm text-muted-foreground">
                  {summary.subject}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <User className="h-5 w-5 text-primary mr-3 mt-0.5" />
              <div>
                <p className="font-medium">Payment</p>
                <p className="text-sm text-muted-foreground">
                  ₹{summary.totalAmount} • Payment Successful
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="text-center text-sm text-muted-foreground">
            <p>
              You can find all your booked sessions in the "My Sessions" section.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="sm:w-1/2" asChild>
            <Link href={`/messages/${tutor.id}`}>
              Message Tutor
            </Link>
          </Button>
          <Button className="sm:w-1/2" asChild>
            <Link href="/my-sessions">
              View My Sessions
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
