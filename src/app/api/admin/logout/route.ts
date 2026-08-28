import { NextResponse } from 'next/server';

import { ADMIN_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url), 303);
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
