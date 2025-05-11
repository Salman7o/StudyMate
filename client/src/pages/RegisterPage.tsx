import { useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/context/AuthContext";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Get user type from URL query parameters
  const params = new URLSearchParams(location.split('?')[1]);
  const userType = params.get('type') === 'tutor' ? 'tutor' : 'student';
  
  // Redirect authenticated users to home
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);
  
  if (isAuthenticated) {
    return null;
  }
  
  return (
    <>
      <Helmet>
        <title>Sign Up | StudyBuddy</title>
        <meta 
          name="description" 
          content="Create your StudyBuddy account. Join as a student to find tutors or sign up as a tutor to share your knowledge." 
        />
      </Helmet>
      
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your StudyBuddy Account</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join our community of students and tutors. Find help with your studies or share your knowledge.
            </p>
          </div>
          
          <RegisterForm defaultUserType={userType as "student" | "tutor"} />
        </div>
      </section>
    </>
  );
}
