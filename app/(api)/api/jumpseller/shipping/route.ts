import { NextResponse } from 'next/server';
import { Jumpseller } from '@/jumpseller';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const regionCode = searchParams.get('region');
  const municipality = searchParams.get('municipality');

  if (!regionCode || !municipality) {
    return NextResponse.json(
      { error: 'Region code and municipality are required' },
      { status: 400 }
    );
  }

  try {
    const shippingMethods = await Jumpseller.getShippingMethods(regionCode, municipality);
    return NextResponse.json({ shippingMethods });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch shipping methods' },
      { status: 500 }
    );
  }
}
