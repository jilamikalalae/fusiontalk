'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import ImageUploadButton from '@/components/notification/ImageUploadButton';

interface Contact {
  id: string;
  source: 'line' | 'messenger';
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

const NotificationPageContent: React.FC = () => {
  const router = useRouter();
  const { clearUnreadMessages } = useNotifications();
  const urlUserId = useSearchParams()?.get('userId') || null;
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'line' | 'messenger'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showContacts, setShowContacts] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        // Fetch Line contacts
        const lineResponse = await fetch('/api/line/contacts');
        const lineData = await lineResponse.json();

        // Fetch Messenger contacts
        const messengerResponse = await fetch('/api/meta/contacts');
        const messengerData = await messengerResponse.json();

        // Transform and combine contacts
        const lineContacts = Array.isArray(lineData)
          ? lineData.map((contact: any) => ({
              id: contact.userId,
              source: 'line' as const,
              displayName: contact.displayName || 'Line User',
              pictureUrl: contact.pictureUrl,
              statusMessage: contact.statusMessage,
              lastMessage: contact.lastMessage,
              lastMessageAt: contact.lastMessageAt,
              unreadCount: contact.unreadCount || 0
            }))
          : [];

        const messengerContacts = Array.isArray(messengerData)
          ? messengerData.map((contact: any) => ({
              id: contact.id || contact.userId,
              source: 'messenger' as const,
              displayName: contact.firstName
                ? `${contact.firstName} ${contact.lastName || ''}`
                : contact.name || contact.displayName || 'Guest',
              pictureUrl: contact.profilePic || contact.pictureUrl,
              lastMessage: contact.lastMessage,
              lastMessageAt: contact.lastMessageAt,
              unreadCount: contact.unreadCount || 0
            }))
          : [];

        // Combine and sort by last message time (newest first)
        const allContacts = [...lineContacts, ...messengerContacts].sort(
          (a, b) => {
            if (!a.lastMessageAt) return 1;
            if (!b.lastMessageAt) return -1;
            return (
              new Date(b.lastMessageAt).getTime() -
              new Date(a.lastMessageAt).getTime()
            );
          }
        );

        setContacts(
          allContacts.map((contact) =>
            contact.id === selectedContact?.id
              ? { ...contact, unreadCount: 0 }
              : contact
          )
        );

        if (urlUserId && Array.isArray(allContacts)) {
          const contactFromUrl = allContacts.find(
            (contact) => contact.id === urlUserId
          );
          if (contactFromUrl) {
            setSelectedContact((prev) => {
              if (!prev || prev.id !== contactFromUrl.id) {
                return contactFromUrl;
              }
              return prev;
            });

            if (window.innerWidth < 768) {
              setShowContacts(false);
            }
          }
        }

