import { NextResponse } from 'next/server';

export function NewResponse(
  status: number,
  data: any,
  error: string | any,
): NextResponse {
  let response;

  if (error) {
    response = NextResponse.json(
      {
        error: error
      },
      { status }
    );
  } else {
    response = NextResponse.json(
      data,
      { status }
    );
  }

  return response;
}
