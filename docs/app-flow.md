# Sequenzia AI - Application Flow

This document provides a comprehensive overview of how the Sequenzia AI application works, from user input to rendered output.

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Application Startup Flow](#application-startup-flow)
4. [Message Flow](#message-flow)
5. [Expansion System](#expansion-system)
6. [Component Hierarchy](#component-hierarchy)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Theming System](#theming-system)
10. [Key Files Reference](#key-files-reference)

---

## Overview

Sequenzia AI is a Next.js chat application implementing the **Expanding Message Paradigm** - messages can expand in-place to reveal interactive content (forms, charts, code, cards) rather than opening in separate panels.

### Core Technologies

- **Framework**: Next.js 15 (App Router)
- **AI Integration**: Vercel AI SDK v6 (`ai`, `@ai-sdk/react`)
- **AI Gateway**: Vercel AI Gateway for multi-provider model support
- **State Management**: React Context + useReducer
- **Server State**: TanStack Query
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS + shadcn/ui
- **Validation**: Zod schemas

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Browser (Client)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         RootLayout                                   │    │
│  │  ┌───────────────────────────────────────────────────────────────┐  │    │
│  │  │                      ThemeProvider                            │  │    │
│  │  │  ┌─────────────────────────────────────────────────────────┐  │  │    │
│  │  │  │                    QueryProvider                        │  │  │    │
│  │  │  │  ┌───────────────────────────────────────────────────┐  │  │  │    │
│  │  │  │  │                  ChatProvider                     │  │  │  │    │
│  │  │  │  │  ┌─────────────────────────────────────────────┐  │  │  │  │    │
│  │  │  │  │  │              Page Layout                    │  │  │  │  │    │
│  │  │  │  │  │  ┌────────────────────────────────────────┐ │  │  │  │  │    │
│  │  │  │  │  │  │ Header (ModelPicker + ThemeToggle)     │ │  │  │  │  │    │
│  │  │  │  │  │  ├────────────────────────────────────────┤ │  │  │  │  │    │
│  │  │  │  │  │  │ ChatContainer                          │ │  │  │  │  │    │
│  │  │  │  │  │  │   └─ MessageBubble[]                   │ │  │  │  │  │    │
│  │  │  │  │  │  │        └─ ExpandableContent            │ │  │  │  │  │    │
│  │  │  │  │  │  │             ├─ FormContent             │ │  │  │  │  │    │
│  │  │  │  │  │  │             ├─ ChartContent            │ │  │  │  │  │    │
│  │  │  │  │  │  │             ├─ CodeContent             │ │  │  │  │  │    │
│  │  │  │  │  │  │             └─ CardContent             │ │  │  │  │  │    │
│  │  │  │  │  │  ├────────────────────────────────────────┤ │  │  │  │  │    │
│  │  │  │  │  │  │ InputComposer                          │ │  │  │  │  │    │
│  │  │  │  │  │  └────────────────────────────────────────┘ │  │  │  │  │    │
│  │  │  │  │  └─────────────────────────────────────────────┘  │  │  │  │    │
│  │  │  │  └───────────────────────────────────────────────────┘  │  │  │    │
│  │  │  └─────────────────────────────────────────────────────────┘  │  │    │
│  │  └───────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP POST /api/chat
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Server (API Route)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    /api/chat/route.ts                               │    │
│  │                                                                      │    │
│  │  1. Receive messages + modelId                                       │    │
│  │  2. Convert UIMessage[] → ModelMessage[]                             │    │
│  │  3. Call streamText() with:                                          │    │
│  │     - Vercel AI Gateway provider                                     │    │
│  │     - System prompt                                                  │    │
│  │     - 4 Tools (generateForm, generateChart, generateCode, generateCard)│   │
│  │  4. Return streaming response                                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
└──────────────────────────────────────│───────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Vercel AI Gateway                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Routes to appropriate provider based on modelId:                            │
│    - openai/gpt-5-nano → OpenAI                                             │
│    - openai/gpt-4o-mini → OpenAI                                            │
│    - openai/gpt-4o → OpenAI                                                 │
│    - anthropic/claude-sonnet-4 → Anthropic                                  │
│    - google/gemini-2.0-flash → Google                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Application Startup Flow

### 1. Server-Side Rendering (layout.tsx)

```
RootLayout
├── Load Google Fonts (Geist Sans, Geist Mono)
├── Set metadata (title, description)
└── Render:
    └── <html>
        └── <body>
            └── ThemeProvider (defaultTheme="system")
                └── QueryProvider
                    └── {children}
                    └── Toaster (sonner)
```

### 2. Client-Side Hydration (page.tsx)

```
Home (Client Component)
└── ChatProvider
    └── <div> (flex container, h-screen)
        ├── Header
        ├── ChatContainer (flex-1)
        └── InputComposer
```

### 3. Provider Initialization

1. **ThemeProvider**: Reads theme from localStorage, applies to document
2. **QueryProvider**: Creates TanStack Query client with default options
3. **ChatProvider**:
   - Initializes `useAIChat` hook with `DefaultChatTransport`
   - Creates expansion state reducer (empty Map)
   - Sets default model ID

---

## Message Flow

### Step-by-Step: User Sends a Message

```
1. USER INPUT
   ┌─────────────────┐
   │ InputComposer   │
   │ - User types    │
   │ - Presses Enter │
   └────────┬────────┘
            │
            ▼
2. MESSAGE DISPATCH
   ┌──────────────────────────────┐
   │ ChatProvider.sendMessage()  │
   │ - Calls aiSendMessage()     │
   │ - Includes modelId in body  │
   └────────┬─────────────────────┘
            │
            ▼
3. CLIENT TRANSPORT
   ┌──────────────────────────────┐
   │ DefaultChatTransport        │
   │ - POST to /api/chat         │
   │ - Body: { messages, modelId }│
   └────────┬─────────────────────┘
            │
            ▼
4. API ROUTE PROCESSING
   ┌──────────────────────────────────┐
   │ /api/chat/route.ts              │
   │ a. Parse request body           │
   │ b. Validate modelId             │
   │ c. Convert UIMessage→ModelMessage│
   │ d. Call streamText() with tools │
   └────────┬─────────────────────────┘
            │
            ▼
5. AI RESPONSE STREAMING
   ┌──────────────────────────────────┐
   │ Vercel AI Gateway               │
   │ - Routes to provider            │
   │ - Streams text + tool calls     │
   └────────┬─────────────────────────┘
            │
            ▼
6. RESPONSE PROCESSING
   ┌────────────────────────────────────────┐
   │ ChatProvider (useAIChat)              │
   │ a. Receives streaming chunks          │
   │ b. Updates aiMessages state           │
   │ c. Transforms to Message[] via useMemo│
   │ d. Parses tool results → expandableContent│
   └────────┬───────────────────────────────┘
            │
            ▼
7. AUTO-EXPANSION (useEffect)
   ┌────────────────────────────────────────┐
   │ If message has expandableContent and  │
   │ no expansion state exists:            │
   │ → Set to 'partial' state              │
   └────────┬───────────────────────────────┘
            │
            ▼
8. UI RENDER
   ┌────────────────────────────────────────┐
   │ ChatContainer                         │
   │ └─ MessageBubble (with animation)     │
   │     └─ ExpandableContent              │
   │         └─ FormContent/ChartContent/  │
   │            CodeContent/CardContent    │
   └───────────────────────────────────────┘
```

### Message Type Transformation

```typescript
// 1. AI SDK UIMessage (from useAIChat)
{
  id: "msg-1",
  role: "assistant",
  parts: [
    { type: "text", text: "Here's a chart..." },
    { type: "tool-generateChart", toolCallId: "tc-1", input: {...}, output: {...} }
  ]
}

// 2. Transformed to Message (internal type)
{
  id: "msg-1",
  role: "assistant",
  content: "Here's a chart...",
  timestamp: "2024-01-15T10:30:00Z",
  expandableContent: {
    type: "chart",
    chartType: "bar",
    title: "Sales Data",
    data: [...],
    xKey: "month",
    yKey: "sales"
  },
  toolInvocations: [...]
}
```

---

## Expansion System

### 4-State Model

Messages with expandable content exist in one of four states:

```
┌─────────────────────────────────────────────────────────────────┐
│                      EXPANSION STATES                            │
├─────────────┬─────────────┬─────────────┬───────────────────────┤
│  collapsed  │   partial   │  expanded   │       focused         │
├─────────────┼─────────────┼─────────────┼───────────────────────┤
│ Icon+Title  │ Preview     │ Full        │ Full + backdrop blur  │
│ only        │ (limited)   │ content     │ + scale 1.02          │
│             │             │             │ + ring highlight      │
├─────────────┼─────────────┼─────────────┼───────────────────────┤
│ Form: badge │ 3 fields    │ All fields  │ All + submit enabled  │
│ Chart: icon │ 150px       │ 300px       │ 300px + legend        │
│ Code: lang  │ 10 lines    │ All lines   │ All + stats           │
│ Card: title │ Truncated   │ Full + media│ Full + actions        │
└─────────────┴─────────────┴─────────────┴───────────────────────┘
```

### State Transitions

```
                    ┌──────────────────────┐
                    │                      │
                    ▼                      │
              ┌──────────┐                 │
              │ collapsed │◄───────────────┤
              └────┬─────┘                 │
                   │ click/Enter           │
                   ▼                       │
              ┌──────────┐                 │
              │ partial  │─────────────────┤
              └────┬─────┘                 │
                   │ click/Enter           │
                   ▼                       │
              ┌──────────┐                 │
              │ expanded │─────────────────┘
              └────┬─────┘     click/Enter
                   │
                   │ Cmd+F
                   ▼
              ┌──────────┐
              │ focused  │
              └────┬─────┘
                   │ Escape/Cmd+F
                   ▼
              ┌──────────┐
              │ expanded │
              └──────────┘
```

### Expansion State Management

```typescript
// State stored in Map<messageId, ExpansionStateData>
interface ExpansionStateData {
  messageId: string;
  state: 'collapsed' | 'partial' | 'expanded' | 'focused';
  pinned: boolean;        // Prevents collapse during collapseAll
  interactionDepth: number; // Tracks user interactions
}

// Reducer actions
type ExpansionAction =
  | { type: 'SET_STATE'; messageId: string; state: ExpansionState }
  | { type: 'TOGGLE'; messageId: string }     // Cycles: collapsed→partial→expanded→collapsed
  | { type: 'FOCUS'; messageId: string }      // Sets focused + pinned
  | { type: 'UNFOCUS'; messageId: string }    // Returns to expanded
  | { type: 'PIN'; messageId: string; pinned: boolean }
  | { type: 'COLLAPSE_ALL'; except?: string };
```

### Keyboard Navigation (useExpansion hook)

| Key        | Action                                      |
|------------|---------------------------------------------|
| `Enter`    | Toggle expansion state                      |
| `Space`    | Toggle expansion state                      |
| `Escape`   | If focused → unfocus; else → collapse       |
| `Cmd+F`    | Toggle focus mode                           |

### Double-Tap Detection

```typescript
// 300ms threshold for double-tap
if (timeSinceLastClick < 300) {
  // Double tap → jump between collapsed and expanded
} else {
  // Single tap → normal toggle through states
}
```

---

## Component Hierarchy

### Full Component Tree

```
App
└── RootLayout (layout.tsx)
    ├── ThemeProvider
    │   └── Provides: theme, resolvedTheme, setTheme, highContrast
    └── QueryProvider
        └── Provides: TanStack Query client
            └── Home (page.tsx)
                └── ChatProvider
                    ├── Provides: messages, isLoading, sendMessage, expansionStates, etc.
                    └── Layout Container
                        ├── Header
                        │   ├── Logo
                        │   ├── ModelPicker (Select dropdown)
                        │   └── ThemeDropdown (light/dark/system)
                        │
                        ├── ChatContainer
                        │   ├── Focus Overlay (when focusedMessageId exists)
                        │   ├── EmptyState (when no messages)
                        │   ├── MessageBubble[] (mapped from messages)
                        │   │   ├── Avatar
                        │   │   ├── Bubble (text + expandable content)
                        │   │   │   └── ExpandableContent
                        │   │   │       ├── FormContent
                        │   │   │       ├── ChartContent
                        │   │   │       ├── CodeContent
                        │   │   │       └── CardContent
                        │   │   └── Action buttons (copy, regenerate, focus)
                        │   └── LoadingDots (when isLoading)
                        │
                        └── InputComposer
                            ├── Textarea (auto-resize)
                            └── Submit Button (animated)
```

### Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| `ChatProvider` | Global chat state, AI connection, expansion management |
| `ChatContainer` | Scroll management, focus overlay, message list |
| `MessageBubble` | Individual message rendering, expansion UI, animations |
| `ExpandableContent` | Routes to correct content component based on type |
| `FormContent` | Interactive form with field rendering, submission |
| `ChartContent` | Recharts-based visualization (line/bar/pie/area) |
| `CodeContent` | Syntax highlighted code block with copy |
| `CardContent` | Rich content card with optional media/actions |
| `InputComposer` | Message input, auto-resize, keyboard handling |
| `Header` | Model picker, theme toggle, branding |

---

## State Management

### Three Layers of State

```
┌───────────────────────────────────────────────────────────────────┐
│ Layer 1: ChatProvider Context (Global Chat State)                │
├───────────────────────────────────────────────────────────────────┤
│ • messages: Message[]           (transformed from AI SDK)        │
│ • isLoading: boolean            (derived from status)            │
│ • error: Error | null                                            │
│ • expansionStates: Map<string, ExpansionStateData>               │
│ • modelId: string               (current selected model)         │
│ • focusedMessageId: string | null                                │
│                                                                   │
│ Actions:                                                          │
│ • sendMessage(content)                                           │
│ • regenerateLastMessage()                                        │
│ • clearMessages()                                                │
│ • stop()                                                         │
│ • setModelId(id)                                                 │
│ • toggleExpansion(messageId)                                     │
│ • focusMessage(messageId)                                        │
│ • unfocusMessage(messageId)                                      │
│ • pinMessage(messageId, pinned)                                  │
│ • collapseAll(except?)                                           │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ Layer 2: TanStack Query (Server State)                           │
├───────────────────────────────────────────────────────────────────┤
│ • staleTime: 60s                                                 │
│ • gcTime: 5min                                                   │
│ • refetchOnWindowFocus: false                                    │
│ • retry: 1                                                       │
│                                                                   │
│ (Currently minimal usage - prepared for future API caching)      │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ Layer 3: Local Component State                                   │
├───────────────────────────────────────────────────────────────────┤
│ InputComposer:                                                   │
│ • message: string (current input text)                           │
│                                                                   │
│ FormContent:                                                     │
│ • formData: Record<string, value> (field values)                 │
│ • submitted: boolean                                             │
│                                                                   │
│ CodeContent:                                                     │
│ • copied: boolean (copy feedback state)                          │
│                                                                   │
│ ThemeProvider:                                                   │
│ • theme: 'light' | 'dark' | 'system'                            │
│ • resolvedTheme: 'light' | 'dark'                               │
│ • highContrast: boolean                                          │
└───────────────────────────────────────────────────────────────────┘
```

---

## API Integration

### API Route: `/api/chat/route.ts`

```typescript
// Request
POST /api/chat
{
  messages: UIMessage[],  // From DefaultChatTransport
  modelId: string         // e.g., "openai/gpt-4o"
}

// Processing
1. Validate modelId against MODELS list
2. Convert UIMessage[] → ModelMessage[]
   - Extract text from parts
   - Convert tool parts to tool-call/tool-result format
3. Call streamText() with Vercel AI Gateway

// Response
StreamingTextResponse (SSE)
```

### Available AI Tools

| Tool | Description | Output Schema |
|------|-------------|---------------|
| `generateForm` | Creates interactive forms | `FormContentData` |
| `generateChart` | Creates data visualizations | `ChartContentData` |
| `generateCode` | Creates code blocks | `CodeContentData` |
| `generateCard` | Creates rich content cards | `CardContentData` |

### Tool Execution Flow

```
AI Model
    │
    ├─► "I'll create a form for you"  (text)
    │
    └─► tool-call: generateForm       (tool invocation)
            │
            ▼
        Tool Execute (passthrough)
            │
            ▼
        tool-result: { type: 'form', ... }
            │
            ▼
        Parsed as expandableContent
            │
            ▼
        Rendered as FormContent
```

---

## Theming System

### CSS Custom Properties

```css
/* Base tokens (shadcn/ui) */
--background, --foreground, --primary, --secondary,
--muted, --accent, --destructive, --border, --ring

/* Message-specific */
--message-user          /* User message background */
--message-assistant     /* Assistant message background */
--message-focused       /* Focused state ring color */

/* Content-specific */
--form-field           /* Form input backgrounds */
--chart-grid           /* Chart gridlines */
--chart-axis           /* Chart axis labels */
--code-background      /* Code block background */
--code-line-number     /* Line number color */

/* Chart colors */
--chart-1 through --chart-5
```

### Theme Switching

```
1. ThemeProvider reads from localStorage
2. Resolves 'system' to actual theme via matchMedia
3. Applies classes to <html>: 'light' | 'dark' | 'high-contrast'
4. Sets color-scheme CSS property
5. Listens for system preference changes
```

---

## Key Files Reference

### Core Application

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with providers |
| `src/app/page.tsx` | Main page with ChatProvider |
| `src/app/api/chat/route.ts` | AI chat API endpoint |

### Components

| File | Purpose |
|------|---------|
| `src/components/chat/ChatProvider.tsx` | Global state + AI integration |
| `src/components/chat/ChatContainer.tsx` | Message list + scroll management |
| `src/components/chat/MessageBubble.tsx` | Individual message rendering |
| `src/components/chat/InputComposer.tsx` | Message input |
| `src/components/expandable/ExpandableContent.tsx` | Content type router |
| `src/components/expandable/FormContent.tsx` | Interactive forms |
| `src/components/expandable/ChartContent.tsx` | Data visualizations |
| `src/components/expandable/CodeContent.tsx` | Code blocks |
| `src/components/expandable/CardContent.tsx` | Rich content cards |
| `src/components/Header.tsx` | App header with model picker |
| `src/components/ModelPicker.tsx` | Model selection dropdown |

### Providers

| File | Purpose |
|------|---------|
| `src/components/providers/ThemeProvider.tsx` | Theme state + system preference |
| `src/components/providers/QueryProvider.tsx` | TanStack Query setup |

### Hooks

| File | Purpose |
|------|---------|
| `src/hooks/useExpansion.ts` | Expansion state + keyboard nav |
| `src/hooks/useScrollAnchor.ts` | Scroll position management |

### Types

| File | Purpose |
|------|---------|
| `src/types/message.ts` | Message, expandable content, tool schemas |
| `src/types/conversation.ts` | Conversation types |
| `src/types/theme.ts` | Theme type definitions |

### Utilities

| File | Purpose |
|------|---------|
| `src/lib/utils.ts` | cn() helper for classnames |
| `src/lib/models.ts` | Model definitions + validation |

---

## Animation Timings

| Animation | Duration | Easing |
|-----------|----------|--------|
| Expand content | 250ms | easeOut |
| Collapse content | 200ms | default |
| Focus scale | 250ms | easeOut |
| Loading dots | bounce | staggered 150ms |
| Submit button | 200ms | default |
| Form field enter | 50ms stagger | default |

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway authentication |

---

## Future Considerations

1. **Conversation persistence**: Currently in-memory only
2. **File attachments**: Types defined but not implemented
3. **Real-time collaboration**: Not implemented
4. **Message editing**: Not implemented
5. **Tool result caching**: TanStack Query configured but minimal usage
