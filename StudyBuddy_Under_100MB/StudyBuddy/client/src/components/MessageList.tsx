import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ConversationWithUser {
  user: {
    id: number;
    fullName: string;
    profileImage?: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isRead: boolean;
    senderId: number;
  };
}

const MessageList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location] = useLocation();
  const userId = parseInt(location.split('/').pop() || "0");
  
  const { data: conversations = [], isLoading } = useQuery<ConversationWithUser[]>({
    queryKey: ["/api/conversations"],
  });
  
  const filteredConversations = conversations.filter(convo => 
    convo.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="h-full flex flex-col border-r">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search messages..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? "No matching conversations found" : "No conversations yet"}
          </div>
        ) : (
          <ul>
            {filteredConversations.map(convo => (
              <li key={convo.user.id}>
                <Link href={`/messages/${convo.user.id}`}>
                  <a className={`
                    flex items-start space-x-3 p-4 hover:bg-gray-50 transition-colors
                    ${userId === convo.user.id ? "bg-gray-100" : ""}
                    ${!convo.lastMessage.isRead && convo.lastMessage.senderId !== convo.user.id ? "bg-blue-50" : ""}
                  `}>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={convo.user.profileImage} alt={convo.user.fullName} />
                      <AvatarFallback>{convo.user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className={`font-medium truncate ${!convo.lastMessage.isRead && convo.lastMessage.senderId !== convo.user.id ? "font-bold" : ""}`}>
                          {convo.user.fullName}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(convo.lastMessage.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {convo.lastMessage.content}
                      </p>
                    </div>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MessageList;
