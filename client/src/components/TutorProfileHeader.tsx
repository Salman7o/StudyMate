import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/ui/star-rating";
import { MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { TutorWithProfile } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

interface TutorProfileHeaderProps {
  tutor: TutorWithProfile;
  onBookSession: () => void;
}

const TutorProfileHeader = ({ tutor, onBookSession }: TutorProfileHeaderProps) => {
  const { user } = useAuth();
  
  const isOwnProfile = user?.id === tutor.id;
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={tutor.profileImage} alt={tutor.fullName} />
          <AvatarFallback className="text-2xl">{tutor.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground font-inter">{tutor.fullName}</h1>
          <p className="text-gray-600 mb-2">{tutor.profile.university} - {tutor.profile.degree}</p>
          
          <div className="flex items-center mb-2">
            <StarRating rating={tutor.avgRating} size="sm" className="mr-2" />
            <span className="text-sm text-gray-600">{tutor.avgRating.toFixed(1)} ({tutor.reviewCount} reviews)</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {tutor.subjects.map(subject => (
              <span key={subject.id} className="bg-blue-100 text-primary px-2 py-1 rounded-md text-xs font-medium">
                {subject.name}
              </span>
            ))}
          </div>
        </div>
        
        <div className="w-full md:w-auto flex flex-col space-y-2">
          <p className="text-2xl font-bold text-foreground text-center md:text-right">
            ${tutor.profile.hourlyRate.toFixed(2)}<span className="text-base font-normal">/hour</span>
          </p>
          
          {!isOwnProfile && (
            <>
              <Button className="btn-primary w-full" onClick={onBookSession}>
                Book Session
              </Button>
              
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/messages/${tutor.id}`}>
                  <MessageSquare className="h-4 w-4 mr-2" /> Message
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-2 font-inter">About Me</h2>
        <p className="text-gray-600">{tutor.profile.bio}</p>
      </div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Experience</h3>
          <p className="font-medium">{tutor.profile.yearsOfExperience} years</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Subject Expertise</h3>
          <p className="font-medium">{tutor.subjects.length} subjects</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Verification</h3>
          <p className="font-medium">{tutor.profile.isVerified ? "Verified" : "Pending"}</p>
        </div>
      </div>
    </div>
  );
};

export default TutorProfileHeader;
