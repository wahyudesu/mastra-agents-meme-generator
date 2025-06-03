# Step 1: Your First Workflow Step

## What We're Building

In this step, we'll create our first workflow step that uses AI to extract and categorize workplace frustrations from user input.

### New Concepts
- **Workflow Steps**: Reusable units of work with typed inputs/outputs
- **Zod Schemas**: Runtime type validation for data
- **Structured Generation**: Getting predictable JSON from AI models

## What's New in This Branch

1. **Schemas** (`src/mastra/workflows/schemas/frustrations.ts`)
   - Defines the structure for extracted frustrations
   - Uses Zod for type safety

2. **First Step** (`src/mastra/workflows/steps/extract-frustrations.ts`)
   - Extracts frustrations from user input
   - Uses OpenAI's structured generation

3. **Test Workflow** (`src/mastra/workflows/test-workflow.ts`)
   - Simple workflow with just one step
   - Registered in Mastra config

## Try It Out!

1. **Start the dev server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open the Mastra Playground**:
   - Navigate to http://localhost:4111
   - Click on the "Workflows" tab
   - You should see "test-workflow" listed!

3. **Run the workflow**:
   - Click on "test-workflow"
   - Enter some frustrations like:
     - "My meetings always run over time"
     - "The deployment process is broken and nobody knows how to fix it"
     - "I have to explain the same thing to different teams every week"
   - Click "Run Workflow"
   - See the structured output!

## Understanding the Code

### The Schema
```typescript
export const frustrationsSchema = z.object({
  frustrations: z.array(
    z.object({
      frustration: z.string(),
      category: z.enum(['meetings', 'tools', 'communication', 'process', 'other']),
      intensity: z.enum(['mild', 'moderate', 'severe']),
    }),
  ),
  analysis: z.object({
    message: z.string(),
    dominantTheme: z.string(),
  }),
});
```

### The Step
```typescript
export const extractFrustrationsStep = createStep({
  id: 'extract-frustrations',
  inputSchema: z.object({ userInput: z.string() }),
  outputSchema: frustrationsSchema,
  execute: async ({ inputData }) => {
    // AI magic happens here!
  },
});
```

## Experiment!

Try different inputs:
- Multiple frustrations in one message
- Different intensity levels
- Various categories

Notice how the AI consistently returns structured data that matches our schema!

## What's Next?

In Step 2, we'll add more steps to:
- Find appropriate meme templates
- Generate funny captions
- Create the actual meme

Ready? Head to Step 2! 🚀