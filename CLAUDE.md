# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

## Architecture Overview

Sequenzia AI implements the **Expanding Message Paradigm** - an AI chat interface where messages can expand in-place to reveal interactive content (forms, charts, code, cards) rather than opening in separate panels.

### Core Concept: 4-State Expansion System

Messages exist in one of four states:

- **collapsed**: Icon + title preview only
- **partial**: Limited content (3 form fields, 10 code lines, 150px chart)
- **expanded**: Full content
- **focused**: Full content with backdrop blur on other messages

State transitions: collapsed → partial → expanded → collapsed (cycle), any state → focused via Cmd+F

### Component Hierarchy

```text
ChatProvider (expansion state + AI connection)
├── ChatContainer (scroll management)
│   └── MessageBubble (per-message expansion animation)
│       └── ExpandableContent (routes to content type)
│           ├── FormContent
│           ├── ChartContent
│           ├── CodeContent
│           └── CardContent
└── InputComposer (message input)
```

### State Management Layers

1. **ChatProvider context** - Expansion states via reducer (`Map<messageId, ExpansionStateData>`), AI chat via `@ai-sdk/react`
2. **TanStack Query** - Server state caching (configured in QueryProvider)
3. **Local component state** - Form data, animation state

### Key Data Flow

1. User input → `ChatProvider.sendMessage()` → POST `/api/chat`
2. API uses `streamText()` with 4 tools: `generateForm`, `generateChart`, `generateCode`, `generateCard`
3. Tool results become `expandableContent` on messages
4. New assistant messages with expandable content auto-expand to 'partial' state
5. Expansion changes trigger Framer Motion animations (250ms expand, 200ms collapse)

### AI Integration

- **Gateway**: Vercel AI Gateway for multi-provider support
- **Models**: Configurable via model picker (OpenAI, Anthropic, Google)
- **Transport**: `DefaultChatTransport` from `ai` package (AI SDK v6)
- **Tools**: Zod-validated schemas in `/api/chat/route.ts` - tools return structured data directly
- **Model Config**: `/src/lib/models.ts` defines available models

### Expandable Content Types

Each type implements 3 display modes (preview/partial/full):

| Type  | Schema                   | Partial Display   |
| ----- | ------------------------ | ----------------- |
| form  | `FormContentDataSchema`  | First 3 fields    |
| chart | `ChartContentDataSchema` | 150px height      |
| code  | `CodeContentDataSchema`  | First 10 lines    |
| card  | `CardContentDataSchema`  | Truncated content |

### Theming

CSS custom properties in `globals.css`:

- Base: `--background`, `--foreground`, `--primary`, etc. (shadcn/ui tokens)
- Message: `--message-user`, `--message-assistant`, `--message-focused`
- Content: `--form-field`, `--chart-grid`, `--code-background`

Theme switching via `ThemeProvider` (light/dark/system).

### Key Hooks

- **useExpansion**: Message expansion logic, keyboard nav (Enter/Escape/Cmd+F), double-tap detection
- **useScrollAnchor**: Anchor-based scrolling during expansions, auto-scroll to bottom

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
