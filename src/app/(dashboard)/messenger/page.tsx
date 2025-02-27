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
  const [showContacts, setShowContacts] = useState(true);

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

  // On mobile, when a contact is selected, hide the contacts list
  useEffect(() => {
    if (selectedContact && window.innerWidth < 768) {
      setShowContacts(false);
    }
  }, [selectedContact]);

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    if (window.innerWidth < 768) {
      setShowContacts(false);
    }
  };

  const handleBackToContacts = () => {
    setShowContacts(true);
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
          <div className="flex flex-col md:flex-row h-screen bg-gray-100">
            {/* Contacts List - Full screen on mobile when showing contacts */}
            <div 
              className={`${
                showContacts ? 'block' : 'hidden'
              } md:block w-full md:w-1/3 lg:w-1/4 bg-white border-r h-screen md:h-auto`}
            >
              <Card className="h-full border-0 md:border rounded-none md:rounded-lg">
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
                        key={contact._id}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleContactClick(contact)}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
                          {contact.profilePic ? (
                            <img
                              src={contact.profilePic}
                              alt={`${contact.firstName}'s profile`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = '';
                                target.parentElement!.innerHTML = `<span class="text-gray-600 text-sm font-medium">${contact.firstName?.[0] || 'U'}</span>`;
                              }}
                            />
                          ) : (
                            <span className="text-gray-600 text-sm font-medium">
                              {contact.firstName?.[0] || 'U'}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {contact.firstName} {contact.lastName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {contact.lastInteraction || 'No messages yet'}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area - Full screen on mobile when a contact is selected */}
            <div 
              className={`${
                !showContacts ? 'block' : 'hidden'
              } md:block w-full md:w-2/3 lg:w-3/4 h-screen md:h-auto`}
            >
              <Card className="h-full border-0 md:border rounded-none md:rounded-lg">
                {selectedContact ? (
                  <CardContent className="flex flex-col h-screen md:h-[calc(100vh-2rem)] p-0">
                    {/* Chat Header with Back Button */}
                    <div className="flex items-center p-4 border-b">
                      {/* Back button - Only visible on mobile */}
                      <button 
                        className="md:hidden mr-2 p-1 rounded-full hover:bg-gray-200"
                        onClick={handleBackToContacts}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center mr-3">
                        {selectedContact.profilePic ? (
                          <img
                            src={selectedContact.profilePic}
                            alt={`${selectedContact.firstName}'s profile`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = '';
                              target.parentElement!.innerHTML = `<span class="text-gray-600 text-sm font-medium">${selectedContact.firstName?.[0] || 'U'}</span>`;
                            }}
                          />
                        ) : (
                          <span className="text-gray-600 text-sm font-medium">
                            {selectedContact.firstName?.[0] || 'U'}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h2 className="font-semibold">
                          {selectedContact.firstName} {selectedContact.lastName}
                        </h2>
                      </div>
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
                      {messages.length > 0 ? (
                        messages.map((msg) => (
                          <div
                            key={msg._id}
                            className={`flex ${msg.messageType === MessageType.OUTGOING ? 'justify-end' : 'justify-start'} mb-1`}
                          >
                            <div
                              className={`max-w-[75%] p-3 rounded-lg ${
                                msg.messageType === MessageType.OUTGOING
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200'
                              }`}
                            >
                              <p className="break-words">{msg.content}</p>
                              <div className={`text-xs mt-1 ${
                                msg.messageType === MessageType.OUTGOING ? "text-white/80" : "text-gray-500"
                              }`}>
                                {new Date(msg.timestamp).toLocaleString('en-US', {
                                  hour: 'numeric',
                                  minute: 'numeric',
                                  hour12: true,
                                  month: 'numeric',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500">
                          No messages yet. Start a conversation!
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input Box */}
                    <div className="flex items-center space-x-3 border-t p-4">
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
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        onClick={handleSendMessage}
                      >
                        Send
                      </button>
                    </div>
                  </CardContent>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 p-4">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-lg font-medium">Select a contact to start messaging</p>
                      <p className="text-sm mt-2">Your conversations will appear here</p>
                    </div>
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
