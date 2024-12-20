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
} 