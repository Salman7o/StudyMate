import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import SessionItem from "@/components/dashboard/SessionItem";
import { Session } from "@/lib/types";
import { CalendarDays, Search, BookOpen, XCircle } from "lucide-react";

export default function SessionsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login?redirect=/sessions");
    }
  }, [isAuthenticated, isLoading, setLocation]);
  
  const { data: sessions, isLoading: isLoadingSessions } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
    enabled: isAuthenticated,
  });
  
  if (isLoading || !isAuthenticated) {
    return null;
  }
  
  // Filter sessions based on search term and status
  const filteredSessions = sessions?.filter(session => {
    const matchesSearch = searchTerm === "" || 
      (session.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user?.userType === "student" && session.tutor?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user?.userType === "tutor" && session.student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || session.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];
  
  // Group sessions by status
  const pendingSessions = filteredSessions.filter(session => session.status === "pending");
  const confirmedSessions = filteredSessions.filter(session => session.status === "confirmed");
  const completedSessions = filteredSessions.filter(session => session.status === "completed");
  const cancelledSessions = filteredSessions.filter(session => session.status === "cancelled");
  
  return (
    <>
      <Helmet>
        <title>My Sessions | StudyBuddy</title>
        <meta 
          name="description" 
          content="Manage all your tutoring sessions in one place. Track upcoming sessions, review past sessions, and schedule new ones." 
        />
      </Helmet>
      
      <section className="py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">My Sessions</h1>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by subject or name"
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoadingSessions ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredSessions.length > 0 ? (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All ({filteredSessions.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingSessions.length})</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed ({confirmedSessions.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedSessions.length})</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled ({cancelledSessions.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="space-y-4">
                  {filteredSessions.map((session) => (
                    <SessionItem key={session.id} session={session} userType={user?.userType as 'student' | 'tutor'} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="pending">
                <div className="space-y-4">
                  {pendingSessions.map((session) => (
                    <SessionItem key={session.id} session={session} userType={user?.userType as 'student' | 'tutor'} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="confirmed">
                <div className="space-y-4">
                  {confirmedSessions.map((session) => (
                    <SessionItem key={session.id} session={session} userType={user?.userType as 'student' | 'tutor'} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="completed">
                <div className="space-y-4">
                  {completedSessions.map((session) => (
                    <SessionItem key={session.id} session={session} userType={user?.userType as 'student' | 'tutor'} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="cancelled">
                <div className="space-y-4">
                  {cancelledSessions.map((session) => (
                    <SessionItem key={session.id} session={session} userType={user?.userType as 'student' | 'tutor'} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center text-center space-y-6">
                {statusFilter !== "all" ? (
                  <>
                    {statusFilter === "pending" && <CalendarDays className="h-16 w-16 text-gray-400" />}
                    {statusFilter === "confirmed" && <CalendarDays className="h-16 w-16 text-gray-400" />}
                    {statusFilter === "completed" && <BookOpen className="h-16 w-16 text-gray-400" />}
                    {statusFilter === "cancelled" && <XCircle className="h-16 w-16 text-gray-400" />}
                    <div>
                      <h3 className="text-xl font-medium">No {statusFilter} sessions found</h3>
                      <p className="text-gray-500 mt-2 max-w-md mx-auto">
                        {searchTerm 
                          ? `No ${statusFilter} sessions match your search "${searchTerm}".` 
                          : `You don't have any ${statusFilter} tutoring sessions.`}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <CalendarDays className="h-16 w-16 text-gray-400" />
                    <div>
                      <h3 className="text-xl font-medium">No sessions found</h3>
                      <p className="text-gray-500 mt-2 max-w-md mx-auto">
                        {searchTerm 
                          ? `No sessions match your search "${searchTerm}".` 
                          : "You don't have any tutoring sessions yet."}
                      </p>
                    </div>
                    {user?.userType === "student" && (
                      <Button asChild>
                        <a href="/tutors">Find a Tutor</a>
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </>
  );
}
