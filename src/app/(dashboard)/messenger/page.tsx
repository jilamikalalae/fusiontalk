"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { inboxMessages, chatMessagesData, type Message, type ChatMessage } from "@/lib/store/messages";

const MessengerPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<Record<number, ChatMessage[]>>(chatMessagesData);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Simulate typing indicator
  useEffect(() => {
    let typingTimer: NodeJS.Timeout;
    if (newMessage) {
      setIsTyping(true);
      typingTimer = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    } else {
      setIsTyping(false);
    }
    return () => clearTimeout(typingTimer);
  }, [newMessage]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;

    const currentTime = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const newChatMessage: ChatMessage = {
      id: chatMessages[selectedContact.id]?.length + 1 || 1,
      sender: "user",
      text: newMessage,
      time: currentTime,
      status: "sending"
    };

    // Update chat messages
    setChatMessages(prev => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newChatMessage]
    }));

    // Clear input
    setNewMessage("");

    // Simulate message status updates
    setTimeout(() => {
      setChatMessages(prev => ({
        ...prev,
        [selectedContact.id]: prev[selectedContact.id].map(msg => 
          msg.id === newChatMessage.id ? { ...msg, status: "sent" } : msg
        )
      }));
    }, 500);

    setTimeout(() => {
      setChatMessages(prev => ({
        ...prev,
        [selectedContact.id]: prev[selectedContact.id].map(msg => 
          msg.id === newChatMessage.id ? { ...msg, status: "delivered" } : msg
        )
      }));
    }, 1000);

    // Simulate recipient reading the message
    setTimeout(() => {
      setChatMessages(prev => ({
        ...prev,
        [selectedContact.id]: prev[selectedContact.id].map(msg => 
          msg.id === newChatMessage.id ? { ...msg, status: "read" } : msg
        )
      }));
    }, 2000);
  };

  const filteredMessages = inboxMessages
    .filter((message) => message.type === "messenger")
    .filter((message) => 
      message.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <div className="mb-4">
              <input
                type="search"
                placeholder="Search contacts..."
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <ul className="space-y-3">
              {filteredMessages.map((message) => (
                <li
                  key={message.id}
                  className={`flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer ${
                    message.isUnread ? "font-bold" : ""
                  } ${selectedContact?.id === message.id ? "bg-gray-200" : ""}`}
                  onClick={() => setSelectedContact(message)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">MSG</span>
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
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">MSG</span>
                  </div>
                  <div>
                    <h2 className="font-semibold">{selectedContact.name}</h2>
                    <p className="text-sm text-gray-500">Messenger Chat</p>
                  </div>
                </div>
              </div>

              <CardContent className="flex flex-col h-[calc(100%-80px)] justify-between">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4">
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
                          <div className="flex items-center justify-end space-x-1 text-xs mt-1">
                            <span className="opacity-70">{msg.time}</span>
                            {msg.sender === "user" && msg.status && (
                              <span className="opacity-70">
                                {msg.status === "sending" && "●"}
                                {msg.status === "sent" && "✓"}
                                {msg.status === "delivered" && "✓✓"}
                                {msg.status === "read" && (
                                  <span className="text-blue-300">✓✓</span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">No messages yet</div>
                  )}
                  {isTyping && selectedContact && (
                    <div className="flex justify-start">
                      <div className="bg-gray-200 p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Box */}
                <div className="flex items-center space-x-3 border-t p-3">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                  />
                  <button 
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !selectedContact}
                  >
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

export default MessengerPage;
