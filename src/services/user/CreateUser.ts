import { IUserRepository } from '@/repositories/user/IUserRepository';
import { CreateUserRequestDto } from './dto/CreateUserRequestDto';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { NewResponse } from '@/types/api-response';
import { IUser } from '@/domain/User';

export class CreateUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(req: CreateUserRequestDto): Promise<NextResponse<any>> {
    try {
      const hashedPassword = await bcrypt.hash(req.password, 10);

      let user: IUser = {
        name: req.name,
        email: req.email,
        password: hashedPassword,
        lineToken: null
      };

      this.userRepository.create(user);

      return NewResponse(200, null, null);
    } catch (e) {
      return NewResponse(500, null, e);
    }
  }
}
