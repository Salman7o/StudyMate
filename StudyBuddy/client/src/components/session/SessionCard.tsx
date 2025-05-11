import { useState } from "react";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { ApiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@shared/schema";
import { useChatState } from "@/lib/utils/chat";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SessionCardProps {
  session: Session & {
    tutor?: {
      id: number;
      name: string;
      profileImageUrl?: string;
    };
    student?: {
      id: number;
      name: string;
      profileImageUrl?: string;
    };
  };
  userRole: "student" | "tutor";
  showActions?: boolean;
  onFeedback?: (sessionId: number) => void;
  onPayment?: (sessionId: number) => void;
}

export default function SessionCard({
  session,
  userRole,
  showActions = true,
  onFeedback,
  onPayment,
}: SessionCardProps) {
  const { toast } = useToast();
  const { openChat } = useChatState();
  const [isUpdating, setIsUpdating] = useState(false);

  const otherPerson = userRole === "student" ? session.tutor : session.student;

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/sessions/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/student"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/tutor"] });
      toast({
        title: "Session updated",
        description: "Session status has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update session",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  const handleStatusChange = (status: string) => {
    setIsUpdating(true);
    updateStatusMutation.mutate({ id: session.id, status });
  };

  const formatSessionTime = (startTime: Date, endTime: Date) => {
    return `${format(new Date(startTime), "h:mm a")} - ${format(new Date(endTime), "h:mm a")}`;
  };

  const formatSessionDate = (date: Date) => {
    return format(new Date(date), "EEEE, MMMM d, yyyy");
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-secondary-100 text-secondary-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default: // pending
        return "bg-gray-100 text-gray-800";
    }
  };

  const isPast = new Date(session.endTime) < new Date();
  const canCancel = ["pending", "confirmed"].includes(session.status) && !isPast;
  const canComplete = session.status === "confirmed" && isPast;
  const needsPayment = session.status === "completed" && session.paymentStatus === "unpaid" && userRole === "student";

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img
              className="h-12 w-12 rounded-full"
              src={otherPerson?.profileImageUrl || "https://via.placeholder.com/48?text=U"}
              alt={`${otherPerson?.name || "User"}'s profile`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userRole === "student" ? "Tutor: " : "Student: "}
              {otherPerson?.name || "Anonymous"}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {session.subject}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {formatSessionDate(new Date(session.startTime))}
            </div>
            <div className="text-sm text-gray-500">
              {formatSessionTime(new Date(session.startTime), new Date(session.endTime))}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          {session.notes && (
            <div className="bg-gray-50 p-3 rounded-md text-sm mb-3">
              <span className="font-medium">Notes: </span>
              {session.notes}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(session.status)}`}>
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </span>
              {session.paymentStatus === "paid" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                  Paid
                </span>
              )}
            </div>
            
            {showActions && (
              <div className="flex space-x-2">
                {canCancel && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Session</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel this session? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>No, keep it</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleStatusChange("cancelled")}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, cancel
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                
                {userRole === "tutor" && session.status === "pending" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-secondary-600 border-secondary-200 hover:bg-secondary-50"
                    onClick={() => handleStatusChange("confirmed")}
                    disabled={isUpdating}
                  >
                    Confirm
                  </Button>
                )}
                
                {canComplete && userRole === "student" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => handleStatusChange("completed")}
                    disabled={isUpdating}
                  >
                    Mark Complete
                  </Button>
                )}
                
                {needsPayment && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-primary hover:bg-primary-50"
                    onClick={() => onPayment && onPayment(session.id)}
                    disabled={isUpdating}
                  >
                    Pay Now
                  </Button>
                )}
                
                {session.status === "completed" && 
                 session.paymentStatus === "paid" && 
                 userRole === "student" && 
                 onFeedback && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-amber-600 border-amber-200 hover:bg-amber-50"
                    onClick={() => onFeedback(session.id)}
                    disabled={isUpdating}
                  >
                    Leave Feedback
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  onClick={() => openChat(otherPerson?.id || 0)}
                  disabled={!otherPerson?.id}
                >
                  <i className="fas fa-comment-alt mr-1 text-xs"></i> Message
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
