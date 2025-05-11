import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MessageSquare, Star, Clock } from "lucide-react";
import { Link } from "wouter";
import { TutorWithProfile } from "@shared/schema";
import Rating from "./Rating";

interface TutorProfileModalProps {
  tutor: TutorWithProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TutorProfileModal({ tutor, open, onOpenChange }: TutorProfileModalProps) {
  if (!tutor) return null;

  const reviews = [
    {
      id: 1,
      studentName: "Anita Patel",
      studentImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      rating: 5,
      date: "2 weeks ago",
      comment: "Michael is an excellent tutor! He helped me understand complex Java concepts that I was struggling with for weeks. His explanations are clear and he's very patient. I'll definitely book more sessions with him."
    },
    {
      id: 2,
      studentName: "Rahul Mehta",
      studentImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      rating: 5,
      date: "1 month ago",
      comment: "I was struggling with data structures and algorithms until I started sessions with Michael. He breaks down complex problems into simpler parts and teaches problem-solving strategies. My grades have improved significantly!"
    }
  ];

  const dayAvailability = [
    { day: "Mon", available: tutor.profile.availableDays.includes("Monday") },
    { day: "Tue", available: tutor.profile.availableDays.includes("Tuesday") },
    { day: "Wed", available: tutor.profile.availableDays.includes("Wednesday") },
    { day: "Thu", available: tutor.profile.availableDays.includes("Thursday") },
    { day: "Fri", available: tutor.profile.availableDays.includes("Friday") },
    { day: "Sat", available: tutor.profile.availableDays.includes("Saturday") },
    { day: "Sun", available: tutor.profile.availableDays.includes("Sunday") }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground" />
        
        <div className="relative">
          <div className="h-48 bg-primary"></div>
          <div className="absolute -bottom-16 left-6">
            <Avatar className="h-32 w-32 border-4 border-white">
              <AvatarImage src={tutor.profileImage || ""} alt={`${tutor.firstName} ${tutor.lastName}`} />
              <AvatarFallback className="text-2xl">{tutor.firstName?.[0]}{tutor.lastName?.[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <div className="pt-16">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{tutor.firstName} {tutor.lastName}</h2>
              <p className="text-muted-foreground">{tutor.program}, {tutor.semester}</p>
              <div className="mt-1 flex items-center">
                <Rating value={tutor.profile.rating} />
                <span className="ml-1 text-sm text-muted-foreground">{tutor.profile.rating.toFixed(1)} ({tutor.profile.reviewCount} reviews)</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">₹{tutor.profile.hourlyRate}<span className="text-base font-normal text-muted-foreground">/hour</span></p>
              <Link href={`/book-session/${tutor.id}`}>
                <Button variant="secondary" className="mt-2">
                  Book Session
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-foreground">About Me</h3>
            <p className="mt-2 text-base text-muted-foreground">
              {tutor.bio}
            </p>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-foreground">Expertise</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {tutor.profile.expertise.map((skill, index) => (
                <Badge key={index} className="bg-blue-100 text-primary py-1 px-3">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-foreground">Availability</h3>
            <div className="mt-2 grid grid-cols-7 gap-2 text-center">
              {dayAvailability.map((day) => (
                <div key={day.day}>
                  <div className="text-sm font-medium text-muted-foreground">{day.day}</div>
                  <div className={`mt-1 text-xs ${day.available ? 'bg-green-100 text-secondary' : 'bg-red-100 text-red-500'} rounded py-1`}>
                    {day.available ? 'Available' : 'Booked'}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground flex items-center">
              <Clock className="text-primary h-4 w-4 mr-1" /> Preferred hours: {tutor.profile.availableTimeStart} - {tutor.profile.availableTimeEnd}
            </p>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Reviews</h3>
              <a href="#" className="text-sm text-primary hover:text-primary/80">View all {tutor.profile.reviewCount} reviews</a>
            </div>
            
            <div className="mt-4 space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={review.studentImage} alt={review.studentName} />
                      <AvatarFallback>{review.studentName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-foreground">{review.studentName}</p>
                      <div className="flex items-center">
                        <Rating value={review.rating} size="sm" />
                        <span className="ml-1 text-xs text-muted-foreground">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 text-center flex flex-wrap gap-3 justify-center">
            <Link href={`/book-session/${tutor.id}`}>
              <Button variant="secondary" size="lg" className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" /> Book a Session with {tutor.firstName}
              </Button>
            </Link>
            <Link href={`/messages/${tutor.id}`}>
              <Button variant="outline" size="lg" className="text-primary flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" /> Message
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
