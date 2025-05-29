import { mastra } from '../../../src/mastra';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get the meme generator agent
    const agent = mastra.getAgent('memeGenerator');
    
    if (!agent) {
      return NextResponse.json(
        { error: 'Meme generator agent not found' },
        { status: 500 }
      );
    }

    // Generate response
    const response = await agent.generate(message);
    
    return NextResponse.json({
      success: true,
      response: response
    });
    
  } catch (error) {
    console.error('Error in meme generator API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 