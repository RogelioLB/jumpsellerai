import { NextResponse } from 'next/server';
import { Jumpseller } from '@/jumpseller';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const regionCode = searchParams.get('region');

  if (!regionCode) {
    return NextResponse.json(
      { error: 'Region code is required' },
      { status: 400 }
    );
  }

  try {
    const municipalities = await Jumpseller.getMunicipalities(regionCode);
    return NextResponse.json({ municipalities });
  } catch (error) {
    console.error('Error fetching municipalities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch municipalities' },
      { status: 500 }
    );
  }
}
