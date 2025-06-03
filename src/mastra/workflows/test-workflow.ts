import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { extractFrustrationsStep } from './steps';

// Simple workflow with just one step for now
export const testWorkflow = createWorkflow({
  id: 'test-workflow',
  description: 'Test workflow with frustration extraction',
  inputSchema: z.object({
    userInput: z.string().describe('Raw user input about work frustrations'),
  }),
  outputSchema: extractFrustrationsStep.outputSchema,
  steps: [extractFrustrationsStep],
});

// Connect the step
testWorkflow
  .then(extractFrustrationsStep)
  .commit();