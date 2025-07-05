import { NextRequest, NextResponse } from "next/server";
import { BlueExpress } from "@/blueexpress";

/**
 * API endpoint for tracking BlueExpress shipments
 * POST /api/blueexpress/tracking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackingNumber } = body;

    // Validate required parameters
    if (!trackingNumber) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing required parameter: trackingNumber is required" 
        },
        { status: 400 }
      );
    }

    // Call the BlueExpress tracking service
    const trackingResponse = await BlueExpress.trackOrder({ trackingNumber });

    if (!trackingResponse.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: trackingResponse.error || "Failed to track shipment" 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(trackingResponse);
  } catch (error) {
    console.error("Error in BlueExpress tracking API:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      },
      { status: 500 }
    );
  }
}
