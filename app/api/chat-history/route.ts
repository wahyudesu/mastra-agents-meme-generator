import { mastra } from '../../../src/mastra';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('resourceId') || 'default_user';
    const threadId = searchParams.get('threadId') || 'meme_generation_thread';

    // Get the meme generator agent
    const agent = mastra.getAgent('memeGenerator');

    if (!agent) {
      return NextResponse.json(
        { error: 'Meme generator agent not found' },
        { status: 500 },
      );
    }

    // Get the memory instance from the agent
    const memory = agent.getMemory();

    if (!memory) {
      return NextResponse.json(
        { error: 'Memory not configured for this agent' },
        { status: 500 },
      );
    }

    try {
      // Try to get the thread and its messages using correct parameter format
      const thread = await memory.getThreadById({ threadId });

      if (!thread) {
        return NextResponse.json({
          success: true,
          history: [],
          resourceId,
          threadId,
          message: 'No conversation history found',
        });
      }

      // Get thread messages through memory query
      const messages = await memory.query({
        resourceId,
        threadId,
      });

      return NextResponse.json({
        success: true,
        history: messages || [],
        resourceId,
        threadId,
        threadCreatedAt: thread.createdAt,
        threadUpdatedAt: thread.updatedAt,
      });
    } catch (memoryError) {
      console.error('Error accessing memory:', memoryError);
      return NextResponse.json({
        success: true,
        history: [],
        resourceId,
        threadId,
        message: 'Memory access error, starting fresh conversation',
      });
    }
  } catch (error) {
    console.error('Error in chat history API:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve chat history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
