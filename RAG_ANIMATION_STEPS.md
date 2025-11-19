# RAG Animation Sequence - Step-by-Step Documentation

# Reset

**Timing**: Immediate (0ms)

**What Happens**:
- All child components are reset to initial state:
  - `AIChat.reset()` - Clears user message, assistant message, highlights, indicators
  - `Search.reset()` - Hides all documents, clears database text, resets highlights
  - `PostRequest.reset()` - Resets context highlighting, document stack, user message
- All active states are set to `false`:
  - `chatActive = false`
  - `retrievalActive = false`
  - `postActive = false`
---

# setFinal

**Component**: All

**Timing**: Immediate (0ms)

**What Happens**:
1. **All panels activated**:
   - `chatActive = true` (AI Chat fully visible)
   - `retrievalActive = true` (Database/Search fully visible)
   - `postActive = true` (Post Request fully visible)

2. **AI Chat Final State** (`AIChat.setFinal()`):
   - User message is visible (no animation)
   - User message highlights are removed (normal appearance)
   - All assistant message lines are visible (no reveal animation):
     - Line 1: Fully visible
     - Line 2: Fully visible
     - Answer: Fully visible (colored based on `isCorrect` prop)
     - Line 3: Fully visible
   - Indicator is visible (checkmark or X, no animation)
   - All animation states cleared

3. **Search/Database Final State** (`Search.setFinal(false)` - unhighlighted):
   - All documents are immediately visible (no fade-in animation)
   - All documents are shown without highlights (no highlight lines visible)
   - Database search bar shows query text without keyword highlights
   - Database is in final unhighlighted state

4. **Post Request Final State** (`PostRequest.setFinal()`):
   - Context variable in API call is highlighted (no animation)
   - Document stack is fully visible (all 10 documents, no staggered appearance)
   - Document stack highlights are visible (if applicable)
   - Message variable in API call is highlighted (no animation)
   - User message below documents is visible (no animation)
   - No pulsation animation
   - All animation states set to final

**Visual Result**: All components instantly display their complete final state:
- All panels are fully visible and active
- All text, documents, and highlights are visible
- No animations or transitions
- Complete pipeline state is shown at once

**Usage**: This function can be called at any time to instantly jump to the final state without running the animation sequence. Useful for:
- Initial page load showing final state
- Skipping animations for faster display
- Resetting to a known good state

**Code Reference**: 
- `rag-card.tsx` lines 125-146 (`showFinalStage` function)
- `AI-chat.tsx` lines 327-339 (`handleSetFinal`)
- `search.tsx` lines 451-523 (`setFinal`)
- `post-request.tsx` lines 136-149 (`handleSetFinal`)

**Note**: This step is independent and can be called at any time to instantly show the final state without running the animation sequence.


# Animate

## Step 0: call reset

## Step 1: User Message Animation

**Component**: AI Chat (left/middle panel)

**Timing**:
- **Start Delay**: `200ms` (`AI_CHAT_TIMINGS.USER_MESSAGE_START_DELAY_MS`)
- **Animation Duration**: `300ms` (`AI_CHAT_TIMINGS.USER_MESSAGE_ANIMATION_MS`)
- **Total Step Duration**: `500ms` (200ms delay + 300ms animation)

**What Happens**:
1. `chatActive` is set to `true` (AI Chat panel becomes fully visible)
2. After 200ms delay, user message appears
3. User message fades in from below with CSS animation (`user-message-animate` class)

**Visual Result**: User's query appears in the AI Chat interface

**Code Reference**: `rag-card.tsx` lines 160-162, `AI-chat.tsx` lines 161-202

---

## Step 2: Focus on User Message

**Component**: AI Chat

**Timing**:
- **Focus Animation**: Immediate set `retrievalActive` to `true` `400ms` (CSS `--opacity-transition-duration: 0.4s`)
- **Break Before Focus**: Start break `300ms` (`AI_CHAT_TIMINGS.BREAK_BEFORE_FOCUS_MS`)
- **Add Text**: When break is over (immediate animation 0s)
- **Break Before Focus**: Start break `100ms` (`AI_CHAT_TIMINGS.BREAK_AFTER_FOCUS_BEFORE_UNFOCUS_MS`)
- **Unfocus**: the text in AI chat (immediate animation 0s)
- **Total Step Duration**: `400ms` (400ms opacity transition)

