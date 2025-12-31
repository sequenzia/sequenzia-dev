# Sequenzia AI

An AI chat interface that implements the **Expanding Message Paradigm** - messages expand in-place to reveal interactive content like forms, charts, code blocks, and cards, rather than opening in separate panels.

## Features

- **Expandable Messages**: AI responses can contain interactive content that expands/collapses inline
- **4 Content Types**: Forms, Charts (line/bar/pie/area), Code blocks, and Rich cards
- **4-State Expansion System**: collapsed → partial → expanded → focused
- **Keyboard Navigation**: Enter/Escape to cycle states, Cmd+F for focused mode
- **Smooth Animations**: Framer Motion powered transitions (250ms expand, 200ms collapse)
- **Dark/Light Theme**: System-aware theming with manual override
- **Real-time Streaming**: AI responses stream in real-time via AI SDK

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **AI**: Vercel AI SDK v6 with OpenAI GPT-4o
- **UI**: React 19, Tailwind CSS 4, shadcn/ui components
- **State**: React Context + TanStack Query
- **Validation**: Zod schemas
- **Animation**: Framer Motion
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sequenzia-ai.git
cd sequenzia-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your OPENAI_API_KEY to .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

## Architecture

### Expansion System

Messages exist in one of four states:

| State | Description |
|-------|-------------|
| `collapsed` | Icon + title preview only |
| `partial` | Limited content (3 form fields, 10 code lines, 150px chart) |
| `expanded` | Full content visible |
| `focused` | Full content with backdrop blur on other messages |

### Component Hierarchy

```
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

### AI Tools

The AI can generate four types of expandable content:

- **generateForm**: Interactive forms for data collection (surveys, registrations)
- **generateChart**: Data visualizations (line, bar, pie, area charts)
- **generateCode**: Syntax-highlighted code blocks
- **generateCard**: Rich cards with optional media and actions

### Key Hooks

- `useExpansion`: Message expansion logic, keyboard navigation, double-tap detection
- `useScrollAnchor`: Anchor-based scrolling during expansions, auto-scroll behavior

## Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts   # AI chat endpoint with tools
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Main chat page
├── components/
│   ├── chat/               # Chat components
│   ├── expandable/         # Expandable content renderers
│   ├── providers/          # Context providers
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities
└── types/                  # TypeScript types & Zod schemas
```

## License

MIT
