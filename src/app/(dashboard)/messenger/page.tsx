"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Participant {
  userId: string;
  firstName: string;
  lastName: string;
  profilePic: string;
}

interface Message {
  _id: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  content: string;
  messageType: 'user' | 'page';
  timestamp: string;
  isRead: boolean;
}

interface Contact {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  lastInteraction: string;
}

const MessengerPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch("/api/meta/contacts");
        const data = await response.json();
        setContacts(data || []);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts();
  }, []);

  // Fetch messages when a contact is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact) return;
      
      try {
        const response = await fetch(`/api/meta/messages?userId=${selectedContact.userId}`);
        const data = await response.json();
        setMessages(data || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Set up polling for new messages
    const intervalId = setInterval(fetchMessages, 5000);
    return () => clearInterval(intervalId);
  }, [selectedContact]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    // Create temporary message for immediate display
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      senderId: 'page',
      recipientId: selectedContact.userId,
      senderName: 'Page',
      content: newMessage,
      messageType: 'page',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    // Optimistically add message to UI
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const response = await fetch("/api/meta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: selectedContact.userId,
          messageText: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Fetch updated messages
      const messagesResponse = await fetch(`/api/meta/messages?userId=${selectedContact.userId}`);
      const updatedMessages = await messagesResponse.json();
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally remove the temporary message if send failed
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/4 bg-white border-r">
        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
            <CardDescription>Select a contact to view messages</CardDescription>
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
              {filteredContacts.map((contact) => (
                <li
                  key={contact._id}
                  className="flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer"
                  onClick={() => handleContactClick(contact)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img 
                        src={contact.profilePic} 
                        alt={`${contact.firstName}'s profile`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{`${contact.firstName} ${contact.lastName}`}</p>
                      <p className="text-sm text-gray-500">Last active: {new Date(contact.lastInteraction).toLocaleDateString()}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="w-3/4 p-6">
        <Card className="h-full">
          {selectedContact ? (
            <CardContent className="flex flex-col h-full justify-between">
              <div className="flex-1 overflow-y-auto space-y-4 p-4">
                {messages.map((msg) => (
                  <div 
                    key={msg._id} 
                    className={`flex ${msg.messageType === 'page' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-sm p-3 rounded-lg ${
                      msg.messageType === 'page' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}>
                      <p>{msg.content}</p>
                      <span className="text-xs opacity-75">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

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
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a contact to view messages
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MessengerPage;
