import { useQuery } from "@tanstack/react-query";
import { SessionTabs } from "@/components/sessions/session-tabs";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function MySessions() {
  const { isAuthenticated, user } = useAuth();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['/api/sessions'],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="py-12 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 max-w-md mx-auto">
          <div className="text-5xl mb-4 text-primary">
            <i className="fas fa-lock"></i>
          </div>
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to view your sessions
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/login">
              <Button>Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">My Sessions</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {user?.role === 'student' 
            ? "Manage your tutoring sessions"
            : "Manage your tutoring schedule and student sessions"}
        </p>
      </div>

      <Card>
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading your sessions...</p>
          </div>
        ) : (
          <SessionTabs sessions={sessions} />
        )}
      </Card>
    </div>
  );
}
