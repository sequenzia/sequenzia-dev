'use client';

import { useCallback, useRef, useEffect } from 'react';

interface UseScrollAnchorOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  enabled?: boolean;
}

interface AnchorPoint {
  element: HTMLElement;
  offsetFromTop: number;
}

export function useScrollAnchor({
  containerRef,
  enabled = true,
}: UseScrollAnchorOptions) {
  const anchorRef = useRef<AnchorPoint | null>(null);
  const isAdjustingRef = useRef(false);

  // Capture the current anchor point before content changes
  const captureAnchor = useCallback(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerRect = container.getBoundingClientRect();

    // Find the first visible element that could serve as anchor
    const messages = container.querySelectorAll('[data-message-id]');

    for (const message of messages) {
      const rect = message.getBoundingClientRect();

      // Check if element is at least partially visible
      if (rect.top < containerRect.bottom && rect.bottom > containerRect.top) {
        anchorRef.current = {
          element: message as HTMLElement,
          offsetFromTop: rect.top - containerRect.top,
        };
        break;
      }
    }
  }, [containerRef, enabled]);

  // Restore scroll position to maintain anchor point
  const restoreAnchor = useCallback(() => {
    if (!enabled || !anchorRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const anchor = anchorRef.current;

    // Skip if element is no longer in DOM
    if (!anchor.element.isConnected) {
      anchorRef.current = null;
      return;
    }

    isAdjustingRef.current = true;

    const containerRect = container.getBoundingClientRect();
    const elementRect = anchor.element.getBoundingClientRect();
    const currentOffset = elementRect.top - containerRect.top;
    const adjustment = currentOffset - anchor.offsetFromTop;

    if (Math.abs(adjustment) > 1) {
      container.scrollTop += adjustment;
    }

    // Clear anchor after restoration
    anchorRef.current = null;

    // Reset flag after a brief delay
    requestAnimationFrame(() => {
      isAdjustingRef.current = false;
    });
  }, [containerRef, enabled]);

  // Auto-scroll to bottom for new messages
  const scrollToBottom = useCallback(
    (smooth = true) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant',
      });
    },
    [containerRef]
  );

  // Check if scrolled to bottom
  const isAtBottom = useCallback(() => {
    if (!containerRef.current) return true;

    const container = containerRef.current;
    const threshold = 50; // pixels from bottom to consider "at bottom"
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold
    );
  }, [containerRef]);

  // Scroll to a specific message
  const scrollToMessage = useCallback(
    (messageId: string, behavior: ScrollBehavior = 'smooth') => {
      if (!containerRef.current) return;

      const message = containerRef.current.querySelector(
        `[data-message-id="${messageId}"]`
      );

      if (message) {
        message.scrollIntoView({ behavior, block: 'center' });
      }
    },
    [containerRef]
  );

  return {
    captureAnchor,
    restoreAnchor,
    scrollToBottom,
    isAtBottom,
    scrollToMessage,
    isAdjusting: () => isAdjustingRef.current,
  };
}
