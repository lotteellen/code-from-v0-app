# Animation System Documentation

## Overview

This document comprehensively documents all animation timings, breaks, sequences, and dependencies in the graphics pipeline system. The system consists of two main pipelines: **RAG** (Retrieval-Augmented Generation) and **SID** (Structured Information Discovery), with shared and unique components.

---

## 1. Timing Constants Reference

All timing constants are defined in `components/graphics/helpers/animation-timings.ts` and organized by component usage.

### 1.1 Used in BOTH RAG and SID

#### AI Chat Card Timings (`AI_CHAT_TIMINGS`)

```typescript
USER_MESSAGE_START_DELAY_MS: 300        // Delay before user message animation starts
USER_MESSAGE_ANIMATION_MS: 450          // User message fade-in animation duration
ASSISTANT_LINE_1_DELAY_MS: 0            // First assistant line reveal delay
ASSISTANT_LINE_2_DELAY_MS: 250          // Second assistant line reveal delay
ASSISTANT_ANSWER_DELAY_MS: 500           // Answer reveal delay (250 + 250)
ASSISTANT_LINE_3_DELAY_MS: 750           // Third assistant line reveal delay (250 + 250 + 250)
INDICATOR_START_DELAY_MS: 1000           // Delay after all assistant lines complete
INDICATOR_DURATION_MS: 600               // Indicator animation duration
PAUSE_AFTER_POST_PULSATION_MS: 500      // Pause between post pulsation and assistant response
```

**CSS Animation Durations:**
- User message fade-in: `0.25s` (250ms) - matches `USER_MESSAGE_ANIMATION_MS`
- Assistant line reveal: `0.4s` (400ms)
- Indicator checkmark: `0.25s` (250ms)
- Indicator X (first path): `0.12s` (120ms) with `0.12s` delay
- Indicator X (second path): `0.12s` (120ms)

#### Post Request Card Timings (`POST_REQUEST_TIMINGS`)

```typescript
INITIAL_DELAY_BEFORE_ANIMATION_MS: 600  // Delay before first animation starts
DOCUMENT_STACK_DELAYS_MS: [400, 250, 120, 180, 80, 200, 300, 150, 220, 100]  // Chaotic document entry delays
CONTEXT_ANIMATION_DURATION_MS: 850      // Context highlight duration (800ms CSS + 50ms buffer)
DELAY_AFTER_RETRIEVAL_MS: 800           // Delay between retrieval completion and post animation
```

**CSS Animation Durations:**
- Paper stack fade-in: `0.3s` (300ms)
- Highlight left-to-right: `0.8s` (800ms)
- Note: `CONTEXT_ANIMATION_DURATION_MS` includes 800ms CSS + 50ms buffer

#### Retrieved Search Card Timings (`RETRIEVED_SEARCH_TIMINGS`)

```typescript
REMOVE_HIGHLIGHT_DELAY_MS: 300           // Delay before removing highlight after adding text
DOCUMENT_RESET_DELAY_MS: 50              // Small delay to ensure state reset completes
DOCUMENT_TOTAL_TIME_WINDOW_MS: 850       // Documents spaced evenly over this duration
DOCUMENT_SEARCH_COMPLETION_MS: 2000      // Max delay for search animation completion
DOCUMENT_TRANSITION_MS: 400              // Opacity and transform transitions
```

**CSS Animation Durations:**
- Highlight left-to-right: `0.8s` (800ms) - used with 50ms buffer = 850ms total

#### Database Search Card Timings (`DATABASE_SEARCH_TIMINGS`)

```typescript
SEARCH_ANIMATION_DURATION_MS: 2000      // Search animation duration
```

**CSS Animation Durations:**
- Database pulse: `1s` infinite
- Text shimmer: `0.3s` infinite

#### Document Variants Timings (`DOCUMENT_VARIANTS_TIMINGS`)

```typescript
HIGHLIGHT_DELAY_MS: 10                   // Delay before triggering highlight animation
```

### 1.2 Used Only in RAG

#### RAG Highlight Timings (`RAG_HIGHLIGHT_TIMINGS`)

```typescript
HIGHLIGHT_ANIMATION_DURATION_MS: 850     // Highlight animation duration (800ms CSS + 50ms buffer)
DOCUMENT_HIGHLIGHT_LINES: {
  SIMPLE: [1, 3, 5]                      // Line indices to highlight for simple variant
  BULLETS: [0, 2, 4]                      // Line indices to highlight for bullets variant
  CHART: [0, 2]                           // Line indices to highlight for chart variant
  TABLE: [1, 4, 7]                        // Line indices to highlight for table variant
}
```

**Note:** Database search term highlighting (enterprise, pricing, SMB) uses the same `HIGHLIGHT_ANIMATION_DURATION_MS` timing. In SID, `highlightDatabase={false}` is passed, so database highlighting is skipped.

