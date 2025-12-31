'use client';

import type { Transition, Variants } from 'motion/react';

// ============================================================================
// Spring Presets
// ============================================================================

export const springs = {
  /** Gentle spring for content appearance */
  gentle: { type: 'spring', stiffness: 120, damping: 14 } as const,
  /** Mobile-optimized gentle spring (slightly faster) */
  gentleMobile: { type: 'spring', stiffness: 150, damping: 18 } as const,
  /** Snappy spring for UI feedback */
  snappy: { type: 'spring', stiffness: 400, damping: 30 } as const,
  /** Bouncy spring for success/celebration states */
  bouncy: { type: 'spring', stiffness: 300, damping: 10 } as const,
} satisfies Record<string, Transition>;

// ============================================================================
// Entrance Variants
// ============================================================================

/** Simple fade in */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** Fade in with upward movement */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
};

/** Fade in with scale */
export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.gentle,
  },
};

/** Slide in from left */
export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springs.snappy,
  },
};

/** Slide in from right */
export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springs.snappy,
  },
};

// ============================================================================
// Message Variants
// ============================================================================

/** Container for staggered message list */
export const messageList: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/** Individual message item - user messages (snappy entrance) */
export const messageItemUser: Variants = {
  hidden: { opacity: 0, x: 12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: { duration: 0.15 },
  },
};

/** Individual message item - assistant messages (snappy entrance) */
export const messageItemAssistant: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.15 },
  },
};

// ============================================================================
// Form Variants
// ============================================================================

/** Container for staggered form fields */
export const formFieldContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

/** Individual form field */
export const formField: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springs.snappy,
  },
};

/** Success state with bounce */
export const successBounce: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.bouncy,
  },
};

// ============================================================================
// Content Variants
// ============================================================================

/** Code block entrance */
export const codeBlockEntrance: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springs.snappy,
  },
};

/** Chart entrance with scale */
export const chartEntrance: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.gentle,
  },
};

/** Card entrance */
export const cardEntrance: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springs.gentle,
  },
};

// ============================================================================
// UI Element Variants
// ============================================================================

/** Scroll button entrance/exit */
export const scrollButtonVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.snappy,
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.9,
    transition: { duration: 0.15 },
  },
};

// ============================================================================
// Gesture Animations
// ============================================================================

/** Button tap feedback */
export const buttonTap = {
  scale: 0.97,
};

/** Button hover feedback (desktop only) */
export const buttonHover = {
  scale: 1.02,
};

/** Mobile tap feedback (more pronounced) */
export const buttonTapMobile = {
  scale: 0.95,
};

// ============================================================================
// SVG Path Animations
// ============================================================================

/** Checkmark draw animation */
export const checkmarkDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};
