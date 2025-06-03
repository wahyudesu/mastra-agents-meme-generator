# Mastra Workshop Guide

## Workshop Overview

Welcome to the Mastra workshop! Over the next 2 hours, we'll build a complete AI-powered meme generator that turns workplace frustrations into shareable memes.

### Timeline
- **0:00-0:15** - Introduction & Setup
- **0:15-0:30** - Step 0: Project Setup (Current)
- **0:30-0:55** - Step 1: First Workflow Step
- **0:55-1:30** - Step 2: Complete Workflow
- **1:30-1:50** - Step 3: Agent Integration
- **1:50-2:00** - Step 4: Polish & Q&A

### Getting Help

If you fall behind, you can catch up by checking out the next step branch:

```bash
# If you're stuck on step 1, jump to step 2:
git checkout steps/step-2
npm install
```

## Step 0: Project Setup (Current Branch)

### Goals
- ✅ Get the development environment running
- ✅ Understand the project structure
- ✅ Configure environment variables
- ✅ Explore the Mastra playground

### What's Provided
- Basic Next.js application
- Mastra framework installed and configured
- Memory/storage already set up (in `src/mastra/memory.ts`)
- Empty agents and workflows objects ready to fill

### Your Tasks

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional but recommended for reliability:
   IMGFLIP_USERNAME=your_imgflip_username
   IMGFLIP_PASSWORD=your_imgflip_password
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Explore the Mastra playground:**
   - Visit http://localhost:4111
   - Click on "Workflows" tab (it's empty now!)
   - This is where we'll test our workflow steps

### Key Files to Review
- `src/mastra/index.ts` - Mastra configuration (note the empty objects!)
- `src/mastra/memory.ts` - Storage setup (already configured)
- `app/page.tsx` - Main UI component

### Understanding Mastra Structure

```typescript
// src/mastra/index.ts
export const mastra = new Mastra({
  storage,        // ✅ Already configured
  agents: {},     // 📝 We'll add in Step 3
  workflows: {},  // 📝 We'll add in Steps 1-2
  telemetry: { enabled: true },
});
```

### What's Next?
In Step 1, we'll create our first workflow step that extracts frustrations from user input using AI-powered structured generation. You'll see it run in the Mastra playground!

---

## Tips for Success

1. **Don't worry about the code you don't understand** - Focus on the patterns
2. **The playground is your friend** - Test everything there first
3. **Ask questions** - We have helper instructors!
4. **Have fun** - We're building something entertaining!

Ready? Let's move to Step 1! 🚀