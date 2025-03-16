'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { MessageType } from '@/enum/enum';
import Modal from '@/components/account/modal';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import ImageModal from '@/components/ImageModal';
import ImageUploadButton from '@/components/meta/ImageUploadButton';

interface Participant {
  userId: string;
  firstName: string;
  lastName: string;
  profilePic: string;
}

export interface MetaMessage {
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
  displayName: string;
  profilePic: string;
  lastInteraction: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

function MessengerPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlUserId = searchParams?.get('userId') || null;
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<MetaMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [showContacts, setShowContacts] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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

  // Function to fetch messages for selected contact
  const fetchMessages = async () => {
    if (!selectedContact) return;

    try {
      const response = await fetch(
        `/api/meta/messages/${selectedContact.userId}`
      );
      const data = await response.json();
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  // Function to fetch all contacts
  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/meta/contacts');
      const data = await response.json();

      // Ensure data is an array, otherwise use empty array
      const newContacts = Array.isArray(data) ? data : [];

      // Update contacts state while maintaining zero unread count for selected contact
      setContacts(
        newContacts.map((contact) =>
          contact.userId === selectedContact?.userId
            ? { ...contact, unreadCount: 0 }
            : contact
        )
      );

      // If we have a userId in the URL, find and select that contact
      if (urlUserId && Array.isArray(data)) {
        const contactFromUrl = data.find(
          (contact) => contact.userId === urlUserId
        );
        if (contactFromUrl) {
          setSelectedContact((prev) => {
            if (!prev || prev.userId !== contactFromUrl.userId) {
              return contactFromUrl;
            }
            return prev;
          });

          if (window.innerWidth < 768) {
            setShowContacts(false);
          }
        }
      }

      if (selectedContact) {
        const updatedSelectedContact = newContacts.find(
          (contact) => contact.userId === selectedContact.userId
        );

        if (updatedSelectedContact) {
          setSelectedContact(updatedSelectedContact);
        }
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Initial fetch and set up polling
  useEffect(() => {
    // Initial fetch
    fetchContacts();

    // Set up polling after initial fetch
    const contactsIntervalId = setInterval(() => {
      setIsInitialLoading(false); // Ensure loading is false for subsequent fetches
      fetchContacts();
    }, 3000);

    return () => clearInterval(contactsIntervalId);
  }, [urlUserId]);

  // Fetch messages when selected contact changes
  useEffect(() => {
    if (!selectedContact) return;

    fetchMessages();

    // Poll for messages from the selected contact
    const messagesIntervalId = setInterval(fetchMessages, 3000);

    return () => clearInterval(messagesIntervalId);
  }, [selectedContact]);

  // On mobile, when a contact is selected, hide the contacts list
  useEffect(() => {
    if (selectedContact && window.innerWidth < 768) {
      setShowContacts(false);
    }
  }, [selectedContact]);

  // Handle contact click
  const handleContactClick = async (contact: Contact) => {
    setContacts((prevContacts) =>
      prevContacts.map((c) =>
        c.userId === contact.userId ? { ...c, unreadCount: 0 } : c
      )
    );

    setSelectedContact(contact);

    if (window.innerWidth < 768) {
      setShowContacts(false);
    }

    // Update URL with the selected contact's userId
    router.push(`/messenger?userId=${contact.userId}`);
  };

  const handleBackToContacts = () => {
    setShowContacts(true);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    const timestamp = new Date();

    // Create temporary message for immediate display
    const tempMessage: MetaMessage = {
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

  const handleNewImage = (tempMessage: MetaMessage) => {
    setMessages((prev) => [tempMessage, ...prev]);
  };

  const handleImageError = (errorMessage: string) => {
    setErrorMessage(errorMessage);
    setIsErrorModalOpen(true);
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

      <div className="flex flex-col md:flex-row h-screen md:h-[calc(100vh-2rem)] md:mx-4 md:my-4">
        {/* Contacts List - Hidden on mobile when a contact is selected */}
        <div
          className={`${
            showContacts ? 'block' : 'hidden'
          } md:block w-full md:w-1/3 lg:w-1/4 border-r md:border-r-0 md:mr-4`}
        >
          <Card className="h-full border-0 md:border rounded-none md:rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle>LINE Contacts</CardTitle>
              <CardDescription>
                Your LINE contacts will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto h-[calc(100vh-8rem)]">
              <div className="mb-4">
                <input
                  type="search"
                  placeholder="Search contacts..."
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.userId}
                    className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer hover:bg-gray-100 ${
                      selectedContact?.userId === contact.userId
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : ''
                    }`}
                    onClick={() => handleContactClick(contact)}
                  >
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden mr-3">
                      {contact.profilePic ? (
                        <img
                          src={contact.profilePic}
                          alt={`${contact.firstName}'s profile`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              'https://miro.medium.com/v2/resize:fit:720/1*W35QUSvGpcLuxPo3SRTH4w.png';
                            target.onerror = null;
                          }}
                        />
                      ) : (
                        <span className="text-white text-lg">
                          {contact.firstName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium truncate">
                          {contact.firstName}
                        </h3>
                        {contact.lastMessageAt && (
                          <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                            {new Date(
                              contact.lastMessageAt
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600 truncate">
                          {contact.lastMessage}
                        </p>
                        {contact.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1 ml-2">
                            {contact.unreadCount > 99
                              ? '99+'
                              : contact.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 mt-8">
                  <p>No contacts found</p>
                  <p className="text-sm mt-2">
                    Add your LINE Official Account to get started
                  </p>
                </div>
              )}
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

                  <div className="w-10 h-10 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden mr-3">
                    {selectedContact.profilePic ? (
                      <img
                        src={selectedContact.profilePic}
                        alt={`${selectedContact.firstName}'s profile`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            'https://miro.medium.com/v2/resize:fit:720/1*W35QUSvGpcLuxPo3SRTH4w.png';
                          target.onerror = null;
                        }}
                      />
                    ) : (
                      <span className="text-white text-xs">
                        {selectedContact.profilePic.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold truncate">
                      {selectedContact.firstName}
                    </h2>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
                  {messages.length > 0 ? (
                    messages
                      .sort(
                        (a, b) =>
                          new Date(b.timestamp).getTime() -
                          new Date(a.timestamp).getTime()
                      )
                      .map((msg) => (
                        <div
                          key={msg._id}
                          className={`flex ${
                            msg.messageType === MessageType.OUTGOING
                              ? 'justify-end'
                              : 'justify-start'
                          } mb-1`}
                        >
                          <div
                            className={`max-w-[75%] p-3 rounded-lg ${
                              msg.messageType === MessageType.OUTGOING
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200'
                            }`}
                          >
                            {msg.contentType === 'image' && msg.imageUrl ? (
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
                                msg.messageType === MessageType.OUTGOING
                                  ? 'text-white/80'
                                  : 'text-gray-500'
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
                </div>

                {/* Input Box */}
                <div className="flex items-center space-x-3 border-t p-4">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />

                  <ImageUploadButton
                    selectedContact={selectedContact}
                    onImageUpload={handleNewImage}
                    onError={handleImageError}
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

      <ImageModal
        isOpen={isImageModalOpen}
        imageUrl={selectedImage}
        onClose={closeImageModal}
      />
    </>
  );
}

// Main component with Suspense boundary
const MessengerPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <MessengerPageContent />
    </Suspense>
  );
};

export default MessengerPage;
