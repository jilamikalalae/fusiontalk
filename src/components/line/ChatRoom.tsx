"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineContact, Message } from "@/lib/types";

interface ChatRoomProps {
  selectedContact: LineContact | null;
  messages: Message[];
  inputMessage: string;
  onInputChange: (message: string) => void;
  onSendMessage: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  selectedContact,
  messages,
  inputMessage,
  onInputChange,
  onSendMessage,
}) => {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col h-[calc(100vh-2rem)]">
        {selectedContact && (
          <div className="flex items-center p-4 border-b">
            <div className="w-10 h-10 bg-green-500 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden mr-3">
              {selectedContact.pictureUrl ? (
                <img 
                  src={selectedContact.pictureUrl} 
                  alt={selectedContact.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-xs">LINE</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold truncate">{selectedContact.displayName}</h2>
              {selectedContact.statusMessage && (
                <p className="text-sm text-gray-500 truncate">{selectedContact.statusMessage}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 p-4 flex flex-col-reverse">
          {selectedContact && messages.length > 0 ? (
            messages
              .filter(msg => msg.userId === selectedContact.userId)
              .flatMap(doc => doc.messages)
              .sort((a, b) => (b?.createdAt ? new Date(b.createdAt).getTime() : 0) - (a?.createdAt ? new Date(a.createdAt).getTime() : 0))
              .filter((msg): msg is { _id: string; content: string; messageType: "user" | "bot"; createdAt: Date } => msg !== undefined)
              .map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg.messageType === 'bot' ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-lg ${
                      msg.messageType === 'bot' ? "bg-blue-500 text-white" : "bg-gray-200"
                    }`}
                  >
                    <span className="text-xs text-gray-400 block mb-1">
                      {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="break-words">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center text-gray-500">
              {selectedContact ? "No messages yet" : "Select a contact to start chatting"}
            </div>
          )}
        </div>

        {selectedContact && (
          <div className="flex items-center space-x-3 border-t p-4">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onSendMessage();
                }
              }}
            />
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={onSendMessage}
            >
              Send
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatRoom; 