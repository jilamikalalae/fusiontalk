import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Message {
  id: number;
  name: string;
  preview: string;
  time: string;
  isUnread?: boolean;
}

interface ChatMessage {
  id: number;
  sender: "user" | "recipient";
  text: string;
  time: string;
}

const inboxMessages: Message[] = [
];

const chatMessages: ChatMessage[] = [
];

const CustomersPage: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r">
        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription>Newest ↑</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {inboxMessages.map((message) => (
                <li
                  key={message.id}
                  className={`flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer ${
                    message.isUnread ? "font-bold" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full" />
                    <div>
                      <p className="font-medium">{message.name}</p>
                      <p className="text-sm text-gray-500">{message.preview}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{message.time}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="w-3/4 p-6">
        <Card className="h-full">
          <CardContent className="flex flex-col h-full justify-between">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-sm p-3 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Box */}
            <div className="flex items-center space-x-3 border-t p-3">
              <input
                type="text"
                placeholder="Type here"
                className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                Send
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomersPage;
