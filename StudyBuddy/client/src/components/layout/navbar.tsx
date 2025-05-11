import { Link } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();

  // Student-specific links
  const isStudent = user && user.role === "student";
  const showFindTutors = isStudent;
  const showStudentDashboard = isStudent;
  
  // Tutor-specific links
  const isTutor = user && user.role === "tutor";
  const showTutorDashboard = isTutor;
  const showFindStudents = isTutor;

  return (
    <nav className="bg-white dark:bg-black shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-black dark:from-red-500 dark:to-gray-300 flex items-center">
            <i className="fas fa-graduation-cap mr-2 text-red-600 dark:text-red-500"></i>
            StudyMate
          </Link>
          {isAuthenticated && (
            <div className="hidden md:flex space-x-6 ml-10">
              {showStudentDashboard && (
                <Link href="/student-dashboard" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500">
                  Dashboard
                </Link>
              )}
              {showFindTutors && (
                <Link href="/find-tutors" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500">
                  Find Tutors
                </Link>
              )}
              {showTutorDashboard && (
                <Link href="/tutor-dashboard" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500">
                  Dashboard
                </Link>
              )}
              {showFindStudents && (
                <Link href="/find-students" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500">
                  Find Students
                </Link>
              )}
              <Link href="/my-sessions" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500">
                My Sessions
              </Link>
              <Link href="/messages" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500">
                Messages
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {theme === "dark" ? (
              <i className="fas fa-sun text-yellow-400"></i>
            ) : (
              <i className="fas fa-moon"></i>
            )}
          </button>
          {user ? (
            <div className="relative flex items-center space-x-4">
              <Link href="/profile" className="flex items-center space-x-2">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user.fullName.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                )}
                <span className="hidden md:inline-block font-medium">
                  {user.fullName}
                </span>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => logout()} 
                className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500"
              >
                <i className="fas fa-sign-out-alt mr-1"></i>
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
