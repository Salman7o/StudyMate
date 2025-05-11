import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SessionCard } from "@/components/sessions/session-card";

interface Session {
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
}

interface SessionTabsProps {
  sessions: Session[];
}

export function SessionTabs({ sessions }: SessionTabsProps) {
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Filter sessions based on active tab
  const getFilteredSessions = () => {
    const now = new Date();
    
    switch (activeTab) {
      case "upcoming":
        return sessions.filter(
          (session) => 
            (session.status === "confirmed") && 
            new Date(session.date) >= now
        );
      case "pending":
        return sessions.filter(
          (session) => session.status === "pending"
        );
      case "past":
        return sessions.filter(
          (session) => 
            session.status === "completed" || 
            (session.status === "confirmed" && new Date(session.date) < now)
        );
      default:
        return [];
    }
  };
  
  const filteredSessions = getFilteredSessions();

  return (
    <Tabs defaultValue="upcoming" onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="past">Past Sessions</TabsTrigger>
        <TabsTrigger value="pending">Pending Requests</TabsTrigger>
      </TabsList>
      
      {["upcoming", "past", "pending"].map((tabId) => (
        <TabsContent key={tabId} value={tabId} className="p-4">
          {activeTab === tabId && filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No {tabId} sessions found
            </div>
          ) : (
            filteredSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
