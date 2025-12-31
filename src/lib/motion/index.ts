// Motion animation utilities and configuration
// Re-exports for clean imports

export {
  // Spring presets
  springs,
  // Entrance variants
  fadeIn,
  fadeInUp,
  fadeInScale,
  slideFromLeft,
  slideFromRight,
  // Message variants
  messageList,
  messageItemUser,
  messageItemAssistant,
  // Form variants
  formFieldContainer,
  formField,
  successBounce,
  // Content variants
  codeBlockEntrance,
  chartEntrance,
  cardEntrance,
  // UI variants
  scrollButtonVariants,
  // Gesture animations
  buttonTap,
  buttonHover,
  buttonTapMobile,
  // SVG animations
  checkmarkDraw,
} from './variants';

export {
  useReducedMotion,
  useIsMobile,
  useAnimationConfig,
  useEntranceAnimation,
} from './hooks';
