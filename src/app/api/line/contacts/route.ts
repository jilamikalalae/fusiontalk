import { LineController } from '@/controllers/LineController';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const response = await LineController.getLineContact(req);
  return response;
}