**What Happens**:


**Code Reference**: `rag-card.tsx` lines 192-200, `AI-chat.tsx` lines 204-211


## Step 3: Database Search Animation

**Component**: Search/Database

**Timing**:
1. **Break**: `300ms` (`DATABASE_SEARCH_TIMINGS.BREAK_BEFORE_SEARCH_ANIMATION_MS`)
2. `chatActive` is set to `false` (AI Chat panel returns to low opacity)
3. **Search Animation Duration**: `2000ms` (`DATABASE_SEARCH_TIMINGS.SEARCH_ANIMATION_DURATION_MS`) - slow search with double pulse
4. **Document Appearance**: Documents appear during search animation (staggered over ~1600ms window)
- **Total Step Duration**: `2300ms` (300ms break + 2000ms search animation)

**What Happens**:
1. After 300ms break, `chatActive` is set to `false` (AI Chat panel returns to low opacity)
2. Search animation begins immediately after
3. Database component shows pulsing/searching animation (double pulse for slow search)
4. Documents start appearing in staggered fashion:
   - First document appears immediately (at search start)
   - Last document appears at `searchDuration - transitionDuration` (1600ms)
   - Documents fade in with `400ms` transition (`DOCUMENT_TRANSITION_MS`)
   - Documents scale from 0.8 with translateY(-40px) to final position
5. Documents are arranged in rows (max 5 per row) with overlapping margins
6. Documents are stacked vertically with 80% height overlap

**Visual Result**: Database shows searching animation while retrieved documents appear one by one

**Code Reference**: `rag-card.tsx` lines 216-224, `search.tsx` lines 304-413

---

## Step 4: Document Highlighting

**Component**: Search/Database

**Timing**:
- **Break After Search**: `800ms` (`DOCUMENT_VARIANTS_TIMINGS.HIGHLIGHT_DELAY_MS`)
- **Highlight Animation Duration**: `650ms` (`RAG_HIGHLIGHT_TIMINGS.HIGHLIGHT_ANIMATION_DURATION_MS`)
  - CSS animation: `600ms` (left-to-right highlight sweep)
  - Buffer: `50ms`
- **Break After Highlight**: `400ms` (`RETRIEVED_SEARCH_TIMINGS.BREAK_AFTER_HIGHLIGHT_BEFORE_POST_REQUEST_MS`)
- **Total Step Duration**: `1850ms` (800ms delay + 650ms animation + 400ms break)

**What Happens**:
1. After search animation completes, wait 800ms
2. Highlight animations begin on documents:
   - Each document highlights specific lines based on variant
   - Highlight sweeps left-to-right across each line (CSS animation)
3. Database search bar keywords are also highlighted simultaneously
4. All highlights complete after 650ms
5. Wait 400ms break to let user see highlighted documents

**Visual Result**: Relevant lines in documents are highlighted with yellow sweep animation, search terms in database are highlighted

**Code Reference**: `rag-card.tsx` lines 215-220, `search.tsx` lines 369-398, `animation-timings.ts` lines 180-201

---

## Step 5: Post Request Animation - Context Phase

**Component**: Post Request (left panel)

**Timing**:
- **Break After Retrieval**: `650ms` (`POST_REQUEST_TIMINGS.DELAY_AFTER_RETRIEVAL_MS`)
- **Post Activation**: Immediate (after breaks)
- **Break After Active**: `600ms` (`POST_REQUEST_TIMINGS.BREAK_AFTER_POST_ACTIVE_BEFORE_ANIMATION_MS`)
- **Context Highlight Duration**: `850ms` (`POST_REQUEST_TIMINGS.CONTEXT_ANIMATION_DURATION_MS`)
  - CSS animation: `800ms` (left-to-right highlight)
  - Buffer: `50ms`
