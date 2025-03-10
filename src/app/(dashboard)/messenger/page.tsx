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
import Image from 'next/image';
import { format } from 'date-fns';

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
  contentType?: string;
  imageUrl?: string;
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
  lastMessage: string;
  lastMessageAt: string;
}

const MessengerPage: React.FC = () => {
  const router = useRouter();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const urlUserId = searchParams.get('userId');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

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
        
        // Transform data to set default names for undefined values
        const contactsWithDefaults = data.map((contact: any) => ({
          ...contact,
          firstName: contact.firstName || 'Guest',
          lastName: contact.lastName || '',
        }));
        
        setContacts(contactsWithDefaults || []);
        
        // If we have a userId in the URL, find and select that contact
        if (urlUserId && Array.isArray(data)) {
          const contactFromUrl = data.find(contact => contact.userId === urlUserId);
          if (contactFromUrl) {
            setSelectedContact(contactFromUrl);
            if (window.innerWidth < 768) {
              setShowContacts(false);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setContacts([]);
      }
    };

    fetchContacts();

    const intervalId = setInterval(fetchContacts, 3000); // Poll every 3 seconds
    return () => clearInterval(intervalId);
  }, [isConnected, urlUserId]);

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
    setMessages((prev) => [tempMessage, ...prev]);
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
      setErrorMessage(
        'Failed to send message. Your token might have expired. Please try reconnecting your Messenger account.'
      );
      setIsErrorModalOpen(true);
      // Remove the temporary message if send failed
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
    }
  };

  const handleModalConfirm = () => {
    router.push('/account');
  };

  const handleErrorModalClose = () => {
    setIsErrorModalOpen(false);
  };

  const filteredContacts = contacts.filter((contact) =>
    `${contact.firstName} ${contact.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleImageSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedContact) return;
    
    const file = e.target.files[0];
    
    // Create a temporary message with a local image preview
    const tempImageUrl = URL.createObjectURL(file);
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      senderId: 'me',
      recipientId: selectedContact.userId,
      senderName: 'You',
      content: 'Sent an image',
      messageType: MessageType.OUTGOING,
      timestamp: new Date().toISOString(),
      isRead: true,
      contentType: 'image',
      imageUrl: tempImageUrl
    };
    
    setMessages((prev) => [tempMessage, ...prev]);
    
    // Create form data for the upload
    const formData = new FormData();
    formData.append('image', file);
    formData.append('recipientId', selectedContact.userId);
    formData.append('content', 'Sent an image');
    
    try {
      const response = await fetch('/api/meta/messages', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to send image');
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
      console.error('Error sending image:', error);
      setErrorMessage(
        'Failed to send image. Your token might have expired. Please try reconnecting your Messenger account.'
      );
      setIsErrorModalOpen(true);
      // Remove the temporary message if send failed
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        title="Messenger Connection Required"
        message="Please connect your Messenger account to access the chat features. Would you like to go to the account settings page?"
        confirmText="Go to Settings"
        onConfirm={handleModalConfirm}
      />
      <Modal
        isOpen={isErrorModalOpen}
        title="Error Sending Message"
        message={errorMessage}
        confirmText="Reconnect Account"
        cancelText="Close"
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
                        className="flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer"
                        onClick={() => handleContactClick(contact)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <img
                              src={
                                contact.profilePic ||
                                'https://miro.medium.com/v2/resize:fit:720/1*W35QUSvGpcLuxPo3SRTH4w.png'
                              }
                              alt={`${contact.firstName || 'Guest'} ${contact.lastName || ''}'s profile`}
                              className="w-full h-full object-cover"
                            
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {contact.firstName || 'Guest'} {contact.lastName || ''}
                            </p>
                            {contact.lastMessage && (
                              <p className="text-sm text-gray-500 truncate">
                                {contact.lastMessage}
                              </p>
                            )}
                          </div>
                        </div>
                        {contact.lastMessageAt && (
                          <p className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {new Date(
                              contact.lastMessageAt
                            ).toLocaleDateString()}{' '}
                            {new Date(contact.lastMessageAt).toLocaleTimeString(
                              [],
                              {
                                hour: '2-digit',
                                minute: '2-digit'
                              }
                            )}
                          </p>
                        )}
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
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>

                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center mr-3">
                          <img
                          src={selectedContact.profilePic || 'https://miro.medium.com/v2/resize:fit:720/1*W35QUSvGpcLuxPo3SRTH4w.png'}
                            alt={`${selectedContact.firstName || 'Guest'} ${selectedContact.lastName || ''}'s profile`}
                            className="w-full h-full object-cover"
                          
                          />
                      
                      </div>

                      <div className="flex-1">
                        <h2 className="font-semibold">
                          {selectedContact.firstName || 'Guest'} {selectedContact.lastName || ''}
                        </h2>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
                      {messages.length > 0 ? (
                        messages.map((msg) => (
                          <div
                            key={msg._id}
                            className={`flex ${msg.messageType === MessageType.OUTGOING ? 'justify-end' : 'justify-start'} mb-4`}
                          >
                            <div
                              className={`max-w-[75%] p-3 rounded-lg ${
                                msg.messageType === MessageType.OUTGOING
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              {msg.contentType === 'image' ? (
                                <div 
                                  className="cursor-pointer" 
                                  onClick={() => handleImageClick(msg.imageUrl!)}
                                >
                                  <img
                                    src={msg.imageUrl}
                                    alt="Message attachment"
                                    className="rounded-md max-w-full max-h-60 object-contain"
                                  />
                                </div>
                              ) : (
                                <p className="break-words">{msg.content}</p>
                              )}
                              <div
                                className={`text-xs mt-1 ${
                                  msg.messageType === MessageType.OUTGOING ? 'text-white/80' : 'text-gray-500'
                                }`}
                              >
                                {format(new Date(msg.timestamp), 'h:mm a')}
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
                      
                      {/* Hidden file input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      
                      {/* Image upload button */}
                      <button
                        className="p-2 text-blue-500 hover:text-blue-700"
                        onClick={handleImageSelect}
                        title="Upload image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-gray-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <p className="text-lg font-medium">
                        Select a contact to start messaging
                      </p>
                      <p className="text-sm mt-2">
                        Your conversations will appear here
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )
      )}
      {isImageModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl max-h-screen p-4">
            <button 
              className="absolute top-2 right-2 bg-white rounded-full p-2 text-black"
              onClick={closeImageModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={selectedImage} 
              alt="Enlarged message attachment" 
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MessengerPage;