### 1.3 Used Only in SID

#### Reasoning Model Timings (`REASONING_MODEL_TIMINGS`)

```typescript
TYPING_SPEED_MS_PER_CHAR: 15             // Typing animation speed per character
TEXT_HIGHLIGHT_DURATION_MS: 500          // Text highlight duration
PAUSE_BETWEEN_DELETE_AND_TYPE_MS: 100    // Pause between delete and type operations
STATUS_TRANSITION_MS: 300                // Status transition animation duration
THINKING_LINE_1_DELAY_MS: 0              // First thinking line animation delay
THINKING_LINE_2_DELAY_MS: 50             // Second thinking line animation delay
THINKING_LINE_3_DELAY_MS: 100            // Third thinking line animation delay
ANSWER_LINE_1_DELAY_MS: 0                // First answer line animation delay
ANSWER_LINE_2_DELAY_MS: 50               // Second answer line animation delay
ANSWER_LINE_3_DELAY_MS: 100              // Third answer line animation delay
ANSWER_COMPLETE_DELAY_MS: 150            // Answer complete delay
ANSWER_TRANSITION_MS: 400                // Answer transition duration
PLAN_STEP_FADE_IN_DELAY_MS: 50           // Plan step fade-in delay between steps
```

**Sequential Flow Timings:**
```typescript
SEQUENTIAL_FLOW: {
  STATE_RESET_DELAY_MS: 100               // State reset delay
  QUERY_HIGHLIGHT_MS: 500                // Query highlight duration
  PAUSE_AFTER_REMOVE_HIGHLIGHT_MS: 300   // Pause after removing highlight
  THINKING_TIMER_MS: 1000                // Thinking timer duration
  PLAN_DISPLAY_WAIT_MS: 300              // Plan display wait time
  ANSWERING_ANIMATION_WAIT_MS: 500       // Answering animation wait time
  PAUSE_BEFORE_COMPLETE_STEP_3_MS: 300  // Pause before completing step 3
  PAUSE_BEFORE_NEXT_LINE_MS: 300         // Pause before next line
  PAUSE_BEFORE_START_ANSWERING_MS: 500   // Pause before starting answering
  ANSWERING_TIMER_MS: 1000               // Answering timer duration
}
```

**CSS Animation Durations:**
- Answer transition: `0.4s` (400ms) - matches `ANSWER_TRANSITION_MS`
- Status fade: `0.3s` (300ms) - matches `STATUS_TRANSITION_MS`
- Plan step fade-in: `0.3s` (300ms)
- Query text opacity: `0.3s` (300ms)
- Step transition: `0.1s` (100ms)
- Spinner: `2s` infinite
- Component transitions: `0.2s` (200ms)

### 1.4 Calculated Values (Runtime)

The following values are calculated at runtime and cannot be constants:

1. **Document appearance delays** in `retrieved-search-card.tsx`:
   - `delayBetweenDocuments = totalTimeWindow / (documents.length - 1)`
   - Individual document delays = `resetDelay + (index * delayBetweenDocuments)`

2. **Typing time calculations** in `reasoning-model-card.tsx`:
   - `typingTime = textLength * TYPING_SPEED_MS_PER_CHAR + highlightDuration + pause`
   - Example: `stripFormatting(updated_question).length * 50 + 600`

3. **Task typing time** in `reasoning-model-card.tsx`:
   - `taskTypingTime = (updated_question || "").length * 50 + 200`

---

## 2. Component Animation Sequences

### 2.1 AI Chat Card (`components/graphics/elements/AI-chat.tsx`)

#### User Message Animation Sequence

1. **Initial Delay** (300ms)
   - Wait: `USER_MESSAGE_START_DELAY_MS`
   - State: Message hidden

2. **Fade-in Animation** (450ms)
   - Show message and start fade-in animation
   - Duration: `USER_MESSAGE_ANIMATION_MS`
   - CSS: `user-message-animate` class

3. **Highlight Lines** (immediate after animation)
   - Set `highlightLine1 = true`
   - Set `highlightLine2 = true`
   - CSS: `text-focus-active` class

**Total Duration:** ~750ms (300ms delay + 450ms animation)

#### Assistant Message Animation Sequence

1. **Line 1 Reveal** (0ms delay)
   - Delay: `ASSISTANT_LINE_1_DELAY_MS` (0ms)
   - CSS: `assistant-line-reveal` class
   - Duration: 400ms (CSS)

2. **Line 2 Reveal** (250ms delay)
   - Delay: `ASSISTANT_LINE_2_DELAY_MS` (250ms)
   - CSS: `assistant-line-reveal` class
   - Duration: 400ms (CSS)

