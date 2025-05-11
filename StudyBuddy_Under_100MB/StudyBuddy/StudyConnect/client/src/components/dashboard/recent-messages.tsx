import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChatModal } from "@/components/chat/chat-modal";

interface User {
  id: number;
  fullName: string;
  profileImage?: string;
}

interface Message {
  id: number;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

interface RecentMessagesProps {
  conversations: Conversation[];
  onConversationOpen: (userId: number) => void;
}

export function RecentMessages({ conversations, onConversationOpen }: RecentMessagesProps) {
  const [activeChat, setActiveChat] = useState<User | null>(null);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const handleOpenChat = (user: User) => {
    setActiveChat(user);
    onConversationOpen(user.id);
  };

  const handleCloseChat = () => {
    setActiveChat(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Messages</h2>
            <a href="/messages" className="text-primary hover:text-primary-600 text-sm">View All</a>
          </div>
        </div>
        <div className="bg-white p-6 h-96 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p>No conversations yet</p>
              <a href="/find-tutors" className="mt-2 text-primary hover:underline">
                Find a tutor to message
              </a>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {conversations.map((conversation) => (
                <li 
                  key={conversation.user.id} 
                  className="py-4 cursor-pointer hover:bg-gray-50 px-2 rounded transition duration-150"
                  onClick={() => handleOpenChat(conversation.user)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-12 w-12">
                        {conversation.user.profileImage ? (
                          <AvatarImage src={conversation.user.profileImage} alt={conversation.user.fullName} />
                        ) : (
                          <AvatarFallback>
                            {getInitials(conversation.user.fullName)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-500"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.user.fullName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {formatTime(conversation.lastMessage.timestamp)}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge className="mt-1 px-1.5 py-0.5 bg-primary text-white">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {activeChat && (
        <ChatModal
          user={activeChat}
          isOpen={!!activeChat}
          onClose={handleCloseChat}
        />
      )}
    </>
  );
}
