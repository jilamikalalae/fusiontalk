'use client';

import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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

const NotificationPage: React.FC = () => {
  const router = useRouter();
  const { clearUnreadMessages } = useNotifications();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'line' | 'messenger'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        
        // Fetch Line contacts
        const lineResponse = await fetch('/api/line/contacts');
        const lineData = await lineResponse.json();
        
        // Fetch Messenger contacts
        const messengerResponse = await fetch('/api/meta/contacts');
        const messengerData = await messengerResponse.json();
        
        // Transform and combine contacts
        const lineContacts = Array.isArray(lineData) ? lineData.map((contact: any) => ({
          id: contact.userId,
          source: 'line' as const,
          displayName: contact.displayName || 'Line User',
          pictureUrl: contact.pictureUrl,
          statusMessage: contact.statusMessage,
          lastMessage: contact.lastMessage,
          lastMessageAt: contact.lastMessageAt,
          unreadCount: contact.unreadCount || 0
        })) : [];
        
        const messengerContacts = Array.isArray(messengerData) ? messengerData.map((contact: any) => ({
          id: contact.id || contact.userId,
          source: 'messenger' as const,
          displayName: contact.firstName 
            ? `${contact.firstName} ${contact.lastName || ''}`
            : (contact.name || contact.displayName || 'Guest'),
          pictureUrl: contact.profilePic || contact.pictureUrl,
          lastMessage: contact.lastMessage,
          lastMessageAt: contact.lastMessageAt,
          unreadCount: contact.unreadCount || 0
        })) : [];
        
        // Combine and sort by last message time (newest first)
        const allContacts = [...lineContacts, ...messengerContacts]
          .sort((a, b) => {
            if (!a.lastMessageAt) return 1;
            if (!b.lastMessageAt) return -1;
            return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
          });
        
        setContacts(allContacts);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
    
    // Set up polling for new contacts
    const intervalId = setInterval(fetchContacts, 30000); // Poll every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  const handleContactClick = (contact: Contact) => {
    if (contact.source === 'line') {
      router.push(`/line?userId=${contact.id}`);
    } else {
      router.push(`/messenger?userId=${contact.id}`);
    }
  };

  const filteredContacts = contacts
    .filter(contact => 
      activeTab === 'all' || contact.source === activeTab
    )
    .filter(contact => 
      contact.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Notification Inbox</CardTitle>
          <CardDescription>View all your conversations in one place</CardDescription>
          
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
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="line">Line</TabsTrigger>
                <TabsTrigger value="messenger">Messenger</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredContacts.length > 0 ? (
            <ul className="space-y-3">
              {filteredContacts.map((contact) => (
                <li 
                  key={`${contact.source}-${contact.id}`}
                  onClick={() => handleContactClick(contact)}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    contact.unreadCount > 0 
                      ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      <img 
                        src={contact.pictureUrl || 'https://miro.medium.com/v2/resize:fit:720/1*W35QUSvGpcLuxPo3SRTH4w.png'} 
                        alt={`${contact.displayName}'s profile`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://miro.medium.com/v2/resize:fit:720/1*W35QUSvGpcLuxPo3SRTH4w.png';
                          target.onerror = null;
                        }}
                      />
                    </div>
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${
                      contact.source === 'line' ? 'bg-green-500' : 'bg-blue-600'
                    } flex items-center justify-center`}>
                      {contact.source === 'line' ? (
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/LINE_logo.svg/640px-LINE_logo.svg.png" 
                          alt="Line" 
                          className="w-3 h-3"
                        />
                      ) : (
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Facebook_Messenger_logo_2020.svg/1200px-Facebook_Messenger_logo_2020.svg.png" 
                          alt="Messenger" 
                          className="w-3 h-3"
                        />
                      )}
                    </div>
                    
                    {contact.unreadCount > 0 && (
                      <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1">
                        {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{contact.displayName}</h3>
                      {contact.lastMessageAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(contact.lastMessageAt).toLocaleString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true,
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                    
                    {contact.statusMessage && (
                      <p className="text-xs text-gray-400 truncate">{contact.statusMessage}</p>
                    )}
                    
                    {contact.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No contacts found</p>
              {activeTab !== 'all' && (
                <p className="mt-2 text-sm">
                  Try connecting your {activeTab === 'line' ? 'Line' : 'Messenger'} account in the account settings
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPage; 