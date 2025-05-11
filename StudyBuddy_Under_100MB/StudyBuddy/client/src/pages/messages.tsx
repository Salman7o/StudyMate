import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { ConversationList } from "@/components/messages/conversation-list";
import { ChatWindow } from "@/components/messages/chat-window";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Messages() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [selectedConversationId, setSelectedConversationId] = useState<number | undefined>(undefined);

  // Parse conversation ID from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const conversationId = params.get('conversation');
    if (conversationId) {
      setSelectedConversationId(parseInt(conversationId));
    }
  }, [location]);

  const handleSelectConversation = (conversationId: number) => {
    setSelectedConversationId(conversationId);
  };

  if (!isAuthenticated) {
    return (
      <div className="py-12 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 max-w-md mx-auto">
          <div className="text-5xl mb-4 text-primary">
            <i className="fas fa-lock"></i>
          </div>
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to access your messages
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/login">
              <Button>Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Chat with your tutors and students
        </p>
      </div>
      
      <Card className="overflow-hidden">
        <div className="flex h-[600px]">
          <ConversationList
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
          />
          <ChatWindow conversationId={selectedConversationId} />
        </div>
      </Card>
    </div>
  );
}
