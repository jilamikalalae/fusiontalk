"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Message } from "@/lib/types";

const LinePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Message | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/messages/line');
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const filteredMessages = Array.isArray(messages) 
    ? messages
        .filter(message => 
          message.messageType === 'user' && 
          message.userName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  const handleSendMessage = async () => {
    if (!selectedContact || !inputMessage.trim()) {
      alert('Please select a contact and enter a message');
      return;
    }

    const messageData = {
      message: inputMessage,
      userId: selectedContact.userId
    };
    
    console.log('Sending message data:', messageData);

    try {
      const response = await fetch('/api/line', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error('Failed to send message');
      }

      setInputMessage('');
      
      const messagesResponse = await fetch('/api/messages/line');
      const newMessages = await messagesResponse.json();
      setMessages(Array.isArray(newMessages) ? newMessages : []);

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

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
              {Array.from(new Set(filteredMessages.map(message => message.userId)))
                .map(userId => {
                  const userMessages = filteredMessages.filter(message => message.userId === userId);
                  const latestMessage = userMessages[0];

                  return (
                    <li
                      key={userId}
                      className={`flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer ${
                        latestMessage.isUnread ? "font-bold" : ""
                      }`}
                      onClick={() => setSelectedContact(latestMessage)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full" />
                        <div>
                          <p className="font-medium">{latestMessage.userName}</p>
                          <p className="text-sm text-gray-500">{latestMessage.content}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(latestMessage.createdAt).toLocaleString()}
                      </p>
                    </li>
                  );
                })}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="w-3/4 p-6">
        <Card className="h-full">
          <CardContent className="flex flex-col h-full justify-between">
            {/* Chat Room Title with Contact Name */}
            {selectedContact && (
              <div className="flex items-center mb-4">
                <img
                  src={selectedContact.pictureUrl}
                  alt={`${selectedContact.displayName}'s profile`}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <h2 className="text-xl font-bold">{selectedContact.displayName}</h2>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 flex flex-col-reverse">
              {selectedContact && messages.length > 0 ? (
                messages
                  .filter(msg => {
                    // Show messages between the selected contact and BOT
                    return (
                      msg.userId === selectedContact.userId || 
                      (msg.userId === 'BOT' && msg.replyTo === selectedContact.userId)
                    );
                  })
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        (msg.messageType === 'bot' || msg.userId === 'BOT') ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-sm p-3 rounded-lg ${
                          (msg.messageType === 'bot' || msg.userId === 'BOT') ? "bg-blue-500 text-white" : "bg-gray-200"
                        }`}
                      >
                        {msg.content}
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
                placeholder="Type"
                className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LinePage;
