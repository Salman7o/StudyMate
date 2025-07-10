import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { UpcomingSessions } from "@/components/dashboard/upcoming-sessions";
import { RecentMessages } from "@/components/dashboard/recent-messages";
import { TutorCard } from "@/components/dashboard/tutor-card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, BookOpen, UserCheck, Star, MessageSquare, Video, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatModal } from "@/components/chat/chat-modal";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<{ id: number; fullName: string; profileImage?: string } | null>(null);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard'],
  });

  const handleMessageClick = (userId: number) => {
    // Find the user data from either upcoming sessions or conversations
    const userFromSessions = data?.upcomingSessions?.find(session => 
      session.tutor.id === userId || session.student.id === userId
    );
    
    const userFromConversations = data?.conversations?.find(conv => 
      conv.user.id === userId
    )?.user;
    
    const chatUser = userFromSessions 
      ? (user?.role === 'student' ? userFromSessions.tutor : userFromSessions.student)
      : userFromConversations;
    
    if (chatUser) {
      setActiveChat(chatUser);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h1>
            <p className="text-red-500">{error.message}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.fullName?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-gray-600">Ready to continue your learning journey?</p>
            
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <StatsCard 
                title="Active Sessions" 
                value={data?.stats?.activeSessions || 0}
                icon={<BookOpen className="text-white" />}
                className="bg-primary-50"
                iconClassName="bg-primary"
              />
              
              <StatsCard 
                title="Completed Sessions" 
                value={data?.stats?.completedSessions || 0}
                icon={<UserCheck className="text-white" />}
                className="bg-green-50"
                iconClassName="bg-green-500"
              />
              
              <StatsCard 
                title="Average Rating" 
                value={`${data?.stats?.avgRating?.toFixed(1) || '0.0'}/5`}
                icon={<Star className="text-white" />}
                className="bg-amber-50"
                iconClassName="bg-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Upcoming Sessions */}
          <UpcomingSessions 
            sessions={data?.upcomingSessions || []} 
            onMessageClick={handleMessageClick} 
          />
          
          {/* Recent Messages */}
          <RecentMessages 
            conversations={data?.conversations || []}
            onConversationOpen={handleMessageClick}
          />
        </div>
        
        {/* Recommended Tutors */}
        {user?.role === 'student' && data?.recommendedTutors?.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Recommended Tutors</h2>
              <a href="/find-tutors" className="text-primary hover:text-primary-600 text-sm flex items-center">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.recommendedTutors.map((tutor) => (
                <TutorCard key={tutor.id} tutor={tutor} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {activeChat && (
        <ChatModal
          user={activeChat}
          isOpen={!!activeChat}
          onClose={() => setActiveChat(null)}
        />
      )}
    </MainLayout>
  );
}
