import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import MessageList from "@/components/MessageList";
import Conversation from "@/components/Conversation";
import { useAuth } from "@/hooks/useAuth";

const Messages = () => {
  const [, params] = useRoute("/messages/:id");
  const recipientId = params?.id ? parseInt(params.id) : null;
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will redirect to login
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6 font-inter">Messages</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-250px)]">
          <div className="col-span-1 border-r">
            <MessageList />
          </div>
          
          <div className="col-span-2">
            {recipientId ? (
              <Conversation recipientId={recipientId} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <p className="mb-2">Select a conversation to start messaging</p>
                  <p className="text-sm">Or find a tutor to message from the tutor search page</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
