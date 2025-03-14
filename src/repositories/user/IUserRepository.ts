import { IUser } from '@/domain/User';

export interface IUserRepository {
  create(user: IUser): Promise<void>;
  findById(userId: string): Promise<IUser>;
  getUserByLineId(userId: string): Promise<IUser>;
  // findByEmail(email: string): Promise<IUser | null>;
  // findAll(): Promise<IUser[]>;
}
