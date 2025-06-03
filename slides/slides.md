---
theme: seriph
background: https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1920
title: Build AI Agents with Mastra
info: |
  ## AI Meme Generator Workshop
  Learn to build production-ready AI agents and workflows using TypeScript
class: text-center
highlighter: shiki
drawings:
  persist: false
transition: slide-left
mdc: true
---

# Build AI Agents with Mastra

## Turn Workplace Frustrations into Memes with AI

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    Press Space for next page <carbon:arrow-right class="inline"/>
  </span>
</div>

---
layout: two-cols
---

# Welcome! 👋

<div class="text-xl">

**Today's Mission:**  
Build an AI-powered meme generator that transforms workplace frustrations into shareable content

**Format:**
- 20 min intro & concepts
- 90 min hands-on coding
- 10 min wrap-up & Q&A

</div>

::right::

<div class="pl-8 pt-4">

```mermaid {scale: 0.8}
graph TD
    A[User Frustration] --> B[AI Agent]
    B --> C[Extract & Categorize]
    C --> D[Find Meme Template]
    D --> E[Generate Captions]
    E --> F[Create Meme]
    F --> G[Share & Laugh!]
```

</div>

---

# About Us

<div class="grid grid-cols-2 gap-8">
<div>

## WorkOS

<img src="https://workos.com/images/logo.svg" class="h-12 mb-4" />

We build developer tools that make enterprise features easy:

- **SSO/SAML** - Enterprise authentication
- **Directory Sync** - SCIM protocol  
- **Audit Logs** - Compliance-ready events
- **Fine-Grained Authorization** - Advanced permissions

</div>
<div>

### Why We're Here

We love building tools that make developers' lives easier. Mastra is our latest exploration into making AI development more accessible and production-ready.

### Our Mission

Make complex enterprise features as simple as possible for developers to implement.

</div>
</div>

---
layout: image-right
image: https://github.com/nicknisi.png
---

# Nick Nisi

## Developer Advocate @ WorkOS

- 🎙️ Host of JS Party podcast
- 💻 TypeScript enthusiast
- 🔧 Vim user (btw)
- 🌐 @nicknisi everywhere

### Fun Facts
- Conference organizer (NEJS Conf, TSConf)
- Dad jokes connoisseur
- Mechanical keyboard collector

---
layout: image-right
image: https://github.com/zkirby.png
---

# Zack Kirby

## Software Engineer @ WorkOS

- 🏗️ Building Mastra
- 🤖 AI/ML engineering
- 🚀 Full-stack TypeScript
- 🌐 @zkirby on GitHub

### Fun Facts
- Loves building developer tools
- Coffee enthusiast
- Always experimenting with new AI models

---

# What is Mastra? 

<div class="grid grid-cols-2 gap-8 pt-4">

<div>

## The Framework

**Mastra** is a TypeScript framework for building AI applications with:

- 🔄 **Workflows** - Composable, typed pipelines
- 🔧 **Tools** - Reusable functions agents can call
- 🤖 **Agents** - Stateful AI entities with memory
- 💾 **Built-in persistence** - Conversation memory
- 🔍 **Observability** - See what your AI is doing
- 🟰 Evaluation - Mastra can tell you the health of your pipeline over time

</div>

<div>

## Why Mastra?

```typescript
// Type-safe from end to end
const workflow = createWorkflow({
  inputSchema: z.object({
    frustration: z.string()
  }),
  outputSchema: z.object({
    memeUrl: z.string()
  }),
  steps: [extractStep, generateStep]
});

// Agents that just work
const agent = new Agent({
  name: 'MemeBot',
  workflows: { memeGen: workflow }
});
```

</div>

</div>

---

# Why Build Internal AI Tools?

<div class="grid grid-cols-2 gap-8">

<div>

## The Problem

**Every company needs custom AI tools:**
- Customer support automation
- Document processing pipelines
- Data analysis workflows
- Content generation systems

**But building them is hard:**
- No standards or best practices
- Difficult to maintain and debug
- Hard to share across teams
- Security and compliance concerns

</div>

<div>

## The Solution

**Mastra provides standards for:**
- 🏗️ **Consistent architecture** across all tools
- 🔒 **Type safety** from input to output
- 🔍 **Built-in observability** and debugging
- 📊 **Evaluation** to measure quality over time
- 🚀 **Rapid deployment** patterns

**Perfect for:**
- Internal productivity tools
- Customer-facing AI features
- Data processing pipelines
- Automation workflows

</div>

</div>

---
layout: center
---

# Core Concepts

Let's understand the building blocks before we code

---

