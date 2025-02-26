import { LineController } from '@/controllers/LineController';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lineId: string }> }
) {
  const { lineId } = await params;

  const response = await LineController.getLineMessage(req, lineId);
  return response;
}
