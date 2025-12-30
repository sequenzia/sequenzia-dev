# Sequenzia AI

**High-Level Technical Specification**

---

## 1. Executive Summary

This specification defines an AI assistant application built on the Expanding Message Paradigm, a design philosophy that treats conversation and interactivity as a unified spectrum rather than separate concerns. The application combines traditional conversational AI capabilities with the ability to generate rich, interactive UI elements that expand and contract within the natural message flow.

The core innovation lies in how interactive content is presented: rather than relegating generated artifacts to separate panels or modal overlays, each AI response can expand in place to reveal forms, visualizations, code editors, and other interactive components. This preserves conversational context while accommodating sophisticated user interactions.

| Attribute             | Value                               |
| --------------------- | ----------------------------------- |
| **Target Platform**   | Web (Desktop and Mobile Responsive) |
| **Primary Framework** | Next.js with React                  |
| **AI Integration**    | Vercel AI SDK v6.0 with AI Gateway  |
| **Deployment**        | Vercel Platform                     |

---

## 2. Product Vision

### 2.1 Problem Statement

Current AI chat interfaces create a fundamental disconnect between conversation and generated content. When an AI produces something interactive, whether a form, chart, or code snippet, users must mentally context-switch between the conversational thread and separate artifact panels, losing the natural flow of thought that the conversation represents.

### 2.2 Solution Overview

The Expanding Message Paradigm eliminates this disconnect by treating every AI response as a potentially expandable container. A simple text reply remains compact and conversational. A generated form, chart, or interactive component expands in place, claiming the visual and interactive space it needs while remaining anchored to its conversational context.

### 2.3 Design Principles

1. **Contextual Continuity:** Interactive elements exist within the conversation timeline, preserving the when and why of their creation.

2. **Progressive Disclosure:** Content reveals itself proportionally to user engagement, from collapsed previews to fully expanded interactions.

3. **Graceful Transitions:** State changes between expansion levels feel organic and trackable, never jarring or disorienting.

4. **Viewport Respect:** Scroll position and user focus are preserved intelligently as content expands and contracts.

---

## 3. Technical Architecture

### 3.1 Technology Stack

| Layer          | Technology                     | Purpose                                        |
| -------------- | ------------------------------ | ---------------------------------------------- |
| Framework      | Next.js 14+                    | Full-stack React framework with App Router     |
| UI Core        | React 18+                      | Component architecture and state management    |
| Design System  | Vercel AI Elements + shadcn/ui | Pre-built AI chat components and UI primitives |
| Styling        | Tailwind CSS                   | Utility-first styling with custom animations   |
| State          | TanStack Query                 | Server state, caching, and synchronization     |
| AI Integration | Vercel AI SDK v6.0             | Streaming, tool calls, and UI generation       |
| AI Models      | Vercel AI Gateway              | Multi-provider model routing and fallbacks     |
| Deployment     | Vercel                         | Edge functions, CDN, and serverless hosting    |

### 3.2 High-Level Architecture

The application follows a layered architecture that separates concerns while enabling tight integration between the AI backend and the expandable UI system.

#### 3.2.1 Presentation Layer

The presentation layer consists of React components organized around the expanding message paradigm. The primary components include a ChatContainer that manages the conversation viewport, MessageBubble components that handle expansion state and transitions, and specialized ExpandableContent components for each type of interactive element the AI can generate.

#### 3.2.2 State Management Layer

TanStack Query manages server state including conversation history, message streaming, and AI responses. Local UI state, particularly expansion states and animation coordination, is handled through React context providers and component-level state. This separation allows the expansion system to operate independently of network concerns while staying synchronized with the underlying data.

#### 3.2.3 AI Integration Layer

The Vercel AI SDK v6.0 provides the bridge between the frontend and AI models. This layer handles streaming responses, tool call orchestration, and the structured output parsing required to render generated UI components. The AI Gateway enables model routing, allowing different models to be used for different tasks or as fallbacks.