# Workflows 🔄

<div class="grid grid-cols-2 gap-8">

<div>

## What are Workflows?

**Workflows** are composable pipelines that:
- Chain multiple steps together
- Pass data between steps  
- Validate inputs/outputs with Zod
- Handle errors gracefully

Think of them as **typed, observable functions** that can do complex multi-step operations.

</div>

<div>

```typescript
// Define a workflow
const memeWorkflow = createWorkflow({
  id: 'generate-meme',
  steps: [
    extractFrustrations,
    findMemeTemplate,
    generateCaptions,
    createMeme
  ]
});

// Chain steps with data flow
workflow
  .then(extractStep)
  .map({ 
    // Map data between steps
    template: { 
      step: extractStep, 
      path: 'suggestedTemplate' 
    }
  })
  .then(generateStep)
  .commit();
```

</div>

</div>

---

# Tools 🔧

<div class="grid grid-cols-2 gap-8">

<div>

## What are Tools?

**Tools** are functions that agents can call:
- File system access
- API calls
- Database queries
- Custom business logic

They extend what your AI can **actually do** beyond just chatting.

<div class="mt-4 p-4 bg-blue-500 bg-opacity-20 rounded">
💡 **Note:** We won't use tools today, but they're key for production apps where agents need to interact with external systems.
</div>

</div>

<div>

```typescript
// Example tool definition
const searchMemeTool = createTool({
  id: 'search-memes',
  description: 'Search for meme templates',
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().optional()
  }),
  execute: async ({ query, limit = 10 }) => {
    const results = await imgflipAPI.search({
      q: query,
      num: limit
    });
    return results;
  }
});

// Agents can use tools autonomously
const agent = new Agent({
  tools: { searchMeme: searchMemeTool }
});
```

</div>

</div>

---

# Agents 🤖

<div class="grid grid-cols-2 gap-8">

<div>

## What are Agents?

**Agents** are stateful AI entities that:
- Maintain conversation memory
- Execute workflows autonomously
- Make decisions based on context
- Use tools to complete tasks

Think of them as **AI assistants with both memory and capabilities**.

</div>

<div>

```typescript
const memeAgent = new Agent({
  name: 'MemeGenerator',
  instructions: `
    You help people turn frustrations 
    into funny memes. When someone 
    shares a frustration, immediately 
    run the meme workflow.
  `,
  model: openai('gpt-4'),
  memory: storage,
  workflows: {
    'meme-gen': memeWorkflow
  }
});

// Agent maintains context
await agent.generate(
  "My meetings always run over", 
  { resourceId: "user-123" }
);
```

</div>

</div>

---

# MCP: Model Context Protocol 🔌

<div class="grid grid-cols-2 gap-8">

<div>

## What is MCP?

**Model Context Protocol** enables:
- Standard way to connect AI to data/tools
- Works with any MCP-compatible client
- Secure, controlled access to resources
- Built by Anthropic, open standard

## Mastra + MCP

Mastra can **consume MCP tools**:
```typescript
const agent = new Agent({
  tools: await mcpClient.getTools(),
  // Your agent can now use any MCP tool!
});
```

</div>

<div>

## MCP in Action

```typescript
// Connect to an MCP server
const mcpClient = new MCPClient({
  serverUrl: 'http://localhost:3000'
});

// Get available tools
const tools = await mcpClient.getTools();
// e.g., filesystem, database, API tools

// Use in your Mastra agent
const agent = new Agent({
  name: 'DataAnalyst',
  tools: {
    readFile: tools.readFile,
    queryDB: tools.queryDatabase,
    callAPI: tools.httpRequest
  }
});
```

</div>

</div>

---
layout: center
---

# mcp.shop 🛒

<div class="text-xl">

## Discover MCP Tools

<div class="mt-8">

