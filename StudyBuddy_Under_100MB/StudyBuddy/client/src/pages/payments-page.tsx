import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import MainLayout from "@/components/layout/MainLayout";
import PaymentForm from "@/components/payment/PaymentForm";
import { Session } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SessionWithTutor extends Session {
  tutor: {
    id: number;
    name: string;
    profileImageUrl: string;
  };
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [selectedSession, setSelectedSession] = useState<SessionWithTutor | null>(null);
  
  const { data: sessions, isLoading } = useQuery<SessionWithTutor[]>({
    queryKey: ["/api/sessions/student"],
    enabled: user?.role === "student",
  });

  // Filter completed sessions that need payment or are already paid
  const unpaidSessions = sessions?.filter(
    session => session.status === "completed" && session.paymentStatus === "unpaid"
  );
  
  const paidSessions = sessions?.filter(
    session => session.status === "completed" && session.paymentStatus === "paid"
  );

  const calculateSessionCost = (session: SessionWithTutor) => {
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    // In a real implementation, we would get the hourly rate from the tutor's profile
    const hourlyRate = 35; // Default rate
    return hours * hourlyRate;
  };

  const formatSessionDate = (date: Date) => {
    return format(new Date(date), "MMM d, yyyy");
  };
  
  const formatSessionTime = (startTime: Date, endTime: Date) => {
    return `${format(new Date(startTime), "h:mm a")} - ${format(new Date(endTime), "h:mm a")}`;
  };

  // If user is not a student, show unsupported message
  if (user?.role !== "student") {
    return (
      <MainLayout title="Payments">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-amber-100 text-amber-800 p-4 rounded-md max-w-md text-center">
            <h2 className="text-lg font-medium mb-2">Payments are for students only</h2>
            <p>As a tutor, you don't need to make payments for sessions.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Payments">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payments</h1>
        <p className="text-gray-600">Manage your session payments</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Pending Payments</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow overflow-hidden p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="ml-3">
                        <Skeleton className="h-5 w-36 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : unpaidSessions?.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-md text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <i className="fas fa-check text-2xl text-green-600"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending payments</h3>
              <p className="text-gray-600">
                You're all caught up! No payments are due at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {unpaidSessions?.map((session) => (
                <div key={session.id} className="bg-white rounded-lg shadow overflow-hidden p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={session.tutor.profileImageUrl || "https://via.placeholder.com/40?text=T"}
                        alt={`${session.tutor.name}'s profile`}
                      />
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">{session.tutor.name}</h3>
                        <p className="text-sm text-gray-500">{session.subject}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatSessionDate(new Date(session.startTime))}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md text-sm mb-4">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      <div className="text-gray-500">Time:</div>
                      <div>{formatSessionTime(new Date(session.startTime), new Date(session.endTime))}</div>
                      
                      <div className="text-gray-500">Status:</div>
                      <div className="text-orange-600">Payment Required</div>
                      
                      <div className="text-gray-500">Amount:</div>
                      <div className="font-bold">${calculateSessionCost(session).toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={() => setSelectedSession(session)}
                    >
                      Pay Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow overflow-hidden p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="ml-3">
                        <Skeleton className="h-5 w-36 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <Skeleton className="h-5 w-20 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : paidSessions?.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-md text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payment history yet</h3>
              <p className="text-gray-600">
                You haven't made any payments yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paidSessions?.map((session) => (
                <div key={session.id} className="bg-white rounded-lg shadow overflow-hidden p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={session.tutor.profileImageUrl || "https://via.placeholder.com/40?text=T"}
                        alt={`${session.tutor.name}'s profile`}
                      />
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">{session.tutor.name}</h3>
                        <p className="text-sm text-gray-500">{session.subject}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatSessionDate(new Date(session.startTime))}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">
                        ${calculateSessionCost(session).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Paid via {session.paymentMethod || "Online Payment"}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Paid
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Payment Dialog */}
      <Dialog 
        open={selectedSession !== null} 
        onOpenChange={(open) => !open && setSelectedSession(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Pay for your session with {selectedSession?.tutor.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <PaymentForm
              sessionId={selectedSession.id}
              amount={calculateSessionCost(selectedSession)}
              onSuccess={() => setSelectedSession(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
