import { create } from 'zustand';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface ChatState {
  isOpen: boolean;
  chatUserId: number | null;
  websocket: WebSocket | null;
  openChat: (userId: number) => void;
  closeChat: () => void;
  setWebsocket: (ws: WebSocket | null) => void;
}

// Create a store for chat state
export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  chatUserId: null,
  websocket: null,
  openChat: (userId) => set({ isOpen: true, chatUserId: userId }),
  closeChat: () => set({ isOpen: false }),
  setWebsocket: (ws) => set({ websocket: ws }),
}));

// Hook to manage chat state and websocket connection
export function useChatState() {
  const { user } = useAuth();
  const { isOpen, chatUserId, websocket, openChat, closeChat, setWebsocket } = useChatStore();

  // Set up WebSocket connection
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      // Authenticate WebSocket connection
      ws.send(JSON.stringify({
        type: "auth",
        userId: user.id,
      }));
      setWebsocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Handle different message types
      if (data.type === "message" && data.message) {
        // Notify and update queries handled by React Query elsewhere
      } else if (data.type === "user_status") {
        // Update user status
      }
    };

    ws.onclose = () => {
      setWebsocket(null);
    };

    return () => {
      ws.close();
      setWebsocket(null);
    };
  }, [user, setWebsocket]);

  return {
    isOpen,
    chatUserId,
    websocket,
    openChat,
    closeChat,
  };
}

// Hook to get unread message count for a user
export function useUnreadMessageCount(userId?: number) {
  const { user } = useAuth();
  
  const { data: conversations } = useQuery<any[]>({
    queryKey: ["/api/conversations"],
    enabled: !!user,
  });
  
  if (!userId || !conversations) return 0;
  
  const conversation = conversations.find(c => c.otherUser.id === userId);
  return conversation ? conversation.unreadCount : 0;
}