---

## 4. Core Features

### 4.1 Conversational Interface

The foundation of the application is a streaming chat interface that supports real-time AI responses. Users can send text messages, attach files, and receive responses that stream in token by token. The interface supports markdown rendering, code syntax highlighting, and inline media display.

### 4.2 Message Expansion System

Every AI message exists within an expansion state machine that governs its visual presentation and interactive capabilities. The system defines four primary states that messages can occupy.

#### 4.2.1 Collapsed State

Messages appear as compact previews showing type indicators and brief descriptions. This state minimizes vertical space consumption while communicating what content is available. For a generated form, users might see a form icon, the form title, and a field count. For a chart, a small sparkline preview might be shown.

#### 4.2.2 Partially Expanded State

An intermediate state that shows enough content to be useful without dominating the viewport. Forms display their first few fields, charts render at constrained dimensions, and code blocks show initial lines with expansion affordances. This state enables quick interactions during conversation browsing.

#### 4.2.3 Fully Expanded State

Content claims whatever space it genuinely requires. All form fields are visible, charts render at comfortable dimensions with full interactivity, and code editors gain complete tooling. Even in this state, the message remains part of the chat flow rather than escaping into a modal.

#### 4.2.4 Focused State

For complex interactions, messages can enter a focused mode that visually deprioritizes surrounding content while keeping it accessible. This signals deep engagement without breaking conversational context. Scrolling continues to work, but the focused element receives enhanced visual prominence.

### 4.3 Interactive UI Generation

The AI can generate several categories of interactive elements that render within the expanding message system.

#### 4.3.1 Forms and Inputs

Dynamic forms with validation, conditional logic, and styled input components. Form submissions generate new messages in the conversation, maintaining cause-and-effect clarity. Supported input types include text fields, text areas, selects, checkboxes, radio groups, date pickers, sliders, and file uploads.

#### 4.3.2 Data Visualizations

Charts and graphs rendered with interactive capabilities including tooltips, zoom, pan, and drill-down. Supported visualization types include line charts, bar charts, pie charts, scatter plots, area charts, and composite dashboards combining multiple visualization types.

#### 4.3.3 Code Editors

Syntax-highlighted code blocks that can expand into full editors with line numbers, language detection, copy functionality, and optional execution capabilities for supported languages. The editor supports themes, font size adjustment, and keyboard shortcuts.

#### 4.3.4 Rich Content

Expandable content cards for displaying structured information, image galleries, embedded media, and formatted documents. This category handles content that benefits from expandable presentation without requiring deep interactivity.

---

## 5. User Interface Specification

### 5.1 Layout Structure

The application uses a single-column centered layout for the chat interface, optimized for readability and focus. On larger screens, the chat column is constrained to a maximum width that ensures comfortable reading while leaving space for future sidebar features. On mobile devices, the interface spans the full viewport width.

### 5.2 Message Components

#### 5.2.1 User Messages

User messages appear right-aligned with a distinct background color. They support text content, file attachments with previews, and inline code. User messages do not participate in the expansion system as they represent static input.

#### 5.2.2 Assistant Messages

Assistant messages appear left-aligned and are the primary participants in the expansion system. Each assistant message contains a header area with avatar and timestamp, a content area that grows and shrinks with expansion state, expansion controls that appear on hover or touch, and action buttons for copying, regenerating, or providing feedback.

### 5.3 Expansion Controls

Expansion state transitions are triggered through multiple interaction patterns to accommodate different user preferences and contexts.

- **Click/Tap:** The primary mechanism. Clicking a collapsed message expands it to the partially expanded state. Clicking again fully expands it. A third click collapses back to the initial state.

- **Expand/Collapse Button:** An explicit affordance for users who prefer direct controls over click-anywhere patterns.

- **Keyboard Navigation:** Arrow keys navigate between messages, Enter toggles expansion state, and Escape collapses the currently focused message.

