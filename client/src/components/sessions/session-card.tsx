import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import { ReviewModal } from "@/components/sessions/review-modal";

interface SessionCardProps {
  session: {
    id: number;
    tutorId: number;
    studentId: number;
    subject: string;
    date: string;
    startTime: string;
    duration: number;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    tutor?: {
      id: number;
      fullName: string;
      profileImage?: string;
    };
    student?: {
      id: number;
      fullName: string;
      profileImage?: string;
    };
  };
}

export function SessionCard({ session }: SessionCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  const formattedDate = new Date(session.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  // Convert 24-hour format to 12-hour format
  const formattedStartTime = new Date(`2000-01-01T${session.startTime}`).toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  );
  
  // Calculate end time
  const startDate = new Date(`2000-01-01T${session.startTime}`);
  startDate.setMinutes(startDate.getMinutes() + session.duration);
  const formattedEndTime = startDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const isUserTutor = user?.id === session.tutorId;
  
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "outline" as const;
      case "confirmed":
        return "secondary" as const;
      case "completed":
        return "secondary" as const;
      case "cancelled":
        return "destructive" as const;
      default:
        return "default" as const;
    }
  };

  const handleUpdateStatus = async (newStatus: "confirmed" | "completed" | "cancelled") => {
    try {
      setIsLoading(true);
      await apiRequest("PUT", `/api/sessions/${session.id}/status`, { status: newStatus });
      
      toast({
        title: "Session updated",
        description: `Session has been ${newStatus} successfully`,
      });
      
      // Refresh sessions data
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    } catch (error) {
      console.error("Failed to update session:", error);
      toast({
        title: "Update failed",
        description: "Failed to update session status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActionButtons = () => {
    if (isUserTutor) {
      // Tutor actions
      switch (session.status) {
        case "pending":
          return (
            <>
              <Button 
                size="sm" 
                onClick={() => handleUpdateStatus("confirmed")}
                disabled={isLoading}
              >
                Confirm
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleUpdateStatus("cancelled")}
                disabled={isLoading}
              >
                Decline
              </Button>
            </>
          );
        case "confirmed":
          return (
            <>
              <Button 
                size="sm" 
                onClick={() => handleUpdateStatus("completed")}
                disabled={isLoading}
              >
                Mark Complete
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleUpdateStatus("cancelled")}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </>
          );
        case "completed":
          return (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowReviewModal(true)}
            >
              Provide Feedback
            </Button>
          );
        default:
          return null;
      }
    } else {
      // Student actions
      switch (session.status) {
        case "pending":
          return (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleUpdateStatus("cancelled")}
              disabled={isLoading}
            >
              Cancel Request
            </Button>
          );
        case "confirmed":
          return (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleUpdateStatus("cancelled")}
              disabled={isLoading}
            >
              Cancel
            </Button>
          );
        case "completed":
          return (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowReviewModal(true)}
            >
              Leave Review
            </Button>
          );
        default:
          return null;
      }
    }
  };

  const displayName = isUserTutor 
    ? `Session with ${session.student?.fullName || 'Student'}` 
    : `${session.subject} with ${session.tutor?.fullName || 'Tutor'}`;

  const profileImage = isUserTutor 
    ? session.student?.profileImage 
    : session.tutor?.profileImage;

  const generateInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("");
  };

  return (
    <>
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 last:mb-0 last:border-0">
        <div className="md:flex justify-between items-start">
          <div className="flex mb-4 md:mb-0">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary text-white flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {isUserTutor 
                      ? (session.student?.fullName && generateInitials(session.student.fullName)) || "S" 
                      : (session.tutor?.fullName && generateInitials(session.tutor.fullName)) || "T"}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-4">
              <h3 className="font-medium">{displayName}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {formattedDate}, {formattedStartTime} - {formattedEndTime}
              </p>
              <div className="flex items-center mt-2">
                <Badge variant={getBadgeVariant(session.status)}>
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </Badge>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  Session ID: #{session.id}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            {getActionButtons()}
          </div>
        </div>
      </div>

      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          session={session}
          isStudent={!isUserTutor}
        />
      )}
    </>
  );
}
