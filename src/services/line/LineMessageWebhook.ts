import { ILineRepository } from '@/repositories/line/ILineRepository';
import { NewResponse } from '@/types/api-response';
import { NextResponse } from 'next/server';
import { LineWebhookPayload, LineProfileResponse } from '@/types/line-webhook';
import { ILineContact, MessageType } from '@/domain/LineMessage';
import { IUserRepository } from '@/repositories/user/IUserRepository';
import { DecryptString } from '@/lib/crypto';

export class LineMessageWebhook {
  constructor(
    private lineRepository: ILineRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(req: LineWebhookPayload): Promise<NextResponse<any>> {
    try {
      for (const event of req.events) {
        const lineProfile = await this.getLineUserProfile(
          req.destination,
          event.source.userId
        );

        const lineContact: ILineContact = {
          incomingLineId: event.source.userId,
          outgoingLineId: req.destination,
          displayName: lineProfile.displayName,
          profileUrl: lineProfile.pictureUrl,
          statusMessage: lineProfile.statusMessage ?? '',
          lastMessage: event.message.text,
          messages: [],
          lastMessageAt: new Date(),
          unreadCount: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        this.lineRepository.addMessageToContact(
          lineContact,
          MessageType.INCOMING,
          event.message.text
        );
      }

      return NewResponse(200, null, null);
    } catch (e: any) {
      console.log(e.message);
      return NewResponse(500, null, e);
    }
  }

  async getLineUserProfile(
    botLineId: string,
    incomingLineId: string
  ): Promise<LineProfileResponse> {
    const user = await this.userRepository.getUserByLineId(botLineId);

    if (!user) {
      throw new Error(`User with LINE ID ${botLineId} is not found`);
    }

    if (
      !user.lineToken ||
      !user.lineToken.accessToken ||
      !user.lineToken.accessTokenIv
    ) {
      throw new Error(`Missing lineToken or accessToken for user ${botLineId}`);
    }

    const accessToken = DecryptString(
      user.lineToken.accessToken,
      user.lineToken.accessTokenIv
    );

    const response = await fetch(
      `https://api.line.me/v2/bot/profile/${incomingLineId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get user profile: ${response.statusText} (${errorText})`
      );
    }

    const body: LineProfileResponse = await response.json();
    console.log(body);

    return body;
  }
}
