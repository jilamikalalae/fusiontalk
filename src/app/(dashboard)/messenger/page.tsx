"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { inboxMessages, type Message, type ChatMessage } from "@/lib/store/messages";

interface Participant {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  participants: {
    data: Participant[];
  };
  messages: {
    data: ChatMessage[];
  };
}

const MessengerPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/meta");
        const data = await response.json();
        setContacts(data.data || []);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setMessages(contact.messages.data || []);
  };
  

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;
  
    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  
    const newChatMessage: ChatMessage = {
      id: messages.length + 1,
      sender: "user",
      text: newMessage,
      time: currentTime,
      status: "sending",
    };
  
    setMessages([...messages, newChatMessage]);
  
    try {
      const response = await fetch("/api/meta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: selectedContact.participants.data[0].id,
          messageText: newMessage,
        }),
      });
  
      if (response.ok) {
        setMessages(messages.map((msg) =>
          msg.id === newChatMessage.id ? { ...msg, status: "sent" } : msg
        ));
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  
    setNewMessage("");
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.participants.data[0].name.toLowerCase().includes(searchQuery.toLowerCase())
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
                  key={contact.id}
                  className="flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer"
                  onClick={() => handleContactClick(contact)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">MSG</span>
                    </div>
                    <div>
                      <p className="font-medium">{contact.participants.data[0].name}</p>
                      <p className="text-sm text-gray-500">ID: {contact.participants.data[0].id}</p>
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
              <div className="flex-1 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex justify-start">
                    <div className="max-w-sm p-3 rounded-lg bg-gray-200">
                      <p>{msg.message}</p>
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