- **Double-Tap (Mobile):** Quickly toggles between collapsed and fully expanded states for efficient mobile interaction.

### 5.4 Animation Specifications

Transitions between expansion states follow a choreographed animation system designed to feel organic and maintain user orientation.

#### 5.4.1 Timing

All expansion animations use a duration of 250ms with an ease-out timing function. This provides responsiveness while remaining smooth enough to track visually. Collapse animations use 200ms with ease-in, making the reduction feel slightly quicker and more decisive.

#### 5.4.2 Sequence

When expanding, the container height animates first, followed by content opacity fading in with a 50ms delay. This creates a sense of the content being revealed rather than appearing. When collapsing, content fades out first, then the container shrinks, creating the impression of content being tucked away.

#### 5.4.3 Interruption Handling

If a user triggers a state change during an ongoing animation, the system smoothly reverses or redirects to the new target state rather than jumping or queuing. This is achieved through spring-based animations that can be interrupted and redirected mid-flight.

---

## 6. Scroll and Viewport Management

### 6.1 Anchor-Based Scrolling

When content expands, the viewport adjusts to keep relevant content stationary from the user's perspective. The system identifies an anchor point based on what the user was viewing or interacting with, then maintains that anchor's screen position as surrounding content shifts.

### 6.2 Expansion Scenarios

#### 6.2.1 Expanding Above Viewport

When a message above the current viewport expands, the scroll position adjusts to compensate, keeping the user's current view stable. The user should not perceive any content jump.

#### 6.2.2 Expanding Within Viewport

When the expanding message is within the viewport, the system determines whether to anchor on the expanding message itself or on content below it, depending on where the user's focus appears to be based on recent interactions.

#### 6.2.3 Expanding at Conversation End

The most recent message receives special treatment. When it expands, the viewport scrolls to keep the bottom of the content visible, as users are typically most interested in newly generated content.

### 6.3 Overflow Containment

As an optional mode configurable in user settings, expanded content can be constrained to a maximum height. Beyond this height, the content becomes internally scrollable rather than pushing the conversation further. This trades elegance for predictability in conversations with many large interactive elements.

---

## 7. Component Architecture

### 7.1 Component Hierarchy

The component structure reflects the expanding message paradigm, with clear separation between container logic and content rendering.

| Component           | Responsibility                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| _ChatProvider_      | Context provider managing conversation state, AI connection, and global expansion coordination |
| _ChatContainer_     | Viewport management, scroll behavior, and message list rendering                               |
| _MessageBubble_     | Individual message wrapper handling expansion state, animations, and content delegation        |
| _ExpandableContent_ | Abstract base for all expandable content types with shared transition logic                    |
| _FormContent_       | Generated form rendering with validation, submission, and field management                     |
| _ChartContent_      | Data visualization rendering with interactive capabilities                                     |
| _CodeContent_       | Code display and editing with syntax highlighting and tooling                                  |
| _InputComposer_     | Message input area with file attachment, voice input, and submission handling                  |

### 7.2 State Management Strategy

#### 7.2.1 Server State (TanStack Query)

Conversation history, message content, and AI responses are managed through TanStack Query. This provides automatic caching, background refetching, optimistic updates for message sending, and efficient pagination for long conversations.

#### 7.2.2 UI State (React Context + Local State)

Expansion states, animation coordination, and focus management are handled through a combination of React context for global coordination and component-local state for individual message behavior. This separation ensures that expansion interactions remain responsive even during network operations.

#### 7.2.3 Form State (Local to FormContent)

Generated forms manage their own state locally, with submission triggering a mutation that creates a new message in the conversation. This isolation prevents form interactions from affecting the broader UI state.

---

## 8. Data Models

### 8.1 Message Structure

Messages are the fundamental data unit, representing both user input and AI responses. The structure accommodates plain text, rich content, and generated interactive elements.

#### 8.1.1 Core Message Fields

