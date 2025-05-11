import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Message } from "@shared/schema";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useChatState } from "@/lib/utils/chat";

export default function ChatModal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isOpen, chatUserId, closeChat } = useChatState();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get chat partner details
  const { data: chatPartner, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${chatUserId}`],
    enabled: !!chatUserId && isOpen,
  });

  // Get chat messages
  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: [`/api/messages/${chatUserId}`],
    enabled: !!chatUserId && isOpen,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages", {
        receiverId: chatUserId,
        content,
      });
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${chatUserId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    sendMessageMutation.mutate(messageText.trim());
  };

  // Scroll to bottom of chat when new messages come in
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!isOpen) return null;

  const formatMessageTime = (timestamp: string | Date) => {
    try {
      return format(new Date(timestamp), "h:mm a");
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={closeChat}
        ></div>
        <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="relative w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  {isLoadingUser ? (
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                      </div>
                      <div className="ml-3">
                        <div className="h-5 w-32 bg-gray-200 animate-pulse rounded mb-1"></div>
                        <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img 
                          className="h-10 w-10 rounded-full" 
                          src={chatPartner?.profileImageUrl || "https://via.placeholder.com/40?text=U"} 
                          alt="Chat partner profile" 
                        />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">{chatPartner?.name || "User"}</h3>
                        <p className="text-sm text-gray-500">
                          <span className="inline-block h-2 w-2 rounded-full bg-secondary mr-1"></span>
                          {chatPartner?.isOnline ? "Online" : "Offline"}
                        </p>
                      </div>
                    </div>
                  )}
                  <button 
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none" 
                    onClick={closeChat}
                  >
                    <span className="sr-only">Close panel</span>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 p-4 bg-gray-50">
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4 h-96 overflow-y-auto px-1 py-2">
                    {messages?.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <p>No messages yet. Send a message to start the conversation!</p>
                      </div>
                    ) : (
                      messages?.map((message) => (
                        <div 
                          key={message.id} 
                          className={`flex items-end ${
                            message.senderId === user?.id ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div 
                            className={`flex flex-col space-y-2 text-sm max-w-xs mx-2 order-2 ${
                              message.senderId === user?.id ? "items-end" : "items-start"
                            }`}
                          >
                            <div 
                              className={`px-4 py-2 rounded-lg inline-block ${
                                message.senderId === user?.id 
                                  ? "rounded-br-none bg-primary text-white chat-bubble-student" 
                                  : "rounded-bl-none bg-gray-200 text-gray-600 chat-bubble-tutor"
                              }`}
                            >
                              {message.content}
                            </div>
                            <span className="text-xs text-gray-500 leading-none">
                              {formatMessageTime(message.timestamp)}
                            </span>
                          </div>
                          {message.senderId !== user?.id && (
                            <img 
                              className="w-6 h-6 rounded-full order-1" 
                              src={chatPartner?.profileImageUrl || "https://via.placeholder.com/24?text=U"} 
                              alt="Chat partner profile" 
                            />
                          )}
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef}></div>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center">
                  <button 
                    type="button" 
                    className="inline-flex items-center justify-center rounded-full h-10 w-10 transition-colors ease-in-out duration-150 text-gray-500 hover:text-gray-600"
                  >
                    <i className="fas fa-paperclip"></i>
                  </button>
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="border-0 focus:ring-0 focus:outline-none w-full mx-4 py-2"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    className={`inline-flex items-center justify-center rounded-full h-10 w-10 transition-colors ease-in-out duration-150 ${
                      messageText.trim() 
                        ? "bg-primary hover:bg-primary-600 text-white" 
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <i className="fas fa-paper-plane"></i>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
