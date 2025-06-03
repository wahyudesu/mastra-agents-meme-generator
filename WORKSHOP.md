# Mastra Workshop: Build an AI Meme Generator

## Workshop Overview

Welcome to the Mastra workshop! Over the next 2 hours, we'll build a complete AI-powered meme generator that turns workplace frustrations into shareable memes.

### What You'll Build
A fully functional application that:
- 🤖 Uses AI to understand workplace frustrations
- 🔍 Extracts structured data from natural language
- 🎨 Generates contextual meme captions
- 🖼️ Creates shareable memes using the Imgflip API
- 💬 Provides a conversational interface through agents

### Workshop Timeline
- **0:00-0:15** - Introduction & Setup (Step 0)
- **0:15-0:40** - First Workflow Step (Step 1)
- **0:40-1:15** - Complete Workflow (Step 2)
- **1:15-1:45** - Agent Integration (Step 3)
- **1:45-2:00** - Final Polish & Q&A (Step 4)

### Prerequisites
- Node.js 20.9.0+
- Basic TypeScript knowledge
- OpenAI API key
- Git installed

### Getting Help
If you fall behind, catch up by checking out the next branch:
```bash
git checkout steps/step-X  # Replace X with the step number
npm install
```

---

## Step 0: Project Setup

### Summary
**Goal**: Get your development environment ready with Mastra installed and configured.

**What you'll complete**:
- ✅ Install dependencies
- ✅ Configure API keys
- ✅ Start the Mastra playground
- ✅ Understand the project structure

**Relevant docs**: 
- [Mastra Getting Started](https://mastra.ai/docs/getting-started)
- [Environment Setup](https://mastra.ai/docs/getting-started#environment-setup)

### Instructions

#### 1. Clone and Install
```bash
git clone <workshop-repo-url>
cd ai-eng-world-faire-workshop
git checkout steps/step-0
npm install
```

#### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Required for AI features
OPENAI_API_KEY=your_openai_api_key_here

# Optional but recommended for better rate limits
IMGFLIP_USERNAME=your_imgflip_username
IMGFLIP_PASSWORD=your_imgflip_password
```

#### 3. Start the Development Server
```bash
npm run dev
```

#### 4. Verify Setup
- Open http://localhost:4111
- You should see the Mastra playground
- Click on "Workflows" - it should be empty
- This confirms everything is working!

#### 5. Review Project Structure
Key files to understand:
- `src/mastra/index.ts` - Mastra configuration
- `src/mastra/memory.ts` - Storage setup (already configured)
- `app/api/` - API endpoints (we'll implement these)

---

## Step 1: Your First Workflow Step

### Summary
**Goal**: Create your first workflow step that extracts frustrations from user input using AI.

**What you'll complete**:
- ✅ Define a Zod schema for structured data
- ✅ Create a workflow step with AI integration
- ✅ Test the step in Mastra playground

**Relevant docs**: 
- [Mastra Workflows](https://mastra.ai/docs/workflows)
- [Structured Generation](https://sdk.vercel.ai/docs/ai-sdk-core/generating-structured-data)
- [Zod Documentation](https://zod.dev)

### Instructions

#### 1. Create the Frustrations Schema
Create `src/mastra/workflows/schemas/frustrations.ts`:
```typescript
import { z } from 'zod';

export const frustrationsSchema = z.object({
  frustrations: z.array(
    z.object({
      text: z.string().describe('The specific frustration mentioned'),
      category: z
        .enum([
          'meetings',
          'processes',
          'technology',
          'communication',
          'management',
          'workload',
          'other',
        ])
        .describe('Category of the frustration'),
      severity: z
        .enum(['mild', 'moderate', 'severe'])
        .describe('How severe this frustration is'),
      keywords: z
        .array(z.string())
        .describe('Key words that could be used for meme search'),
    }),
  ),
  overallMood: z
    .enum([
      'frustrated',
      'annoyed',
      'overwhelmed',
      'tired',
      'angry',
      'sarcastic',
    ])
    .describe('Overall emotional tone'),
  suggestedMemeStyle: z
    .enum([
      'classic',
      'modern',
      'corporate',
      'developer',
      'meeting',
      'remote-work',
    ])
    .describe('Suggested meme style based on frustrations'),
});
```

#### 2. Create Schema Index File
Create `src/mastra/workflows/schemas/index.ts`:
```typescript
export { frustrationsSchema } from './frustrations';
```

#### 3. Create the Extract Frustrations Step
Create `src/mastra/workflows/steps/extract-frustrations.ts`:
```typescript
import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { frustrationsSchema } from '../schemas';

export const extractFrustrationsStep = createStep({
  id: 'extract-frustrations',
  description:
    'Extract and categorize user frustrations from raw input using AI',
  inputSchema: z.object({
    userInput: z.string().describe('Raw user input about work frustrations'),
  }),
  outputSchema: frustrationsSchema.extend({
    analysis: z.object({
      message: z.string(),
    }),
  }),
  execute: async ({ inputData }) => {
    try {
      console.log('🔍 Analyzing your workplace frustrations...');

      const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: frustrationsSchema,
        prompt: `
          Analyze this workplace frustration and extract structured information:
          
          "${inputData.userInput}"
          
          Extract:
          - Individual frustrations with categories
          - Overall mood
          - Keywords for each frustration
          - Suggested meme style
          
          Keep analysis concise and focused.
        `,
      });

      const frustrations = result.object;

      console.log(
        `✅ Found ${frustrations.frustrations.length} frustrations, mood: ${frustrations.overallMood}`,
      );

      return {
        ...frustrations,
        analysis: {
          message: `Analyzed your frustrations - main issue: ${frustrations.frustrations[0]?.category} (${frustrations.overallMood} mood)`,
        },
      };
    } catch (error) {
      console.error('Error extracting frustrations:', error);
      throw new Error('Failed to analyze frustrations');
    }
  },
});
```

#### 4. Create Steps Index File
Create `src/mastra/workflows/steps/index.ts`:
```typescript
export { extractFrustrationsStep } from './extract-frustrations';
```

#### 5. Create a Test Workflow
Create `src/mastra/workflows/test-workflow.ts`:
```typescript
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { extractFrustrationsStep } from './steps';

