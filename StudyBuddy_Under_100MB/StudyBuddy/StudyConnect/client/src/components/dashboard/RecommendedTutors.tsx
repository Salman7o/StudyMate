import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { TutorProfile, Subject, User } from "@shared/schema";

interface TutorWithDetails {
  id: number;
  name: string;
  profileImageUrl: string;
  profile: TutorProfile;
  subjects: Subject[];
}

export default function RecommendedTutors() {
  const [_, setLocation] = useLocation();

  const { data: tutors, isLoading } = useQuery<TutorWithDetails[]>({
    queryKey: ["/api/tutors"],
  });

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-center">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="ml-4">
                    <Skeleton className="h-5 w-36 mb-2" />
                    <Skeleton className="h-4 w-28 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                
                <div className="mt-5 flex space-x-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Sort tutors by rating and limit to top 3
  const recommendedTutors = [...(tutors || [])]
    .sort((a, b) => (b.profile?.rating || 0) - (a.profile?.rating || 0))
    .slice(0, 3);

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
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Recommended Tutors</h2>
        <a 
          href="/find-tutors" 
          onClick={(e) => { 
            e.preventDefault(); 
            setLocation("/find-tutors"); 
          }}
          className="text-primary hover:text-primary-600 text-sm"
        >
          View All
        </a>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recommendedTutors.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No tutors available at the moment</p>
          </div>
        ) : (
          recommendedTutors.map((tutor) => (
            <div key={tutor.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-16 w-16">
                    <img 
                      className="h-16 w-16 rounded-full" 
                      src={tutor.profileImageUrl || "https://via.placeholder.com/64?text=T"} 
                      alt={`${tutor.name}'s profile`} 
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{tutor.name}</h3>
                    <div className="text-sm text-gray-500">{tutor.profile.specialization}</div>
                    <div className="flex items-center mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i 
                          key={i} 
                          className={`fas fa-star text-yellow-400 text-xs ${
                            i < Math.floor(tutor.profile.rating) 
                              ? '' 
                              : i < tutor.profile.rating 
                                ? 'fa-star-half-alt' 
                                : 'far fa-star'
                          }`}
                        ></i>
                      ))}
                      <span className="ml-1 text-sm text-gray-500">{tutor.profile.rating.toFixed(1)}</span>
                      <span className="mx-1 text-gray-300">|</span>
                      <span className="text-sm text-gray-500">{tutor.profile.sessionsCompleted} sessions</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm">
                    <div className="text-gray-500">Subjects:</div>
                    <div className="text-gray-900">{getSubjectsText(tutor.subjects)}</div>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <div className="text-gray-500">Rate:</div>
                    <div className="text-gray-900">${tutor.profile.hourlyRate}/hour</div>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <div className="text-gray-500">Availability:</div>
                    <div className="text-gray-900">{getAvailabilityText(tutor.profile)}</div>
                  </div>
                </div>
                
                <div className="mt-5 flex space-x-3">
                  <button 
                    type="button" 
                    className="flex-1 bg-primary text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    onClick={() => setLocation(`/tutor/${tutor.id}`)}
                  >
                    View Profile
                  </button>
                  <button 
                    type="button" 
                    className="flex-1 bg-white text-primary-700 py-2 px-4 border border-primary-300 rounded-md shadow-sm text-sm font-medium hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    onClick={() => setLocation(`/tutor/${tutor.id}?book=true`)}
                  >
                    Book Session
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
