# SID Pipeline Component Functions

This document lists all direct functions exposed by components within the SID pipeline card.

## 1. AIChat Component (6 functions)

1. `animateUserMessage: () => Promise<void>`
   - Animates the user message appearing in the chat interface

2. `unFocus: () => Promise<void>`
   - Removes focus/highlight from the user message

3. `animateAssistantMessage: () => Promise<void>`
   - Animates the assistant's response message appearing

4. `animateIndicator: () => Promise<void>`
   - Animates the checkmark/X indicator appearing

5. `setFinal: () => void`
   - Sets the component to its final state (all content visible, no animations)

6. `reset: () => void`
   - Resets the component to its initial state

## 2. PostRequest Component (4 functions)

1. `animate: () => Promise<void>`
   - Triggers the main animation sequence for the post request

2. `pulsate: () => Promise<void>`
   - Triggers a pulsating animation effect

3. `setFinal: () => void`
   - Sets the component to its final state (all content visible, no animations)

4. `reset: () => void`
   - Resets the component to its initial state

## 3. Search Component (7 functions)

1. `search: (text: string, isSlow: boolean) => Promise<void>`
   - Unified search function (recommended)
   - `text`: The query string to search for
   - `isSlow`: `true` for slow search with highlighting, `false` for quick search without highlighting

2. `addText: (text?: string) => Promise<void>`
   - Adds text to the search input field

3. `removeFocus: () => Promise<void>`
   - Removes focus/highlight from the search input

4. `textAndSearch: (text?: string) => Promise<void>`
   - [Deprecated] Adds text and performs a quick search animation
   - Use `search(text, false)` instead

5. `slowSearchAndHighlight: () => Promise<void>`
   - [Deprecated] Performs a slow search animation with document highlighting
   - Use `search(text, true)` instead

6. `setFinal: (highlighted: boolean) => void`
   - Sets the component to its final state
   - `highlighted`: Whether to show highlighted documents

7. `reset: () => void`
   - Resets the component to its initial state

## 4. ReasoningModel Component (5 functions)

1. `insertQueryText: () => Promise<void>`
   - Inserts and highlights the query text in the reasoning model

2. `runRemainingSequence: () => Promise<void>`
   - Runs the complete reasoning sequence (thinking, plan, steps, answer)

3. `setFinal: (highlighted: boolean) => void`
   - Sets the component to its final state
   - `highlighted`: Whether to show highlighted content

4. `reset: () => void`
   - Resets the component to its initial state

5. `continueRetrieval: () => Promise<void>`
   - Continues the sequence after a retrieval operation completes

---

## Summary

- **AIChat**: 6 functions
- **PostRequest**: 4 functions
- **Search**: 7 functions (includes new unified `search` function)
- **ReasoningModel**: 5 functions

**Total: 22 direct functions**

