"use client";
import React, { useState, useEffect } from "react";
import LineContactList from "@/components/line/LineContact";
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
        
        // Fetch all messages first
        const messagesResponse = await fetch('/api/messages/line');
        const allMessages = await messagesResponse.json();
        const messageArray = Array.isArray(allMessages) ? allMessages : [];
        
        // Process contacts with their latest messages
        const contactsWithMessages = (Array.isArray(data) ? data : []).map((contact) => {
          // Find the latest message for this contact
          const contactMessages = messageArray.filter(msg => 
            (msg.messageType === 'user' && msg.userId === contact.userId) || 
            (msg.messageType === 'bot' && msg.replyTo === contact.userId)
          );
          
          const latestMessage = contactMessages.length > 0 
            ? contactMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
            : null;
          
          return {
            ...contact,
            lastMessage: latestMessage ? latestMessage.content : '',
            lastMessageAt: latestMessage ? latestMessage.createdAt : null
          };
        });

        setContacts(contactsWithMessages);
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

    const intervalId = setInterval(fetchMessages, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [selectedContact]);

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
      <LineContactList
        contacts={contacts}
        searchQuery={searchQuery}
        onContactSelect={setSelectedContact}
        onSearchChange={setSearchQuery}
      />
      <ChatRoom
        selectedContact={selectedContact}
        messages={messages}
        inputMessage={inputMessage}
        onInputChange={setInputMessage}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default LinePage;
