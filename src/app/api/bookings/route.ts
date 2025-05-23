import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth/options';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const fromToday = url.searchParams.get('fromToday') === 'true';

    const db = await connectToDatabase();
    const collection = db.collection('bookings');

    let filter = {};
    if (fromToday) {
      const todayStr = new Date().toISOString().split('T')[0];
      filter = { startDate: { $gte: todayStr } };
    }

    const results = await collection.find(filter).toArray();
    return NextResponse.json(results);
  } catch (err) {
    console.error('GET /api/bookings error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const db = await connectToDatabase();
  const body = await req.json();

  const newBooking = {
    ...body,
    email: session?.user?.email || 'unknown',
    createdAt: new Date(),
  };

  const result = await db.collection('bookings').insertOne(newBooking);
  return NextResponse.json({ ...newBooking, _id: result.insertedId });
}
