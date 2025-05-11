import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ChatWindowProps {
  conversationId?: number;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  status: "sent" | "delivered" | "read";
  sentAt: string;
}

interface Conversation {
  id: number;
  participantOneId: number;
  participantTwoId: number;
  otherParticipant: {
    id: number;
    fullName: string;
    profileImage?: string;
  };
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messageContent, setMessageContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Fetch conversation details
  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/conversations'],
    enabled: !!conversationId,
  });

  const currentConversation = conversations.find(
    (c: Conversation) => c.id === conversationId
  );

  // Fetch messages for the current conversation
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['/api/conversations', conversationId, 'messages'],
    queryFn: async () => {
      if (!conversationId) return [];
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return response.json();
    },
    enabled: !!conversationId,
  });

  // Setup WebSocket connection
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      console.log("WebSocket connected");
      // Authenticate the socket connection
      newSocket.send(JSON.stringify({
        type: 'auth',
        userId: user.id
      }));
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message') {
        // If the message is for the current conversation, update the messages
        if (data.message.conversationId === conversationId) {
          queryClient.invalidateQueries({ 
            queryKey: ['/api/conversations', conversationId, 'messages'] 
          });
          
          // Send a read receipt
          newSocket.send(JSON.stringify({
            type: 'read_receipt',
            messageId: data.message.id
          }));
        }
        
        // Always invalidate conversations list to update the last message
        queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      }
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    newSocket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageContent.trim() || !conversationId || !user || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (socket && socket.readyState === WebSocket.OPEN) {
        // Send message via WebSocket for real-time delivery
        socket.send(JSON.stringify({
          type: 'message',
          conversationId,
          receiverId: currentConversation?.otherParticipant.id,
          content: messageContent.trim()
        }));
      } else {
        // Fallback to HTTP if WebSocket isn't available
        await apiRequest("POST", `/api/conversations/${conversationId}/messages`, {
          content: messageContent.trim()
        });
      }
      
      // Clear input
      setMessageContent("");
      
      // Refetch messages
      queryClient.invalidateQueries({ 
        queryKey: ['/api/conversations', conversationId, 'messages'] 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Failed to send message",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 text-center">
        <div className="text-5xl mb-4 text-gray-300 dark:text-gray-600">
          <i className="fas fa-comment-dots"></i>
        </div>
        <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
        {currentConversation ? (
          <div className="flex items-center">
            {currentConversation.otherParticipant.profileImage ? (
              <img
                src={currentConversation.otherParticipant.profileImage}
                alt={currentConversation.otherParticipant.fullName}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                <span className="text-sm font-medium">
                  {currentConversation.otherParticipant.fullName.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
            )}
            <div className="ml-3">
              <h4 className="text-sm font-medium">{currentConversation.otherParticipant.fullName}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <span className="inline-block bg-green-500 w-2 h-2 rounded-full mr-1"></span>
                Online
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            <div className="ml-3">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-1 animate-pulse"></div>
            </div>
          </div>
        )}
        <div className="ml-auto flex space-x-2">
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <i className="fas fa-phone"></i>
          </button>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <i className="fas fa-video"></i>
          </button>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
      
      {/* Chat messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {isLoadingMessages ? (
          <div className="flex flex-col space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex items-end ${i % 2 === 0 ? "justify-end" : ""}`}>
                {i % 2 !== 0 && <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>}
                <div className={`${i % 2 === 0 ? "bg-gray-200 dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-600"} rounded-lg p-3 max-w-[75%] animate-pulse`}>
                  <div className="h-4 w-32 bg-gray-300 dark:bg-gray-500 rounded"></div>
                  <div className="h-4 w-48 bg-gray-300 dark:bg-gray-500 rounded mt-2"></div>
                  <div className="h-3 w-16 bg-gray-300 dark:bg-gray-500 rounded mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-4 text-gray-300 dark:text-gray-600">
              <i className="fas fa-comment-dots"></i>
            </div>
            <h3 className="text-lg font-medium mb-2">No messages yet</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          messages.map((message: Message) => (
            <div key={message.id} className="mb-4">
              {message.senderId === user?.id ? (
                <div className="flex items-end justify-end">
                  <div className="bg-primary text-white rounded-lg rounded-br-none p-3 max-w-[75%]">
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs text-white/70 mt-1 block">
                      {formatDistanceToNow(new Date(message.sentAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-end">
                  {currentConversation?.otherParticipant.profileImage ? (
                    <img
                      src={currentConversation.otherParticipant.profileImage}
                      alt={currentConversation.otherParticipant.fullName}
                      className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-2 flex-shrink-0">
                      <span className="text-xs font-medium">
                        {currentConversation?.otherParticipant.fullName.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                  )}
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg rounded-bl-none p-3 max-w-[75%]">
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                      {formatDistanceToNow(new Date(message.sentAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </ScrollArea>
      
      {/* Chat input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-2"
          >
            <i className="fas fa-paperclip"></i>
          </button>
          <Input
            type="text"
            placeholder="Type a message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2 mx-2"
          />
          <Button
            type="submit"
            disabled={!messageContent.trim() || isSubmitting}
            className="bg-primary hover:bg-indigo-700 text-white p-2 rounded-full"
          >
            <i className="fas fa-paper-plane"></i>
          </Button>
        </div>
      </form>
    </div>
  );
}
