import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import SessionItem from "./SessionItem";
import { Session, TutorProfile } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { CalendarDays, DollarSign, Users, Star, BarChart, BookOpen, MessageSquare, PenLine } from "lucide-react";

export default function TutorDashboard() {
  const { user } = useAuth();
  
  const { data: sessions, isLoading: isLoadingSessions } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });
  
  const { data: tutorProfile, isLoading: isLoadingProfile } = useQuery<TutorProfile>({
    queryKey: ["/api/tutors/profile"],
  });
  
  const isLoading = isLoadingSessions || isLoadingProfile;
  
  // Group sessions by status
  const upcomingSessions = sessions?.filter(session => 
    ["pending", "confirmed"].includes(session.status)
  ) || [];
  
  const completedSessions = sessions?.filter(session => 
    session.status === "completed"
  ) || [];
  
  const totalEarnings = completedSessions.reduce(
    (sum, session) => sum + parseFloat(session.totalAmount.toString()), 
    0
  );
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-52" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {completedSessions.reduce((students, session) => {
                  if (!students.includes(session.studentId)) {
                    students.push(session.studentId);
                  }
                  return students;
                }, [] as number[]).length}
              </h3>
            </div>
            <div className="h-12 w-12 bg-primary/10 flex items-center justify-center rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                ${totalEarnings.toFixed(2)}
              </h3>
            </div>
            <div className="h-12 w-12 bg-green-100 flex items-center justify-center rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Upcoming Sessions</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {upcomingSessions.length}
              </h3>
            </div>
            <div className="h-12 w-12 bg-blue-100 flex items-center justify-center rounded-full">
              <CalendarDays className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Rating</p>
              <div className="flex items-center mt-1">
                <h3 className="text-2xl font-bold text-gray-900 mr-1">
                  {tutorProfile?.averageRating}
                </h3>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm text-gray-500 ml-1">
                    ({tutorProfile?.reviewCount})
                  </span>
                </div>
              </div>
            </div>
            <div className="h-12 w-12 bg-yellow-100 flex items-center justify-center rounded-full">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tutor Profile Card */}
      {tutorProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Tutor Profile</span>
              <Badge variant="outline" className="font-normal">
                ${tutorProfile.rate}/hr
              </Badge>
            </CardTitle>
            <CardDescription>
              {tutorProfile.subjects.join(", ")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4 line-clamp-2">{tutorProfile.bio}</p>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Profile Completeness</span>
                  <span>80%</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Academic Level</p>
                  <p className="text-gray-700">{tutorProfile.academicLevel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Program</p>
                  <p className="text-gray-700">{tutorProfile.program}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/edit-profile">
                <div className="flex items-center">
                  <PenLine className="mr-2 h-4 w-4" />
                  Edit Profile
                </div>
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Sessions Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingSessions.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedSessions.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <SessionItem key={session.id} session={session} userType="tutor" />
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
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {completedSessions.length > 0 ? (
            <div className="space-y-4">
              {completedSessions.map((session) => (
                <SessionItem key={session.id} session={session} userType="tutor" />
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
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Useful shortcuts to help you manage</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
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
          <Link href="/dashboard/earnings">
            <Button variant="outline" className="flex items-center">
              <BarChart className="h-4 w-4 mr-2" /> Earnings
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
