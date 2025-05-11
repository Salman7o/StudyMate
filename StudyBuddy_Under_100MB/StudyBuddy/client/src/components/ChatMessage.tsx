import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Message } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export default function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  // Fetch sender details
  const { data: sender } = useQuery({
    queryKey: [`/api/users/${message.senderId}`],
  });

  const messageTime = new Date(message.createdAt);
  
  return (
    <div
      className={cn(
        "flex w-max max-w-[75%] flex-col gap-2",
        isCurrentUser ? "ml-auto" : "mr-auto"
      )}
    >
      <div className={cn("flex items-end gap-2", isCurrentUser && "flex-row-reverse")}>
        <Avatar className="h-6 w-6">
          <AvatarImage src={sender?.profileImage || ""} alt={sender?.username || ""} />
          <AvatarFallback>
            {sender?.firstName?.[0] || ""}{sender?.lastName?.[0] || ""}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            isCurrentUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          {message.content}
        </div>
      </div>
      <span
        className={cn(
          "text-xs text-muted-foreground",
          isCurrentUser ? "text-right" : "text-left"
        )}
      >
        {format(messageTime, "h:mm a")}
      </span>
    </div>
  );
}
