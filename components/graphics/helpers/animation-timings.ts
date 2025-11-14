/**
 * Animation and Break Times Constants
 * 
 * This file contains all timing values used in the graphics components.
 * Values are organized by pipeline usage (BOTH, RAG-only, SID-only).
 * 
 * CSS animation durations are documented here for reference but are defined in globals.css
 */

// ============================================================================
// USED IN BOTH RAG AND SID
// ============================================================================

// ----------------------------------------------------------------------------
// AI Chat Card (AI-chat.tsx)
// ----------------------------------------------------------------------------
export const AI_CHAT_TIMINGS = {
  /** Delay before user message animation starts */
  USER_MESSAGE_START_DELAY_MS: 300,
  
  /** User message fade-in animation duration (matches CSS) */
  USER_MESSAGE_ANIMATION_MS: 450,
  
  /** Assistant message line reveal delays */
  ASSISTANT_LINE_1_DELAY_MS: 0,
  ASSISTANT_LINE_2_DELAY_MS: 250,
  ASSISTANT_ANSWER_DELAY_MS: 500, // 250 + 250
  ASSISTANT_LINE_3_DELAY_MS: 750, // 250 + 250 + 250
  
  /** Indicator animation timing */
  INDICATOR_START_DELAY_MS: 1000, // After all assistant lines complete
  INDICATOR_DURATION_MS: 600,
  
  /** Pause between post pulsation start and assistant response animation */
  PAUSE_AFTER_POST_PULSATION_MS: 500,
} as const;

/**
 * CSS Animation Durations (defined in globals.css)
 * - User message fade-in: 0.25s (250ms) - matches USER_MESSAGE_ANIMATION_MS
 * - Assistant line reveal: 0.4s (400ms) - reveal animation
 * - Indicator checkmark: 0.25s (250ms) - see globals.css line 487
 * - Indicator X (first path): 0.12s (120ms) with 0.12s delay - see globals.css line 497
 * - Indicator X (second path): 0.12s (120ms) - see globals.css line 507
 */

// ----------------------------------------------------------------------------
// Post Request Card (post-request-card.tsx)
// ----------------------------------------------------------------------------
export const POST_REQUEST_TIMINGS = {
  /** Delay before first animation starts after post is rendered */
  INITIAL_DELAY_BEFORE_ANIMATION_MS: 600,
  
  /** Document stack entry animation delays (chaotic timing pattern) */
  DOCUMENT_STACK_DELAYS_MS: [400, 250, 120, 180, 80, 200, 300, 150, 220, 100] as const,
  
  /** Context animation duration (includes buffer for CSS animation) */
  CONTEXT_ANIMATION_DURATION_MS: 850, // 800ms CSS highlight + 50ms buffer
  
  /** Delay between retrieval completion and post animation start */
  DELAY_AFTER_RETRIEVAL_MS: 800,
} as const;

/**
 * CSS Animation Durations (defined in globals.css)
 * - Paper stack fade-in: 0.3s (300ms) - see globals.css line 445
 * - Highlight left-to-right: 0.8s (800ms) - see globals.css line 277, 320, 377
 *   Note: CONTEXT_ANIMATION_DURATION_MS includes this 800ms + 50ms buffer
 */

// ----------------------------------------------------------------------------
// Retrieved Search Card (retrieved-search-card.tsx)
// ----------------------------------------------------------------------------
export const RETRIEVED_SEARCH_TIMINGS = {
  /** Delay before removing highlight after adding text */
  REMOVE_HIGHLIGHT_DELAY_MS: 300,
  
  /** Document appearance timing */
  DOCUMENT_RESET_DELAY_MS: 50, // Small delay to ensure state reset completes
  DOCUMENT_TOTAL_TIME_WINDOW_MS: 850, // Documents spaced evenly over this duration
  DOCUMENT_SEARCH_COMPLETION_MS: 2000, // Max delay for search animation completion
  
  /** Document transition duration (used in inline styles) */
  DOCUMENT_TRANSITION_MS: 400, // opacity and transform transitions
} as const;

/**
 * CSS Animation Durations (defined in globals.css)
 * - Highlight left-to-right: 0.8s (800ms) - see globals.css line 277, 320, 377
 *   Note: Used in highlight function with 50ms buffer = 850ms total
 */

// ----------------------------------------------------------------------------
// Database Search Card (database-search-card.tsx)
// ----------------------------------------------------------------------------
export const DATABASE_SEARCH_TIMINGS = {
  /** Search animation duration */
  SEARCH_ANIMATION_DURATION_MS: 2000,
} as const;

/**
 * CSS Animation Durations (defined in globals.css)
 * - Database pulse: 1s infinite - see globals.css line 184, 197, 201
 * - Text shimmer: 0.3s infinite - see globals.css line 232
 */

// ----------------------------------------------------------------------------
// Document Variants (document-variants.tsx)
// ----------------------------------------------------------------------------
export const DOCUMENT_VARIANTS_TIMINGS = {
  /** Delay before triggering highlight animation */
  HIGHLIGHT_DELAY_MS: 10,
} as const;

// ----------------------------------------------------------------------------
// Shared CSS Animations (globals.css)
// ----------------------------------------------------------------------------
/**
 * Shared CSS Animation Durations (defined in globals.css)
 * - Highlight left-to-right: 0.8s (800ms) - see globals.css line 277, 320, 377
 *   Used by: post-request-card, retrieved-search-card, document-variants
 * - Text shimmer: 0.3s infinite - see globals.css line 232
 * - Database pulse: 1s infinite - see globals.css line 184, 197, 201
 */

// ============================================================================
// USED ONLY IN RAG
// ============================================================================

