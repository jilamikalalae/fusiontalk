"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { X } from "lucide-react";

interface Message {
  id: number;
  name: string;
  preview: string;
  time: string;
  isUnread?: boolean;
}

interface ChatMessage {
  id: number;
  sender: "user" | "recipient";
  text: string;
  time: string;
}

const inboxMessages: Message[] = [
  { id: 1, name: "John Doe", preview: "Hello, how are you?", time: "10:30 AM", isUnread: true },
];

const chatMessages: ChatMessage[] = [
  { id: 1, sender: "user", text: "Hi there!", time: "10:32 AM" },
  { id: 2, sender: "recipient", text: "Hello! How can I help?", time: "10:33 AM" },
];

const MessengerPage: React.FC = () => {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  return (
    <div className="flex h-screen bg-gray-100 sm:pl-14">
      {/* Inbox Sidebar */}
      <div className="w-full max-w-md bg-white border-r fixed left-14 top-0 bottom-0">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription>Newest ↑</CardDescription>
          </CardHeader>
          <CardContent className="overflow-y-auto flex-1">
            <ul className="space-y-3">
              {inboxMessages.map((message) => (
                <li
                  key={message.id}
                  className={`flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer ${
                    message.isUnread ? "font-bold" : ""
                  }`}
                  onClick={() => setSelectedMessage(message)}
                  aria-label={`Message from ${message.name}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full" />
                    <div>
                      <p className="font-medium">{message.name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {message.preview}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{message.time}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {selectedMessage ? (
        <div className="flex-1 ml-[384px]">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                <CardTitle>{selectedMessage.name}</CardTitle>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close chat"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-sm p-3 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="flex items-center space-x-3 border-t p-3 bg-white">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Type a message"
              />
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
                aria-label="Send message"
              >
                Send
              </button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="w-3/4 ml-[432px] pl-1"> {/* 432px = left-14 (56px) + max-w-md (384px) */}
          <Card className="fixed top-0 right-0 w-[calc(100%-432px)] h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                <CardTitle>Select a message</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Placeholder for when no message is selected */}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MessengerPage;
