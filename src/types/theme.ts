export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
}

export interface CustomTheme {
  name: string;
  description?: string;
  baseTheme: 'light' | 'dark';
  tokens: ThemeTokens;
}

export interface ThemeTokens {
  // Base colors
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  ring: string;

  // Message-specific
  messageUser?: string;
  messageAssistant?: string;

  // Semantic
  success?: string;
  warning?: string;
  error?: string;
  info?: string;
}

// Animation tokens
export interface AnimationTokens {
  transitionFast: string;
  transitionNormal: string;
  transitionSlow: string;
  easeDefault: string;
  easeBounce: string;
}

export const defaultAnimationTokens: AnimationTokens = {
  transitionFast: '150ms',
  transitionNormal: '250ms',
  transitionSlow: '400ms',
  easeDefault: 'ease-out',
  easeBounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};
