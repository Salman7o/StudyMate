import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import SessionItem from "./SessionItem";
import { Session } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { CalendarDays, BookOpen, MessageSquare, Star } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });
  
  // Group sessions by status
  const upcomingSessions = sessions?.filter(session => 
    ["pending", "confirmed"].includes(session.status)
  ) || [];
  
  const completedSessions = sessions?.filter(session => 
    session.status === "completed"
  ) || [];
  
  const cancelledSessions = sessions?.filter(session => 
    session.status === "cancelled"
  ) || [];
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-52" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-9 w-64 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 font-inter">
        Welcome, {user?.firstName || user?.username}!
      </h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Upcoming Sessions</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {upcomingSessions.length}
              </h3>
            </div>
            <div className="h-12 w-12 bg-primary/10 flex items-center justify-center rounded-full">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed Sessions</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {completedSessions.length}
              </h3>
            </div>
            <div className="h-12 w-12 bg-green-100 flex items-center justify-center rounded-full">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                ${completedSessions.reduce((sum, session) => 
                  sum + parseFloat(session.totalAmount.toString()), 0
                ).toFixed(2)}
              </h3>
            </div>
            <div className="h-12 w-12 bg-blue-100 flex items-center justify-center rounded-full">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sessions Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingSessions.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedSessions.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledSessions.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <SessionItem key={session.id} session={session} userType="student" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-4">
                <CalendarDays className="h-12 w-12 text-gray-400" />
                <div>
                  <h3 className="text-lg font-medium">No upcoming sessions</h3>
                  <p className="text-gray-500 mt-1">
                    You don't have any pending or confirmed tutoring sessions.
                  </p>
                </div>
                <Link href="/tutors">
                  <Button>Find a Tutor</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {completedSessions.length > 0 ? (
            <div className="space-y-4">
              {completedSessions.map((session) => (
                <SessionItem key={session.id} session={session} userType="student" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-4">
                <BookOpen className="h-12 w-12 text-gray-400" />
                <div>
                  <h3 className="text-lg font-medium">No completed sessions</h3>
                  <p className="text-gray-500 mt-1">
                    You haven't completed any tutoring sessions yet.
                  </p>
                </div>
                <Link href="/tutors">
                  <Button>Find a Tutor</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="cancelled">
          {cancelledSessions.length > 0 ? (
            <div className="space-y-4">
              {cancelledSessions.map((session) => (
                <SessionItem key={session.id} session={session} userType="student" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-12 w-12 text-gray-400 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
                    <line x1="18" x2="12" y1="9" y2="15" />
                    <line x1="12" x2="18" y1="9" y2="15" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium">No cancelled sessions</h3>
                  <p className="text-gray-500 mt-1">
                    You don't have any cancelled tutoring sessions.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Useful shortcuts to help you navigate</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Link href="/tutors">
            <Button variant="outline" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" /> Find Tutors
            </Button>
          </Link>
          <Link href="/messages">
            <Button variant="outline" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" /> Messages
            </Button>
          </Link>
          <Link href="/sessions">
            <Button variant="outline" className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-2" /> All Sessions
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
