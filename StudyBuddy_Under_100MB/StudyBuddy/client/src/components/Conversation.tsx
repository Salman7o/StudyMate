import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { Message, User } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface ConversationProps {
  recipientId: number;
}

const Conversation = ({ recipientId }: ConversationProps) => {
  const { user: currentUser } = useAuth();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: recipient, isLoading: isLoadingRecipient } = useQuery<User>({
    queryKey: [`/api/users/${recipientId}`],
  });
  
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: [`/api/messages/${recipientId}`],
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });
  
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => 
      apiRequest("POST", "/api/messages", { 
        receiverId: recipientId, 
        content 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${recipientId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    }
  });
  
  const handleSendMessage = () => {
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message);
      setMessage("");
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  if (isLoadingRecipient) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading conversation...</p>
      </div>
    );
  }
  
  if (!recipient) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>User not found</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={recipient.profileImage} alt={recipient.fullName} />
          <AvatarFallback>{recipient.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-bold">{recipient.fullName}</h3>
          <p className="text-sm text-gray-500">{recipient.userType === "tutor" ? "Tutor" : "Student"}</p>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isCurrentUser = msg.senderId === currentUser?.id;
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex items-end space-x-2">
                    {!isCurrentUser && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={recipient.profileImage} alt={recipient.fullName} />
                        <AvatarFallback>{recipient.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                    <div 
                      className={`max-w-sm px-4 py-2 rounded-lg ${
                        isCurrentUser 
                          ? "bg-primary text-white rounded-br-none" 
                          : "bg-gray-100 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${isCurrentUser ? "text-primary-foreground/80" : "text-gray-500"}`}>
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="resize-none"
            rows={2}
          />
          <Button 
            className="self-end btn-primary"
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