        // Update selected contact data if it exists in the new contacts
        if (selectedContact) {
          const updatedContact = allContacts.find(
            (c) =>
              c.id === selectedContact.id && c.source === selectedContact.source
          );
          if (updatedContact) {
            setSelectedContact(updatedContact);
          }
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    // Initial fetch
    fetchContacts();

    // Set up polling for new contacts silently in the background
    const intervalId = setInterval(fetchContacts, 3000);

    return () => clearInterval(intervalId);
  }, [urlUserId]);

  // Add a separate effect to update the selected contact when contacts change
  useEffect(() => {
    if (selectedContact && contacts.length > 0) {
      const updatedContact = contacts.find(
        (c) =>
          c.id === selectedContact.id && c.source === selectedContact.source
      );
      if (updatedContact) {
        setSelectedContact(updatedContact);
      }
    }
  }, [contacts, selectedContact?.id]);

  const handleContactClick = (contact: Contact) => {
    // Update selected contact and UI state
    setSelectedContact(contact);
    if (window.innerWidth < 768) {
      setShowContacts(false);
    }

    // Fetch messages for the selected contact
    fetchMessagesForContact(contact);
    router.push(`/notification?userId=${contact.id}`);
  };

  const fetchMessagesForContact = async (contact: Contact) => {
    try {
      let endpoint = '';
      if (contact.source === 'line') {
        endpoint = `/api/line/messages/${contact.id}`;
      } else {
        endpoint = `/api/meta/messages/${contact.id}`;
      }

      const response = await fetch(endpoint);
      const data = await response.json();

      // Transform the data to match the Message type
      const transformedMessages = data.map((msg: any) => ({
        id: msg._id?.$oid || msg.id || `msg-${Date.now()}-${Math.random()}`,
        content: msg.content,
        messageType: msg.messageType === 'INCOMING' ? 'user' : 'bot',
        userId: contact.id,
        replyTo: contact.id,
        createdAt: msg.createdAt || new Date().toISOString(),
        contentType: msg.contentType || 'text',
        imageUrl: msg.imageUrl || undefined
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const handleBackToContacts = () => {
    setShowContacts(true);
  };

  const handleSendMessage = async () => {
    if (!selectedContact || !inputMessage.trim()) return;

    // Create temporary message
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: inputMessage,
      messageType: 'bot',
      userId: selectedContact.id,
      replyTo: selectedContact.id,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [tempMessage, ...prev]);
    setInputMessage('');

    const messageData = {
      content: inputMessage,
      recipientId: selectedContact.id
    };

    try {
      const endpoint =
        selectedContact.source === 'line'
          ? '/api/line/messages'
          : '/api/meta/messages';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error sending message:', errorData);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Effect to poll for messages when a contact is selected
  useEffect(() => {
    if (!selectedContact) return;

    const intervalId = setInterval(() => {
      fetchMessagesForContact(selectedContact);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [selectedContact]);

  // On mobile, when a contact is selected, hide the contacts list
  useEffect(() => {
    if (selectedContact && window.innerWidth < 768) {
      setShowContacts(false);
    }
  }, [selectedContact]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  const filteredContacts = contacts
    .filter((contact) => activeTab === 'all' || contact.source === activeTab)
    .filter((contact) =>
      contact.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleNewImage = (tempMessage: any) => {
    setMessages((prev) => [tempMessage, ...prev]);
  };

  const handleImageError = (errorMessage: string) => {
    // setErrorMessage(errorMessage);
    // setIsErrorModalOpen(true);
  };

  return (
    <Suspense>
      <div className="flex flex-col md:flex-row h-screen bg-gray-100">
        {/* Contacts Sidebar - Full width on mobile when showing contacts */}
        <div
          className={`${
            showContacts ? 'block' : 'hidden'
          } md:block w-full md:w-1/3 lg:w-1/4 bg-white h-screen md:h-auto overflow-hidden`}
        >
          <Card className="h-full border-0 md:border rounded-none md:rounded-lg">
            <CardHeader>
              <CardTitle>Unified Inbox</CardTitle>
              <CardDescription>
                View all your conversations in one place
              </CardDescription>

              <div className="mt-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search contacts..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Tabs
                  defaultValue="all"
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value as any)}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="line">Line</TabsTrigger>
                    <TabsTrigger value="messenger">Messenger</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>

            <CardContent className="overflow-y-auto max-h-[calc(100vh-220px)]">
              {filteredContacts.length > 0 ? (
                <ul className="space-y-3">
                  {filteredContacts.map((contact) => (
                    <li
                      key={contact.id}
                      onClick={() => handleContactClick(contact)}
                      className="flex items-start p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden mr-3">
                        <img
                          src={contact.pictureUrl || 'default-avatar-url'}
                          alt={contact.displayName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://miro.medium.com/v2/resize:fit:720/1*W35QUSvGpcLuxPo3SRTH4w.png';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-medium truncate max-w-[150px]">
                            {contact.displayName}
                          </h3>
                          {contact.lastMessageAt && (
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {new Date(contact.lastMessageAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm text-gray-600 truncate max-w-[180px]">
                            {contact.lastMessage}
                          </p>
                          {contact.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1 ml-2 flex-shrink-0">
                              {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No contacts found</p>
                  {activeTab !== 'all' && (
                    <p className="mt-2 text-sm">
                      Try connecting your{' '}
                      {activeTab === 'line' ? 'Line' : 'Messenger'} account in
                      the account settings
                    </p>
                  )}
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

                  <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden mr-3">
                    <img
                      src={
                        selectedContact.pictureUrl ||
                        'https://miro.medium.com/v2/resize:fit:720/1*W35QUSvGpcLuxPo3SRTH4w.png'
                      }
                      alt={`${selectedContact.displayName}'s profile`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          'https://miro.medium.com/v2/resize:fit:720/1*W35QUSvGpcLuxPo3SRTH4w.png';
                        target.onerror = null;
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold truncate">
                      {selectedContact.displayName}
                    </h2>
                    {selectedContact.statusMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {selectedContact.statusMessage}
                      </p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
                  {messages.length > 0 ? (
                    messages
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      )
                      .map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.messageType === 'bot'
                              ? 'justify-end'
                              : 'justify-start'
                          } mb-4`}
                        >
                          <div
                            className={`max-w-[75%] p-3 rounded-lg ${
                              message.messageType === 'bot'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            {message.contentType === 'image' &&
                            message.imageUrl ? (
                              <div
                                className="cursor-pointer"
                                onClick={() =>
                                  handleImageClick(message.imageUrl!)
                                }
                              >
                                <img
                                  src={message.imageUrl}
                                  alt="Message attachment"
                                  className="rounded-md max-w-full max-h-60 object-contain"
                                />
                              </div>
                            ) : (
                              <p className="break-words">{message.content}</p>
                            )}
                            <div
                              className={`text-xs mt-1 ${
                                message.messageType === 'bot'
                                  ? 'text-white/80'
                                  : 'text-gray-500'
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleString()}
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
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
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

        {/* Image Modal */}
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
                    d="M6 18L18 6M6 6l12 12"
                  />
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
      </div>
    </Suspense>
  );
};

const NotificationPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <NotificationPageContent />
    </Suspense>
  );
};

export default NotificationPage;
