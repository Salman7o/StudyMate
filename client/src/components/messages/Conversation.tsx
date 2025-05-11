import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Conversation as IConversation, Message, User } from "@/lib/types";

interface ConversationProps {
  conversationId: number;
}

export default function Conversation({ conversationId }: ConversationProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Get conversation details
  const { data: conversation, isLoading: isLoadingConversation } = useQuery<IConversation>({
    queryKey: [`/api/conversations/${conversationId}`],
    enabled: !!conversationId,
  });
  
  // Get messages for this conversation
  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: [`/api/conversations/${conversationId}/messages`],
    enabled: !!conversationId,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversation) return null;
      
      // Get the other user's ID
      const receiverId = conversation.user1Id === user?.id ? conversation.user2Id : conversation.user1Id;
      
      const res = await apiRequest("POST", "/api/messages", {
        receiverId,
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch messages after sending a new one
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setNewMessage("");
    },
  });
  
  // Get the other user in the conversation
  const getOtherUser = (): User | undefined => {
    if (!conversation || !user) return undefined;
    
    const otherUserId = conversation.user1Id === user.id ? conversation.user2Id : conversation.user1Id;
    
    // Find other user from conversation data
    if (conversation.otherUser && conversation.otherUser.id === otherUserId) {
      return conversation.otherUser;
    }
    
    return undefined;
  };
  
  const otherUser = getOtherUser();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };
  
  if (isLoadingConversation || !conversation) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex-1 p-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <Skeleton className={`h-12 w-64 rounded-xl`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Conversation header */}
      <div className="p-4 border-b flex items-center space-x-3">
        <Avatar>
          <AvatarImage 
            src={otherUser?.profileImageUrl} 
            alt={`${otherUser?.firstName} ${otherUser?.lastName}`} 
          />
          <AvatarFallback>
            {otherUser?.firstName?.[0] || ""}{otherUser?.lastName?.[0] || ""}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-sm font-medium">{otherUser?.firstName} {otherUser?.lastName}</h2>
          <p className="text-xs text-gray-500">
            {otherUser?.userType === 'tutor' ? `Tutor - ${otherUser?.email}` : `Student - ${otherUser?.email}`}
          </p>
        </div>
      </div>
      
      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {isLoadingMessages ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <Skeleton className={`h-12 w-64 rounded-xl`} />
              </div>
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => {
              const isSentByMe = message.senderId === user?.id;
              const messageDate = new Date(message.createdAt);
              const timeString = format(messageDate, 'h:mm a');
              
              return (
                <div key={message.id} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl p-3 ${
                    isSentByMe 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                    <p className="break-words">{message.content}</p>
                    <p className={`text-xs ${isSentByMe ? 'text-blue-100' : 'text-gray-500'} text-right mt-1`}>
                      {timeString}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              No messages yet. Send a message to start the conversation.
            </p>
          </div>
        )}
      </ScrollArea>
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t flex space-x-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!newMessage.trim() || sendMessageMutation.isPending}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