export const testWorkflow = createWorkflow({
  id: 'test-workflow',
  description: 'Test workflow with frustration extraction',
  inputSchema: z.object({
    userInput: z.string().describe('Raw user input about work frustrations'),
  }),
  outputSchema: extractFrustrationsStep.outputSchema,
  steps: [extractFrustrationsStep],
});

testWorkflow
  .then(extractFrustrationsStep)
  .commit();
```

#### 6. Register the Workflow
Update `src/mastra/index.ts`:
```typescript
import { Mastra } from '@mastra/core';
import { storage } from './memory';
import { testWorkflow } from './workflows/test-workflow';

export const mastra = new Mastra({
  storage,
  agents: {},
  workflows: {
    'test-workflow': testWorkflow,
  },
  telemetry: {
    enabled: true,
  },
});
```

#### 7. Test Your Step
1. Go to http://localhost:4111/workflows
2. Click on "test-workflow"
3. Try inputs like:
   - "My meetings always run over time"
   - "The deployment process is completely broken"
   - "I have to explain the same thing to three different teams"
4. See the structured output!

---

## Step 2: Complete the Workflow

### Summary
**Goal**: Build the complete meme generation workflow by adding all remaining steps.

**What you'll complete**:
- ✅ Add meme template and caption schemas
- ✅ Create steps for finding memes, generating captions, and creating images
- ✅ Chain steps together with data mapping
- ✅ Test the complete workflow

**Relevant docs**: 
- [Workflow Composition](https://mastra.ai/docs/workflows#composition)
- [Data Mapping](https://mastra.ai/docs/workflows#data-mapping)
- [Imgflip API](https://imgflip.com/api)

### Instructions

#### 1. Add Meme Template Schema
Create `src/mastra/workflows/schemas/meme-template.ts`:
```typescript
import { z } from 'zod';

export const memeTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  width: z.number(),
  height: z.number(),
  box_count: z.number(),
});
```

#### 2. Add Captions Schema
Create `src/mastra/workflows/schemas/captions.ts`:
```typescript
import { z } from 'zod';

export const captionsSchema = z.object({
  topText: z.string().describe('Text for the top of the meme'),
  bottomText: z.string().describe('Text for the bottom of the meme'),
  memeStyle: z
    .enum(['witty', 'sarcastic', 'relatable', 'exaggerated', 'deadpan'])
    .describe('The style of humor to use'),
  humorLevel: z
    .enum(['mild', 'medium', 'spicy'])
    .describe('How edgy the humor should be'),
});
```

#### 3. Update Schema Exports
Update `src/mastra/workflows/schemas/index.ts`:
```typescript
export { frustrationsSchema } from './frustrations';
export { memeTemplateSchema } from './meme-template';
export { captionsSchema } from './captions';
```

#### 4. Create Find Base Meme Step
Create `src/mastra/workflows/steps/find-base-meme.ts`:
```typescript
import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { frustrationsSchema, memeTemplateSchema } from '../schemas';