- **Document Stack Animation**: Documents appear with staggered delays
  - Delays: `[400, 250, 120, 180, 80, 200, 300, 150, 220, 100]ms` (`DOCUMENT_STACK_DELAYS_MS`)
  - Document fade-in: `300ms` (`DOCUMENT_ANIMATION_DURATION_MS`)
  - Max document delay: `400ms` (first value in array)
  - Documents complete: `400ms + 300ms = 700ms`
- **Phase 1 Complete**: `max(850ms, 700ms) = 850ms`
- **Total Step Duration**: `650ms + 600ms + 850ms = 2100ms`

**What Happens**:
1. Wait additional 650ms break (total pause to let user see highlighted documents)
2. `postActive` is set to `true` (Post Request panel becomes fully visible)
3. After 600ms break, animation sequence begins
   - Context variable in API call code is highlighted (left-to-right sweep)
   - Document stack animation begins simultaneously:
     - 10 documents appear with staggered delays (chaotic timing pattern)
     - Each document fades in over 300ms
     - Documents are stacked with overlapping margins
6. Context highlight completes after 850ms
7. Document stack completes after 700ms (all documents visible)

**Visual Result**: Brief pause after highlighting, then API call code shows context variable being highlighted, document stack appears below

**Code Reference**: `rag-card.tsx` lines 222-233, `post-request.tsx` lines 98-127

---

## Step 6: Post Request Animation - Message Phase

**Component**: Post Request

**Timing**:
- **Break Between Phases**: `300ms` (`POST_REQUEST_TIMINGS.BREAK_BETWEEN_CONTEXT_AND_MESSAGE_MS`)
- **Message Highlight Duration**: `850ms` (same as context - 800ms CSS + 50ms buffer)
- **User Message Delay**: `200ms` (`POST_REQUEST_TIMINGS.MESSAGE_HIGHLIGHT_DELAY_AFTER_CONTEXT_MS`) - delay after message highlight starts, before user message appears
- **Total Step Duration**: `300ms + 850ms = 1150ms` (user message appears 200ms into the highlight animation)

**What Happens**:
1. After 300ms break following context phase:
2. Message variable in API call code is highlighted (left-to-right sweep) - starts immediately
3. After 200ms delay (while highlight is animating), user message appears below the document stack
4. User message fades in with same animation as Step 1
5. Message highlight completes after 850ms total (user message appears 200ms into this animation)

**Visual Result**: API call code shows message variable highlighted, user message appears below documents

**Code Reference**: `rag-card.tsx` line 233, `post-request.tsx` lines 81-87, 129-133

---

## Step 7: Break After Post Animation

**Component**: None (transition pause)

**Timing**:
- **Break Duration**: `300ms` (`POST_REQUEST_TIMINGS.BREAK_AFTER_POST_ANIMATION_MS`)
- **Total Step Duration**: `300ms`

**What Happens**:
1. `retrievalActive` is set to `false` immediately after POST request animation completes (database panel starts fading to low opacity)
2. Brief pause (300ms) while database panel fades out
3. `chatActive` is set to `true` at the end of the break (AI Chat panel becomes fully visible again)

**Visual Result**: Focus shifts back to AI Chat panel

**Code Reference**: `rag-card.tsx` lines 242-247

---

## Step 8: Pulsate & Assistant Message (Simultaneous)

**Component**: Post Request + AI Chat

**Timing**:
- **Break Before Pulsate**: `500ms` (`POST_REQUEST_TIMINGS.BREAK_BEFORE_PULSATE_MS`)
- **Assistant Message Duration**: `2000ms` (calculated from last line delay + animation)
  - Line 1: `0ms` delay
  - Line 2: `533ms` delay (`AI_CHAT_TIMINGS.ASSISTANT_LINE_2_DELAY_MS`)
  - Answer: `1066ms` delay (`AI_CHAT_TIMINGS.ASSISTANT_ANSWER_DELAY_MS`)
  - Line 3: `1600ms` delay (`AI_CHAT_TIMINGS.ASSISTANT_LINE_3_DELAY_MS`)
  - Each line reveal: `400ms` CSS animation duration
  - Total: `1600ms + 400ms = 2000ms` (last line completes)
