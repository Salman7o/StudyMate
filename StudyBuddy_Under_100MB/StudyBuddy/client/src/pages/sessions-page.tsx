import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import MainLayout from "@/components/layout/MainLayout";
import SessionCard from "@/components/session/SessionCard";
import PaymentForm from "@/components/payment/PaymentForm";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Session } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface SessionWithDetails extends Session {
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
}

export default function SessionsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [paymentSessionId, setPaymentSessionId] = useState<number | null>(null);
  const [feedbackSessionId, setFeedbackSessionId] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionWithDetails | null>(null);

  // Fetch sessions based on user role
  const { data: sessions, isLoading } = useQuery<SessionWithDetails[]>({
    queryKey: [user?.role === "tutor" ? "/api/sessions/tutor" : "/api/sessions/student"],
  });

  const handlePayment = (sessionId: number) => {
    const session = sessions?.find(s => s.id === sessionId);
    if (session) {
      setSelectedSession(session);
      setPaymentSessionId(sessionId);
    }
  };

  const handleFeedback = (sessionId: number) => {
    const session = sessions?.find(s => s.id === sessionId);
    if (session) {
      setSelectedSession(session);
      setFeedbackSessionId(sessionId);
    }
  };

  // Group sessions by status
  const upcoming = sessions?.filter(session => 
    (session.status === "pending" || session.status === "confirmed") && 
    new Date(session.startTime) >= new Date()
  ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const past = sessions?.filter(session => 
    session.status === "completed" || 
    (session.status !== "cancelled" && new Date(session.endTime) < new Date())
  ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const cancelled = sessions?.filter(session => 
    session.status === "cancelled"
  ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  // Calculate session cost (duration in hours * hourly rate)
  const calculateSessionCost = (session: SessionWithDetails): number => {
    if (!session) return 0;
    
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    // Assuming we have hourlyRate on the session or tutor
    const hourlyRate = 35; // Default rate (this should come from the tutor profile)
    
    return durationHours * hourlyRate;
  };

  return (
    <MainLayout title="Sessions">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Sessions</h1>
        <p className="text-gray-600">Manage your tutoring sessions</p>
      </div>

      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow overflow-hidden mb-4">
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-28 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Skeleton className="h-6 w-20" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : upcoming?.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-md text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h3>
              <p className="text-gray-600 mb-4">
                You don't have any upcoming sessions scheduled.
              </p>
              {user?.role === "student" && (
                <a 
                  href="/find-tutors" 
                  className="text-primary hover:underline"
                >
                  Find tutors to book a session
                </a>
              )}
            </div>
          ) : (
            upcoming?.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                userRole={user?.role as "student" | "tutor"}
                onPayment={handlePayment}
                onFeedback={handleFeedback}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow overflow-hidden mb-4">
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-28 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Skeleton className="h-6 w-20" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : past?.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-md text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No past sessions</h3>
              <p className="text-gray-600">
                You haven't completed any sessions yet.
              </p>
            </div>
          ) : (
            past?.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                userRole={user?.role as "student" | "tutor"}
                onPayment={handlePayment}
                onFeedback={handleFeedback}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="cancelled">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow overflow-hidden mb-4">
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-28 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            ))
          ) : cancelled?.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-md text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cancelled sessions</h3>
              <p className="text-gray-600">
                You don't have any cancelled sessions.
              </p>
            </div>
          ) : (
            cancelled?.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                userRole={user?.role as "student" | "tutor"}
                showActions={false}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
      
      {/* Payment Dialog */}
      <Dialog 
        open={paymentSessionId !== null} 
        onOpenChange={(open) => !open && setPaymentSessionId(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Pay for your completed session with {selectedSession?.tutor?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <PaymentForm
              sessionId={paymentSessionId!}
              amount={calculateSessionCost(selectedSession)}
              onSuccess={() => setPaymentSessionId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Feedback Dialog */}
      <Dialog 
        open={feedbackSessionId !== null} 
        onOpenChange={(open) => !open && setFeedbackSessionId(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Feedback</DialogTitle>
            <DialogDescription>
              Share your experience with {selectedSession?.tutor?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && selectedSession.tutor && (
            <FeedbackForm
              sessionId={feedbackSessionId!}
              tutorName={selectedSession.tutor.name}
              onSuccess={() => setFeedbackSessionId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