export const findBaseMemeStep = createStep({
  id: 'find-base-meme',
  description: "Get meme templates from Imgflip's API",
  inputSchema: frustrationsSchema.extend({
    analysis: z.object({
      message: z.string(),
    }),
  }),
  outputSchema: z.object({
    templates: z.array(memeTemplateSchema),
    searchCriteria: z.object({
      primaryMood: z.string(),
      style: z.string(),
    }),
    analysis: z.object({
      message: z.string(),
    }),
  }),
  execute: async ({ inputData }) => {
    try {
      console.log('🔍 Searching for the perfect meme template...');

      const response = await fetch('https://api.imgflip.com/get_memes');
      const data = await response.json();

      if (!data.success) {
        throw new Error('Failed to fetch memes from Imgflip');
      }

      // Get a diverse selection of popular memes
      const popularMemes = data.data.memes.slice(0, 100);
      const shuffled = popularMemes.sort(() => Math.random() - 0.5);
      const selectedMemes = shuffled.slice(0, 10);

      console.log(`✅ Found ${selectedMemes.length} suitable meme templates`);

      return {
        templates: selectedMemes,
        searchCriteria: {
          primaryMood: inputData.overallMood,
          style: inputData.suggestedMemeStyle,
        },
        analysis: {
          message: `Found ${selectedMemes.length} meme templates matching ${inputData.overallMood} mood`,
        },
      };
    } catch (error) {
      console.error('Error finding meme templates:', error);
      throw new Error('Failed to find meme templates');
    }
  },
});
```

#### 5. Create Generate Captions Step
Create `src/mastra/workflows/steps/generate-captions.ts`:
```typescript
import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { frustrationsSchema, memeTemplateSchema, captionsSchema } from '../schemas';

export const generateCaptionsStep = createStep({
  id: 'generate-captions',
  description: 'Generate funny captions based on frustrations and meme template',
  inputSchema: z.object({
    frustrations: frustrationsSchema,
    baseTemplate: memeTemplateSchema,
  }),
  outputSchema: captionsSchema,
  execute: async ({ inputData }) => {
    try {
      console.log(
        `🎨 Generating captions for ${inputData.baseTemplate.name} meme...`
      );

      const mainFrustration = inputData.frustrations.frustrations[0];
      const mood = inputData.frustrations.overallMood;

      const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: captionsSchema,
        prompt: `
          Create meme captions for the "${inputData.baseTemplate.name}" meme template.
          
          Context:
          - Frustration: ${mainFrustration.text}
          - Category: ${mainFrustration.category}
          - Mood: ${mood}
          - Meme has ${inputData.baseTemplate.box_count} text boxes
          
          Make it funny and relatable to office workers. The humor should match the ${mood} mood.
          Keep text concise for meme format. Be creative but workplace-appropriate.
        `,
      });

      console.log('✅ Captions generated successfully');
      return result.object;
    } catch (error) {
      console.error('Error generating captions:', error);
      throw new Error('Failed to generate captions');
    }
  },
});
```

#### 6. Create Generate Meme Step
Create `src/mastra/workflows/steps/generate-meme.ts`:
```typescript
import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { memeTemplateSchema, captionsSchema } from '../schemas';

