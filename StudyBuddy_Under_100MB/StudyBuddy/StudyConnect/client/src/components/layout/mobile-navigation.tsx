import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";

export function MobileNavigation() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Don't render navigation if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Show correct finder link based on user role
  const isTutor = user && user.role === "tutor";
  const isStudent = user && user.role === "student";

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-700 py-2 px-4 z-10">
      <div className="flex justify-around">
        {isTutor ? (
          <>
            <Link 
              href="/tutor-dashboard" 
              className={`flex flex-col items-center ${location === "/tutor-dashboard" ? "text-red-600 dark:text-red-500" : "text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500"}`}
            >
              <i className="fas fa-th-large text-lg"></i>
              <span className="text-xs mt-1">Dashboard</span>
            </Link>
            <Link 
              href="/find-students" 
              className={`flex flex-col items-center ${location === "/find-students" ? "text-red-600 dark:text-red-500" : "text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500"}`}
            >
              <i className="fas fa-users text-lg"></i>
              <span className="text-xs mt-1">Students</span>
            </Link>
          </>
        ) : isStudent ? (
          <>
            <Link 
              href="/student-dashboard" 
              className={`flex flex-col items-center ${location === "/student-dashboard" ? "text-red-600 dark:text-red-500" : "text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500"}`}
            >
              <i className="fas fa-th-large text-lg"></i>
              <span className="text-xs mt-1">Dashboard</span>
            </Link>
            <Link 
              href="/find-tutors" 
              className={`flex flex-col items-center ${location === "/find-tutors" ? "text-red-600 dark:text-red-500" : "text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500"}`}
            >
              <i className="fas fa-chalkboard-teacher text-lg"></i>
              <span className="text-xs mt-1">Tutors</span>
            </Link>
          </>
        ) : null}
        <Link 
          href="/my-sessions" 
          className={`flex flex-col items-center ${location === "/my-sessions" ? "text-red-600 dark:text-red-500" : "text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500"}`}
        >
          <i className="fas fa-calendar-alt text-lg"></i>
          <span className="text-xs mt-1">Sessions</span>
        </Link>
        <Link 
          href="/messages" 
          className={`flex flex-col items-center ${location === "/messages" ? "text-red-600 dark:text-red-500" : "text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500"}`}
        >
          <i className="fas fa-comment-alt text-lg"></i>
          <span className="text-xs mt-1">Messages</span>
        </Link>
        <Link 
          href="/profile" 
          className={`flex flex-col items-center ${location === "/profile" ? "text-red-600 dark:text-red-500" : "text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500"}`}
        >
          <i className="fas fa-user text-lg"></i>
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
}