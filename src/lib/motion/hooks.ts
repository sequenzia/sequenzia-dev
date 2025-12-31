'use client';

import { useReducedMotion as useMotionReducedMotion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { springs, buttonHover, buttonTap, buttonTapMobile } from './variants';

/**
 * Hook to detect if user prefers reduced motion
 * Wraps Motion's built-in hook for consistency
 */
export function useReducedMotion(): boolean {
  const prefersReducedMotion = useMotionReducedMotion();
  return prefersReducedMotion ?? false;
}

/**
 * Hook to detect if device is mobile/touch-based
 * Uses both screen width and touch capability detection
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isNarrowScreen = window.matchMedia('(max-width: 768px)').matches;
      setIsMobile(isTouchDevice || isNarrowScreen);
    };

    checkMobile();

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handler = () => checkMobile();

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isMobile;
}

/**
 * Hook that returns device-appropriate animation configuration
 * Respects reduced motion preference and adjusts for mobile
 */
export function useAnimationConfig() {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  return useMemo(() => {
    // Disable animations if user prefers reduced motion
    if (prefersReducedMotion) {
      return {
        spring: { duration: 0 },
        hoverGesture: {},
        tapGesture: {},
        shouldAnimate: false,
        isMobile,
      };
    }

    return {
      // Use mobile-optimized springs on touch devices
      spring: isMobile ? springs.gentleMobile : springs.gentle,
      // No hover on mobile - only tap
      hoverGesture: isMobile ? {} : buttonHover,
      // More pronounced tap feedback on mobile
      tapGesture: isMobile ? buttonTapMobile : buttonTap,
      shouldAnimate: true,
      isMobile,
    };
  }, [prefersReducedMotion, isMobile]);
}

/**
 * Hook to get entrance animation props based on device
 * Returns empty object if reduced motion is preferred
 */
export function useEntranceAnimation(variants: {
  hidden: Record<string, unknown>;
  visible: Record<string, unknown>;
}) {
  const { shouldAnimate } = useAnimationConfig();

  return useMemo(() => {
    if (!shouldAnimate) {
      return {};
    }

    return {
      initial: 'hidden',
      animate: 'visible',
      variants,
    };
  }, [shouldAnimate, variants]);
}
