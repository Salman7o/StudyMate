import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: number;
  otherParticipant: {
    id: number;
    fullName: string;
    profileImage?: string;
  };
  lastMessage?: {
    content: string;
    sentAt: string;
  };
  lastMessageAt: string;
}

interface ConversationListProps {
  selectedConversationId?: number;
  onSelectConversation: (conversationId: number) => void;
}

export function ConversationList({ 
  selectedConversationId, 
  onSelectConversation 
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['/api/conversations'],
  });

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation: Conversation) => 
    conversation.otherParticipant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conversation.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort conversations by most recent message
  const sortedConversations = [...filteredConversations].sort((a: Conversation, b: Conversation) => 
    new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );

  // Select first conversation by default if none is selected
  useEffect(() => {
    if (sortedConversations.length > 0 && !selectedConversationId) {
      onSelectConversation(sortedConversations[0].id);
    }
  }, [sortedConversations, selectedConversationId, onSelectConversation]);

  if (isLoading) {
    return (
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Input placeholder="Loading conversations..." disabled />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search messages"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <i className="fas fa-search"></i>
          </div>
        </div>
      </div>
      <ScrollArea className="h-[calc(600px-64px)]">
        {sortedConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? "No matching conversations" : "No conversations yet"}
          </div>
        ) : (
          sortedConversations.map((conversation: Conversation) => (
            <div
              key={conversation.id}
              className={`p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                selectedConversationId === conversation.id ? "bg-gray-50 dark:bg-gray-700" : ""
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-center">
                <div className="relative">
                  {conversation.otherParticipant.profileImage ? (
                    <img
                      src={conversation.otherParticipant.profileImage}
                      alt={conversation.otherParticipant.fullName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {conversation.otherParticipant.fullName.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium truncate">
                      {conversation.otherParticipant.fullName}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {conversation.lastMessageAt 
                        ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true }) 
                        : ""}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {conversation.lastMessage?.content || "Start a conversation"}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
}
