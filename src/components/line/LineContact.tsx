import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineContact } from '@/lib/types';

interface LineContactProps {
  contacts: LineContact[];
  searchQuery: string;
  onContactSelect: (contact: LineContact) => void;
  onSearchChange: (query: string) => void;
}

const LineContactList: React.FC<LineContactProps> = ({
  contacts,
  searchQuery,
  onContactSelect,
  onSearchChange,
}) => {
  const filteredContacts = contacts.filter(contact =>
    contact.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r">
      <Card className="h-full">
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
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <ul className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
            {filteredContacts.map((contact) => (
              <li
                key={contact.userId}
                className={`flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer`}
                onClick={() => onContactSelect(contact)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {contact.pictureUrl ? (
                      <img 
                        src={contact.pictureUrl} 
                        alt={contact.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xs">LINE</span>
                    )}
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
  );
};

export default LineContactList; 