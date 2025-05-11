import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/context/AuthContext";
import MessageList from "@/components/messages/MessageList";
import Conversation from "@/components/messages/Conversation";

export default function MessagesPage() {
  const { id } = useParams<{ id: string }>();
  const conversationId = id ? parseInt(id) : undefined;
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login?redirect=/messages");
    }
  }, [isAuthenticated, setLocation]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <>
      <Helmet>
        <title>Messages | StudyBuddy</title>
        <meta 
          name="description" 
          content="Chat with your tutors and students. Discuss session details, share study materials, and get your questions answered." 
        />
      </Helmet>
      
      <section className="py-6 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden min-h-[70vh]">
            <div className="grid grid-cols-1 md:grid-cols-3 h-[70vh]">
              <div className="border-r border-gray-200">
                <MessageList selectedConversationId={conversationId} />
              </div>
              
              <div className="md:col-span-2">
                {conversationId ? (
                  <Conversation conversationId={conversationId} />
                ) : (
                  <div className="flex items-center justify-center h-full text-center p-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-700 mb-2">Select a conversation</h2>
                      <p className="text-gray-500 max-w-sm mx-auto">
                        Choose a conversation from the list or find a tutor to start a new conversation.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