🌐 **[mcp.shop](https://mcp.shop)** - The MCP tool marketplace

</div>

<div class="grid grid-cols-3 gap-4 mt-8">

<div class="p-4 bg-gray-100 rounded">

### Data Sources
- Databases
- File systems  
- APIs
- Cloud storage

</div>

<div class="p-4 bg-gray-100 rounded">

### Productivity
- GitHub
- Slack
- Email
- Calendar

</div>

<div class="p-4 bg-gray-100 rounded">

### Specialized
- Web scraping
- Data analysis
- Code execution
- Custom tools

</div>

</div>

<div class="mt-8 text-lg">

**Why it matters**: Instantly add capabilities to your Mastra agents without writing integrations!

</div>

</div>

---
layout: center
---

# Today's Build

## AI Meme Generator 🎭

Transform workplace frustrations into shareable memes using:
- **Workflows** to process and generate
- **Agents** to provide conversational interface
- **OpenAI** for understanding and creativity
- **Imgflip** for meme generation

---

# Workshop Format 📋

<div class="grid grid-cols-2 gap-8">

<div>

## Self-Paced Learning

1. **Clone the repo** and start at `step-0`
2. **Follow WORKSHOP.md** at your own pace
3. **Complete each step** before moving on
4. **Use branch checkpoints** if you fall behind

## Checkpoint Schedule

- **0:20** - Should complete Step 0 (Setup)
- **0:40** - Should complete Step 1 (First workflow)
- **1:00** - Should complete Step 2 (Full workflow)
- **1:20** - Should complete Step 3 (Agent)
- **1:40** - Should complete Step 4 (Polish)

</div>

<div>

## Getting Unstuck

### If you fall behind:
```bash
git checkout steps/step-2
npm install
```

### If you need help:
- 🙋 Raise your hand
- 💬 Ask in chat
- 👀 Check the solution branch

### Remember:
- **Quality > Speed**
- **Understanding > Completion**
- **It's OK to explore!**

</div>

</div>

---
layout: fact
---

# Let's Build! 🚀

## Get Started:

```bash
git clone git@github.com:workos/mastra-agents-meme-generator.git
cd mastra-agents-meme-generator
git checkout steps/step-0
npm install
```

<div class="mt-8 text-2xl">
Open <code>WORKSHOP.md</code> and begin!
</div>

---

# Checkpoint: Step 0 ✅
### Time: 0:20

<div class="text-xl">

You should have:
- ✅ Project cloned and dependencies installed
- ✅ `.env` file with your OpenAI API key
- ✅ Mastra playground running at `http://localhost:4111`
- ✅ Understanding of the project structure

### Trouble? 
```bash
git checkout steps/step-1
npm install
```

</div>

---

# Checkpoint: Step 1 ✅
### Time: 0:40

<div class="text-xl">

You should have:
- ✅ Created frustrations schema with Zod
- ✅ Built your first workflow step
- ✅ Tested extraction in the playground
- ✅ Seen structured data from AI

### Trouble?
```bash
git checkout steps/step-2
npm install
```

</div>

---

# Checkpoint: Step 2 ✅
### Time: 1:00

<div class="text-xl">

You should have:
- ✅ All workflow steps created
- ✅ Steps chained together with data mapping
- ✅ Successfully generated a meme!
- ✅ Understanding of workflow composition

### Trouble?
```bash
git checkout steps/step-3
npm install
```

</div>

---

# Checkpoint: Step 3 ✅
### Time: 1:20

<div class="text-xl">

You should have:
- ✅ Created the meme generator agent
- ✅ Agent responding conversationally
- ✅ Automatic workflow triggering
- ✅ Memory persistence working

### Trouble?
```bash
git checkout steps/step-4
npm install
```

</div>

---
layout: center
---

# Wrapping Up 🎉

## What We Built

- 🔄 **Multi-step workflow** with typed data flow
- 🤖 **Conversational agent** with memory
- 🎨 **Real meme generation** from frustrations
- 📦 **Production patterns** for AI apps

---

# Key Takeaways 💡

<div class="grid grid-cols-2 gap-8">

<div>

## Technical Learnings

- **Workflows** compose complex AI operations
- **Agents** add state and decision-making
- **Type safety** catches errors early
- **Structured generation** ensures reliable output

## Mastra Benefits

- 🏗️ **Framework, not boilerplate**
- 🔒 **Type-safe by default**
- 🔍 **Observable and debuggable**
- 🚀 **Production-ready patterns**

</div>

<div>

## What's Next?

### With Your Meme Generator:
- Add more meme sources
- Implement meme history
- Add user preferences
- Deploy to production

### With Mastra:
- Explore tool creation
- Build multi-agent systems
- Add vector databases
- Implement RAG patterns

</div>

</div>

---
layout: center
---

# Thank You! 🙏

<div class="text-xl">

## Resources

- 📚 **Docs**: [mastra.ai/docs](https://mastra.ai/docs)
- 💻 **GitHub**: [github.com/mastraai/mastra](https://github.com/mastraai/mastra)
- 💬 **Discord**: [mastra.ai/discord](https://mastra.ai/discord)

## Your Feedback Matters!

Please fill out our workshop survey: [link-to-survey]

</div>

---
layout: end
---

# Questions?

<div class="text-xl mt-8">

Let's discuss:
- Implementation details
- Architecture decisions  
- Production considerations
- What you'd build next

</div>
