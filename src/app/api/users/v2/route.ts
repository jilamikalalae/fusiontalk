import { UserController } from '@/controllers/UserController';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const response = await UserController.getUser(req);
  return response;
}
