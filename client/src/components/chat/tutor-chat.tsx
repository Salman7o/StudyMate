
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TutorChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4">
      {isOpen ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-80">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold dark:text-white">Chat</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
          <div className="h-80 overflow-y-auto border dark:border-gray-700 rounded p-2 mb-4">
            {/* Chat messages will go here */}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 rounded border dark:border-gray-700 dark:bg-gray-900 dark:text-white p-2"
              placeholder="Type a message..."
            />
            <Button size="sm">Send</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setIsOpen(true)} className="rounded-full w-12 h-12 flex items-center justify-center">
          <i className="fas fa-comment"></i>
        </Button>
      )}
    </div>
  );
}
