import { useLocation } from "wouter";
import { useChatState } from "@/lib/utils/chat";
import { TutorProfile, Subject } from "@shared/schema";

interface TutorCardProps {
  id: number;
  name: string;
  profileImageUrl?: string;
  profile: TutorProfile;
  subjects: Subject[];
}

export default function TutorCard({
  id,
  name,
  profileImageUrl,
  profile,
  subjects,
}: TutorCardProps) {
  const [_, setLocation] = useLocation();
  const { openChat } = useChatState();

  const getSubjectsText = (subjects: Subject[]) => {
    if (!subjects.length) return "No subjects specified";
    return subjects.map(s => s.name).join(", ");
  };

  const getAvailabilityText = (profile: TutorProfile) => {
    if (profile.availableWeekdays && profile.availableWeekends) {
      return "Weekdays & Weekends";
    } else if (profile.availableWeekdays) {
      return "Weekdays Only";
    } else if (profile.availableWeekends) {
      return "Weekends Only";
    }
    return "Not specified";
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-16 w-16">
            <img 
              className="h-16 w-16 rounded-full" 
              src={profileImageUrl || "https://via.placeholder.com/64?text=T"} 
              alt={`${name}'s profile`} 
            />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{name}</h3>
            <div className="text-sm text-gray-500">{profile.specialization}</div>
            <div className="flex items-center mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <i 
                  key={i} 
                  className={`fas fa-star text-yellow-400 text-xs ${
                    i < Math.floor(profile.rating) 
                      ? '' 
                      : i < profile.rating 
                        ? 'fa-star-half-alt' 
                        : 'far fa-star'
                  }`}
                ></i>
              ))}
              <span className="ml-1 text-sm text-gray-500">{profile.rating.toFixed(1)}</span>
              <span className="mx-1 text-gray-300">|</span>
              <span className="text-sm text-gray-500">{profile.sessionsCompleted} sessions</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <div className="text-gray-500">Subjects:</div>
            <div className="text-gray-900">{getSubjectsText(subjects)}</div>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <div className="text-gray-500">Rate:</div>
            <div className="text-gray-900">${profile.hourlyRate}/hour</div>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <div className="text-gray-500">Availability:</div>
            <div className="text-gray-900">{getAvailabilityText(profile)}</div>
          </div>
        </div>
        
        <div className="mt-5 flex space-x-3">
          <button 
            type="button" 
            className="flex-1 bg-primary text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={() => setLocation(`/tutor/${id}`)}
          >
            View Profile
          </button>
          <button 
            type="button" 
            className="flex-1 bg-white text-primary-700 py-2 px-4 border border-primary-300 rounded-md shadow-sm text-sm font-medium hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={() => setLocation(`/tutor/${id}?book=true`)}
          >
            Book Session
          </button>
        </div>
      </div>
    </div>
  );
}
