import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-indigo-400 text-transparent bg-clip-text">
          StudyMate - Your Smart Study Partner
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Connect with qualified student tutors for personalized learning
          experiences tailored to your academic needs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-primary mb-4 text-4xl">
            <i className="fas fa-user-graduate"></i>
          </div>
          <h2 className="text-2xl font-bold mb-4">For Students</h2>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start">
              <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
              <span>Find expert tutors for any subject or course</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
              <span>Book sessions at times that work for you</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
              <span>Connect through our secure messaging system</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
              <span>Pay securely using JazzCash or EasyPaisa</span>
            </li>
          </ul>
          {isAuthenticated ? (
            user?.role === 'tutor' ? (
              <Link href="/find-students">
                <Button className="w-full">Find Students</Button>
              </Link>
            ) : (
              <Link href="/find-tutors">
                <Button className="w-full">Find Tutors Now</Button>
              </Link>
            )
          ) : (
            <Link href="/auth/register?tab=student">
              <Button className="w-full">Sign Up as Student</Button>
            </Link>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-primary mb-4 text-4xl">
            <i className="fas fa-chalkboard-teacher"></i>
          </div>
          <h2 className="text-2xl font-bold mb-4">For Tutors</h2>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start">
              <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
              <span>Create your profile and showcase your expertise</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
              <span>Set your own rates and availability</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
              <span>Manage tutoring sessions and bookings</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
              <span>Receive payments directly to your accounts</span>
            </li>
          </ul>
          {isAuthenticated ? (
            <Link href="/profile">
              <Button className="w-full">Manage Your Profile</Button>
            </Link>
          ) : (
            <Link href="/auth/register?tab=tutor">
              <Button className="w-full">Sign Up as Tutor</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center mb-12">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-search text-2xl text-primary"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">Search</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Browse and filter tutors based on subject, program, and rates
            </p>
          </div>
          <div>
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-calendar-check text-2xl text-primary"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">Book</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Schedule a session at your preferred time and date
            </p>
          </div>
          <div>
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-comment-dots text-2xl text-primary"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">Connect</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Message your tutor to discuss your learning needs
            </p>
          </div>
          <div>
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-graduation-cap text-2xl text-primary"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">Learn</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Attend your session and improve your academic performance
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Join the StudyMate community today and transform your learning experience!
        </p>
        {!isAuthenticated && (
          <div className="flex justify-center space-x-4">
            <Link href="/auth/register">
              <Button size="lg">Sign Up Now</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">
                Login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
