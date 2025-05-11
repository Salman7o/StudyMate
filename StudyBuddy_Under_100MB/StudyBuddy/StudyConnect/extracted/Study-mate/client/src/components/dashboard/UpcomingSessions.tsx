import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Session } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useChatState } from "@/lib/utils/chat";

interface SessionWithTutor extends Session {
  tutor: {
    id: number;
    name: string;
    profileImageUrl: string;
  };
}

export default function UpcomingSessions() {
  const { toast } = useToast();
  const { openChat } = useChatState();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: sessions, isLoading } = useQuery<SessionWithTutor[]>({
    queryKey: ["/api/sessions/student"],
  });

  const handleStatusChange = async (sessionId: number, newStatus: string) => {
    setIsUpdating(true);
    try {
      await apiRequest("PATCH", `/api/sessions/${sessionId}/status`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/student"] });
      toast({
        title: "Session updated",
        description: `Session status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update session",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatSessionTime = (startTime: Date, endTime: Date) => {
    return `${format(new Date(startTime), "h:mm a")} - ${format(new Date(endTime), "h:mm a")}`;
  };

  const formatSessionDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return format(new Date(date), "EEEE");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="bg-white p-6 h-96 overflow-y-auto">
          <ul className="divide-y divide-gray-200">
            {[1, 2, 3].map((i) => (
              <li key={i} className="py-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="mt-3 flex justify-between">
                  <Skeleton className="h-6 w-20" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Filter and sort upcoming sessions
  const upcomingSessions = sessions
    ?.filter(session => ["pending", "confirmed"].includes(session.status))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) || [];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Upcoming Sessions</h2>
          <a href="/sessions" className="text-primary hover:text-primary-600 text-sm">View All</a>
        </div>
      </div>
      <div className="bg-white p-6 h-96 overflow-y-auto">
        {upcomingSessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No upcoming sessions found</p>
            <a href="/find-tutors" className="mt-2 inline-block text-primary hover:underline">Find tutors</a>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {upcomingSessions.map((session) => (
              <li key={session.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img 
                      className="h-12 w-12 rounded-full" 
                      src={session.tutor.profileImageUrl || "https://via.placeholder.com/48?text=T"} 
                      alt={`${session.tutor.name}'s profile`} 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.tutor.name}
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
                <div className="mt-3 flex justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    session.status === "confirmed" 
                      ? "bg-secondary-100 text-secondary-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {session.status === "confirmed" ? "Confirmed" : "Pending"}
                  </span>
                  <div className="flex space-x-2">
                    {session.status === "confirmed" ? (
                      <button 
                        type="button" 
                        className={`inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isUpdating}
                      >
                        <i className="fas fa-video mr-1"></i> Join
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        className={`inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-400 bg-gray-50 cursor-not-allowed`}
                        disabled
                      >
                        <i className="fas fa-video mr-1"></i> Join
                      </button>
                    )}
                    <button 
                      type="button" 
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-primary hover:bg-primary-600"
                      onClick={() => openChat(session.tutor.id)}
                    >
                      <i className="fas fa-comment-alt mr-1"></i> Message
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
