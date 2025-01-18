export interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  isUnread?: boolean;
  pictureUrl?: string;
  displayName?: string;
  messageType: 'user' | 'bot' | string;
  replyTo?: string;
  platform?: 'line' | 'messenger';
}

export interface LineContact {
  userId: string;
  displayName: string;
  pictureUrl: string;
  statusMessage: string;
  lastMessage: string;
  lastMessageAt: Date;
} 