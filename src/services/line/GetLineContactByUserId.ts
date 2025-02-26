import { ILineRepository } from '@/repositories/line/ILineRepository';
import { IUserRepository } from '@/repositories/user/IUserRepository';
import { NewResponse } from '@/types/api-response';
import { NextResponse } from 'next/server';
import { LineContactResponseDto } from './dto/LineContactResponseDto';

export class GetLineContactByUserId {
  constructor(
    private lineRepository: ILineRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(userId: string): Promise<NextResponse<any>> {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user.lineToken?.userId) {
        return NewResponse(409, null, 'user have not connect with line yet');
      }

      const lineContacts = await this.lineRepository.getContactByLineId(
        user.lineToken.userId,
        null
      );

      let response: LineContactResponseDto[] = [];
      for (let lineContact of lineContacts) {
        response.push({
          userId: lineContact.incomingLineId,
          displayName: lineContact.displayName,
          pictureUrl: lineContact.profileUrl,
          statusMessage: lineContact.statusMessage,
          updatedAt: lineContact.updatedAt,
          createdAt: lineContact.createdAt,
          lastMessage: lineContact.lastMessage,
          lastMessageAt: lineContact.lastMessageAt
        });
      }

      return NewResponse(200, response, null);
    } catch (e: any) {
      console.log('failed to get line contact by userId: ', e.message);
      return NewResponse(500, null, e.message);
    }
  }
}
