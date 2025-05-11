import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import MainLayout from "@/components/layout/MainLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Message } from "@shared/schema";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Conversation {
  otherUser: {
    id: number;
    name: string;
    profileImageUrl: string;
    isOnline: boolean;
  };
  lastMessage: {
    id: number;
    content: string;
    timestamp: string;
  };
  unreadCount: number;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get conversations
  const { data: conversations, isLoading: isLoadingConversations } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    enabled: !!user,
  });
  
  // Get chat messages for active conversation
  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: [`/api/messages/${activeConversation}`],
    enabled: !!activeConversation,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });
  
  // Get details for active conversation partner
  const { data: activePartner } = useQuery<Conversation["otherUser"]>({
    queryKey: [`/api/users/${activeConversation}`],
    enabled: !!activeConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: number; content: string }) => {
      return apiRequest("POST", "/api/messages", {
        receiverId,
        content,
      });
    },
    onSuccess: () => {
      setMessageText("");
      if (activeConversation) {
        queryClient.invalidateQueries({ queryKey: [`/api/messages/${activeConversation}`] });
        queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      }
    },
  });

  // Scroll to bottom when new messages come in
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeConversation) return;
    sendMessageMutation.mutate({
      receiverId: activeConversation,
      content: messageText.trim(),
    });
  };

  const formatMessageTime = (timestamp: string | Date) => {
    try {
      return format(new Date(timestamp), "h:mm a");
    } catch (e) {
      return "";
    }
  };
  
  const formatConversationTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      
      // If today, show time
      if (date.toDateString() === now.toDateString()) {
        return format(date, "h:mm a");
      }
      
      // If this year, show month and day
      if (date.getFullYear() === now.getFullYear()) {
        return format(date, "MMM d");
      }
      
      // Otherwise show full date
      return format(date, "MMM d, yyyy");
    } catch (e) {
      return "";
    }
  };

  // Filter conversations by search query
  const filteredConversations = conversations?.filter(convo => {
    if (!searchQuery) return true;
    return convo.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <MainLayout title="Messages">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
        {/* Conversations List */}
        <div className="md:col-span-1 bg-white rounded-lg shadow overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search conversations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center p-3 space-x-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-28 mb-2" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations?.length === 0 ? (
              <div className="text-center p-6 text-gray-500">
                <p>No conversations found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredConversations?.map((conversation) => (
                  <div
                    key={conversation.otherUser.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      activeConversation === conversation.otherUser.id ? "bg-primary-50" : ""
                    }`}
                    onClick={() => setActiveConversation(conversation.otherUser.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative flex-shrink-0">
                        <img
                          className="h-12 w-12 rounded-full"
                          src={conversation.otherUser.profileImageUrl || "https://via.placeholder.com/48?text=U"}
                          alt={`${conversation.otherUser.name}'s profile`}
                        />
                        <span
                          className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${
                            conversation.otherUser.isOnline ? "bg-secondary" : "bg-gray-300"
                          }`}
                        ></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.otherUser.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatConversationTime(conversation.lastMessage.timestamp)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{conversation.lastMessage.content}</p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-xs font-medium text-white">
                            {conversation.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden flex flex-col h-full">
          {activeConversation ? (
            <>
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                  {activePartner ? (
                    <>
                      <div className="relative flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={activePartner.profileImageUrl || "https://via.placeholder.com/40?text=U"}
                          alt={`${activePartner.name}'s profile`}
                        />
                        <span
                          className={`absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white ${
                            activePartner.isOnline ? "bg-secondary" : "bg-gray-300"
                          }`}
                        ></span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">{activePartner.name}</h3>
                        <p className="text-sm text-gray-500">
                          {activePartner.isOnline ? "Online" : "Offline"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="ml-3">
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : messages?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                      <i className="fas fa-comment-dots text-2xl"></i>
                    </div>
                    <p>No messages yet</p>
                    <p className="text-sm">Start a conversation with {activePartner?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages?.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === user?.id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex flex-col max-w-xs mx-2 ${
                            message.senderId === user?.id ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`px-4 py-2 rounded-lg ${
                              message.senderId === user?.id
                                ? "bg-primary text-white rounded-br-none chat-bubble-student"
                                : "bg-gray-200 text-gray-800 rounded-bl-none chat-bubble-tutor"
                            }`}
                          >
                            {message.content}
                          </div>
                          <span className="text-xs text-gray-500 mt-1">
                            {formatMessageTime(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef}></div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 mr-2"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <i className="fas fa-paper-plane"></i>
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <i className="fas fa-comments text-5xl"></i>
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">Your Messages</h3>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
