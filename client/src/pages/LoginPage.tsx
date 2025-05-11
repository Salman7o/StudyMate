import { useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/context/AuthContext";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Get redirect URL from query parameters
  const params = new URLSearchParams(location.split('?')[1]);
  const redirectUrl = params.get('redirect') || "/";
  
  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      setLocation(redirectUrl);
    }
  }, [isAuthenticated, redirectUrl, setLocation]);
  
  if (isAuthenticated) {
    return null;
  }
  
  return (
    <>
      <Helmet>
        <title>Sign In | StudyBuddy</title>
        <meta 
          name="description" 
          content="Sign in to your StudyBuddy account. Connect with tutors, manage your sessions, and improve your academic performance." 
        />
      </Helmet>
      
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sign in to your StudyBuddy account to continue your learning journey.
            </p>
          </div>
          
          <LoginForm redirectUrl={redirectUrl} />
        </div>
      </section>
    </>
  );
}
