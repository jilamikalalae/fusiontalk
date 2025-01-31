export interface LineContact {
  userId: string;
  displayName: string;
  pictureUrl: string;
  statusMessage: string;
  lastMessage: string;
  lastMessageAt: Date;
}

export interface Message {
  id: string;
  content: string;
  messageType: 'user' | 'bot';
  userId: string;
  replyTo?: string;
  createdAt: string;
} 