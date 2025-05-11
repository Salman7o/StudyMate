import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle, 
  Clock, 
  School, 
  BookOpen,
  User,
  BookOpenCheck,
  GraduationCap,
  Calendar
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
  email?: string;
}

export default function StudentProfile() {
  const { id } = useParams();
  const studentId = id ? parseInt(id) : undefined;
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: student, isLoading } = useQuery({
    queryKey: [`/api/students/${studentId}`],
    enabled: !!studentId,
    queryFn: async () => {
      try {
        const response = await fetch(`/api/students/${studentId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch student profile");
        }

        return response.json();
      } catch (error) {
        console.error("Error fetching student profile:", error);
        throw new Error("Failed to fetch student profile");
      }
    },
  });

  const startChat = async () => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Student Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The student profile you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button onClick={() => setLocation("/find-students")}>
          Back to Student Search
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-red-500 to-black text-white flex items-center justify-center">
                {student.profileImage ? (
                  <img
                    src={student.profileImage}
                    alt={student.fullName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-3xl font-medium">
                    {student.fullName.split(" ").map((n: string, i: number) => n[0]).join("")}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-2xl font-bold mb-2">{student.fullName}</h1>
              <div className="flex items-center justify-center md:justify-start text-muted-foreground mb-2">
                <School className="h-4 w-4 mr-2" />
                <span>{student.university}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start mb-3">
                <GraduationCap className="h-4 w-4 mr-2 text-primary" />
                <span>
                  {student.program}, {student.semester}th Semester
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 my-3">
                {student.subjects?.map((subject: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="px-2 py-1"
                  >
                    {subject}
                  </Badge>
                ))}
              </div>
              
              <div className="mt-4 flex justify-center md:justify-start space-x-3">
                <Button
                  className="bg-gradient-to-r from-red-500 to-black hover:from-red-600 hover:to-gray-900"
                  onClick={startChat}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message Student
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpenCheck className="mr-2 h-5 w-5 text-primary" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Program</h3>
                <p>{student.program}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Semester</h3>
                <p>{student.semester}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">University</h3>
                <p>{student.university}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Availability & Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Availability</h3>
                <p>{student.availability || "Not specified"}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Budget</h3>
                <p className="text-green-600 font-medium">Rs. {student.hourlyRate?.toLocaleString() || "Not specified"} /hour</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {student.bio && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-primary" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{student.bio}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}