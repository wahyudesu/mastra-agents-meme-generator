import { Mastra } from '@mastra/core';
import { VercelDeployer } from '@mastra/deployer-vercel';
import { memeGeneratorAgent } from './agents/meme-generator';
import { memeGenerationWorkflow } from './workflows/meme-generation';

export const mastra = new Mastra({
  deployer: new VercelDeployer({
    teamSlug: process.env.VERCEL_TEAM_SLUG || 'your-team-slug',
    projectName: process.env.VERCEL_PROJECT_NAME || 'mastra-meme-generator',
    token: process.env.VERCEL_TOKEN!, // This is required
  }),
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