3. **Answer Reveal** (500ms delay)
   - Delay: `ASSISTANT_ANSWER_DELAY_MS` (500ms)
   - CSS: `assistant-line-reveal` class
   - Duration: 400ms (CSS)
   - Color: Green (correct) or Red (incorrect)

4. **Line 3 Reveal** (750ms delay)
   - Delay: `ASSISTANT_LINE_3_DELAY_MS` (750ms)
   - CSS: `assistant-line-reveal` class
   - Duration: 400ms (CSS)

5. **Indicator Animation** (1000ms delay)
   - Delay: `INDICATOR_START_DELAY_MS` (1000ms after line 3 starts)
   - Show indicator (checkmark or X)
   - Duration: `INDICATOR_DURATION_MS` (600ms)
   - CSS: `indicator-path-reveal` class

**Total Duration:** ~1600ms (750ms + 400ms + 1000ms delay + 600ms indicator)

#### Dependencies

- User message animation is independent
- Assistant message animation is triggered by Post Request Card via `onAnimateAssistantMessage` callback
- Indicator appears automatically after all assistant lines complete

---

### 2.2 Post Request Card (`components/graphics/elements/post-request-card.tsx`)

#### Animation Sequence (with context highlighting)

1. **Initial Delay** (600ms)
   - Wait: `INITIAL_DELAY_BEFORE_ANIMATION_MS`
   - State: All animations reset

2. **Context Highlight** (800ms duration)
   - Start context highlight animation
   - CSS: `highlight-animate highlight-context` or `highlight-documents`
   - Duration: 800ms (CSS)
   - **Halfway Point (400ms):** Documents start appearing

3. **Document Stack Entry** (starts at 400ms)
   - Documents appear at: `contextHighlightHalfway + DOCUMENT_STACK_DELAYS_MS[index]`
   - First document: 400ms + 400ms = 800ms
   - Last document: 400ms + 100ms = 500ms (varies by delay)
   - CSS: `paper-stack-animate` class
   - Duration: 300ms per document
   - Documents fully apparent: 400ms + 400ms (max delay) + 300ms = 1100ms

4. **Message Highlight** (starts at 1100ms)
   - Wait until documents fully apparent
   - Start message highlight animation
   - CSS: `highlight-animate highlight-message`
   - Duration: 800ms (CSS)
   - **Halfway Point (1500ms):** User message appears

5. **User Message Appearance** (at 1500ms)
   - Show user message
   - CSS: `user-message-animate` class
   - Duration: 250ms (CSS)

6. **Browser Window Pulsation** (starts at 1900ms)
   - Wait: Remaining 400ms after message highlight completes
   - Start pulsation
   - Duration: 2000ms
   - **Halfway Point (2900ms):** Trigger AI chat animation

7. **AI Chat Animation Trigger** (at 2900ms)
   - Call `onAnimateAssistantMessage()` callback
   - This triggers assistant message animation in AI Chat Card

8. **Stop Pulsation** (at 3900ms)
   - Stop pulsation after remaining 1000ms

**Total Duration:** ~3900ms

#### Timing Breakdown

```
0ms     - Initial delay starts
600ms   - Context highlight starts
1000ms  - Context highlight halfway, documents start appearing
1100ms  - Documents fully apparent, message highlight starts
1500ms  - Message highlight halfway, user message appears
1900ms  - Message highlight completes, pulsation starts
2900ms  - Pulsation halfway, AI chat animation triggered
3900ms  - Pulsation completes, animation sequence ends
```

#### Dependencies

- Triggered by pipeline orchestrator (RAG or SID)
- Calls `onAnimateAssistantMessage` callback to trigger AI Chat Card animation
- Documents appear during context highlight (not after)
- User message appears during message highlight (not after)

---

### 2.3 Retrieved Search Card (`components/graphics/elements/retrieved-search-card.tsx`)

#### Animation Sequence

The component exposes three main functions that are called sequentially:

##### Function 1: `addTextAndRemoveHighlight`

1. **Add Text** (immediate)
   - Call `databaseFunctions.addText(text)`
   - Text appears with highlight (blue color)

2. **Remove Highlight** (300ms delay)
   - Wait: `REMOVE_HIGHLIGHT_DELAY_MS`
   - Call `databaseFunctions.removeHighlight()`
   - Text returns to normal color

**Total Duration:** 300ms

##### Function 2: `search` (Retrieval)

1. **Reset State** (immediate)
   - Increment `resetKey` to force remount
   - Reset all document visibility states

2. **Start Search Animation** (immediate)
   - Call `databaseFunctions.search()`
   - Database search animation starts
   - Duration: `SEARCH_ANIMATION_DURATION_MS` (2000ms)