- **Pulsate Duration**: `2000ms` (matches assistant message duration exactly - two pulses)
  - First pulse: `1000ms` (`POST_REQUEST_TIMINGS.PULSATE_HALFWAY_MS`)
  - Second pulse: `1000ms` (`POST_REQUEST_TIMINGS.PULSATE_HALFWAY_MS`)
  - Total: `2000ms` (two complete pulses)
- **Total Step Duration**: `2500ms` (500ms break + 2000ms animations)

**What Happens**:
1. After 500ms break, both animations begin simultaneously
2. **Pulsate Animation** (Post Request):
   - Browser window wrapper pulses twice:
     - First pulse: scales up and down over 1000ms
     - Second pulse: scales up and down over 1000ms
   - Total duration: 2000ms (exactly matches assistant message generation)
   - Draws attention to the API call
3. **Assistant Message** (AI Chat):
   - Assistant response lines appear sequentially:
     - Line 1 reveals at 0ms
     - Line 2 reveals at 533ms
     - Answer text reveals at 1066ms (colored based on `isCorrect` prop)
     - Line 3 reveals at 1600ms
   - Each line uses clip-path animation (reveals from left to right, 400ms duration)
   - Last line (Line 3) completes at 2000ms (1600ms delay + 400ms animation)
   - Total duration: 2000ms (exactly matches two pulses)

**Visual Result**: API call pulses while assistant response appears line by line in chat

**Code Reference**: 
- `rag-card.tsx` lines 252-263
- `post-request.tsx` lines 89-101
- `AI-chat.tsx` lines 222-271
- `globals.css` lines 570-584 (browserWindowPulsate keyframes and animation)

---

## Step 9: Indicator Animation

**Component**: AI Chat

**Timing**:
- **Break Before Indicator**: `800ms` (`AI_CHAT_TIMINGS.BREAK_BEFORE_INDICATOR_MS`)
- **Indicator Start Delay**: `1000ms` (`AI_CHAT_TIMINGS.INDICATOR_START_DELAY_MS`) - not used in RAG
- **Indicator Animation Duration**: `700ms` (`AI_CHAT_TIMINGS.INDICATOR_DURATION_MS`)
  - Checkmark: `500ms` CSS animation (path reveal) - `indicatorPathRevealCheck` keyframes
  - X mark: First path `250ms` + `250ms` delay, second path `250ms` (total `500ms`)
- **Total Step Duration**: `800ms + 700ms = 1500ms`

**What Happens**:
1. `postActive` is set to `false` (Post Request panel returns to low opacity)
2. After 800ms break:
3. Indicator appears below AI Chat panel:
   - If `isCorrect = true`: Green checkmark (✓)
   - If `isCorrect = false`: Red X mark (✗)
4. Indicator animates:
   - Checkmark: Path draws from bottom-left to top-right (500ms)
   - X mark: First diagonal draws (250ms), then second diagonal (250ms) - total 500ms
5. Animation completes after 700ms

**Visual Result**: Success/failure indicator appears below the chat interface

**Code Reference**: 
- `rag-card.tsx` lines 249-251
- `AI-chat.tsx` lines 273-302
- `globals.css` (indicatorPathRevealCheck keyframes animation duration)

---

## Step 10: Completion

**Component**: All

**Timing**: Immediate

**What Happens**:
1. `chatActive` is set to `false`
2. `postActive` is set to `false`
3. `isAnimating` flag is set to `false`
4. All components remain in their final animated state

**Visual Result**: Animation sequence complete, all panels return to inactive state

**Code Reference**: `rag-card.tsx` lines 256-262

---



---

## Timing Summary

