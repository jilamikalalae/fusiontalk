export interface IMessengerContact {
  userId: string;
  pageId: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  lastInteraction: Date;
  lastMessage: String;
  lastMessageAt: Date;
  unreadCount: number;
}