3. **Document Appearance Sequence** (starts at 50ms)
   - First document: `DOCUMENT_RESET_DELAY_MS` (50ms)
   - Subsequent documents: Evenly spaced over `DOCUMENT_TOTAL_TIME_WINDOW_MS` (850ms)
   - Calculation: `resetDelay + (index * delayBetweenDocuments)`
   - For 4 documents: 50ms, 333ms, 616ms, 900ms
   - CSS: Opacity and transform transitions
   - Duration: `DOCUMENT_TRANSITION_MS` (400ms per document)

4. **Completion** (2000ms)
   - Force all documents visible as backup
   - Set `isDone = true`
   - Resolve promise

**Total Duration:** 2000ms

##### Function 3: `highlight`

1. **Set Highlight State** (immediate)
   - Set `internalHighlightDocuments = true`
   - Set highlight lines for each document variant:
     - Simple: lines [1, 3, 5]
     - Bullets: lines [0, 2, 4]
     - Chart: lines [0, 2]
     - Table: lines [1, 4, 7]

2. **Database Term Highlighting** (if `highlightDatabase = true`)
   - Call `highlightEnterprise()`
   - Call `highlightPricing()`
   - Call `highlightSMB()`
   - Each uses `HIGHLIGHT_ANIMATION_DURATION_MS` (850ms)

3. **Wait for Completion** (850ms)
   - Wait: `HIGHLIGHT_ANIMATION_DURATION_MS`
   - CSS: `word-highlight-active` class
   - CSS highlight duration: 800ms + 50ms buffer

**Total Duration:** 850ms

#### Dependencies

- Depends on Database Search Card for text and search functions
- Documents appear sequentially from left to right
- Highlighting happens after documents are visible
- In SID pipeline, `highlightDatabase={false}` is passed

---

### 2.4 Database Search Card (`components/graphics/elements/database-search-card.tsx`)

#### Animation Sequence

##### Function: `addText`

1. **Set Text** (immediate)
   - Update `displayedText` state
   - Text appears with highlight (blue color, `text-focus-active` class)

##### Function: `removeHighlight`

1. **Remove Highlight** (immediate)
   - Set `highlighted = false`
   - Text returns to normal color

##### Function: `search`

1. **Start Search Animation** (immediate)
   - Set `isSearching = true`
   - CSS: `database-pulse` or `database-pulse-white` class
   - CSS: `text-pulse` class on text
   - Duration: `SEARCH_ANIMATION_DURATION_MS` (2000ms)

2. **Stop Search Animation** (2000ms)
   - Set `isSearching = false`
   - Remove pulse classes

**Total Duration:** 2000ms

##### Functions: `highlightEnterprise`, `highlightPricing`, `highlightSMB`

1. **Start Highlight** (immediate)
   - Increment key to restart animation
   - Set highlight state to `true`
   - CSS: `word-highlight-active` class
   - Duration: 850ms (matches `HIGHLIGHT_ANIMATION_DURATION_MS`)

2. **Remove Highlight** (when called again)
   - Set highlight state to `false`

#### Dependencies

- Used by Retrieved Search Card
- Search animation is independent
- Highlighting can be triggered individually for each term

---

### 2.5 Reasoning Model Card (`components/graphics/elements/reasoning-model-card.tsx`)

#### Sequential Flow Animation

The reasoning model card runs a complex sequential flow with multiple steps. Each step goes through phases: `active` → `updating` → `retrieving` → `answering` → `completed`.

##### Phase 1: Initial Setup

1. **State Reset** (100ms)
   - Wait: `STATE_RESET_DELAY_MS`
   - Reset all step states

2. **Query Highlight** (500ms)
   - Highlight query text in AI Chat Card (via `onBeforeQueryText` callback)
   - Wait: `QUERY_HIGHLIGHT_MS`
   - Remove highlight
   - Wait: `PAUSE_AFTER_REMOVE_HIGHLIGHT_MS` (300ms)

3. **Thinking Phase** (1000ms)
   - Show thinking lines with delays:
     - Line 1: `THINKING_LINE_1_DELAY_MS` (0ms)
     - Line 2: `THINKING_LINE_2_DELAY_MS` (50ms)
     - Line 3: `THINKING_LINE_3_DELAY_MS` (100ms)
   - Wait: `THINKING_TIMER_MS` (1000ms)

4. **Plan Display** (300ms)
   - Show plan steps
   - Wait: `PLAN_DISPLAY_WAIT_MS`
   - Steps fade in with `PLAN_STEP_FADE_IN_DELAY_MS` (50ms) between each

##### Phase 2: Step Processing (Steps 1-4)

For each step (lines 1-4):

