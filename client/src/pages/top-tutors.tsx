import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Award, Star, MessageCircle, School, Clock } from "lucide-react";

export default function TopTutors() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setLocation] = useLocation();
  
  // Fetch top tutors
  const { data: topTutors = [], isLoading } = useQuery({
    queryKey: ['/api/tutors/top'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/tutors', { credentials: 'include' });
        const tutors = await response.json();
        
        // Sort by rating (in a real app this would be a server endpoint)
        return tutors
          .sort((a: any, b: any) => b.rating - a.rating);
      } catch (error) {
        console.error("Failed to fetch top tutors:", error);
        return [];
      }
    }
  });
  
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? topTutors.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === topTutors.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const viewProfile = (tutorId: number) => {
    console.log(`Navigating to tutor profile: /tutors/${tutorId}`);
    setLocation(`/tutors/${tutorId}`);
  };
  
  const bookSession = (tutorId: number) => {
    setLocation(`/tutors/${tutorId}?action=book`);
  };
  
  const messageUser = (tutorId: number) => {
    setLocation(`/messages?user=${tutorId}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!topTutors.length) {
    return (
      <Card className="text-center py-10">
        <CardContent>
          <div className="text-5xl mb-4 text-gray-300">
            <Award className="h-16 w-16 mx-auto opacity-40" />
          </div>
          <h3 className="text-xl font-medium mb-2">No Top Tutors Available</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            We don't have any rated tutors yet. Check back later once tutors have received ratings from students.
          </p>
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const currentTutor = topTutors[currentIndex];
  
  return (
    <div>
      <Card className="overflow-hidden bg-gradient-to-br from-black to-red-800 border-none">
        <CardHeader className="text-center border-b border-gray-800 pb-6">
          <CardTitle className="text-2xl font-bold text-white">STUDYMATE</CardTitle>
          <CardDescription className="text-gray-300">
            Our highest rated tutors based on student reviews
          </CardDescription>
        </CardHeader>
        
        <CardContent className="py-10 relative">
          {/* Previous button */}
          <button 
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors z-10"
            aria-label="Previous tutor"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          {/* Current tutor */}
          <div className="flex flex-col items-center justify-center text-center px-8">
            {currentTutor.user?.profileImage ? (
              <img 
                src={currentTutor.user.profileImage} 
                alt={currentTutor.user.fullName} 
                className="w-24 h-24 rounded-full mb-4 border-2 border-red-500"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-red-900 text-white flex items-center justify-center mb-4 border-2 border-red-500">
                <span className="text-xl font-bold">
                  {currentTutor.user?.fullName.split(" ").map((n: string) => n[0]).join("")}
                </span>
              </div>
            )}
            
            <h3 className="text-xl font-bold text-white mb-2">{currentTutor.user?.fullName}</h3>
            
            <div className="flex items-center justify-center mb-3 text-yellow-400">
              {Array.from({ length: 5 }).map((_, index) => {
                const rating = currentTutor.rating / 10;
                const isFilled = index < Math.floor(rating);
                const isHalf = !isFilled && index < Math.ceil(rating) && rating % 1 !== 0;
                
                return (
                  <span key={index} className="mx-0.5">
                    {isFilled ? (
                      <Star className="h-5 w-5 fill-current" />
                    ) : isHalf ? (
                      <span className="relative">
                        <Star className="h-5 w-5 text-gray-600" />
                        <span className="absolute top-0 left-0 overflow-hidden w-1/2">
                          <Star className="h-5 w-5 fill-current" />
                        </span>
                      </span>
                    ) : (
                      <Star className="h-5 w-5 text-gray-600" />
                    )}
                  </span>
                );
              })}
              <span className="ml-2 text-gray-300 text-sm">{(currentTutor.rating / 10).toFixed(1)} / 5</span>
            </div>
            
            <div className="text-gray-300 mb-6">
              {currentTutor.reviewCount} {currentTutor.reviewCount === 1 ? 'review' : 'reviews'}
            </div>

            <div className="bg-red-900/30 text-white p-4 rounded-md mb-4">
              <h4 className="text-lg font-medium mb-2">Availability</h4>
              <p className="text-sm text-red-200">
                {currentTutor.availability || "Contact tutor for availability"}
              </p>
            </div>
            
            <div className="bg-red-900/30 text-white p-4 rounded-md mb-6">
              <h4 className="text-lg font-medium mb-2">Expertise</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {currentTutor.subjects.map((subject: string, index: number) => (
                  <span 
                    key={index} 
                    className="bg-red-500/20 border border-red-500/40 text-red-200 rounded-full px-3 py-1 text-sm"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-6">
              <div className="bg-black/50 p-3 rounded-md text-center">
                <div className="text-gray-400 text-sm mb-1">Experience</div>
                <div className="text-white">{currentTutor.experience || 'Not specified'}</div>
              </div>
              <div className="bg-black/50 p-3 rounded-md text-center">
                <div className="text-gray-400 text-sm mb-1">Hourly Rate</div>
                <div className="text-white">Rs. {currentTutor.hourlyRate}/hr</div>
              </div>
            </div>
            
            <Button 
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900" 
              onClick={() => viewProfile(currentTutor.user.id)}
            >
              View Profile
            </Button>
          </div>
          
          {/* Next button */}
          <button 
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors z-10"
            aria-label="Next tutor"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </CardContent>
        
        {/* Dots navigation */}
        <div className="flex justify-center pb-6 space-x-2">
          {topTutors.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-red-500' : 'bg-gray-600'
              }`}
              aria-label={`Go to tutor ${index + 1}`}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}