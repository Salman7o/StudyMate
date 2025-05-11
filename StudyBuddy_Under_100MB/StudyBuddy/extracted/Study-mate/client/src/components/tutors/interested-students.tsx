import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface Student {
  id: number;
  fullName: string;
  program: string;
  semester: string;
  university: string;
  profileImage?: string;
  bio?: string;
  subject: string;
  sessionId?: number;
  createdAt?: string;
}

export function InterestedStudents({ tutorSubjects }: { tutorSubjects: string[] }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);

  // Query for pending sessions where tutor teaches subjects the students are interested in
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['/api/sessions/pending-by-tutor', user?.id],
    enabled: !!user?.id && user?.role === 'tutor',
    queryFn: async () => {
      try {
        const response = await fetch(`/api/sessions/pending?tutorId=${user?.id}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch pending sessions');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching pending sessions:', error);
        return [];
      }
    },
  });

  // Query for students interested in the tutor's subjects (based on search queries)
  const { data: interestedStudents, isLoading: loadingStudents } = useQuery({
    queryKey: ['/api/students/interested', tutorSubjects],
    enabled: !!tutorSubjects?.length && user?.role === 'tutor',
    queryFn: async () => {
      try {
        // In a real implementation, this would be an API endpoint that returns students
        // who have searched for or shown interest in the tutor's subjects
        // For now, simulate with a mock response
        return []; // Server would return actual student data
      } catch (error) {
        console.error('Error fetching interested students:', error);
        return [];
      }
    },
  });

  // Process and combine data
  useEffect(() => {
    const processedStudents: Student[] = [];
    
    // Add students from pending sessions
    if (sessions?.length) {
      sessions.forEach((session: any) => {
        if (session.studentId && session.subject && tutorSubjects.includes(session.subject)) {
          processedStudents.push({
            id: session.studentId,
            fullName: session.student?.fullName || 'Unknown Student',
            program: session.student?.program || 'N/A',
            semester: session.student?.semester || 'N/A',
            university: session.student?.university || 'University',
            profileImage: session.student?.profileImage,
            subject: session.subject,
            sessionId: session.id,
            createdAt: session.createdAt,
          });
        }
      });
    }

    // Add interested students who haven't booked yet
    if (interestedStudents?.length) {
      interestedStudents.forEach((student: any) => {
        // Check if student is not already in the list (from sessions)
        if (!processedStudents.some(s => s.id === student.id)) {
          processedStudents.push({
            id: student.id,
            fullName: student.fullName,
            program: student.program || 'N/A',
            semester: student.semester || 'N/A',
            university: student.university || 'University',
            profileImage: student.profileImage,
            bio: student.bio,
            subject: student.interestedSubject,
          });
        }
      });
    }

    setStudents(processedStudents);
  }, [sessions, interestedStudents, tutorSubjects]);

  const startChat = async (studentId: number) => {
    try {
      // Create or get existing conversation
      const response = await apiRequest("POST", "/api/conversations", {
        participantOneId: user?.id,
        participantTwoId: studentId,
      });
      
      const conversationData = await response.json();
      
      toast({
        title: "Chat initiated",
        description: "You can now message this student",
      });
      
      // Redirect to messages
      window.location.href = `/messages?conversationId=${conversationData.id}`;
    } catch (error) {
      console.error("Failed to start chat:", error);
      toast({
        title: "Error",
        description: "Failed to start chat with this student",
        variant: "destructive",
      });
    }
  };

  if (isLoading || loadingStudents) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2">Loading students...</span>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Interested Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-5xl mb-4 text-gray-300">
              <i className="fas fa-user-graduate"></i>
            </div>
            <h3 className="text-lg font-medium mb-2">No Students Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              No students are currently interested in your subjects. Make sure your profile is complete and your subjects are up to date.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Students Interested in Your Subjects</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {students.map((student) => (
            <div key={`${student.id}-${student.subject}`} className="border rounded-lg p-4 relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  {student.profileImage ? (
                    <img
                      src={student.profileImage}
                      alt={student.fullName}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                      <span className="text-md font-medium">
                        {student.fullName.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{student.fullName}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {student.program} | {getOrdinalSuffix(student.semester)} Semester | {student.university}
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                        {student.subject}
                      </Badge>
                      {student.sessionId && (
                        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                          Session Requested
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center"
                  onClick={() => startChat(student.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  <span>Message</span>
                </Button>
              </div>
              {student.bio && (
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  {student.bio.length > 150 ? `${student.bio.substring(0, 150)}...` : student.bio}
                </div>
              )}
              {student.createdAt && (
                <div className="mt-2 text-xs text-gray-500">
                  Requested: {format(new Date(student.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getOrdinalSuffix(semester: string): string {
  const num = parseInt(semester);
  if (isNaN(num)) return semester;
  
  if (num % 10 === 1 && num % 100 !== 11) {
    return `${num}st`;
  } else if (num % 10 === 2 && num % 100 !== 12) {
    return `${num}nd`;
  } else if (num % 10 === 3 && num % 100 !== 13) {
    return `${num}rd`;
  } else {
    return `${num}th`;
  }
}