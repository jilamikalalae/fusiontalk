export interface Message {
  _id: {
    $oid: string;
  };
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  messageType: 'user' | 'bot' | string;
  contentType?: 'image' | 'text';
  imageUrl?: string;
  replyTo?: string;
  isUnread?: boolean;
  pictureUrl?: string;
  displayName?: string;
  platform?: 'line' | 'messenger';
}

