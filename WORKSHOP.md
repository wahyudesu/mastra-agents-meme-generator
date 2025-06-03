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

### What You'll Learn
In this step, you'll master the art of **workflow composition** - connecting multiple AI-powered steps into a seamless pipeline. You'll learn how to:

- **Design robust data schemas** using Zod for type safety and validation
- **Integrate external APIs** (Imgflip) with proper error handling
- **Map data between workflow steps** to ensure smooth information flow
- **Create a multi-step AI pipeline** that transforms unstructured input into a finished product
- **Handle asynchronous operations** and API rate limits effectively

### Why This Matters
Building complete workflows is where the magic happens in AI applications. Instead of one-off AI calls, you're creating a **sophisticated pipeline** that:

1. **Maintains data integrity** through typed schemas
2. **Chains AI reasoning** with external services
3. **Handles complexity gracefully** with proper error boundaries
4. **Scales to real-world problems** beyond simple chatbots

This pattern is essential for production AI applications where you need reliable, predictable behavior across multiple steps.

### Key Concepts

#### 🔗 **Workflow Composition**
Mastra workflows use a **builder pattern** to chain steps together:
```typescript
workflow
  .then(stepA)        // Run first step
  .map({ ... })       // Transform data
  .then(stepB)        // Run second step with mapped data
  .commit()           // Finalize the workflow
```

#### 📊 **Data Mapping**
The `.map()` function tells Mastra how to pass data between steps:
```typescript
.map({
  fieldName: {
    step: previousStep,    // Which step to get data from
    path: 'nested.field'   // JSONPath to the specific data
  }
})
```

#### 🛡️ **Schema Validation**
Every step has input/output schemas that:
- **Validate data structure** at runtime
- **Provide TypeScript types** for development
- **Generate documentation** automatically
- **Catch errors early** before they propagate

#### 🌐 **External API Integration**
Real workflows often need external services. Best practices:
- **Always handle failures gracefully**
- **Include retry logic for transient errors**
- **Validate external API responses**
- **Use environment variables for credentials**

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

### What You'll Learn
In this step, you'll discover the power of **conversational AI agents** - entities that can maintain context, remember past interactions, and intelligently trigger workflows. You'll learn:

- **What agents are** and how they differ from simple AI API calls
- **Agent instructions** and how they shape behavior and decision-making
- **Memory systems** for conversation persistence across sessions
- **Workflow integration** to automatically trigger complex processes
- **API endpoint design** for conversational interfaces
- **Resource and thread management** for multi-user applications

### Why This Matters
Agents transform workflows from **tools you have to manually run** into **intelligent assistants that know when and how to help**. This step represents the evolution from:

- ❌ "User opens workflow UI → manually enters data → gets result"
- ✅ "User mentions problem in natural language → agent understands context → automatically creates solution"

This pattern is foundational for building AI applications that feel natural and proactive rather than mechanical.

### Key Concepts

#### 🤖 **What Are Agents?**
Agents are **stateful AI entities** that combine:
- **Persistent memory** across conversations
- **Instructions** that define their personality and behavior  
- **Tool access** to workflows, APIs, and external systems
- **Context awareness** to make intelligent decisions about when to act

#### 🧠 **Memory & Persistence**
Mastra agents use a memory system that tracks:
- **Conversation history** (what was said when)
- **User context** (resourceId = which user)
- **Thread context** (threadId = which conversation)
- **Workflow results** (what was created before)

#### 🎯 **Agent Instructions**
The `instructions` field is where you define:
- **Personality**: How the agent communicates
- **Behavior rules**: When to trigger workflows vs just chat
- **Domain knowledge**: What the agent knows about
- **Decision logic**: How to interpret user intent

#### 🔗 **Workflow Integration**
Agents can be configured with workflows that they can trigger automatically based on conversation context, making them proactive rather than reactive.

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

### What You'll Learn
In this final step, you'll transform your prototype into a **production-ready application**. You'll learn:

- **Production readiness principles** for AI applications
- **Comprehensive error handling** strategies
- **Testing methodologies** for workflow-driven applications
- **API design patterns** for conversational interfaces
- **Observability and monitoring** considerations
- **Scalability patterns** for multi-user applications

### Why This Matters
Moving from a working demo to a production system requires thinking about **reliability, maintainability, and user experience**. This step covers:

1. **Error resilience**: What happens when APIs fail, networks disconnect, or users send unexpected input?
2. **User experience**: How do users understand what's happening and recover from issues?
3. **System observability**: How do you monitor and debug a system with multiple AI components?
4. **Data management**: How do you handle conversation history and user data responsibly?

These considerations separate toy projects from real applications that users trust and depend on.

### Key Concepts

#### 🛡️ **Error Handling Strategies**
Production AI applications need multiple layers of error handling:
- **Input validation**: Catch bad data before it reaches expensive AI calls
- **Service degradation**: Graceful fallbacks when external APIs fail
- **User communication**: Clear error messages that help users understand what went wrong
- **System recovery**: Automatic retries and circuit breaker patterns

