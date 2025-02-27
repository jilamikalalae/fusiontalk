import connectMongoDB from '@/lib/mongodb';
import User from '@/models/user';
import { IUserRepository } from './IUserRepository';
import { IUser } from '@/domain/User';

export class UserRepository implements IUserRepository {
  async getUserByLineId(userId: string): Promise<IUser> {
    try {
      await connectMongoDB();

      const user = await User.findOne({ 'lineToken.userId': userId });
      return user;
    } catch (e) {
      throw new Error('failed to create user');
    }
  }
  async create(user: IUser): Promise<void> {
    try {
      await connectMongoDB();

      await User.create(user);
    } catch (e) {
      throw new Error('failed to create user');
    }
  }

  async findById(userId: string): Promise<IUser> {
    try {
      await connectMongoDB();

      const user = await User.findById(userId);
      return user;
    } catch (e) {
      throw new Error('failed to get user by id');
    }
  }
}
