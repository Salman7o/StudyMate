import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { TutorCard } from "@/components/tutors/tutor-card";
import { Button } from "@/components/ui/button";

export default function FindTutors() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect if not authenticated or if user is a tutor
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/auth/login");
      return;
    }
    
    if (user?.role === "tutor") {
      setLocation("/profile");
      return;
    }
  }, [isAuthenticated, user, setLocation]);

  const [visibleTutors, setVisibleTutors] = useState(6);

  // Fetch tutors based on the student's profile data (subjects, program, semester)
  const { data: tutors = [], isLoading } = useQuery({
    queryKey: ['/api/tutors'],
    queryFn: async () => {
      const response = await fetch('/api/tutors', {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch tutors");
      }
      return response.json();
    },
    enabled: isAuthenticated && user?.role === "student", // Only run query if authenticated and student
  });

  const loadMore = () => {
    setVisibleTutors(prevCount => prevCount + 6);
  };

  // If not authenticated or user is a tutor, don't render the page content
  if (!isAuthenticated || user?.role === "tutor") {
    return null;
  }

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Your Matched Tutors</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Based on your profile, we've matched you with the following tutors for your subjects and needs.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading your matched tutors...</p>
        </div>
      ) : tutors.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-5xl mb-4">
            <i className="fas fa-search text-gray-300 dark:text-gray-600"></i>
          </div>
          <h3 className="text-xl font-medium mb-2">No matching tutors found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            We couldn't find tutors matching your profile. Please update your subjects or preferences in your profile.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {tutors.slice(0, visibleTutors).map((tutor: any) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>

          {visibleTutors < tutors.length && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={loadMore}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Load More Tutors
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
