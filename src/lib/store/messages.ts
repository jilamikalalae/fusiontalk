export interface Message {
  id: number;
  name: string;
  preview: string;
  time: string;
  isUnread?: boolean;
  type: "line" | "messenger";
}

export interface ChatMessage {
  id: number;
  sender: "user" | "recipient";
  text: string;
  time: string;
  status?: "sending" | "sent" | "delivered" | "read";
}

export const inboxMessages: Message[] = [
  {
    id: 1,
    name: "John Doe",
    preview: "Hey, how are you?",
    time: "10:30 AM",
    isUnread: true,
    type: "messenger"
  },
  {
    id: 2,
    name: "Jane Smith",
    preview: "Meeting at 2 PM",
    time: "9:45 AM",
    type: "line"
  },
  {
    id: 3,
    name: "Mike Johnson",
    preview: "Please check the docs",
    time: "Yesterday",
    type: "messenger"
  },
  {
    id: 4,
    name: "Sarah Wilson",
    preview: "Thanks for your help!",
    time: "Yesterday",
    isUnread: true,
    type: "line"
  },
];

export const chatMessagesData: Record<number, ChatMessage[]> = {
  1: [
    { id: 1, sender: "recipient", text: "Hey, how are you?", time: "10:30 AM" },
    { id: 2, sender: "user", text: "I'm good, thanks! How about you?", time: "10:31 AM" },
    { id: 3, sender: "recipient", text: "Doing great! Want to grab lunch?", time: "10:32 AM" },
  ],
  2: [
    { id: 1, sender: "recipient", text: "Meeting at 2 PM", time: "9:45 AM" },
    { id: 2, sender: "user", text: "Sure, I'll be there", time: "9:46 AM" },
  ],
  // Add more chat histories for other contacts...
}; 