- **id:** Unique identifier for the message
- **role:** Either 'user' or 'assistant'
- **content:** Text content of the message
- **timestamp:** ISO 8601 creation timestamp
- **attachments:** Array of file references for user uploads
- **expandableContent:** Optional structured content for interactive elements

#### 8.1.2 Expandable Content Types

The expandableContent field contains a discriminated union based on the type field, with each type having its own schema for the associated data.

- **form:** Schema defining fields, validation rules, and submission behavior
- **chart:** Visualization specification with data, chart type, and configuration
- **code:** Code content with language, filename, and execution options
- **card:** Structured content card with title, body, and optional media

### 8.2 Conversation Structure

- **id:** Unique conversation identifier
- **title:** Display title, often derived from first user message
- **messages:** Ordered array of Message objects
- **createdAt:** Conversation creation timestamp
- **updatedAt:** Last activity timestamp

### 8.3 Expansion State

- **messageId:** Reference to the associated message
- **state:** One of 'collapsed', 'partial', 'expanded', or 'focused'
- **pinned:** Boolean indicating whether auto-collapse should be prevented
- **interactionDepth:** Tracks user engagement level for smart restoration

---

## 9. AI Integration

### 9.1 Vercel AI SDK Integration

The Vercel AI SDK v6.0 provides the core AI communication layer. The application uses the useChat hook for basic streaming and extends it with custom handlers for tool calls and UI generation.

#### 9.1.1 Streaming Configuration

All AI responses stream to provide immediate feedback. The streaming configuration includes token-level updates for text content, structured data events for tool call progress, and completion callbacks for triggering post-response behaviors like auto-expansion.

#### 9.1.2 Tool Call Handling

The AI can invoke tools to gather information or perform actions. Tool calls are rendered as expandable content showing the tool name, input parameters, and results. Users can expand tool call messages to inspect the AI's reasoning process.

### 9.2 UI Generation Protocol

When the AI generates interactive UI elements, it returns structured data conforming to the expandableContent schemas. This data is parsed and validated on the client before being passed to the appropriate content renderer.

#### 9.2.1 Form Generation

The AI can generate forms by specifying field definitions, validation rules, and submission handlers. The FormContent component interprets this schema and renders appropriate input components from the shadcn/ui library.

#### 9.2.2 Visualization Generation

Charts are specified using a declarative format that maps to the charting library's configuration options. The AI provides data, chart type, and styling preferences, which the ChartContent component renders.

### 9.3 AI Gateway Configuration

The Vercel AI Gateway enables model routing and fallback strategies. The application configures primary and fallback models, with routing rules based on task type, latency requirements, and cost optimization.

---

## 10. Non-Functional Requirements

### 10.1 Performance

1. **Initial Load:** Time to interactive under 2 seconds on 4G connections
2. **Expansion Animations:** Consistent 60fps during state transitions
3. **Message Rendering:** Support conversations with 1000+ messages without degradation
4. **Streaming Latency:** First token visible within 500ms of request

### 10.2 Accessibility

- Full keyboard navigation support for all expansion states and interactive elements
- ARIA live regions announcing expansion state changes and new message arrivals
- Screen reader compatible generated forms with proper labeling
- Reduced motion mode respecting prefers-reduced-motion media query
- WCAG 2.1 AA compliance for color contrast and interactive targets

### 10.3 Responsive Design

- **Desktop (1024px+):** Full expansion capabilities with side-by-side content possible
- **Tablet (768px-1023px):** Adapted layouts with touch-optimized expansion controls
- **Mobile (<768px):** Full-width messages, simplified expansion, double-tap shortcuts

### 10.4 Browser Support

The application targets modern evergreen browsers: Chrome, Firefox, Safari, and Edge in their current and previous major versions. Progressive enhancement ensures basic functionality on older browsers while reserving advanced animation features for capable environments.

---

## 11. Theming System

### 11.1 Overview

The application implements a comprehensive theming system built on Tailwind CSS and CSS custom properties. This architecture enables runtime theme switching, user-customizable color schemes, and consistent styling across all components including dynamically generated UI elements.

