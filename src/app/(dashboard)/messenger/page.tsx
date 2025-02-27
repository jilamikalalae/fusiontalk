'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { MessageType } from '@/enum/enum';
import Modal from '@/components/account/modal';
import { useRouter } from 'next/navigation';

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
  messageType: MessageType;
  timestamp: string;
  isRead: boolean;
}

interface NewMessage {
  _id: string;
  recipientId: string;
  content: string;
  messageType: MessageType;
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Check Messenger connection first
  useEffect(() => {
    const checkMessengerConnection = async () => {
      try {
        const response = await fetch('/api/users/v2');
        const userData = await response.json();

        if (!userData.isMessengerConnected) {
          setIsModalOpen(true);
          setLoading(false);
          return;
        }
        
        setIsConnected(true);
        setLoading(false);
      } catch (error) {
        console.error('Error checking Messenger connection:', error);
        setLoading(false);
      }
    };

    checkMessengerConnection();
  }, []);

  // Only fetch contacts if connected
  useEffect(() => {
    if (!isConnected) return;

    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/meta/contacts');
        const data = await response.json();
        setContacts(data || []);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setContacts([]);
      }
    };

    fetchContacts();

    const intervalId = setInterval(fetchContacts, 3000); // Poll every 3 seconds
    return () => clearInterval(intervalId);
  }, [isConnected]);

  // Only fetch messages if connected and contact selected
  useEffect(() => {
    if (!isConnected || !selectedContact) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `/api/meta/messages/${selectedContact.userId}`
        );
        const data = await response.json();
        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    const intervalId = setInterval(fetchMessages, 5000);
    return () => clearInterval(intervalId);
  }, [selectedContact, isConnected]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    const timestamp = new Date();

    // Create temporary message for immediate display
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      senderId: 'page',
      recipientId: selectedContact.userId,
      senderName: 'Page',
      content: newMessage,
      messageType: MessageType.OUTGOING,
      timestamp: timestamp.toISOString(),
      isRead: false
    };

    // Optimistically add message to UI
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage('');

    try {
      const dbResponse = await fetch('/api/meta/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: selectedContact.userId,
          content: newMessage
        })
      });

      if (!dbResponse.ok) {
        throw new Error('Failed to send message');
      }

      // Fetch updated messages
      const messagesResponse = await fetch(
        `/api/meta/messages/${selectedContact.userId}`
      );
      if (!messagesResponse.ok) {
        throw new Error('Failed to fetch updated messages');
      }

      const updatedMessages = await messagesResponse.json();
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temporary message if send failed
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
    }
  };

  const handleModalConfirm = () => {
    router.push('/account');
  };

  const filteredContacts = contacts.filter((contact) =>
    `${contact.firstName} ${contact.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        title="Messenger Connection Required"
        message="Please connect your Messenger account to access the chat features. Would you like to go to the account settings page?"
        confirmText="Go to Settings"
        onConfirm={handleModalConfirm}
      />
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div>Loading...</div>
        </div>
      ) : (
        // Only show the messenger interface if connected
        isConnected && (
          <div className="flex h-screen bg-gray-100">
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
                            <p className="text-sm text-gray-500">
                              Last active:{' '}
                              {new Date(contact.lastInteraction).toLocaleDateString()}
                            </p>
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
                    {/* Profile Header */}
                    <div className="flex items-center p-4 border-b">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden mr-3">
                        {selectedContact.profilePic ? (
                          <img
                            src={selectedContact.profilePic}
                            alt={`${selectedContact.firstName} ${selectedContact.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-xs">IMG</span>
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold truncate">{`${selectedContact.firstName} ${selectedContact.lastName}`}</h2>
                      </div>
                    </div>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto space-y-4 p-4">
                      {messages.map((msg) => (
                        <div
                          key={msg._id}
                          className={`flex ${msg.messageType === MessageType.OUTGOING ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-sm p-3 rounded-lg ${
                              msg.messageType === MessageType.OUTGOING
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200'
                            }`}
                          >
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
                          if (e.key === 'Enter') {
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
        )
      )}
    </>
  );
};

export default MessengerPage;
