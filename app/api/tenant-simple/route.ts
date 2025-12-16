import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Simple tenant API called');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Simple tenant API working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Simple tenant API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Simple tenant API failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}