export const generateMemeStep = createStep({
  id: 'generate-meme',
  description: "Create a meme using Imgflip's API",
  inputSchema: z.object({
    baseTemplate: memeTemplateSchema,
    captions: captionsSchema,
  }),
  outputSchema: z.object({
    imageUrl: z.string(),
    pageUrl: z.string().optional(),
    captions: z.object({
      topText: z.string(),
      bottomText: z.string(),
    }),
    baseTemplate: z.string(),
    memeStyle: z.string(),
    humorLevel: z.string(),
    analysis: z.object({
      message: z.string(),
    }),
  }),
  execute: async ({ inputData }) => {
    try {
      console.log('🎨 Creating your meme...');

      const username = process.env.IMGFLIP_USERNAME || 'imgflip_hubot';
      const password = process.env.IMGFLIP_PASSWORD || 'imgflip_hubot';

      const formData = new URLSearchParams();
      formData.append('template_id', inputData.baseTemplate.id);
      formData.append('username', username);
      formData.append('password', password);
      formData.append('text0', inputData.captions.topText);
      formData.append('text1', inputData.captions.bottomText);

      const response = await fetch('https://api.imgflip.com/caption_image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(`Imgflip API error: ${result.error_message}`);
      }

      console.log('✅ Meme created successfully!');

      return {
        imageUrl: result.data.url,
        pageUrl: result.data.page_url,
        captions: {
          topText: inputData.captions.topText,
          bottomText: inputData.captions.bottomText,
        },
        baseTemplate: inputData.baseTemplate.name,
        memeStyle: inputData.captions.memeStyle,
        humorLevel: inputData.captions.humorLevel,
        analysis: {
          message: `Created ${inputData.captions.memeStyle} meme with ${inputData.captions.humorLevel} humor level`,
        },
      };
    } catch (error) {
      console.error('Error generating meme:', error);
      throw new Error('Failed to generate meme');
    }
  },
});
```

#### 7. Update Steps Exports
Update `src/mastra/workflows/steps/index.ts`:
```typescript
export { extractFrustrationsStep } from './extract-frustrations';
export { findBaseMemeStep } from './find-base-meme';
export { generateCaptionsStep } from './generate-captions';
export { generateMemeStep } from './generate-meme';
```

#### 8. Create the Complete Workflow
Create `src/mastra/workflows/meme-generation.ts`:
```typescript
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import {
  extractFrustrationsStep,
  findBaseMemeStep,
  generateCaptionsStep,
  generateMemeStep,
} from './steps';

export const memeGenerationWorkflow = createWorkflow({
  id: 'meme-generation',
  description: 'Complete workflow to generate memes from workplace frustrations',
  inputSchema: z.object({
    userInput: z.string().describe('Raw user input about work frustrations'),
  }),
  outputSchema: z.object({
    shareableUrl: z.string(),
    pageUrl: z.string().optional(),
    analysis: z.object({
      message: z.string(),
    }),
  }),
  steps: [
    extractFrustrationsStep,
    findBaseMemeStep,
    generateCaptionsStep,
    generateMemeStep,
  ],
});

// Build the workflow chain with data mapping
memeGenerationWorkflow
  .then(extractFrustrationsStep)
  .then(findBaseMemeStep)
  .map({
    frustrations: {
      step: extractFrustrationsStep,
      path: '.',
    },
    baseTemplate: {
      step: findBaseMemeStep,
      path: 'templates.0',
    },
  })
  .then(generateCaptionsStep)
  .map({
    baseTemplate: {
      step: findBaseMemeStep,
      path: 'templates.0',
    },
    captions: {
      step: generateCaptionsStep,
      path: '.',
    },
  })
  .then(generateMemeStep)
  .map({
    shareableUrl: {
      step: generateMemeStep,
      path: 'imageUrl',
    },
    pageUrl: {
      step: generateMemeStep,
      path: 'pageUrl',
    },
    analysis: {
      step: generateMemeStep,
      path: 'analysis',
    },
  })
  .commit();
```

#### 9. Update Mastra Configuration
Update `src/mastra/index.ts`:
```typescript
import { Mastra } from '@mastra/core';
import { storage } from './memory';
import { memeGenerationWorkflow } from './workflows/meme-generation';

export const mastra = new Mastra({
  storage,
  agents: {},
  workflows: {
    'meme-generation': memeGenerationWorkflow,
  },
  telemetry: {
    enabled: true,
  },
});
```

#### 10. Test the Complete Workflow
1. Go to http://localhost:4111/workflows
2. Click on "meme-generation"
3. Enter frustrations and watch the magic happen!
4. You'll see each step execute and get a meme URL at the end

---

## Step 3: Add Agent Integration

### Summary
**Goal**: Create an AI agent that provides a conversational interface to the workflow.

**What you'll complete**:
- ✅ Create a Mastra agent with instructions
- ✅ Connect the agent to the workflow
- ✅ Implement the API endpoint
- ✅ Test the conversational interface

**Relevant docs**: 
- [Mastra Agents](https://mastra.ai/docs/agents)
- [Agent Memory](https://mastra.ai/docs/memory)
- [AI SDK](https://sdk.vercel.ai/docs)

### Instructions

#### 1. Create the Meme Generator Agent
Create `src/mastra/agents/meme-generator.ts`:
```typescript
import { Agent } from '@mastra/core';
import { openai } from '@ai-sdk/openai';
import { memory } from '../memory';
import { memeGenerationWorkflow } from '../workflows/meme-generation';

