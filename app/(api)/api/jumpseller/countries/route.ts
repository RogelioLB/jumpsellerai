import { NextResponse } from 'next/server';
import { Jumpseller } from '@/jumpseller';

export async function GET() {
  try {
    const countries = await Jumpseller.getCountries();
    console.log(countries)
    return NextResponse.json({ countries });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}
