import { NextResponse } from 'next/server';
import { generateICS } from '@/lib/ical';
import { INITIAL_TASKS } from '@/lib/mockData';

export async function GET() {
  // Calendar feed export
  const icsData = generateICS(INITIAL_TASKS, 'Remindly Personal Schedule');

  return new NextResponse(icsData, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="remindly.ics"',
      'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
    },
  });
}