1. **Update Question** (variable duration)
   - State: `active` → `updating`
   - Highlight text to be replaced: `TEXT_HIGHLIGHT_DURATION_MS` (500ms)
   - Delete highlighted text
   - Pause: `PAUSE_BETWEEN_DELETE_AND_TYPE_MS` (100ms)
   - Type new text: `textLength * TYPING_SPEED_MS_PER_CHAR` (15ms per char)
   - Example: "When did they pivot?" → "When did Tomato pivot to SMB?"
     - Highlight "they" (500ms)
     - Delete "they"
     - Type "Tomato" (6 chars × 15ms = 90ms)
     - Type " to SMB" (7 chars × 15ms = 105ms)
   - Total: ~795ms

2. **Retrieval Phase** (variable duration)
   - State: `updating` → `retrieving`
   - Call `onRetrievalReady(stepIndex, retrievalText)` callback
   - This triggers Retrieved Search Card animation:
     - `addTextAndRemoveHighlight(retrievalText)` (300ms)
     - `search()` (2000ms)
   - Wait for callback to complete
   - State transition animation: `STATUS_TRANSITION_MS` (300ms)

3. **Answering Phase** (500ms + 1000ms)
   - State: `retrieving` → `answering`
   - Wait: `ANSWERING_ANIMATION_WAIT_MS` (500ms)
   - Show answer lines with delays:
     - Line 1: `ANSWER_LINE_1_DELAY_MS` (0ms)
     - Line 2: `ANSWER_LINE_2_DELAY_MS` (50ms)
     - Line 3: `ANSWER_LINE_3_DELAY_MS` (100ms)
   - Wait: `ANSWER_COMPLETE_DELAY_MS` (150ms)
   - State transition animation: `STATUS_TRANSITION_MS` (300ms)

4. **Completion** (300ms)
   - State: `answering` → `completed`
   - Show answer text
   - Wait: `PAUSE_BEFORE_NEXT_LINE_MS` (300ms)

**Per Step Duration:** ~4000-5000ms (depending on text length and retrieval)

##### Phase 3: New Task Addition (Step 5)

1. **Add New Task** (variable duration)
   - Create new step with empty question
   - State: `pending`
   - Type question: `question.length * 50 + 200` (different calculation)
   - Example: "Pricing after pivot?" (20 chars × 50ms + 200ms = 1200ms)

2. **Update Question** (same as Phase 2, Step 1)
   - State: `pending` → `updating`
   - Highlight, delete, type new text

3. **Retrieval Phase** (same as Phase 2, Step 2)
   - State: `updating` → `retrieving`
   - Call `onRetrievalReady` callback

4. **Answering Phase** (same as Phase 2, Step 3)
   - State: `retrieving` → `answering`
   - Show answer

5. **Completion** (same as Phase 2, Step 4)
   - State: `answering` → `completed`
   - Show final answer

**Step 5 Duration:** ~5000-6000ms

##### Total Sequential Flow Duration

- Phase 1: ~1900ms
- Phase 2 (4 steps): ~16000-20000ms
- Phase 3 (1 step): ~5000-6000ms
- **Total: ~23000-28000ms (23-28 seconds)**

#### Dependencies

- Calls `onBeforeQueryText` before updating query (unhighlights AI Chat lines)
- Calls `onRetrievalReady` for each step that needs retrieval (triggers Retrieved Search Card)
- State transitions use CSS animations with `STATUS_TRANSITION_MS` duration
- Typing speed is character-based: `TYPING_SPEED_MS_PER_CHAR`

---

## 3. Pipeline Flows

### 3.1 RAG Pipeline (`components/graphics/rag-card.tsx`)

#### Sequential Animation Flow

The RAG pipeline orchestrates animations across three main components: AI Chat Card, Retrieved Search Card, and Post Request Card.

##### Step 1: User Message Animation
- **Component:** AI Chat Card
- **Function:** `animateUserMessage()`
- **Duration:** ~750ms
- **Active States:** `chatActive = true`, `retrievalActive = true`, `postActive = false`
- **Dependencies:** None (starts the sequence)

##### Step 2: Add Text and Remove Highlight
- **Component:** Retrieved Search Card
- **Function:** `addTextAndRemoveHighlight()`
- **Duration:** 300ms
- **Active States:** `chatActive = true`, `retrievalActive = true`, `postActive = false`
- **Dependencies:** Waits for Step 1 to complete

##### Step 3: Unhighlight Lines
- **Component:** AI Chat Card
- **Function:** `unhighlightLines()`
- **Duration:** Immediate
- **Active States:** `chatActive = false`, `retrievalActive = true`, `postActive = false`
- **Dependencies:** Waits for Step 2 to complete

##### Step 4: Search/Retrieval
- **Component:** Retrieved Search Card
- **Function:** `search()`
- **Duration:** 2000ms
- **Active States:** `chatActive = false`, `retrievalActive = true`, `postActive = false`
- **Dependencies:** Waits for Step 3 to complete

