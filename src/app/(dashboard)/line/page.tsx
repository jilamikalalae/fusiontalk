"use client";
import React, { useState, useEffect } from "react";
import ContactsList from "@/components/line/ContactsList";
import ChatRoom from "@/components/line/ChatRoom";
import { LineContact, Message } from "@/lib/types";

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
        const response = await fetch(`/api/messages/line?userId=${selectedContact.userId}`);
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [selectedContact]);

  const handleSendMessage = async () => {
    if (!selectedContact || !inputMessage.trim()) {
      alert('Please select a contact and enter a message');
      return;
    }

    const messageData = {
      userId: selectedContact.userId,
      userName: selectedContact.displayName,
      message: inputMessage,
      messageType: 'user'
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
      
      const messagesResponse = await fetch(`/api/messages/line?userId=${selectedContact.userId}`);
      const newMessages = await messagesResponse.json();
      setMessages(Array.isArray(newMessages) ? newMessages : []);

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r">
        <ContactsList
          contacts={contacts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectContact={setSelectedContact}
        />
      </div>
      <div className="w-full md:w-2/3 lg:w-3/4 p-4">
        <ChatRoom
          selectedContact={selectedContact}
          messages={messages}
          inputMessage={inputMessage}
          onInputChange={setInputMessage}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default LinePage;