import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow, format } from "date-fns";
import { MessageSquare, Video } from "lucide-react";

interface User {
  id: number;
  fullName: string;
  profileImage?: string;
  specialization?: string;
}

interface Session {
  id: number;
  subject: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  student: User;
  tutor: User;
}

interface UpcomingSessionsProps {
  sessions: Session[];
  onMessageClick: (userId: number) => void;
}

export function UpcomingSessions({ sessions, onMessageClick }: UpcomingSessionsProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && 
                    date.getMonth() === now.getMonth() && 
                    date.getFullYear() === now.getFullYear();
                    
    if (isToday) return 'Today';
    
    const isTomorrow = new Date(now.setDate(now.getDate() + 1)).getDate() === date.getDate() &&
                       new Date(now.setDate(now.getDate() + 1)).getMonth() === date.getMonth() &&
                       new Date(now.setDate(now.getDate() + 1)).getFullYear() === date.getFullYear();
                       
    if (isTomorrow) return 'Tomorrow';
    
    return format(date, 'EEEE');
  };

  const formatTime = (start: string, end: string) => {
    return `${format(new Date(start), 'h:mm a')} - ${format(new Date(end), 'h:mm a')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Upcoming Sessions</h2>
          <a href="/sessions" className="text-primary hover:text-primary-600 text-sm">View All</a>
        </div>
      </div>
      <div className="bg-white p-6 h-96 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No upcoming sessions</p>
            <a href="/find-tutors" className="mt-2 text-primary hover:underline">
              Find a tutor
            </a>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {sessions.map((session) => (
              <li key={session.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      {session.tutor.profileImage ? (
                        <AvatarImage src={session.tutor.profileImage} alt={session.tutor.fullName} />
                      ) : (
                        <AvatarFallback>
                          {getInitials(session.tutor.fullName)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.tutor.fullName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {session.subject}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(session.startTime)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTime(session.startTime, session.endTime)}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-between">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      session.status === 'confirmed' && "bg-green-100 text-green-800 hover:bg-green-100",
                      session.status === 'pending' && "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    )}
                  >
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "text-xs",
                        session.status !== 'confirmed' && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={session.status !== 'confirmed'}
                    >
                      <Video className="mr-1 h-3 w-3" />
                      Join
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs"
                      onClick={() => onMessageClick(session.tutor.id)}
                    >
                      <MessageSquare className="mr-1 h-3 w-3" />
                      Message
                    </Button>
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

import { cn } from "@/lib/utils";
