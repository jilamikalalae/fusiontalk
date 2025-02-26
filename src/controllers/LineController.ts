import authOptions from '@/lib/authOptions';
import { LineRepository } from '@/repositories/line/LineRepository';
import { UserRepository } from '@/repositories/user/UserRepository';
import { SendLineMessageRequestDto } from '@/services/line/dto/SendLineMessageRequestDto';
import { GetLineContactByUserId } from '@/services/line/GetLineContactByUserId';
import { GetLineMessageByLineId } from '@/services/line/GetLineMessageByLineId';
import { LineMessageWebhook } from '@/services/line/LineMessageWebhook';
import { SendLineMessage } from '@/services/line/SendLineMessage';
import { NewResponse } from '@/types/api-response';
import { LineWebhookPayload } from '@/types/line-webhook';
import { AuthOptions, getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

const lineRepository = new LineRepository();
const userRepository = new UserRepository();

const lineMessageWebhook = new LineMessageWebhook(
  lineRepository,
  userRepository
);
const getLineContactByUserId = new GetLineContactByUserId(
  lineRepository,
  userRepository
);
const getLineMessageByLineId = new GetLineMessageByLineId(
  lineRepository,
  userRepository
);
const sendLineMessage = new SendLineMessage(lineRepository, userRepository);

export class LineController {
  static async webhook(req: NextRequest): Promise<any> {
    const request: LineWebhookPayload = await req.json();

    console.log(request);

    const response = await lineMessageWebhook.execute(request);
    return response;
  }

  static async getLineContact(req: NextRequest): Promise<any> {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NewResponse(401, null, 'Unauthorized');
    }

    const response = await getLineContactByUserId.execute(session.user.id);
    return response;
  }

  static async getLineMessage(
    req: NextRequest,
    incomingLineId: string
  ): Promise<any> {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NewResponse(401, null, 'Unauthorized');
    }

    const response = await getLineMessageByLineId.execute(
      session.user.id,
      incomingLineId
    );
    return response;
  }

  static async sendLineMessage(req: NextRequest): Promise<any> {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NewResponse(401, null, 'Unauthorized');
    }

    let request: SendLineMessageRequestDto = await req.json();

    request.userId = session.user.id;

    const response = await sendLineMessage.execute(request);
    return response;
  }
}
