import { MessageType } from '@/enum/enum';

export interface ILineContact {
  incomingLineId: string;
  outgoingLineId: string;
  displayName: string;
  profileUrl: string;
  statusMessage: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: Number;
  messages: ILineMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ILineMessage {
  messageType: string;
  content: string;
  createdAt: Date;
  contentType?: 'text' | 'image';
  imageUrl?: string;
}
