# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Framework**: Next.js 16.1 with App Router
- **React**: 19.2 with Server Components
- **AI**: Vercel AI SDK v6 (`ai`, `@ai-sdk/react`, `@ai-sdk/gateway`)
- **UI Components**: Vercel AI Elements, shadcn/ui
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **Validation**: Zod v4
- **State**: React Context + TanStack Query

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

## Architecture Overview

Sequenzia AI is a chat interface built on Vercel's AI Elements component library. It uses the AI SDK v6's UIMessage format for rendering messages with text, tool calls, and rich content.

### Component Hierarchy

```text
ChatProvider (AI connection via useChat)
├── ChatContainer (Conversation component with scroll management)
│   └── ChatMessage (Message + Tool components)
│       └── ExpandableContent (routes to content type)
│           ├── FormContent
│           ├── ChartContent
│           ├── CodeContent (uses AI Elements CodeBlock)
│           └── CardContent
└── InputComposer (PromptInput with model selector)
```

### AI Elements Components

Located in `src/components/ai-elements/`:

- **Conversation** - Container with sticky scroll behavior (`use-stick-to-bottom`)
- **Message** - User/assistant message bubbles with actions
- **PromptInput** - Text input with file attachments and model selection
- **Tool** - Collapsible tool invocation display with status
- **CodeBlock** - Syntax highlighted code with Shiki
- **Loader** - Streaming/loading indicators
- **Reasoning** - Expandable thinking process
- **Confirmation** - Tool approval dialogs

### State Management

1. **ChatProvider context** - AI chat via `useChat` from `@ai-sdk/react`, model selection
2. **TanStack Query** - Server state caching (configured in QueryProvider)
3. **Local component state** - Form data, animation state

### Key Data Flow

1. User input → `ChatProvider.sendMessage()` → POST `/api/chat`
2. API uses `streamText()` with 4 tools: `generateForm`, `generateChart`, `generateCode`, `generateCard`
3. Response streamed as `UIMessage` with parts (text, tool-*)
4. ChatMessage renders each part:
   - `text` parts → `MessageResponse`
   - `tool-*` parts → `Tool` component or custom `ExpandableContent`

### AI Integration

- **Gateway**: Vercel AI Gateway via `gateway()` function for multi-provider routing
- **Models**: Configurable via model picker:
  - GPT-5 Nano (default), GPT-5 Mini, GPT-4o Mini, GPT-4o
  - Claude Sonnet 4
  - Gemini 2.0 Flash
- **Chat Hook**: `useChat` from `@ai-sdk/react` with `DefaultChatTransport`
- **Streaming**: `streamText()` with `toUIMessageStreamResponse()` for SSE
- **Tools**: Zod-validated schemas returning structured data directly
- **AI Config** (`src/lib/ai/`):
  - `models.ts` - Model definitions with `gateway/provider/model` ID format (client-safe)
  - `models.server.ts` - `createModel()` with optional DevTools middleware (server-only)
  - `tools.ts` - Tool definitions (`generateForm`, `generateChart`, `generateCode`, `generateCard`)
  - `prompts.ts` - System prompt for Sequenzia assistant

### Expandable Content Types

Each type renders with full content (no preview modes):

| Type  | Schema                   | Component    |
| ----- | ------------------------ | ------------ |
| form  | `FormContentDataSchema`  | FormContent  |
| chart | `ChartContentDataSchema` | ChartContent |
| code  | `CodeContentDataSchema`  | CodeContent  |
| card  | `CardContentDataSchema`  | CardContent  |

### Theming

CSS custom properties in `globals.css`:

- Base: `--background`, `--foreground`, `--primary`, etc. (shadcn/ui tokens)
- Message: `--message-user`, `--message-assistant`
- Content: `--form-field`, `--chart-grid`
- Semantic: `--success`, `--warning`, `--error`, `--info`

Theme switching via `ThemeProvider` (light/dark/system).

### Environment

Requires `AI_GATEWAY_API_KEY` in `.env.local` for Vercel AI Gateway access.

To set up:

1. Get an API key from the [AI Gateway dashboard](https://vercel.com/ai-gateway)
2. Create `.env.local` with `AI_GATEWAY_API_KEY=your_key_here`

### Debugging

Set `AI_DEBUG=true` in `.env.local` to enable AI SDK DevTools. When enabled:

1. Run `npx @ai-sdk/devtools` to start the DevTools viewer
2. Access the web UI at http://localhost:4983
3. Inspect AI interactions, prompts, and tool calls

**Note**: DevTools stores data locally in plain text. Only use in development.