// ----------------------------------------------------------------------------
// Retrieved Search Card - Highlight Function (retrieved-search-card.tsx)
// ----------------------------------------------------------------------------
export const RAG_HIGHLIGHT_TIMINGS = {
  /** Highlight animation duration (includes buffer for CSS animation) */
  HIGHLIGHT_ANIMATION_DURATION_MS: 850, // 800ms CSS highlight + 50ms buffer
  
  /** Document highlight line indices */
  DOCUMENT_HIGHLIGHT_LINES: {
    SIMPLE: [1, 3, 5] as const,
    BULLETS: [0, 2, 4] as const,
    CHART: [0, 2] as const,
    TABLE: [1, 4, 7] as const,
  },
} as const;

/**
 * Note: Database search term highlighting (enterprise, pricing, SMB) uses the same
 * HIGHLIGHT_ANIMATION_DURATION_MS timing. In SID, highlightDatabase={false} is passed,
 * so database highlighting is skipped.
 * 
 * CSS Animation Duration (defined in globals.css)
 * - Highlight left-to-right: 0.8s (800ms) - see globals.css line 277, 320, 377
 *   Note: HIGHLIGHT_ANIMATION_DURATION_MS includes this 800ms + 50ms buffer
 */

// ============================================================================
// USED ONLY IN SID
// ============================================================================

// ----------------------------------------------------------------------------
// Reasoning Model Card (reasoning-model-card.tsx)
// ----------------------------------------------------------------------------
export const REASONING_MODEL_TIMINGS = {
  /** Typing animation speed */
  TYPING_SPEED_MS_PER_CHAR: 15,
  
  /** Text highlight duration */
  TEXT_HIGHLIGHT_DURATION_MS: 500,
  
  /** Pause between delete and type operations */
  PAUSE_BETWEEN_DELETE_AND_TYPE_MS: 100,
  
  /** Status transition animation duration */
  STATUS_TRANSITION_MS: 300,
  
  /** Thinking lines animation delays */
  THINKING_LINE_1_DELAY_MS: 0,
  THINKING_LINE_2_DELAY_MS: 50,
  THINKING_LINE_3_DELAY_MS: 100,
  
  /** Answer lines animation delays */
  ANSWER_LINE_1_DELAY_MS: 0,
  ANSWER_LINE_2_DELAY_MS: 50,
  ANSWER_LINE_3_DELAY_MS: 100,
  ANSWER_COMPLETE_DELAY_MS: 150,
  
  /** Answer transition duration */
  ANSWER_TRANSITION_MS: 400,
  
  /** Plan step fade-in delay between steps */
  PLAN_STEP_FADE_IN_DELAY_MS: 50,
  
  /** Sequential flow timing values */
  SEQUENTIAL_FLOW: {
    STATE_RESET_DELAY_MS: 100,
    QUERY_HIGHLIGHT_MS: 500,
    PAUSE_AFTER_REMOVE_HIGHLIGHT_MS: 300,
    THINKING_TIMER_MS: 1000,
    PLAN_DISPLAY_WAIT_MS: 300,
    ANSWERING_ANIMATION_WAIT_MS: 500,
    PAUSE_BEFORE_COMPLETE_STEP_3_MS: 300,
    PAUSE_BEFORE_NEXT_LINE_MS: 300,
    PAUSE_BEFORE_START_ANSWERING_MS: 500,
    ANSWERING_TIMER_MS: 1000,
  } as const,
} as const;

/**
 * CSS Animation Durations (defined in globals.css and reasoning-components.tsx)
 * - Answer transition: 0.4s (400ms) - matches ANSWER_TRANSITION_MS
 *   See reasoning-model-card.tsx inline style line 56, 76
 * - Status fade: 0.3s (300ms) - matches STATUS_TRANSITION_MS
 *   See globals.css line 409
 * - Plan step fade-in: 0.3s (300ms) - matches PLAN_STEP_FADE_IN_DELAY_MS
 *   See reasoning-model-card.tsx inline style line 1535
 * - Query text opacity: 0.3s (300ms) - see reasoning-model-card.tsx inline style line 1496
 * - Step transition: 0.1s (100ms) - see reasoning-model-card.tsx inline style line 592
 * - Spinner: 2s infinite - see reasoning-components.tsx line 134
 * - Component transitions: 0.2s (200ms) - see reasoning-components.tsx lines 27, 157
 */

// ============================================================================
// CALCULATED VALUES (Cannot be constants - calculated at runtime)
// ============================================================================

/**
 * The following values are calculated at runtime and cannot be constants:
 * 
 * 1. Document appearance delays in retrieved-search-card.tsx:
 *    - delayBetweenDocuments = totalTimeWindow / (documents.length - 1)
 *    - Individual document delays = resetDelay + (index * delayBetweenDocuments)
 *    See retrieved-search-card.tsx lines 216-218
 * 
 * 2. Typing time calculations in reasoning-model-card.tsx:
 *    - typingTime = textLength * TYPING_SPEED_MS_PER_CHAR + highlightDuration + pause
 *    - Example: stripFormatting(updated_question).length * 50 + 600
 *    See reasoning-model-card.tsx lines 1097-1098, 1194
 * 
 * 3. Task typing time in reasoning-model-card.tsx:
 *    - taskTypingTime = (updated_question || "").length * 50 + 200
 *    See reasoning-model-card.tsx line 1279
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type AnimationTimings = typeof AI_CHAT_TIMINGS &
  typeof POST_REQUEST_TIMINGS &
  typeof RETRIEVED_SEARCH_TIMINGS &
  typeof DATABASE_SEARCH_TIMINGS &
  typeof DOCUMENT_VARIANTS_TIMINGS &
  typeof RAG_HIGHLIGHT_TIMINGS &
  typeof REASONING_MODEL_TIMINGS;

