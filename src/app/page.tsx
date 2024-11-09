"use client";


import { useState } from "react";
import { AiOutlineInbox, AiOutlineMessage, AiOutlineSetting } from "react-icons/ai"; // Example icons from react-icons

// Define a type for the messages
interface Message {
  sender: string;
  text: string;
  time: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    { sender: "Boom", text: "Can you check my order process? I ordered a red bag by yesterday via LINE, name Boomwww.", time: "12:31" },
    { sender: "You", text: "OK. Your order number is #41000. It is in the middle of packing process.", time: "12:31" }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { sender: "You", text: message, time: new Date().toLocaleTimeString() }]);
      setMessage("");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Tab Bar */}
      <div className="w-16 p-4 bg-gray-100 border-r flex flex-col items-center space-y-4">
        <button onClick={() => setActiveTab("inbox")} className={`p-2 ${activeTab === "inbox" ? "bg-blue-500 text-white" : "text-gray-600"}`}>
          <AiOutlineInbox size={24} />
        </button>
        <button onClick={() => setActiveTab("messages")} className={`p-2 ${activeTab === "messages" ? "bg-blue-500 text-white" : "text-gray-600"}`}>
          <AiOutlineMessage size={24} />
        </button>
        <button onClick={() => setActiveTab("settings")} className={`p-2 ${activeTab === "settings" ? "bg-blue-500 text-white" : "text-gray-600"}`}>
          <AiOutlineSetting size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        {activeTab === "inbox" && (
          <div className="w-1/3 p-4 bg-gray-100 border-r">
            <h2 className="text-lg font-bold mb-4">Inbox</h2>
            <div className="space-y-2">
              {["Boom", "Jason", "Nomsom", "Dannie", "Adam"].map((contact, index) => (
                <div key={index} className="p-2 bg-white rounded shadow flex items-center">
                  <div className="bg-gray-300 rounded-full w-8 h-8 mr-3"></div>
                  <div className="flex-1">
                    <p className="font-semibold">{contact}</p>
                    <p className="text-sm text-gray-500">Last message...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Area */}
        {activeTab === "messages" && (
          <div className="w-2/3 p-4">
            <h2 className="text-lg font-bold mb-4">Boom</h2>
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-xs p-2 rounded ${msg.sender === "You" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
                    <p>{msg.text}</p>
                    <span className="text-xs text-gray-500">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded p-2"
                placeholder="Do you have any problem?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                onClick={handleSendMessage}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* Settings Area */}
        {activeTab === "settings" && (
          <div className="w-2/3 p-4">
            <h2 className="text-lg font-bold mb-4">Settings</h2>
            <p className="text-gray-600">Here you can adjust your settings.</p>
            {/* Add more settings content here */}
          </div>
        )}
      </div>
    </div>
  );
}
