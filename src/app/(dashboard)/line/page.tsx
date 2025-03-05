"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Message } from "@/lib/types";
import Modal from "@/components/account/modal";

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
  const router = useRouter();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const urlUserId = searchParams.get('userId');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<LineContact | null>(null);
  const [contacts, setContacts] = useState<LineContact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showContacts, setShowContacts] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/line/contacts');
        const data = await response.json();
        // Ensure data is an array, otherwise use empty array
        setContacts(Array.isArray(data) ? data : []);
        
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
  }, [urlUserId]); 

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact) return;
      
      try {
        const response = await fetch(`/api/line/messages/${selectedContact.userId}`);
        const data = await response.json();
        // Transform the data to match the Message type
        const transformedMessages = data.map((msg: any) => ({
          id: msg._id.$oid,
          content: msg.content,
          messageType: msg.messageType === 'INCOMING' ? 'user' : 'bot',
          userId: selectedContact.userId,
          replyTo: selectedContact.userId,
          createdAt: msg.createdAt
        }));
        setMessages(transformedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
    };

    fetchMessages();

    const intervalId = setInterval(fetchMessages, 3000); // Poll every 3 seconds

    return () => clearInterval(intervalId);
  }, [selectedContact]);

  useEffect(() => {
    const checkLineConnection = async () => {
      try {
        const response = await fetch('/api/users/v2');
        const userData = await response.json();
        
        if (!userData.isLineConnected) {
          setIsModalOpen(true);
          return;
        }
        setLoading(false);
      } catch (error) {
        console.error('Error checking LINE connection:', error);
      }
    };

    checkLineConnection();
  }, []);

  // On mobile, when a contact is selected, hide the contacts list
  useEffect(() => {
    if (selectedContact && window.innerWidth < 768) {
      setShowContacts(false);
    }
  }, [selectedContact]);

  const filteredContacts = contacts?.filter(contact =>
    contact?.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleContactClick = (contact: LineContact) => {
    setSelectedContact(contact);
    if (window.innerWidth < 768) {
      setShowContacts(false);
    }
  };

  const handleBackToContacts = () => {
    setShowContacts(true);
  };

  const handleSendMessage = async () => {
    if (!selectedContact || !inputMessage.trim()) return;

    // Create temporary message with matching ID structure
    const tempMessage: Message = {
      _id: {
        $oid: `temp-${Date.now()}`
      },
      id: `temp-${Date.now()}`,
      content: inputMessage,
      messageType: 'bot',
      userId: selectedContact.userId,
      replyTo: selectedContact.userId,
      createdAt: new Date().toISOString(),
      userName: 'You'
    };

    setMessages(prev => [tempMessage, ...prev]);
    setInputMessage('');

    const messageData = {
      content: inputMessage,
      incomingLineId: selectedContact.userId
    };

    try {
      const response = await fetch('/api/line/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  const handleModalConfirm = () => {
    router.push('/account');
  };

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        title="Line Connection Required"
        message="Please connect your LINE account to access the chat features. Would you like to go to the account settings page?"
        confirmText="Go to Settings"
        onConfirm={handleModalConfirm}
      />
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div>Loading...</div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row h-screen bg-gray-100">
          {/* Sidebar - Full width on mobile when showing contacts */}
          <div className={`${
            showContacts ? 'block' : 'hidden'
          } md:block w-full md:w-1/3 lg:w-1/4 bg-white border-r h-screen md:h-auto`}>
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
                      key={contact.userId}
                      className="flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer"
                      onClick={() => handleContactClick(contact)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={contact.pictureUrl || 'https://miro.medium.com/v2/resize:fit:720/1*W35QUSvGpcLuxPo3SRTH4w.png'}
                            alt={`${contact.displayName}'s profile`}
                            className="w-full h-full object-cover"
                          
                          />
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
                    
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden mr-3">
                      {selectedContact.pictureUrl ? (
                        <img
                          src={selectedContact.pictureUrl}
                          alt={`${selectedContact.displayName}'s profile`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://miro.medium.com/v2/resize:fit:720/1*W35QUSvGpcLuxPo3SRTH4w.png';
                            target.onerror = null;
                          }}
                        />
                      ) : (
                        <span className="text-white text-xs">{selectedContact.displayName.charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold truncate">{selectedContact.displayName}</h2>
                      {selectedContact.statusMessage && (
                        <p className="text-sm text-gray-500 truncate">{selectedContact.statusMessage}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
                    {messages.length > 0 ? (
                      messages
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.messageType === 'bot' ? "justify-end" : "justify-start"
                            } mb-1`}
                          >
                            <div
                              className={`max-w-[75%] p-3 rounded-lg ${
                                msg.messageType === 'bot' ? "bg-blue-500 text-white" : "bg-gray-200"
                              }`}
                            >
                              <p className="break-words">{msg.content}</p>
                              <div className={`text-xs mt-1 ${
                                msg.messageType === 'bot' ? "text-white/80" : "text-gray-500"
                              }`}>
                                {new Date(msg.createdAt).toLocaleString('en-US', {
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
                  </div>

                  {/* Input Box */}
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
      )}
    </>
  );
};

export default LinePage;
