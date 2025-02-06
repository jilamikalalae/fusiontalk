import { UserController } from '@/controllers/UserController';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const response = await UserController.create(req);
  return response;
}
