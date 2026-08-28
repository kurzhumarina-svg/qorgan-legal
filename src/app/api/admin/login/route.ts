import { NextResponse } from 'next/server';

import { ADMIN_COOKIE, checkPassword, createSessionToken, sessionCookieOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get('password') ?? '');

  if (!checkPassword(password)) {
    return NextResponse.redirect(new URL('/admin/login?error=1', request.url), 303);
  }

  const response = NextResponse.redirect(new URL('/admin', request.url), 303);
  response.cookies.set(ADMIN_COOKIE, createSessionToken(), sessionCookieOptions);
  return response;
}

export async function DELETE(request: Request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url), 303);
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
