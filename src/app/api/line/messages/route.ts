import { LineController } from '@/controllers/LineController';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const response = await LineController.sendLineMessage(req);
  return response;
}