#### 📊 **Testing Patterns**
AI applications require unique testing approaches:
- **Unit tests**: Test individual components and data transformations
- **Integration tests**: Verify workflows work end-to-end
- **Conversation tests**: Ensure agents respond appropriately to different inputs
- **Load tests**: Verify the system handles multiple concurrent users

#### 🔍 **Observability**
Understanding AI system behavior requires:
- **Structured logging**: Track workflow execution and AI decisions
- **Metrics collection**: Monitor success rates, latency, and costs
- **Conversation tracking**: Ability to debug specific user interactions
- **Performance monitoring**: Identify bottlenecks in multi-step workflows
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
**What this does**: Create an API endpoint that allows clients to retrieve conversation history, enabling features like conversation persistence across sessions and conversation replay.

Create `app/api/chat-history/route.ts`:
```typescript
import { mastra } from '@/src/mastra';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const resourceId = url.searchParams.get('resourceId') || 'default_user';
    const threadId = url.searchParams.get('threadId') || 'meme_generation_thread';

    // Input validation for production use
    if (resourceId.length > 100 || threadId.length > 100) {
      return NextResponse.json(
        { error: 'Resource ID and Thread ID must be under 100 characters' },
        { status: 400 },
      );
    }

    // Fetch conversation history from Mastra's memory system
    const messages = await mastra.memory.getMessages({
      resourceId,
      threadId,
    });

    // Filter out sensitive information if needed
    const publicMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      timestamp: msg.createdAt,
      // Exclude: rawContent, toolInvocations, internal metadata
    }));

    return NextResponse.json({
      success: true,
      messages: publicMessages,
      count: publicMessages.length,
      pagination: {
        // In production, you'd implement pagination
        hasMore: false,
        cursor: null,
      },
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    
    // Don't expose internal error details to clients
    const isProduction = process.env.NODE_ENV === 'production';
    
    return NextResponse.json(
      {
        error: 'Failed to fetch chat history',
        details: isProduction ? 'Internal server error' : error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
```

### Why This Endpoint Matters

**🔄 Conversation Continuity**:
- Users can see their previous interactions when they return
- Context is preserved across browser sessions or app restarts
- Users can reference previous memes or conversations

**🐛 Debugging Support**:
- Support teams can view conversation history to help users
- Developers can analyze conversation patterns and improve agent responses
- System administrators can track usage patterns

**📱 Multi-platform Support**:
- Web apps, mobile apps, and desktop clients can all access the same history
- Conversations started on one device continue seamlessly on another

**🔒 Privacy Considerations**:
The endpoint filters out sensitive internal data and includes input validation to prevent abuse. In production, you'd also add:
- Authentication to ensure users only see their own conversations
- Rate limiting to prevent API abuse
- Data retention policies for GDPR compliance

#### 2. Test the Complete System
**What this does**: Implement a comprehensive testing strategy that validates the entire application from user input to meme generation, including error scenarios and edge cases.

### 🧪 Testing Strategy

**A. Functional Testing - Happy Path**
```bash
# Test 1: Basic meme generation
curl -X POST http://localhost:3000/api/meme-generator \
  -H "Content-Type: application/json" \
  -d '{"message": "Our deployment process is a nightmare", "resourceId": "test_user_1", "threadId": "test_thread_1"}'

# Test 2: Conversation continuity
curl -X POST http://localhost:3000/api/meme-generator \
  -H "Content-Type: application/json" \
  -d '{"message": "Make another one about meetings", "resourceId": "test_user_1", "threadId": "test_thread_1"}'

# Test 3: Chat history retrieval
curl "http://localhost:3000/api/chat-history?resourceId=test_user_1&threadId=test_thread_1"
```

**B. Error Handling Testing**
```bash
# Test 4: Missing message
curl -X POST http://localhost:3000/api/meme-generator \
  -H "Content-Type: application/json" \
  -d '{}'

# Test 5: Invalid input
curl -X POST http://localhost:3000/api/meme-generator \
  -H "Content-Type: application/json" \
  -d '{"message": ""}'

# Test 6: Very long input
curl -X POST http://localhost:3000/api/meme-generator \
  -H "Content-Type: application/json" \
  -d '{"message": "'$(printf 'a%.0s' {1..10000})'"}'
```

**C. Edge Case Testing**
```bash
# Test 7: Non-frustration input
curl -X POST http://localhost:3000/api/meme-generator \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the weather like?", "resourceId": "test_user_2", "threadId": "test_thread_2"}'

# Test 8: Multiple users/threads isolation
curl -X POST http://localhost:3000/api/meme-generator \
  -H "Content-Type: application/json" \
  -d '{"message": "Different user frustration", "resourceId": "test_user_3", "threadId": "test_thread_3"}'
```

