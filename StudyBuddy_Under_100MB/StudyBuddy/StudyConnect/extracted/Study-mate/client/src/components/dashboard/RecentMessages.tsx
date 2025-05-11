import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useChatState } from "@/lib/utils/chat";

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

export default function RecentMessages() {
  const { openChat } = useChatState();
  
  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="bg-white p-6 h-96 overflow-y-auto">
          <ul className="divide-y divide-gray-200">
            {[1, 2, 3].map((i) => (
              <li key={i} className="py-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-3 w-16 mb-2" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const formatMessageTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return "recently";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Recent Messages</h2>
          <a href="/messages" className="text-primary hover:text-primary-600 text-sm">View All</a>
        </div>
      </div>
      <div className="bg-white p-6 h-96 overflow-y-auto">
        {conversations?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet</p>
            <a href="/find-tutors" className="mt-2 inline-block text-primary hover:underline">Find tutors to message</a>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {conversations?.map((conversation) => (
              <li 
                key={conversation.otherUser.id} 
                className="py-4 cursor-pointer hover:bg-gray-50 px-2 rounded transition duration-150"
                onClick={() => openChat(conversation.otherUser.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="relative flex-shrink-0">
                    <img 
                      className="h-12 w-12 rounded-full" 
                      src={conversation.otherUser.profileImageUrl || "https://via.placeholder.com/48?text=U"} 
                      alt={`${conversation.otherUser.name}'s profile`}
                    />
                    <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${
                      conversation.otherUser.isOnline ? "bg-secondary" : "bg-gray-300"
                    }`}></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.otherUser.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {formatMessageTime(conversation.lastMessage.timestamp)}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="text-xs px-1.5 py-0.5 bg-primary text-white rounded-full mt-1">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
