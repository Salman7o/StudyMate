import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from "@/contexts/auth-context";
import { Search, Calendar, MessageSquare, Trophy } from "lucide-react";

export default function StudentDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/auth/login");
      return;
    }
    if (user?.role !== "student") {
      setLocation("/tutor-dashboard");
    }
  }, [isAuthenticated, user, setLocation]);

  if (!isAuthenticated || user?.role !== "student") {
    return null;
  }

  return (
    <div className="py-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-indigo-400 text-transparent bg-clip-text">
          Welcome, {user.fullName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Find tutors, manage your sessions, and improve your academic performance
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Find Tutors */}
        <div 
          onClick={() => setLocation("/find-tutors")}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Find Tutors</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Browse tutors matched to your academic needs</p>
        </div>

        {/* My Sessions */}
        <div 
          onClick={() => setLocation("/my-sessions")}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">My Sessions</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">View and manage your tutoring sessions</p>
        </div>

        {/* Messages */}
        <div 
          onClick={() => setLocation("/messages")}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Messages</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Chat with your tutors</p>
        </div>

        {/* Top Tutors */}
        <div 
          onClick={() => setLocation("/top-tutors")}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Top Tutors</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Discover our highest-rated tutors</p>
        </div>
      </div>
    </div>
  );
}