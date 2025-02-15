import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get('error');

  return NextResponse.redirect(new URL(`/?error=${error}`, url));
}