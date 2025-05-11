import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Search, Clock, School, BookOpen } from "lucide-react";
import { useLocation } from "wouter";

interface Student {
  id: number;
  fullName: string;
  program: string;
  semester: string;
  university: string;
  subjects: string[];
  availability: string;
  hourlyRate: number;
  profileImage?: string;
  bio?: string;
}

export default function FindStudents() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["/api/students"],
    enabled: !!user?.id && user?.role === "tutor",
    queryFn: async () => {
      try {
        const response = await fetch("/api/students", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }

        return response.json();
      } catch (error) {
        console.error("Error fetching students:", error);
        throw new Error("Failed to fetch students");
      }
    },
  });

  const startChat = async (studentId: number) => {
    try {
      // Create or get existing conversation
      const res = await fetch("/api/conversations", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantOneId: user?.id,
          participantTwoId: studentId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create conversation");
      }

      const conversation = await res.json();
      
      // Redirect to messages page with the conversation open
      setLocation(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };
  
  const viewProfile = (studentId: number) => {
    setLocation(`/students/${studentId}`);
  };
  
  const bookSession = (studentId: number) => {
    // We'll just navigate to the student profile page
    // The booking functionality will be handled by the modal there
    setLocation(`/students/${studentId}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Students</CardTitle>
          <CardDescription>
            Students are automatically matched based on your subjects,
            availability, and price range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Showing students who match your teaching subjects, availability,
              and pricing preferences.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Matched Students</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading..."
              : `Found ${students.length} students matching your criteria`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No students found</h3>
              <p className="text-sm text-muted-foreground">
                No students currently match your teaching criteria.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {students.map((student: Student) => (
                <div
                  key={student.id}
                  className="border rounded-lg p-6 hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-black text-white flex items-center justify-center mr-3">
                          <span className="text-md font-medium">
                            {student.fullName
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">
                            {student.fullName}
                          </h3>
                          <div className="flex items-center text-sm text-muted-foreground gap-2">
                            <School className="h-4 w-4" />
                            <span>{student.university}</span>
                          </div>
                          <div className="mt-2 text-sm">
                            <span className="font-medium text-green-600 dark:text-green-500">
                              Rate: Rs.{" "}
                              {student.hourlyRate !== undefined &&
                              student.hourlyRate !== null
                                ? student.hourlyRate.toLocaleString()
                                : "Not specified"}
                              /hour
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2 text-primary">
                            <BookOpen className="h-5 w-5" />
                            Academic Profile
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">
                                  Program:
                                </span>
                                <div className="font-medium">
                                  {student.program}
                                </div>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">
                                  Semester:
                                </span>
                                <div className="font-medium">
                                  {student.semester} Semester
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">
                                  University:
                                </span>
                                <div className="font-medium">
                                  {student.university}
                                </div>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">
                                  Hourly Rate:
                                </span>
                                <div className="font-medium text-green-600 dark:text-green-500">
                                  Rs.{" "}
                                  {student.hourlyRate !== undefined &&
                                  student.hourlyRate !== null
                                    ? student.hourlyRate.toLocaleString()
                                    : "Not specified"}
                                  /hour
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                            <h4 className="font-medium mb-3 flex items-center gap-2 text-primary">
                              <BookOpen className="h-5 w-5" />
                              Subjects
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {student.subjects?.map((subject, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="px-2 py-1"
                                >
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                            <h4 className="font-medium mb-3 flex items-center gap-2 text-primary">
                              <Clock className="h-5 w-5" />
                              Availability
                            </h4>
                            <p className="text-sm">
                              {student.availability || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-start gap-2">
                        <Button
                          size="sm"
                          className="flex items-center bg-gradient-to-r from-red-500 to-black hover:from-red-600 hover:to-gray-900"
                          onClick={() => startChat(student.id)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          <span>Message</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => viewProfile(student.id)}
                        >
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => bookSession(student.id)}
                        >
                          Book Session
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