##### Step 5: Highlight Documents
- **Component:** Retrieved Search Card
- **Function:** `highlight()`
- **Duration:** 850ms
- **Active States:** `chatActive = false`, `retrievalActive = true`, `postActive = false`
- **Dependencies:** Waits for Step 4 to complete

##### Break: Delay After Retrieval
- **Duration:** `DELAY_AFTER_RETRIEVAL_MS` (800ms)
- **Purpose:** Pause between retrieval completion and post request animation
- **Active States:** All inactive during break

##### Step 6: Post Request Animation
- **Component:** Post Request Card
- **Function:** `animate()`
- **Duration:** ~3900ms
- **Active States:** `chatActive = false`, `retrievalActive = false`, `postActive = true`
- **Dependencies:** 
  - Waits for break to complete
  - Internally triggers AI Chat Card assistant message animation at 2900ms
  - When AI chat animation is triggered: `chatActive = true` (temporarily)

##### Total RAG Pipeline Duration

- Steps 1-5: ~3900ms
- Break: 800ms
- Step 6: ~3900ms
- **Total: ~8600ms (8.6 seconds)**

#### Dependency Graph

```
AI Chat (User Message)
    ↓
Retrieved Search (Add Text)
    ↓
AI Chat (Unhighlight)
    ↓
Retrieved Search (Search)
    ↓
Retrieved Search (Highlight)
    ↓
[800ms BREAK]
    ↓
Post Request (Animate)
    ├─→ Context Highlight (600ms delay)
    ├─→ Documents Appear (at 1000ms)
    ├─→ Message Highlight (at 1100ms)
    ├─→ User Message (at 1500ms)
    ├─→ Pulsation (at 1900ms)
    └─→ AI Chat (Assistant Message) [at 2900ms]
```

#### Activation State Management

- `chatActive`: Controls AI Chat Card opacity
- `retrievalActive`: Controls Retrieved Search Card opacity
- `postActive`: Controls Post Request Card opacity
- States change throughout the sequence to show which component is active

---

### 3.2 SID Pipeline (`components/graphics/sid-pipeline-card.tsx`)

#### Sequential Animation Flow

The SID pipeline orchestrates animations across four main components: AI Chat Card, Reasoning Model Card, Retrieved Search Card, and Post Request Card.

##### Step 1: User Message Animation
- **Component:** AI Chat Card
- **Function:** `animateUserMessage()`
- **Duration:** ~750ms
- **Active States:** `chatActive = true`, `reasoningActive = false`, `retrievalActive = false`, `postActive = false`
- **Dependencies:** None (starts the sequence)

##### Step 2: Reasoning Model Sequential Flow
- **Component:** Reasoning Model Card
- **Function:** `runSequentialFlow()`
- **Duration:** ~23000-28000ms (23-28 seconds)
- **Active States:** `chatActive = false`, `reasoningActive = true`, `retrievalActive = false`, `postActive = false`
- **Dependencies:** Waits for Step 1 to complete

**Internal Reasoning Model Flow:**

1. **Initial Setup** (~1900ms)
   - State reset (100ms)
   - Query highlight in AI Chat (via `onBeforeQueryText` callback) (500ms)
   - Remove highlight pause (300ms)
   - Thinking phase (1000ms)
   - Plan display (300ms)

2. **Steps 1-4 Processing** (~16000-20000ms)
   - For each step:
     - Update question (highlight, delete, type) (~795ms)
     - Retrieval phase (via `onRetrievalReady` callback) (~2300ms)
     - Answering phase (~1500ms)
     - Completion pause (300ms)
   - Total per step: ~4900ms
   - 4 steps: ~19600ms

3. **Step 5: New Task** (~5000-6000ms)
   - Add new task (type question) (~1200ms)
   - Update question (~795ms)
   - Retrieval phase (~2300ms)
   - Answering phase (~1500ms)
   - Completion (300ms)

**Retrieval Callbacks During Reasoning Flow:**

Each time `onRetrievalReady` is called:
- **Active States:** `reasoningActive = false`, `retrievalActive = true`
- **Component:** Retrieved Search Card
- **Functions Called:**
  1. `addTextAndRemoveHighlight(retrievalText)` (300ms)
  2. `search()` (2000ms)
- **Active States After:** `retrievalActive = false`, `reasoningActive = true`

##### Break: Delay After Retrieval
- **Duration:** `DELAY_AFTER_RETRIEVAL_MS` (800ms)
- **Purpose:** Pause between reasoning completion and post request animation
- **Active States:** All inactive during break

