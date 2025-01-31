import { NewResponse } from '@/types/api-response';

export async function GET(req) {
    const challenge = req.nextUrl.searchParams.get('hub.challenge')
    return new Response(challenge) ;
} 