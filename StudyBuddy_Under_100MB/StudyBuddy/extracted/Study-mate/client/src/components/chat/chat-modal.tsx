import { FormEvent, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface User {
  id: number;
  fullName: string;
  profileImage?: string;
}

interface ChatModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ user, isOpen, onClose }: ChatModalProps) {
  const { user: currentUser } = useAuth();
  const [messageText, setMessageText] = useState("");
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  
  // Get messages between users
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages', user.id],
    enabled: isOpen && !!currentUser?.id && !!user.id,
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUser) throw new Error("Not authenticated");
      
      // Try to send via WebSocket first
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'message',
          data: {
            receiverId: user.id,
            content
          }
        }));
        
        // Return optimistic response
        return {
          id: Date.now(), // Temporary ID
          senderId: currentUser.id,
          receiverId: user.id,
          content,
          timestamp: new Date().toISOString(),
          isRead: false
        };
      }
      
      // Fallback to REST API
      const res = await apiRequest("POST", "/api/messages", {
        receiverId: user.id,
        content
      });
      return await res.json();
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData(['/api/messages', user.id], (oldMessages: Message[] = []) => [
        ...oldMessages,
        newMessage
      ]);
      
      // Also update conversations list
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    }
  });
  
  // Set up WebSocket connection
  useEffect(() => {
    if (!currentUser?.id || !isOpen) return;
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log("WebSocket connected");
      // Authenticate the connection
      ws.send(JSON.stringify({
        type: 'auth',
        data: { userId: currentUser.id }
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message' && 
            (data.data.senderId === user.id || data.data.receiverId === user.id)) {
          // Add message to the chat
          queryClient.setQueryData(['/api/messages', user.id], (oldMessages: Message[] = []) => [
            ...oldMessages,
            data.data
          ]);
          
          // Mark as read if it's from the current chat partner
          if (data.data.senderId === user.id) {
            ws.send(JSON.stringify({
              type: 'read_message',
              data: { messageId: data.data.id }
            }));
          }
          
          // Also update conversations list
          queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
          queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
        }
      } catch (err) {
        console.error("Error parsing WebSocket message", err);
      }
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error", error);
    };
    
    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };
    
    return () => {
      ws.close();
    };
  }, [currentUser?.id, isOpen, queryClient, user.id]);
  
  // Auto scroll to bottom of messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    sendMessageMutation.mutate(messageText);
    setMessageText("");
  };
  
  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  {user.profileImage ? (
                    <AvatarImage src={user.profileImage} alt={user.fullName} />
                  ) : (
                    <AvatarFallback>
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">{user.fullName}</h3>
                <p className="text-sm text-gray-500">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                  Online
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-md text-gray-400 hover:text-gray-500"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close panel</span>
            </Button>
          </div>
        </div>
        
        <div className="flex-1 p-4 bg-gray-50 overflow-hidden">
          <div 
            ref={messageContainerRef}
            className="space-y-4 h-full overflow-y-auto px-1 py-2"
          >
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500">No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isTutor = message.senderId === user.id;
                
                return (
                  <div 
                    key={message.id} 
                    className={`flex items-end ${isTutor ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`flex flex-col space-y-2 text-sm max-w-xs mx-2 order-2 ${
                        isTutor ? 'items-start' : 'items-end'
                      }`}
                    >
                      <div 
                        className={cn(
                          "px-4 py-2 rounded-lg inline-block",
                          isTutor 
                            ? "rounded-bl-none bg-gray-200 text-gray-600" 
                            : "rounded-br-none bg-primary text-white"
                        )}
                      >
                        {message.content}
                      </div>
                      <span className="text-xs text-gray-500 leading-none">
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                    {isTutor && (
                      <Avatar className="w-6 h-6 order-1">
                        {user.profileImage ? (
                          <AvatarImage src={user.profileImage} alt={user.fullName} />
                        ) : (
                          <AvatarFallback className="text-xs">
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <Button 
              type="button"
              variant="ghost" 
              size="icon"
              className="text-gray-500 hover:text-gray-600"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 mx-2"
            />
            <Button
              type="submit"
              size="icon"
              className="bg-primary hover:bg-primary-600 text-white rounded-full h-10 w-10"
              disabled={sendMessageMutation.isPending || !messageText.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
