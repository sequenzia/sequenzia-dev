'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useChat } from '@/components/chat/ChatProvider';
import type { ExpansionState } from '@/types';

interface UseExpansionOptions {
  messageId: string;
  hasExpandableContent: boolean;
}

interface UseExpansionReturn {
  state: ExpansionState;
  isCollapsed: boolean;
  isPartial: boolean;
  isExpanded: boolean;
  isFocused: boolean;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
  focus: () => void;
  unfocus: () => void;
  pin: () => void;
  unpin: () => void;
  // For keyboard navigation
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

export function useExpansion({
  messageId,
  hasExpandableContent,
}: UseExpansionOptions): UseExpansionReturn {
  const {
    getExpansionState,
    setExpansionState,
    toggleExpansion,
    focusMessage,
    unfocusMessage,
    pinMessage,
  } = useChat();

  const state = getExpansionState(messageId);
  const lastClickTime = useRef(0);

  const toggle = useCallback(() => {
    if (!hasExpandableContent) return;
    toggleExpansion(messageId);
  }, [messageId, hasExpandableContent, toggleExpansion]);

  const expand = useCallback(() => {
    if (!hasExpandableContent) return;
    setExpansionState(messageId, 'expanded');
  }, [messageId, hasExpandableContent, setExpansionState]);

  const collapse = useCallback(() => {
    setExpansionState(messageId, 'collapsed');
  }, [messageId, setExpansionState]);

  const focus = useCallback(() => {
    if (!hasExpandableContent) return;
    focusMessage(messageId);
  }, [messageId, hasExpandableContent, focusMessage]);

  const unfocus = useCallback(() => {
    unfocusMessage(messageId);
  }, [messageId, unfocusMessage]);

  const pin = useCallback(() => {
    pinMessage(messageId, true);
  }, [messageId, pinMessage]);

  const unpin = useCallback(() => {
    pinMessage(messageId, false);
  }, [messageId, pinMessage]);

  // Handle double-tap for mobile (quick toggle between collapsed and expanded)
  const handleClick = useCallback(() => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;

    if (timeSinceLastClick < 300) {
      // Double tap - toggle between collapsed and expanded
      if (state === 'collapsed') {
        expand();
      } else {
        collapse();
      }
    } else {
      // Single tap - normal toggle
      toggle();
    }

    lastClickTime.current = now;
  }, [state, toggle, expand, collapse]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!hasExpandableContent) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          toggle();
          break;
        case 'Escape':
          e.preventDefault();
          if (state === 'focused') {
            unfocus();
          } else {
            collapse();
          }
          break;
        case 'f':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            if (state === 'focused') {
              unfocus();
            } else {
              focus();
            }
          }
          break;
      }
    },
    [hasExpandableContent, state, toggle, collapse, focus, unfocus]
  );

  // Escape key listener for focused state
  useEffect(() => {
    if (state !== 'focused') return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        unfocus();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [state, unfocus]);

  return {
    state,
    isCollapsed: state === 'collapsed',
    isPartial: state === 'partial',
    isExpanded: state === 'expanded',
    isFocused: state === 'focused',
    toggle: handleClick,
    expand,
    collapse,
    focus,
    unfocus,
    pin,
    unpin,
    handleKeyDown,
  };
}