### 11.2 Theme Architecture

#### 11.2.1 CSS Custom Properties Foundation

Themes are defined as collections of CSS custom properties (CSS variables) scoped to the document root or theme-specific selectors. This approach enables runtime theme switching without requiring stylesheet regeneration or page reloads.

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode overrides */
}
```

#### 11.2.2 Tailwind Integration

The Tailwind configuration extends the default theme to reference CSS custom properties, allowing theme-aware utility classes throughout the application.

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
};
```

#### 11.2.3 shadcn/ui Alignment

The theming system aligns with shadcn/ui's design token conventions, ensuring that all shadcn/ui components automatically respect the active theme. Custom components follow the same token naming patterns for consistency.

### 11.3 Theme Structure

Each theme defines values across several categories that collectively control the application's visual presentation.

#### 11.3.1 Color Tokens

| Token                | Purpose                                      |
| -------------------- | -------------------------------------------- |
| `background`         | Page and container backgrounds               |
| `foreground`         | Primary text color                           |
| `primary`            | Interactive elements, buttons, links         |
| `primary-foreground` | Text on primary-colored backgrounds          |
| `secondary`          | Secondary buttons and less prominent actions |
| `muted`              | Subtle backgrounds, disabled states          |
| `muted-foreground`   | Secondary text, placeholders                 |
| `accent`             | Highlights, hover states                     |
| `destructive`        | Error states, delete actions                 |
| `border`             | Dividers, input borders                      |
| `ring`               | Focus indicators                             |

#### 11.3.2 Message-Specific Tokens

The expanding message system requires additional tokens to style the various message states and content types.

| Token                 | Purpose                              |
| --------------------- | ------------------------------------ |
| `message-user`        | User message bubble background       |
| `message-assistant`   | Assistant message bubble background  |
| `message-collapsed`   | Collapsed preview background tint    |
| `message-expanded`    | Expanded content area background     |
| `message-focused`     | Focused state overlay color          |
| `expansion-indicator` | Color for expansion affordance icons |

#### 11.3.3 Interactive Content Tokens

Generated UI elements use dedicated tokens to maintain visual consistency while allowing theme-specific customization.

| Token              | Purpose                      |
| ------------------ | ---------------------------- |
| `form-field`       | Input field backgrounds      |
| `form-border`      | Input borders and separators |
| `chart-grid`       | Visualization grid lines     |
| `chart-axis`       | Axis labels and lines        |
| `code-background`  | Code block backgrounds       |
| `code-line-number` | Line number gutter color     |

#### 11.3.4 Semantic Tokens

Status and feedback colors that convey meaning regardless of the active theme.

| Token     | Purpose                              |
| --------- | ------------------------------------ |
| `success` | Positive feedback, completion states |
| `warning` | Caution states, validation warnings  |
| `error`   | Error messages, failed states        |
| `info`    | Informational highlights             |

### 11.4 Built-in Themes

The application ships with several pre-configured themes covering common preferences.

#### 11.4.1 Light Theme (Default)

A clean, high-contrast theme optimized for daytime use and well-lit environments. Uses a white background with dark text and blue primary accents.

#### 11.4.2 Dark Theme

A low-light theme with a dark gray background and light text. Reduces eye strain in dim environments and conserves battery on OLED displays. Primary accents shift to lighter blue tones for adequate contrast.

#### 11.4.3 System Theme

Automatically switches between light and dark themes based on the user's operating system preference, detected via the `prefers-color-scheme` media query.

#### 11.4.4 High Contrast Theme

An accessibility-focused theme with maximum contrast ratios, thicker borders, and enhanced focus indicators. Exceeds WCAG AAA contrast requirements.

#### 11.4.5 Additional Themes

The architecture supports additional themed variants such as sepia-toned reading modes, brand-specific color schemes, and seasonal or promotional themes.

### 11.5 Theme Switching

