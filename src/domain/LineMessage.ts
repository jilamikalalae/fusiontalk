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
  messageType: MessageType;
  content: string;
  createdAt: Date;
}
