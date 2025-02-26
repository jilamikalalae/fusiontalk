import { ILineRepository } from '@/repositories/line/ILineRepository';
import { IUserRepository } from '@/repositories/user/IUserRepository';
import { NewResponse } from '@/types/api-response';
import { NextResponse } from 'next/server';

export class GetLineMessageByLineId {
  constructor(
    private lineRepository: ILineRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(
    userId: string,
    incomingLineId: string
  ): Promise<NextResponse<any>> {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user.lineToken?.userId) {
        return NewResponse(409, null, 'user have not connect with line yet');
      }

      const lineContacts = await this.lineRepository.getContactByLineId(
        user.lineToken.userId,
        incomingLineId
      );

      if (lineContacts.length == 0) {
        return NewResponse(404, null, 'line contact not found');
      }

      const lineContact = lineContacts[0];
      const messages = lineContact.messages;
      messages.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return NewResponse(200, lineContacts[0].messages, null);
    } catch (e: any) {
      console.log('failed to get line contact by userId: ', e.message);
      return NewResponse(500, null, e.message);
    }
  }
}