#### 11.5.1 User Controls

Theme selection is available through a theme picker in the application settings. The picker displays live previews of each theme applied to sample UI elements. The selected theme persists in local storage and applies immediately without page reload.

#### 11.5.2 Implementation

Theme switching is handled by a ThemeProvider component that manages the current theme state and applies the appropriate class or data attribute to the document root.

```typescript
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

// Theme application via class or data attribute
document.documentElement.classList.remove("light", "dark", ...otherThemes);
document.documentElement.classList.add(theme);
```

#### 11.5.3 Transition Effects

Theme changes include a brief crossfade transition (150ms) to prevent jarring visual shifts. The transition applies to background and color properties while avoiding transitions on borders and shadows that could cause visual artifacts.

### 11.6 Custom Themes

#### 11.6.1 User-Created Themes

Advanced users can create custom themes by defining values for the CSS custom properties. The settings interface provides a theme editor with color pickers for each token category and live preview of changes.

#### 11.6.2 Theme Schema

Custom themes are stored as JSON objects conforming to a defined schema.

```typescript
interface CustomTheme {
  name: string;
  description?: string;
  baseTheme: "light" | "dark";
  tokens: {
    background: string;
    foreground: string;
    primary: string;
    // ... additional tokens
  };
}
```

#### 11.6.3 Theme Import/Export

Users can export custom themes as JSON files for backup or sharing. Imported themes are validated against the schema before being added to the available theme list.

### 11.7 Theming Generated Content

#### 11.7.1 Dynamic UI Integration

AI-generated UI elements inherit theme tokens automatically through Tailwind utility classes. The AI does not need to specify colors directly; instead, it references semantic token names that resolve to theme-appropriate values.

#### 11.7.2 Chart Theming

Data visualizations receive theme values through a chart theme configuration object derived from CSS custom properties. This ensures charts match the application theme without requiring the AI to specify colors in chart definitions.

#### 11.7.3 Code Syntax Themes

Code blocks use syntax highlighting themes that complement the active application theme. Light application themes pair with light syntax themes (e.g., GitHub Light), while dark application themes pair with dark syntax themes (e.g., One Dark).

### 11.8 Animation Theming

#### 11.8.1 Motion Tokens

Themes can define motion preferences that affect animation durations and easing functions across the application.

| Token               | Purpose                  | Default                           |
| ------------------- | ------------------------ | --------------------------------- |
| `transition-fast`   | Quick micro-interactions | 150ms                             |
| `transition-normal` | Standard transitions     | 250ms                             |
| `transition-slow`   | Emphasis animations      | 400ms                             |
| `ease-default`      | Standard easing          | ease-out                          |
| `ease-bounce`       | Playful interactions     | cubic-bezier(0.34, 1.56, 0.64, 1) |

#### 11.8.2 Reduced Motion Support

When the user has `prefers-reduced-motion: reduce` enabled, animation durations collapse to near-instant values (10ms) and spring animations convert to simple opacity fades, regardless of theme settings.

---

## Appendix A: Glossary

**Expansion State:** The current visual mode of a message: collapsed, partial, expanded, or focused.

**Anchor-Based Scrolling:** Viewport management technique that maintains a reference point's screen position during content changes.

**Expandable Content:** Structured data representing interactive elements the AI can generate within messages.

**Tool Call:** An AI-initiated function invocation to gather information or perform actions.

**AI Gateway:** Vercel's service for routing AI requests across multiple model providers.

**Streaming Response:** AI output delivered incrementally as tokens are generated rather than waiting for completion.

**CSS Custom Properties:** CSS variables that enable runtime theming by defining values that can be changed dynamically without stylesheet regeneration.

**Design Token:** A named value representing a visual design decision (color, spacing, typography) that can be referenced throughout the application for consistency.

**Semantic Token:** A design token named for its purpose rather than its value (e.g., "destructive" rather than "red"), enabling theme-appropriate styling across different color schemes.
