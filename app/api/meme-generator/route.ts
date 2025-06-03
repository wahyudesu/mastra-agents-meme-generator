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
    // Use unique thread IDs to prevent context accumulation during testing
    const memoryConfig = {
      resourceId: resourceId || 'default_user',
      threadId: threadId || `meme_thread_${Date.now()}` // Unique thread for each request during debugging
    };

    // Wrap the message to ensure it's not too long
    const sanitizedMessage = message.length > 1000 
      ? message.substring(0, 1000) + '...' 
      : message;
    
    console.log('Generating response for message length:', sanitizedMessage.length);
    
    const response = await agent.generate(sanitizedMessage, memoryConfig);
    
    // Ensure we're not sending massive responses back
    const responseData = typeof response === 'string' 
      ? response 
      : response;
    
    return NextResponse.json({
      success: true,
      response: responseData,
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