import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import StarRating from "@/components/ui/star-rating";
import { User, TutorProfile } from "@shared/schema";

// Define the structure based on the actual API response
interface TutorUser extends User {
  profileImage: string | null;
  bio: string | null;
}

interface TutorWithProfile {
  id: number;
  userId: number;
  subjects: string[];
  hourlyRate: number;
  experience: string;
  availability: string;
  isAvailableNow: boolean;
  rating: number;
  reviewCount: number;
  user: TutorUser;
}

interface TutorCardProps {
  tutor: TutorWithProfile;
}

const TutorCard = ({ tutor }: TutorCardProps) => {
  return (
    <Card className="overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={tutor.user.profileImage || undefined} alt={tutor.user.fullName} />
            <AvatarFallback>{tutor.user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-bold text-foreground font-inter">{tutor.user.fullName}</h3>
            <p className="text-sm text-gray-600">
              {tutor.subjects[0]} {tutor.subjects.length > 1 && `& ${tutor.subjects.length - 1} more`}
            </p>
            <div className="flex items-center mt-1">
              <StarRating rating={tutor.rating} size="sm" />
              <p className="ml-2 text-sm text-gray-600">{tutor.rating.toFixed(1)} ({tutor.reviewCount} reviews)</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {tutor.subjects.slice(0, 4).map((subject: string, index) => (
              <span key={index} className="bg-blue-100 text-primary px-2 py-1 rounded-md text-xs font-medium">
                {subject}
              </span>
            ))}
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            {tutor.user.bio 
              ? (tutor.user.bio.length > 100 
                  ? `${tutor.user.bio.substring(0, 100)}...` 
                  : tutor.user.bio)
              : tutor.experience}
          </p>
          
          <div className="flex justify-between items-center">
            <p className="text-lg font-bold text-foreground">
              ${tutor.hourlyRate.toFixed(2)}<span className="text-sm font-normal">/hour</span>
            </p>
            <Button className="btn-primary px-4 py-2 rounded-md text-sm" asChild>
              <Link href={`/tutor/${tutor.id}`}>View Profile</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TutorCard;
