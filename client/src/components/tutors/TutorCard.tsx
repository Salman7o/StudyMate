import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { TutorProfile } from "@/lib/types";

interface TutorCardProps {
  tutor: TutorProfile;
}

export default function TutorCard({ tutor }: TutorCardProps) {
  const { user, subjects, academicLevel, program, rate, bio, averageRating } = tutor;
  
  if (!user) return null;
  
  const { id, firstName, lastName, profileImageUrl } = user;
  
  const getInitials = () => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <Avatar className="h-14 w-14 mr-4">
              <AvatarImage src={profileImageUrl} alt={`${firstName} ${lastName}`} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-textColor font-inter">{firstName} {lastName}</h3>
              <p className="text-gray-600 text-sm">{program} • {academicLevel}</p>
            </div>
          </div>
          <div className="flex items-center bg-blue-50 px-2 py-1 rounded-md">
            <Star className="h-4 w-4 text-yellow-400 mr-1 fill-yellow-400" />
            <span className="text-primary font-medium">{averageRating}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-700 line-clamp-2">{bio}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {subjects.slice(0, 4).map((subject, index) => (
            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              {subject}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Starting from</p>
            <p className="text-lg font-semibold text-textColor">
              ${rate}<span className="text-sm font-normal text-gray-600">/hour</span>
            </p>
          </div>
          <Link href={`/tutors/${id}`}>
            <Button>View Profile</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
