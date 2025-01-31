import authOptions from '@/lib/authOptions';
import { UserRepository } from '@/repositories/user/UserRepository';
import { CreateUser } from '@/services/user/CreateUser';
import { CreateUserRequestDto } from '@/services/user/dto/CreateUserRequestDto';
import { GetUserById } from '@/services/user/GetUserById';
import { NewResponse } from '@/types/api-response';
import { AuthOptions, getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

const userRepository = new UserRepository();
const createUser = new CreateUser(userRepository);
const getUserById = new GetUserById(userRepository);

export class UserController {
  static async create(req: NextRequest): Promise<any> {
    const request: CreateUserRequestDto = await req.json();

    const response = createUser.execute(request);
    return response;
  }

  static async getUser(req: NextRequest): Promise<any> {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NewResponse(401, null, 'Unauthorized');
    }

    const response = getUserById.execute(session.user.id);
    return response;
  }
}
