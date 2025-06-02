import { mastra } from '../../../src/mastra';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, resourceId, threadId } = body;
    
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

    // Generate response with memory support
    // Use resourceId and threadId for persistent memory, fallback to defaults
    const memoryConfig = {
      resourceId: resourceId || 'default_user',
      threadId: threadId || 'meme_generation_thread'
    };

    const response = await agent.generate(message, memoryConfig);
    
    return NextResponse.json({
      success: true,
      response: response,
      memoryConfig // Return the memory config for reference
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