| Step | Description | Duration (ms) | Cumulative (ms) |
|------|-------------|---------------|-----------------|
| Reset | Reset all components | 0 | 0 |
| 1 | User message animation | 500 | 500 |
| 2 | Focus on user message | 800 | 1,300 |
| 4 | Database search | 2,300 | 3,600 |
| 5 | Document highlighting | 1,850 | 5,450 |
| 6 | POST context phase | 2,100 | 7,550 |
| 7 | POST message phase | 1,150 | 8,700 |
| 8 | Break after POST | 300 | 9,000 |
| 9 | Pulsate & assistant message | 2,500 | 11,500 |
| 10 | Indicator animation | 1,500 | 13,000 |
| 11 | Completion | 0 | 13,000 |
| 12 | Final State (setFinal) | 0 | 13,000 |

**Total Animation Duration**: ~13.0 seconds (Steps 1-11)

---

## Key Timing Constants Reference

All timing values are defined in `components/graphics/helpers/animation-timings.ts`:

### AI Chat Timings
- `USER_MESSAGE_START_DELAY_MS`: 200ms
- `USER_MESSAGE_ANIMATION_MS`: 300ms
- `BREAK_BEFORE_FOCUS_MS`: 400ms
- `BREAK_AFTER_FOCUS_BEFORE_UNFOCUS_MS`: 200ms
- `ASSISTANT_LINE_2_DELAY_MS`: 533ms
- `ASSISTANT_ANSWER_DELAY_MS`: 1066ms
- `ASSISTANT_LINE_3_DELAY_MS`: 1600ms (worth two pulses of post request)
- `BREAK_BEFORE_INDICATOR_MS`: 800ms
- `INDICATOR_DURATION_MS`: 700ms

### Search Timings
- `BREAK_BEFORE_ADD_TEXT_MS`: 300ms
- `BREAK_AFTER_HIGHLIGHT_BEFORE_POST_REQUEST_MS`: 400ms
- `DOCUMENT_TRANSITION_MS`: 400ms
- `HIGHLIGHT_ANIMATION_DURATION_MS`: 650ms

### Database Timings
- `BREAK_BEFORE_SEARCH_ANIMATION_MS`: 300ms
- `SEARCH_ANIMATION_DURATION_MS`: 2000ms (slow search)

### Post Request Timings
- `INITIAL_DELAY_BEFORE_ANIMATION_MS`: 600ms
- `CONTEXT_ANIMATION_DURATION_MS`: 850ms
- `DELAY_AFTER_RETRIEVAL_MS`: 650ms
- `BREAK_AFTER_POST_ACTIVE_BEFORE_ANIMATION_MS`: 600ms
- `BREAK_BETWEEN_CONTEXT_AND_MESSAGE_MS`: 300ms
- `MESSAGE_HIGHLIGHT_DELAY_AFTER_CONTEXT_MS`: 200ms
- `BREAK_AFTER_POST_ANIMATION_MS`: 300ms
- `BREAK_BEFORE_PULSATE_MS`: 500ms
- `PULSATE_HALFWAY_MS`: 1000ms
- `DOCUMENT_ANIMATION_DURATION_MS`: 300ms
- `DOCUMENT_STACK_DELAYS_MS`: [400, 250, 120, 180, 80, 200, 300, 150, 220, 100]

### Document Variants Timings
- `HIGHLIGHT_DELAY_MS`: 800ms

---

## Visual State Transitions

### Panel Opacity States

- **Active**: `opacity: 1` (fully visible)
- **Inactive**: `opacity: var(--inactive)` (typically ~0.3, defined in CSS)

### Panel Activation Sequence

1. **Start**: All panels inactive
2. **Step 1**: Chat active
3. **Step 2**: Chat + Database active (database fades in during this step, addText and unfocus occur)
4. **Step 4**: Database active only (chatActive set to false)
5. **Step 6**: Database + Post active
6. **Step 8**: Chat + Post active
7. **Step 10**: Chat active only
8. **End**: All panels inactive

---

## Notes

- All timings are in milliseconds (ms)
- CSS animations run in parallel with JavaScript delays
- Some steps overlap (e.g., document appearance during search)
- The animation can be interrupted/reset at any time
- Final state can be set immediately using `setFinal()` function
- Document highlighting only occurs in RAG mode (not in SID mode)
- **Note**: Code comments in `rag-card.tsx` now match this documentation's step numbering.