### ✅ Expected Results

**Successful meme generation should return**:
```json
{
  "success": true,
  "response": "I totally understand your frustration with deployments! Here's a meme that captures that pain: https://i.imgflip.com/xyz123.jpg - May this meme bring some levity to your deployment woes! 😄",
  "memoryConfig": {
    "resourceId": "test_user_1", 
    "threadId": "test_thread_1"
  }
}
```

**Error responses should be graceful**:
```json
{
  "error": "Message is required",
  "details": "Request body must include a 'message' field"
}
```

**Chat history should show conversation flow**:
```json
{
  "success": true,
  "messages": [
    {
      "id": "msg_1",
      "content": "Our deployment process is a nightmare", 
      "role": "user",
      "timestamp": "2024-01-01T12:00:00Z"
    },
    {
      "id": "msg_2", 
      "content": "I totally understand your frustration...",
      "role": "assistant",
      "timestamp": "2024-01-01T12:00:05Z"
    }
  ],
  "count": 2
}
```

### 🐛 What to Test For

1. **Workflow reliability**: Does the meme generation pipeline complete successfully?
2. **Memory persistence**: Are conversations maintained across API calls?
3. **Error resilience**: Does the system handle failures gracefully?
4. **User isolation**: Can different users have separate conversations?
5. **Response quality**: Are agent responses appropriate and helpful?
6. **Performance**: Are response times reasonable (< 30 seconds for meme generation)?

#### 3. Production Considerations
**What this does**: Transform your workshop project into an application ready for real users by addressing scalability, security, and reliability concerns.

### 🛡️ Security & Authentication

**API Security**:
```typescript
// Add to your API routes
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});
```

**User Authentication**:
```typescript
// Example with NextAuth.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Use session.user.id as resourceId for memory isolation
  const resourceId = session.user.id;
}
```

### 📊 Monitoring & Observability

**Structured Logging**:
```typescript
import { logger } from '@/lib/logger';

// In your workflow steps
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'info',
  service: 'meme-generation',
  step: 'extract-frustrations',
  userId: resourceId,
  threadId: threadId,
  duration: performance.now() - startTime,
  success: true,
}));
```

**Error Tracking**:
```typescript
// Example with Sentry
import * as Sentry from '@sentry/nextjs';

export async function POST(request: NextRequest) {
  try {
    // ... your code
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        component: 'meme-generator-api',
        operation: 'agent-generate',
      },
      user: { id: resourceId },
    });
    
    throw error;
  }
}
```

### ⚡ Performance Optimization

**Caching Strategy**:
```typescript
// Cache meme templates to reduce API calls
import { Redis } from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

async function getCachedMemeTemplates() {
  const cached = await redis.get('meme_templates');
  if (cached) {
    return JSON.parse(cached);
  }
  
  const templates = await fetchFromImgflip();
  await redis.setex('meme_templates', 3600, JSON.stringify(templates)); // Cache for 1 hour
  return templates;
}
```

**Response Streaming**:
```typescript
// For real-time workflow updates
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Stream workflow progress to client
      mastra.on('workflow:step:complete', (data) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
```

### 💾 Data Management

**Database Optimization**:
```sql
-- Add indexes for faster memory queries
CREATE INDEX idx_messages_resource_thread ON messages(resource_id, thread_id, created_at);
CREATE INDEX idx_messages_created_at ON messages(created_at) WHERE created_at > NOW() - INTERVAL '30 days';
```

**Data Retention**:
```typescript
// Automatic cleanup of old conversations
async function cleanupOldMessages() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  await mastra.memory.deleteMessages({
    where: {
      createdAt: { lt: thirtyDaysAgo },
      // Keep messages that users have starred/bookmarked
      starred: false,
    },
  });
}
```

### 🚀 Scalability Patterns

**Horizontal Scaling**:
- **Load balancing**: Distribute requests across multiple server instances
- **Stateless design**: Store all state in external systems (database, Redis)
- **Queue processing**: Use job queues for long-running meme generation

**Cost Optimization**:
- **AI model selection**: Use smaller models for simple tasks, larger models for complex reasoning
- **Request batching**: Combine multiple similar requests to reduce API calls
- **Smart caching**: Cache AI responses for common frustration patterns

### 🔧 DevOps & Deployment

**Environment Variables**:
```bash
# Production .env
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
OPENAI_API_KEY=sk-...
IMGFLIP_USERNAME=your_account
IMGFLIP_PASSWORD=your_password
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://yourdomain.com
SENTRY_DSN=https://...
```

**Docker Configuration**:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Health Checks**:
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Test database connection
    await mastra.memory.getMessages({ resourceId: 'health_check', threadId: 'test' });
    
    // Test AI service
    await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 1,
    });
    
    return NextResponse.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ status: 'unhealthy', error: error.message }, { status: 503 });
  }
}
```

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