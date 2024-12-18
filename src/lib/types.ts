export interface Message {
  id: number;
  userId: string;
  userName: string;
  messageType: "line" | "messenger";
  content: string;
  createdAt: Date;
  sender: "user" | "recipient";
  isUnread?: boolean;
} 