##### Step 3: Post Request Animation
- **Component:** Post Request Card
- **Function:** `animate()`
- **Duration:** ~3900ms
- **Active States:** `chatActive = false`, `reasoningActive = false`, `retrievalActive = false`, `postActive = true`
- **Dependencies:**
  - Waits for break to complete
  - Internally triggers AI Chat Card assistant message animation at 2900ms
  - When AI chat animation is triggered: `chatActive = true` (temporarily)

##### Total SID Pipeline Duration

- Step 1: ~750ms
- Step 2: ~23000-28000ms
- Break: 800ms
- Step 3: ~3900ms
- **Total: ~28450-32750ms (28-33 seconds)**

#### Dependency Graph

```
AI Chat (User Message)
    ↓
Reasoning Model (Sequential Flow)
    ├─→ Initial Setup
    │   ├─→ AI Chat (Unhighlight) [via onBeforeQueryText]
    │   ├─→ Thinking Phase
    │   └─→ Plan Display
    │
    ├─→ Step 1-4 Processing
    │   ├─→ Update Question (highlight, delete, type)
    │   ├─→ Retrieved Search (Retrieval) [via onRetrievalReady]
    │   │   ├─→ Add Text & Remove Highlight (300ms)
    │   │   └─→ Search (2000ms)
    │   ├─→ Answering Phase
    │   └─→ Completion
    │
    └─→ Step 5: New Task
        ├─→ Add Task (type question)
        ├─→ Update Question
        ├─→ Retrieved Search (Retrieval) [via onRetrievalReady]
        └─→ Answering Phase
    ↓
[800ms BREAK]
    ↓
Post Request (Animate)
    ├─→ Context Highlight (600ms delay)
    ├─→ Documents Appear (at 1000ms)
    ├─→ Message Highlight (at 1100ms)
    ├─→ User Message (at 1500ms)
    ├─→ Pulsation (at 1900ms)
    └─→ AI Chat (Assistant Message) [at 2900ms]
```

#### Activation State Management

- `chatActive`: Controls AI Chat Card opacity
- `reasoningActive`: Controls Reasoning Model Card opacity
- `retrievalActive`: Controls Retrieved Search Card opacity (temporarily during retrieval callbacks)
- `postActive`: Controls Post Request Card opacity
- States change throughout the sequence, with retrieval being temporarily active during callbacks

#### Key Differences from RAG Pipeline

1. **Reasoning Model Integration:** SID includes a complex reasoning model that processes multiple steps
2. **Multiple Retrieval Calls:** Retrieval happens multiple times during reasoning flow (once per step)
3. **Longer Duration:** SID pipeline is significantly longer due to reasoning model processing
4. **No Document Highlighting:** In SID, `highlightDatabase={false}` is passed to Retrieved Search Card
5. **Query Updates:** Reasoning model updates queries dynamically during processing

---

## 4. Dependency Graph

### 4.1 Component Dependencies

```
┌─────────────────┐
│  RAG Pipeline   │
│  SID Pipeline   │
└────────┬────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
┌─────────────────┐                  ┌──────────────────┐
│  AI Chat Card   │                  │ Post Request Card│
└────────┬────────┘                  └────────┬─────────┘
         │                                     │
         │ (unhighlightLines)                  │ (onAnimateAssistantMessage)
         │                                     │
         │                                     ▼
         │                            ┌──────────────────┐
         │                            │  AI Chat Card    │
         │                            │ (assistant msg)  │
         │                            └──────────────────┘
         │
         ▼
┌─────────────────────┐
│ Retrieved Search    │
│      Card           │
└────────┬────────────┘
         │
         │ (database functions)
         │
         ▼
┌─────────────────────┐
│ Database Search Card│
└─────────────────────┘

┌─────────────────────┐
│ Reasoning Model Card│
└────────┬─────────────┘
         │
         │ (onRetrievalReady)
         │
         ▼
┌─────────────────────┐
│ Retrieved Search    │
│      Card           │
└─────────────────────┘
```

### 4.2 Callback Chains

#### RAG Pipeline Callbacks

1. **Pipeline → AI Chat Card**
   - `animateUserMessage()` - User message animation
   - `unhighlightLines()` - Remove highlight from lines

2. **Pipeline → Retrieved Search Card**
   - `addTextAndRemoveHighlight()` - Add text and remove highlight
   - `search()` - Start search animation
   - `highlight()` - Highlight documents and database terms

3. **Pipeline → Post Request Card**
   - `animate()` - Start post request animation

4. **Post Request Card → AI Chat Card**
   - `onAnimateAssistantMessage()` - Trigger assistant message animation

#### SID Pipeline Callbacks

1. **Pipeline → AI Chat Card**
   - `animateUserMessage()` - User message animation

2. **Pipeline → Reasoning Model Card**
   - `runSequentialFlow()` - Start sequential reasoning flow

