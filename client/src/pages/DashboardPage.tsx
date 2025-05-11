import { useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/context/AuthContext";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import TutorDashboard from "@/components/dashboard/TutorDashboard";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login?redirect=/dashboard");
    }
  }, [isAuthenticated, isLoading, setLocation]);
  
  if (isLoading) {
    return (
      <div className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-40 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <>
      <Helmet>
        <title>Dashboard | StudyBuddy</title>
        <meta 
          name="description" 
          content="Manage your tutoring sessions, track your progress, and connect with students/tutors in your personalized dashboard." 
        />
      </Helmet>
      
      <section className="py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {user?.userType === "tutor" ? (
            <TutorDashboard />
          ) : (
            <StudentDashboard />
          )}
        </div>
      </section>
    </>
  );
}
