import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // TODO: Implement in Step 3 when we add the agent
  return NextResponse.json({
    error: 'Agent not implemented yet. Check back in Step 3!'
  }, { status: 501 });
}