import { ILineRepository } from '@/repositories/line/ILineRepository';
import { IUserRepository } from '@/repositories/user/IUserRepository';
import { NewResponse } from '@/types/api-response';
import { NextResponse } from 'next/server';
import { SendLineMessageRequestDto } from './dto/SendLineMessageRequestDto';
import { MessageType } from '@/domain/LineMessage';
import { v4 as uuidv4 } from 'uuid';
import { LineSendPushMessageRequest } from '@/types/line-webhook';
import { DecryptString } from '@/lib/crypto';

export class SendLineMessage {
  constructor(
    private lineRepository: ILineRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(req: SendLineMessageRequestDto): Promise<NextResponse<any>> {
    try {
      const user = await this.userRepository.findById(req.userId);

      if (!user.lineToken?.userId) {
        return NewResponse(409, null, 'user have not connect with line yet');
      }

      const lineContacts = await this.lineRepository.getContactByLineId(
        user.lineToken.userId,
        req.incomingLineId
      );

      if (lineContacts.length == 0) {
        return NewResponse(404, null, 'line contact not found');
      }

      const lineContact = lineContacts[0];

      const sendPushMessageRequest: LineSendPushMessageRequest = {
        to: req.incomingLineId,
        messages: [
          {
            type: 'text',
            text: req.content
          }
        ]
      };

      const accessToken = DecryptString(
        user.lineToken.accessToken,
        user.lineToken.accessTokenIv
      );

      const response = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'X-Line-Retry-Key': uuidv4()
        },
        body: JSON.stringify(sendPushMessageRequest)
      });

      this.lineRepository.addMessageToContact(
        lineContact,
        MessageType.OUTGOING,
        req.content
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`LINE API error: ${response.status} ${errorData}`);
      }

      return NewResponse(200, lineContacts[0].messages, null);
    } catch (e: any) {
      console.log('failed to get line contact by userId: ', e.message);
      return NewResponse(500, null, e.message);
    }
  }
}
