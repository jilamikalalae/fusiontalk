export interface LineContactResponseDto {
  userId: string;
  displayName: string;
  pictureUrl: string;
  statusMessage: string;
  updatedAt: Date;
  createdAt: Date;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}
