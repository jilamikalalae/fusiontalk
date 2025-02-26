import { LineController } from '@/controllers/LineController';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { lineId: string } }
) {
  const response = await LineController.getLineMessage(req, params.lineId);
  return response;
}
