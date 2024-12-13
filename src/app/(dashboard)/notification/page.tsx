"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Message {
  id: number;
  name: string;
  preview: string;
  time: string;
  isUnread?: boolean;
  type: "line" | "messenger";
}

interface ChatMessage {
  id: number;
  sender: "user" | "recipient";
  text: string;
  time: string;
}

const inboxMessages: Message[] = [
  {
    id: 1,
    name: "John Doe",
    preview: "Hey, how are you?",
    time: "10:30 AM",
    isUnread: true,
    type: "messenger"
  },
  {
    id: 2,
    name: "Jane Smith",
    preview: "Meeting at 2 PM",
    time: "9:45 AM",
    type: "line"
  },
  {
    id: 3,
    name: "Mike Johnson",
    preview: "Please check the docs",
    time: "Yesterday",
    type: "messenger"
  },
  {
    id: 4,
    name: "Sarah Wilson",
    preview: "Thanks for your help!",
    time: "Yesterday",
    isUnread: true,
    type: "line"
  },
];

// Add sample chat messages
const chatMessagesData: Record<number, ChatMessage[]> = {
  1: [
    { id: 1, sender: "recipient", text: "Hey, how are you?", time: "10:30 AM" },
    { id: 2, sender: "user", text: "I'm good, thanks! How about you?", time: "10:31 AM" },
    { id: 3, sender: "recipient", text: "Doing great! Want to grab lunch?", time: "10:32 AM" },
  ],
  2: [
    { id: 1, sender: "recipient", text: "Meeting at 2 PM", time: "9:45 AM" },
    { id: 2, sender: "user", text: "Sure, I'll be there", time: "9:46 AM" },
  ],
  // Add more chat histories for other contacts...
};

const NotiPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "line" | "messenger">("all");
  const [selectedContact, setSelectedContact] = useState<Message | null>(null);

  const filteredMessages = inboxMessages.filter((message) => {
    const nameMatches = message.name.toLowerCase().includes(searchQuery.toLowerCase());
    const typeMatches = selectedType === "all" || message.type === selectedType;
    return nameMatches && typeMatches;
  });

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r">
        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription>Newest ↑</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Bar */}
              <input
                type="search"
                placeholder="Search contacts..."
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              {/* Filter Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedType("all")}
                  className={`px-3 py-1 rounded-lg ${
                    selectedType === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedType("line")}
                  className={`px-3 py-1 rounded-lg ${
                    selectedType === "line"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  Line
                </button>
                <button
                  onClick={() => setSelectedType("messenger")}
                  className={`px-3 py-1 rounded-lg ${
                    selectedType === "messenger"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  Messenger
                </button>
              </div>
            </div>

            <ul className="space-y-3 mt-4">
              {filteredMessages.map((message) => (
                <li
                  key={message.id}
                  className={`flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer ${
                    message.isUnread ? "font-bold" : ""
                  } ${selectedContact?.id === message.id ? "bg-gray-200" : ""}`}
                  onClick={() => setSelectedContact(message)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      message.type === "line" ? "bg-green-500" : "bg-blue-600"
                    }`}>
                      <span className="text-white text-xs">
                        {message.type === "line" ? "LINE" : "MSG"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{message.name}</p>
                      <p className="text-sm text-gray-500">{message.preview}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{message.time}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="w-3/4 p-6">
        <Card className="h-full">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedContact.type === "line" ? "bg-green-500" : "bg-blue-600"
                  }`}>
                    <span className="text-white text-xs">
                      {selectedContact.type === "line" ? "LINE" : "MSG"}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-semibold">{selectedContact.name}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedContact.type === "line" ? "Line Chat" : "Messenger Chat"}
                    </p>
                  </div>
                </div>
              </div>

              <CardContent className="flex flex-col h-[calc(100%-80px)] justify-between">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 p-4">
                  {selectedContact && chatMessagesData[selectedContact.id] ? (
                    chatMessagesData[selectedContact.id].map((msg) => (
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
                          <p>{msg.text}</p>
                          <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">No messages yet</div>
                  )}
                </div>

                {/* Input Box */}
                <div className="flex items-center space-x-3 border-t p-3">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Send
                  </button>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a contact to start chatting
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default NotiPage;
