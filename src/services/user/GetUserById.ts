import { IUserRepository } from '@/repositories/user/IUserRepository';
import { NewResponse } from '@/types/api-response';
import { NextResponse } from 'next/server';
import { GetUserResponseDto } from './dto/GetUserResponseDto';

export class GetUserById {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<NextResponse<unknown>> {
    try {
      const user = await this.userRepository.findById(userId);

      let isLineConnected = false;
      let isMessengerConnected = false;

      if (
        user.lineToken &&
        user.lineToken.accessToken &&
        user.lineToken.accessTokenIv &&
        user.lineToken.userId
      ) {
        isLineConnected = true;
      }

      if (
        user.messengerToken &&
        user.messengerToken.accessToken &&
        user.messengerToken.accessTokenIv &&
        user.messengerToken.pageId
      ) {
        isMessengerConnected = true;
      }

      const userResponse: GetUserResponseDto = {
        name: user.name,
        email: user.email,
        isLineConnected: isLineConnected,
        isMessengerConnected: isMessengerConnected
      };

      return NewResponse(200, userResponse, null);
    } catch (e) {
      return NewResponse(500, null, e);
    }
  }
}