export const memeGeneratorAgent = new Agent({
  name: 'MemeGenerator',
  instructions: `
    You are a helpful AI assistant that turns workplace frustrations into funny, shareable memes. 
    
    CRITICAL: When a user describes ANY workplace frustration (even briefly), IMMEDIATELY run the "meme-generation" workflow. Do NOT ask for more details.
    
    WORKFLOW - Run the complete meme generation workflow:
    Use the "meme-generation" workflow when user mentions any frustration. This workflow will:
    1. Extract frustrations from user input
    2. Find appropriate meme templates
    3. Generate captions
    4. Create the meme image
    
    After running the workflow, examine the output for the shareableUrl and present it to the user with an enthusiastic, celebratory message that relates to their frustration.
    
    You have access to chat history, so you can reference previous conversations and memes created for the user.
  `,
  model: openai('gpt-4o-mini'),
  memory,
  workflows: {
    'meme-generation': memeGenerationWorkflow,
  },
});
```

#### 2. Update Mastra Configuration
Update `src/mastra/index.ts`:
```typescript
import { Mastra } from '@mastra/core';
import { storage } from './memory';
import { memeGeneratorAgent } from './agents/meme-generator';
import { memeGenerationWorkflow } from './workflows/meme-generation';

export const mastra = new Mastra({
  storage,
  agents: {
    memeGenerator: memeGeneratorAgent,
  },
  workflows: {
    'meme-generation': memeGenerationWorkflow,
  },
  telemetry: {
    enabled: true,
  },
});
```

#### 3. Implement the API Endpoint
Update `app/api/meme-generator/route.ts`:
```typescript
import { mastra } from '../../../src/mastra';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, resourceId, threadId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 },
      );
    }

    // Get the meme generator agent
    const agent = mastra.getAgent('memeGenerator');

    if (!agent) {
      return NextResponse.json(
        { error: 'Meme generator agent not found' },
        { status: 500 },
      );
    }

    // Generate response with memory support
    const memoryConfig = {
      resourceId: resourceId || 'default_user',
      threadId: threadId || 'meme_generation_thread',
    };

    const response = await agent.generate(message, memoryConfig);

    return NextResponse.json({
      success: true,
      response: response,
      memoryConfig,
    });
  } catch (error) {
    console.error('Error in meme generator API:', error);

    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
```

#### 4. Test the Agent
1. Use a tool like Postman or curl to test:
```bash
curl -X POST http://localhost:4111/api/meme-generator \
  -H "Content-Type: application/json" \
  -d '{"message": "My meetings always run over time and nobody respects the agenda"}'
```

2. Or create a simple test page to interact with the agent through a UI

3. The agent should:
   - Understand your frustration
   - Run the workflow automatically
   - Return a meme URL with a fun message

---

## Step 4: Final Polish

### Summary
**Goal**: Add final touches to make the application production-ready.

**What you'll complete**:
- ✅ Add chat history endpoint
- ✅ Improve error handling
- ✅ Optimize agent instructions
- ✅ Test the complete system

**Relevant docs**: 
- [Error Handling](https://mastra.ai/docs/error-handling)
- [Best Practices](https://mastra.ai/docs/best-practices)

### Instructions

#### 1. Add Chat History Endpoint
Create `app/api/chat-history/route.ts`:
```typescript
import { mastra } from '@/src/mastra';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const resourceId = url.searchParams.get('resourceId') || 'default_user';
    const threadId = url.searchParams.get('threadId') || 'meme_generation_thread';

    const messages = await mastra.memory.getMessages({
      resourceId,
      threadId,
    });

    return NextResponse.json({
      success: true,
      messages: messages,
      count: messages.length,
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch chat history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
```

#### 2. Test the Complete System
1. Send multiple messages to build conversation history
2. Verify memes are generated correctly
3. Check that chat history is preserved
4. Test error cases (bad API keys, network issues)

#### 3. Production Considerations
- Add rate limiting to prevent abuse
- Implement proper error boundaries
- Add logging and monitoring
- Consider caching meme templates
- Add user authentication if needed

---

## Congratulations! 🎉

You've successfully built a complete AI-powered meme generator using Mastra! 

### What You've Learned
- ✅ Creating typed workflow steps with Zod schemas
- ✅ Using AI for structured data extraction
- ✅ Chaining steps together with data mapping
- ✅ Building conversational agents
- ✅ Integrating external APIs
- ✅ Managing conversation memory

### Next Steps
- Deploy your application
- Add more meme sources
- Create different types of workflows
- Build agents for other use cases
- Explore Mastra's advanced features

### Resources
- [Mastra Documentation](https://mastra.ai/docs)
- [Workshop Repository](https://github.com/your-repo)
- [Mastra Discord Community](https://discord.gg/mastra)

Happy meme generating! 🚀