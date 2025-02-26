import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Docker health checks
 * This simple endpoint returns a 200 OK response to indicate the application is healthy
 */
export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}