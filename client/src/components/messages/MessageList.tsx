import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Conversation } from "@/lib/types";

interface MessageListProps {
  selectedConversationId?: number;
}

export default function MessageList({ selectedConversationId }: MessageListProps) {
  const [, setLocation] = useLocation();
  
  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    refetchInterval: 10000, // Refetch every 10 seconds to check for new messages
  });

  const handleSelectConversation = (id: number) => {
    setLocation(`/messages/${id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <h3 className="text-lg font-medium text-gray-800 mb-2">No messages yet</h3>
        <p className="text-gray-500 mb-6">
          Start a conversation with a tutor to get help with your studies.
        </p>
        <Link href="/tutors">
          <a className="text-primary font-medium hover:underline">
            Browse Tutors
          </a>
        </Link>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => {
          const { id, otherUser, lastMessage, lastMessageAt } = conversation;
          
          if (!otherUser) return null;
          
          const isSelected = selectedConversationId === id;
          const formattedDate = lastMessageAt ? format(new Date(lastMessageAt), 'MMM d') : '';
          const hasUnreadMessages = lastMessage && !lastMessage.read && lastMessage.receiverId !== otherUser.id;
          
          return (
            <div
              key={id}
              className={`flex items-start space-x-3 p-3 rounded-md cursor-pointer ${
                isSelected ? "bg-primary/10" : "hover:bg-gray-100"
              } ${hasUnreadMessages ? "font-semibold" : ""}`}
              onClick={() => handleSelectConversation(id)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.profileImageUrl} alt={`${otherUser.firstName} ${otherUser.lastName}`} />
                <AvatarFallback>
                  {otherUser.firstName?.[0] || ""}{otherUser.lastName?.[0] || ""}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-sm font-medium truncate">
                    {otherUser.firstName} {otherUser.lastName}
                  </h4>
                  {lastMessageAt && (
                    <span className="text-xs text-gray-500">{formattedDate}</span>
                  )}
                </div>
                {lastMessage ? (
                  <p className={`text-xs truncate ${hasUnreadMessages ? "text-gray-900" : "text-gray-500"}`}>
                    {lastMessage.content}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 italic">No messages yet</p>
                )}
              </div>
              {hasUnreadMessages && (
                <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
