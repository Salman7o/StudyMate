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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Top-Rated Tutors</CardTitle>
          <CardDescription>
            Browse our highest-rated tutors based on student reviews and ratings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 mb-4">
            <p className="text-sm text-muted-foreground">
              Find the best tutors for your subjects and learning needs. Our top tutors have consistently received excellent feedback from students.
            </p>
          </div>
          
          <div className="relative mt-8 overflow-hidden">
            {/* Previous button */}
            <button 
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors z-10"
              aria-label="Previous tutor"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            {/* Current tutor */}
            <div className="border rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 p-6 hover:border-primary transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-black text-white flex items-center justify-center mr-3">
                      <span className="text-lg font-medium">
                        {currentTutor.user?.fullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">
                        {currentTutor.user?.fullName}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <School className="h-4 w-4" />
                        <span>{currentTutor.user?.program || "University Program"}</span>
                      </div>
                      <div className="mt-1 flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= (currentTutor.rating / 10)
                                ? "text-yellow-500 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {(currentTutor.rating / 10).toFixed(1)} ({currentTutor.reviewCount} reviews)
                        </span>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-green-600 dark:text-green-500">
                          Rate: Rs. {currentTutor.hourlyRate.toLocaleString()}/hour
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2 text-primary">
                        <Award className="h-5 w-5" />
                        Top Tutor Profile
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Experience:
                            </span>
                            <div className="font-medium">
                              {currentTutor.experience || "Not specified"}
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Rating:
                            </span>
                            <div className="font-medium text-yellow-500">
                              {(currentTutor.rating / 10).toFixed(1)} / 5 ({currentTutor.reviewCount} reviews)
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Hourly Rate:
                            </span>
                            <div className="font-medium text-green-600 dark:text-green-500">
                              Rs. {currentTutor.hourlyRate.toLocaleString()}/hour
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Status:
                            </span>
                            <div className="font-medium">
                              {currentTutor.isAvailableNow ? (
                                <span className="flex items-center text-green-600">
                                  <span className="h-2 w-2 rounded-full bg-green-600 mr-1"></span>
                                  Available Now
                                </span>
                              ) : (
                                <span className="flex items-center text-amber-600">
                                  <span className="h-2 w-2 rounded-full bg-amber-600 mr-1"></span>
                                  Unavailable
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2 text-primary">
                          Subjects
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {currentTutor.subjects?.map((subject: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="px-2 py-1"
                            >
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2 text-primary">
                          <Clock className="h-5 w-5" />
                          Availability
                        </h4>
                        <p className="text-sm">
                          {currentTutor.availability || "Check with tutor for availability."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-start gap-2">
                    <Button
                      size="sm"
                      className="flex items-center bg-gradient-to-r from-red-500 to-black hover:from-red-600 hover:to-gray-900"
                      onClick={() => messageUser(currentTutor.user.id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span>Message</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => viewProfile(currentTutor.user.id)}
                    >
                      View Profile
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => bookSession(currentTutor.user.id)}
                    >
                      Book Session
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Next button */}
            <button 
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors z-10"
              aria-label="Next tutor"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
          
          {/* Dots navigation */}
          <div className="flex justify-center py-4 space-x-2">
            {topTutors.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to tutor ${index + 1}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}