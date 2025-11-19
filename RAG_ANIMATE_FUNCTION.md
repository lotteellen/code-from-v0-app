# RAG Component `animate()` Function Documentation

This document explains exactly what happens when the `animate()` function is called in the RAG pipeline component.

## Overview

The `animate()` function orchestrates a complete sequential animation sequence across three main components:
- **AIChat** (middle) - User message and assistant response
- **Search** (right) - Document retrieval and highlighting
- **PostRequest** (left) - API call and document stack

All function calls are awaited to ensure sequential execution

## Function Signature

```typescript
animate(): Promise<void>
```

Timing values are defined in `animation-timings.ts` for consistency

## Initialization Phase

### Guard Check
- Checks if animation is already in progress (`isAnimating`)
- If true, returns early to prevent multiple simultaneous animations

### Component References
Retrieves references to child component functions:
- `chatGPT` - AIChat component functions
- `retrievedSearch` - Search component functions  
- `postRequest` - PostRequest component functions

## Reset Phase

Before starting the animation, all components are reset to their initial state:

1. **AIChat.reset()** - Resets user message, assistant message, and indicator states
2. **Search.reset()** - Resets search bar, documents, and highlights
3. **PostRequest.reset()** - Resets API call context, documents, and message states

### State Reset
- `setChatActive(false)` - AI Chat component becomes inactive (dimmed)
- `setRetrievalActive(false)` - Search component becomes inactive (dimmed)
- `setPostActive(false)` - Post Request component becomes inactive (dimmed)
- `setIsAnimating(true)` - Marks animation as in progress

### Validation
Checks that all three component function references are available. If any are missing, logs a warning and exits.

---

## Animation Sequence

### Step 1: User Message Animation

**Component States:**
- `setChatActive(true)`

**Function Called:**
- Brief pause
- `AIChat.animateUserMessage()`

**What Happens:**
- User message fades in from below
- After animation, both lines of the user message are highlighted

---

### Step 2: Add Text to Search Bar

**Component States:**
- `setRetrievalActive(true)`

**Function Called:**
- Brief pause
- `Search.addText()`

**What Happens:**
- Adds the query text to the database/search bar component
- Text appears in the search input field
- Sets internal `hasText` state to `true`
- Text is highlighted in the search bar

---

### Step 3: Unfocus User Message

**Function Called:**
- `AIChat.unFocus()`
- Brief pause after

**What Happens:**
- Removes highlight from both lines of the user message
- User message remains visible but no longer highlighted

---

### Step 4: Remove Focus from Search Bar

**Component States:**
- `setChatActive(false)`

**Function Called:**
- `Search.removeFocus()`
- Brief pause

**What Happens:**
- Removes the highlight/focus state from the search bar
- Search bar text remains visible but no longer highlighted

---

### Step 5: Slow Search and Highlight

**Function Called:**
- `Search.search(query, false)` - Slow search with highlighting (replaces `slowSearchAndHighlight()`)

---

### Step 6: Post Request

**Component States:**
- `setPostActive(true)`

**Function Called:**
- Brief pause
- `PostRequest.animate()`

---

### Step 7: Pulsate API Call + Animate Assistant Message

**Component States:**
- `setRetrievalActive(false)`
- `setChatActive(true)`

**Function Called:**
- `PostRequest.pulsate()`
- Brief pause (but not full pulsation time)
- `AIChat.animateAssistantMessage()`


### Step 8: Animate Indicator

**Component States:**
- `setPostActive(false)` 

**Function Called:**
- `AIChat.animateIndicator()`

---

## Completion Phase

**Component States:**
- `setChatActive(false)` - AI Chat becomes inactive
- `setPostActive(false)` - Post Request becomes inactive
- `setIsAnimating(false)` - Marks animation as complete

**Error Handling:**
- Any errors during the sequence are caught and logged
- Animation state is always reset in the `finally` block

