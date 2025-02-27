import { MessageType } from '@/enum/enum';

export interface IMessengerMessage {
  senderId: string;
  recipientId: string;
  senderName: string;
  messageType: MessageType;
  content: string;
  messageId: string;
  timestamp: Date;
  isRead: boolean;
}