3. **Reasoning Model Card → AI Chat Card**
   - `onBeforeQueryText()` - Unhighlight lines before query update

4. **Reasoning Model Card → Retrieved Search Card**
   - `onRetrievalReady(stepIndex, retrievalText)` - Trigger retrieval for each step
     - Calls `addTextAndRemoveHighlight(retrievalText)`
     - Calls `search()`

5. **Pipeline → Post Request Card**
   - `animate()` - Start post request animation

6. **Post Request Card → AI Chat Card**
   - `onAnimateAssistantMessage()` - Trigger assistant message animation

### 4.3 Timing Dependencies

#### Critical Timing Relationships

1. **Post Request Card → AI Chat Card**
   - Post Request Card waits 2900ms before triggering AI Chat Card
   - This is exactly halfway through the pulsation (2000ms / 2 = 1000ms)
   - Total delay: 1900ms (message highlight complete) + 1000ms (pulsation halfway) = 2900ms

2. **Retrieved Search Card → Database Search Card**
   - Retrieved Search Card immediately calls database functions
   - No delay between Retrieved Search Card and Database Search Card

3. **Reasoning Model Card → Retrieved Search Card**
   - Reasoning Model Card calls `onRetrievalReady` callback
   - Retrieved Search Card processes immediately (no delay)
   - Reasoning Model Card waits for callback to complete before continuing

4. **Document Stack Entry**
   - Documents start appearing at 400ms (halfway through context highlight)
   - Each document has its own delay from `DOCUMENT_STACK_DELAYS_MS`
   - Documents fully apparent at 1100ms (400ms + 400ms max delay + 300ms animation)

5. **User Message in Post Request**
   - User message appears at 1500ms (halfway through message highlight)
   - This is 400ms into the 800ms message highlight animation

### 4.4 Break Points

#### RAG Pipeline Breaks

1. **After Retrieval Completion** (800ms)
   - Location: After Retrieved Search Card highlight completes
   - Duration: `DELAY_AFTER_RETRIEVAL_MS` (800ms)
   - Purpose: Pause before post request animation starts

#### SID Pipeline Breaks

1. **After Reasoning Completion** (800ms)
   - Location: After Reasoning Model Card sequential flow completes
   - Duration: `DELAY_AFTER_RETRIEVAL_MS` (800ms)
   - Purpose: Pause before post request animation starts

2. **Within Reasoning Flow** (multiple)
   - Between question update and retrieval: `PAUSE_BEFORE_START_ANSWERING_MS` (500ms)
   - Between retrieval and answering: `ANSWERING_ANIMATION_WAIT_MS` (500ms)
   - Between steps: `PAUSE_BEFORE_NEXT_LINE_MS` (300ms)
   - Before completing step 3: `PAUSE_BEFORE_COMPLETE_STEP_3_MS` (300ms)

---

## 5. Summary

### Key Timing Constants

- **Shortest Animation:** 10ms (Document Variants highlight delay)
- **Longest Single Animation:** 2000ms (Database search, Retrieved search completion)
- **Longest Component Sequence:** ~3900ms (Post Request Card full sequence)
- **Longest Pipeline:** ~28000-33000ms (SID Pipeline with reasoning model)

### Critical Dependencies

1. **Post Request Card** is the central orchestrator that triggers AI Chat Card assistant message
2. **Reasoning Model Card** makes multiple retrieval calls during its sequential flow
3. **Retrieved Search Card** depends on Database Search Card for text and search functions
4. **All pipelines** use the same break duration (`DELAY_AFTER_RETRIEVAL_MS = 800ms`) before post request

### Animation Patterns

1. **Sequential Reveals:** Assistant messages, thinking lines, answer lines all use sequential delays
2. **Halfway Triggers:** Documents and user message appear halfway through highlight animations
3. **Character-based Typing:** Reasoning model uses per-character timing for realistic typing
4. **State Transitions:** Components use CSS transitions for smooth state changes
5. **Callback Chains:** Complex dependencies are managed through callback functions

---

## Appendix: File Locations

- Timing Constants: `components/graphics/helpers/animation-timings.ts`
- AI Chat Card: `components/graphics/elements/AI-chat.tsx`
- Post Request Card: `components/graphics/elements/post-request-card.tsx`
- Retrieved Search Card: `components/graphics/elements/retrieved-search-card.tsx`
- Database Search Card: `components/graphics/elements/database-search-card.tsx`
- Reasoning Model Card: `components/graphics/elements/reasoning-model-card.tsx`
- RAG Pipeline: `components/graphics/rag-card.tsx`
- SID Pipeline: `components/graphics/sid-pipeline-card.tsx`
- CSS Animations: `components/graphics/helpers/globals.css`

