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

// Add new interface for Line Contact
interface LineContact {
  userId: string;
  displayName: string;
  pictureUrl: string;
  statusMessage: string;
  lastMessage: string;
  lastMessageAt: Date;
}

const LinePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<LineContact | null>(null);
  const [contacts, setContacts] = useState<LineContact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputMessage, setInputMessage] = useState("");

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contacts/line');
        const data = await response.json();
        setContacts(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setContacts([]);
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Fetch messages when a contact is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact) return;
      
      try {
        const response = await fetch('/api/messages/line');
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [selectedContact]);

  const filteredContacts = contacts.filter(contact =>
    contact.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!selectedContact || !inputMessage.trim()) {
      alert('Please select a contact and enter a message');
      return;
    }

    const messageData = {
      message: inputMessage,
      userId: selectedContact.userId,
      messageType: 'bot',
      replyTo: selectedContact.userId
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
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r">
        <Card className="h-full">
          <CardHeader className="p-4">
            <CardTitle className="text-xl">Inbox</CardTitle>
            <CardDescription>Newest ↑</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="mb-4">
              <input
                type="search"
                placeholder="Search contacts..."
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <ul className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
              {filteredContacts.map((contact) => (
                <li
                  key={contact.userId}
                  className={`flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {contact.pictureUrl ? (
                        <img 
                          src={contact.pictureUrl} 
                          alt={contact.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-xs">LINE</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{contact.displayName}</p>
                      <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                    </div>
                  </div>
                  {contact.lastMessageAt && (
                    <p className="text-xs text-gray-400 ml-2 flex-shrink-0">
                      {new Date(contact.lastMessageAt).toLocaleDateString()} {new Date(contact.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="w-full md:w-2/3 lg:w-3/4 p-4">
        <Card className="h-full">
          <CardContent className="flex flex-col h-[calc(100vh-2rem)]">
            {/* Chat Room Title with Contact Name */}
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4 flex flex-col-reverse">
              {selectedContact && messages.length > 0 ? (
                messages
                  .filter(msg => {
                    return (
                      (msg.messageType === 'user' && msg.userId === selectedContact.userId) || 
                      (msg.messageType === 'bot' && msg.replyTo === selectedContact.userId)
                    );
                  })
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((msg) => (
                    <div
                      key={msg.id}
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

            {/* Input Box */}
            {selectedContact && (
              <div className="flex items-center space-x-3 border-t p-4">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={handleSendMessage}
                >
                  Send
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LinePage;