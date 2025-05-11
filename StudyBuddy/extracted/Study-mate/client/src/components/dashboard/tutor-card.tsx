import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, StarHalf } from "lucide-react";
import { useNavigate } from "wouter";

interface TutorProfile {
  id: number;
  specialization: string;
  subjects: string[];
  hourlyRate: number;
  availability: string[];
  rating: number;
  sessionCount: number;
}

interface Tutor {
  id: number;
  fullName: string;
  profileImage?: string;
  tutorProfile: TutorProfile;
}

interface TutorCardProps {
  tutor: Tutor;
}

export function TutorCard({ tutor }: TutorCardProps) {
  const [_, navigate] = useNavigate();

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
      stars.push(<Star key={`full-${i}`} className="text-yellow-400 text-xs" fill="currentColor" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="text-yellow-400 text-xs" fill="currentColor" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-yellow-400 text-xs" />);
    }
    
    return stars;
  };

  const handleViewProfile = () => {
    navigate(`/tutor/${tutor.id}`);
  };

  const handleBookSession = () => {
    navigate(`/tutor/${tutor.id}?action=book`);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-16 w-16">
            <Avatar className="h-16 w-16">
              {tutor.profileImage ? (
                <AvatarImage src={tutor.profileImage} alt={tutor.fullName} />
              ) : (
                <AvatarFallback className="text-lg">
                  {getInitials(tutor.fullName)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{tutor.fullName}</h3>
            <div className="text-sm text-gray-500">{tutor.tutorProfile.specialization}</div>
            <div className="flex items-center mt-1">
              {renderRatingStars(tutor.tutorProfile.rating)}
              <span className="ml-1 text-sm text-gray-500">{tutor.tutorProfile.rating.toFixed(1)}</span>
              <span className="mx-1 text-gray-300">|</span>
              <span className="text-sm text-gray-500">{tutor.tutorProfile.sessionCount} sessions</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <div className="text-gray-500">Subjects:</div>
            <div className="text-gray-900">{tutor.tutorProfile.subjects.join(', ')}</div>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <div className="text-gray-500">Rate:</div>
            <div className="text-gray-900">${tutor.tutorProfile.hourlyRate}/hour</div>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <div className="text-gray-500">Availability:</div>
            <div className="text-gray-900">
              {tutor.tutorProfile.availability?.join(' & ') || 'Not specified'}
            </div>
          </div>
        </div>
        
        <div className="mt-5 flex space-x-3">
          <Button
            className="flex-1"
            onClick={handleViewProfile}
          >
            View Profile
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            onClick={handleBookSession}
          >
            Book Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
