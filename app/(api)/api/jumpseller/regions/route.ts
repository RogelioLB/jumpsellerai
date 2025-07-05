import { NextResponse } from 'next/server';
import { Jumpseller } from '@/jumpseller';

export async function GET() {
  try {
    console.log('Fetching regions from Jumpseller API...');
    const result = await Jumpseller.getRegions();
    console.log('Regions fetched:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regions' },
      { status: 500 }
    );
  }
}
