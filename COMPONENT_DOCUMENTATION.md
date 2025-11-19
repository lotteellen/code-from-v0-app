# Component Documentation

**Components with programmatic control** all expose:
- `setFinal(highlighted?: boolean)` - Final state (most components: true = highlights, false = no highlights; AIChat and ReasoningModel: no parameter)
- `reset()` - Resets all states and animations

**Components are controlled via:**
- **Props** - Basic display and state control
- **`onFunctionsReady`** - Callback that receives programmatic control functions (use this for programmatic control)

**Using `onFunctionsReady`:**
- Components expose their control functions via the `onFunctionsReady` callback
- Parent components can either:
  - **Store functions in refs** (for later use in sequences): `const funcsRef = useRef(null); onFunctionsReady={(f) => { funcsRef.current = f }}`
  - **Call functions directly** (for immediate setup): `onFunctionsReady={(f) => { f.setFinal(true); f.animateHighlight(0) }}`
- Both patterns are valid and used throughout the codebase depending on the use case

---

## DummyHelpers

**Location:** `components/graphics/helpers/dummy-helpers.tsx`

**Description:** Utility functions and components for creating placeholder/dummy content in document visualizations. Provides reusable components for rendering lines, paragraphs, and managing highlight states.

**Exported Functions:**

### `getHighlightClass(highlight: boolean, showFinal: boolean): string`
Returns the appropriate CSS class for highlight animation state.
- **Parameters:**
  - `highlight: boolean` - Whether the element should be highlighted
  - `showFinal: boolean` - Whether to show final state (immediate highlight) or animated state
- **Returns:**
  - Empty string if not highlighted
  - `"dummy-highlight-final"` if `showFinal` is true (no animation, immediate highlight)
  - `"dummy-highlight-active"` if `showFinal` is false (animated highlight)

### `isLineHighlighted(lineIndex: number, highlightLines?: number[]): boolean`
Checks if a line index should be highlighted based on the highlightLines array.
- **Parameters:**
  - `lineIndex: number` - The line index to check (0-based)
  - `highlightLines?: number[]` - Optional array of line indices that should be highlighted
- **Returns:** `true` if the line index is in the highlightLines array, `false` otherwise

**Exported Types/Interfaces:**

### `DummyLineProps`
TypeScript interface for `DummyLine` component props.
```typescript
export interface DummyLineProps {
  width?: string | number
  height?: string | number
  background?: string
  customStyle?: React.CSSProperties
  highlightClassName?: string
}
```

### `DummyParagraphProps`
TypeScript interface for `DummyParagraph` component props.
```typescript
export interface DummyParagraphProps {
  items: React.ReactNode[]
  direction?: "row" | "column"
  gap?: string | number
  style?: React.CSSProperties
}
```

**Exported Components:**

### `DummyLine`
Renders a placeholder line element. A simple presentational component that accepts styling props and a `highlightClassName` for highlight states.

**Props:**
```typescript
{
  width?: string | number          // Line width (default: "100%")
  height?: string | number         // Line height (default: "4px")
  background?: string              // Background color (default: "var(--light-grey)")
  customStyle?: React.CSSProperties  // Additional inline CSS styles (e.g., clipPath, overflow, etc.)
  highlightClassName?: string      // CSS class for highlight animation states (use getHighlightClass() to generate)
}
```

**Note:** 
- `borderRadius` is hardcoded to `"999px"` and cannot be customized via props. Use the `customStyle` prop if you need to override it.
- `highlightClassName` is specifically for highlight animation classes. Use the `getHighlightClass()` helper function to generate the appropriate class based on highlight state.
- `customStyle` is for additional inline styles that override or extend the default styles (merged with default styles).

**Usage:**
```typescript
<DummyLine
  width="100%"
  height="var(--line-height)"
  highlightClassName={getHighlightClass(isLineHighlighted(0, highlightLines), showFinal)}
/>

// With custom styles
<DummyLine
  width="100%"
  height="var(--line-height-big)"
  highlightClassName={showFinal ? "" : "assistant-line-reveal"}
  customStyle={{
    clipPath: showFinal ? undefined : "inset(0 100% 0 0)",
    overflow: "hidden",
  }}
/>
```

### `DummyParagraph`
Renders a flex container for organizing multiple items (lines, components, etc.).

**Props:**
```typescript
{
  items: React.ReactNode[]         // Array of React nodes to render - REQUIRED
  direction?: "row" | "column"     // Flex direction (default: "column")
  gap?: string | number            // Gap between items (default: "4px")
  style?: React.CSSProperties      // Inline CSS styles (use for alignItems, justifyContent, flex, etc.)
}
```

**Usage:**
```typescript
<DummyParagraph
  items={[
    <DummyLine key={0} width="100%" />,
    <DummyLine key={1} width="80%" />,
  ]}
  gap="var(--gap)"
  direction="column"
/>

// With alignItems
<DummyParagraph
  items={[...]}
  direction="row"
  gap="var(--gap)"
  style={{ alignItems: "center" }}
/>

// With justifyContent
<DummyParagraph
  items={[...]}
  style={{ justifyContent: "space-between" }}
/>
```

**Notes:**
- These utilities are used internally by `DocumentVariants` and other components to render document content
- The highlight classes (`dummy-highlight-active` and `dummy-highlight-final`) are defined in CSS and control the visual appearance and animation of highlighted elements
- `DummyLine` is a simple presentational component - highlight states are controlled by passing the appropriate `highlightClassName` generated by `getHighlightClass()`
- Parent components (like `DocumentVariants`) manage highlight state and pass the computed `highlightClassName` to `DummyLine`
- `customStyle` is used for additional inline CSS styles that override or extend the default styles (e.g., `clipPath`, `overflow`, custom `borderRadius`, etc.)
- Both `DummyLineProps` and `DummyParagraphProps` interfaces are exported for type reuse

---

## DocumentVariant

**Location:** `components/graphics/elements/document-variants.tsx`

**Description:** Renders a document preview with various visual styles (simple text, bullets, charts, tables, images, spreadsheets, emails). Supports animated highlighting of specific lines or elements within the document. Each variant has a different structure and maximum highlightable elements.

**Props:**
```typescript
{
  variant: string    // Document type: "simple", "bullets", "chart", etc. 
  title?: string     // Document title (defaults to "{variant}.pdf")
  onFunctionsReady?: (functions: {
    animateHighlight: (lineIndex: number | number[]) => void
    setFinal: (highlighted: boolean) => void
    reset: () => void
  }) => void
}
```

**Exposed Functions (via `onFunctionsReady`):**
```typescript
{
  animateHighlight: (lineIndex: number | number[]) => void  // Highlights single line or array of lines
  setFinal: (highlighted: boolean) => void       // Sets final state: true = show highlights immediately, false = show no highlights
  reset: () => void                              // Clears all highlights and resets state
}
```

**Exported Constants/Types:**
```typescript
// Available document variant names
AVAILABLE_DOCUMENT_VARIANTS: readonly string[]

// Type for document variant names
type DocumentVariant = "simple" | "bullets" | "bullets2" | "chart" | "chart2" | "table" | "table2" | "image" | "image2" | "spreadsheet" | "spreadsheet2" | "email" | "email2" | "email3"

// Maximum highlightable key number for each variant (0-based indexing)
VARIANT_MAX_KEYS: Record<DocumentVariant, number>
```

**How highlight animations work:**

The component starts in **animated mode** by default (`showFinal = false`). The `setFinal()` function controls whether highlights are animated or immediate:
- `setFinal(true)` → Show highlights immediately (no animation)
- `setFinal(false)` → Show highlights with animation (default state)

**To trigger animated highlights:**
1. Simply call `animateHighlight(0)`, `animateHighlight(2)`, `animateHighlight(4)` etc. to highlight specific lines, OR
2. Call `animateHighlight([0, 2, 4])` to highlight multiple lines at once
3. Each line will animate in based on the CSS animation defined for `dummy-highlight-active`

**Note:** 
- You only need to call `setFinal(false)` if you previously called `setFinal(true)` and want to switch back to animated mode
- `animateHighlight()` accepts either a single number or an array of numbers
- Line indices are validated against `VARIANT_MAX_KEYS` for the variant - invalid indices are ignored
- Calling `animateHighlight()` on an already highlighted line has no effect
- Duplicate indices in an array are automatically filtered out

---

## DocumentStack

**Location:** `components/graphics/helpers/document-stack.tsx`

**Description:** Displays a stack of overlapping document previews with staggered positions and rotations. Documents can animate in from various directions. Supports showing documents with or without highlights in the final state. Each document in the stack uses DocumentVariants internally.

**Props:**
```typescript
{
  documents: (string | DocumentItem)[]  // Array of document variant names or DocumentItem objects
  onFunctionsReady?: (functions: {
    animate: () => void
    setFinal: (highlighted: boolean) => void
    reset: () => void
  }) => void
}
```

**`documents` prop details:**
The `documents` prop accepts an array that can contain either:
- **String values**: Simple document variant names (e.g., `"simple"`, `"table"`, `"chart"`)
  - When using strings, documents will be displayed without custom titles or highlight lines
  - This format is backward compatible with previous versions
- **DocumentItem objects**: Objects containing document configuration with optional highlight lines
  - Allows per-document customization of title and highlight lines
  - Each document can have different highlight lines specified

**DocumentItem type:**
```typescript
{
  id: string                    // Unique identifier for the document (required for DocumentItem format)
  title?: string                // Optional document title displayed in the document header
  variant: string              // Document variant name (e.g., "simple", "table", "chart", etc.)
  highlightLines?: number[]     // Optional array of line indices to highlight when animate() or setFinal(true) is called
}
```

**How highlight lines work:**
- `highlightLines` is an array of zero-based line indices (e.g., `[0, 2, 5]` highlights lines 0, 2, and 5)
- When `animate()` is called, documents animate in from various directions. **Highlights appear immediately** (not animated) - they are already visible as the documents animate in
- When `setFinal(true)` is called, documents appear immediately with the specified lines highlighted (no animation)
- When `setFinal(false)` is called, documents appear immediately **without any highlights** - all existing highlights are cleared and no highlight animations occur
- If `highlightLines` is not provided or is an empty array, no highlights will be shown
- Line indices are validated against the variant's maximum highlightable lines (see `VARIANT_MAX_KEYS` in DocumentVariants)

**Exposed Functions (via `onFunctionsReady`):**
```typescript
{
  animate: () => void                // Renders document stack animation - documents animate in with their specified highlights already visible (highlights are not animated, they appear immediately)
  setFinal: (highlighted: boolean) => void  // Shows stack in final stage (without animation): true = with highlights, false = without highlights (all highlights are cleared)
  reset: () => void                 // Hides all documents and resets to initial state
}
```

**Behavior Notes:**
- When `animate()` is called, documents animate in from various directions with staggered delays. **Highlights appear immediately** (not animated) - they are set before the animation starts, so highlights are visible as documents animate in
- If documents are provided as `DocumentItem[]` with `highlightLines`, those specific lines will be highlighted
- If documents are provided as `string[]`, no highlights will be shown (backward compatible)
- When `setFinal(true)` is called, documents appear immediately with their specified highlights (if provided) - no animation
- When `setFinal(false)` is called, documents appear immediately **without any highlights**. All existing highlights are cleared (via `reset()`) before setting the final state, ensuring no highlight animations occur
- When `reset()` is called, all documents are hidden and the stack returns to its initial state
- The stack displays up to 10 documents (limited by predefined positions)

**Example Usage:**
```typescript
// With highlight lines
<DocumentStack
  documents={[
    { id: "doc1", variant: "simple", highlightLines: [1, 3, 5] },
    { id: "doc2", variant: "table", highlightLines: [2, 4] },
  ]}
/>

// Backward compatible - simple string array
<DocumentStack
  documents={["simple", "table", "chart"]}
/>
```

---


## AIChat

**Location:** `components/graphics/elements/AI-chat.tsx`

**Description:** Displays a chat interface with user and assistant messages. Shows animated user message entry, assistant response with typing animation, and a checkmark/X indicator based on answer correctness. All animations can be controlled programmatically.

**Props:**
```typescript
{
  answer?: string         // Answer text to display (defaults based on isCorrect)
  isCorrect?: boolean     // Shows green checkmark if true, red X if false (default: true)
  onFunctionsReady?: (functions: {...}) => void
  query: string           // User query text (split into two lines automatically)
  isActive?: boolean      // Controls opacity (default: true)
}
```

**Exposed Functions:**
```typescript
{
  animateUserMessage: () => Promise<void>   // Animates user message with focused highlights 
  unFocus: () => Promise<void>              // Removes focus highlight from user message
  animateAssistantMessage: () => Promise<void>  // Animates assistant response appearing
  animateIndicator: () => Promise<void>         // Animates checkmark/X indicator appearing
  setFinal: () => void                          // Sets final state (all content visible)
  reset: () => void                             // Resets all animations and state
}
```

---

## Database

**Location:** `components/graphics/elements/database.tsx`

**Description:** Displays a search bar with a vector database visualization (3D stacked layers or 2D outline). Supports text input animation, search animations with pulsing effects, and highlighting of specific keywords (enterprise, pricing, SMB) in the search query.

**Props:**
```typescript
{
  mode?: "light" | "dark" | "filled"   // Which DB instance is used
  message: string                       // Search query text to display - REQUIRED
  onFunctionsReady?: (functions: {...}) => void
}
```

**Exposed Functions (via `onFunctionsReady`):**
```typescript
{
  search: (text: string, isQuick?: boolean) => Promise<void>  // Unified search function - text: query string, isQuick: true for quick search (single pulse), false for slow search (double pulse)
  highlightKeywords: () => void          // Highlights all keywords (enterprise, pricing, SMB) in the search query
  setFinal: (highlighted: boolean) => void  // Sets final state: true = with highlights, false = without highlights
  reset: () => void                      // Resets all state and clears text
}
```

**Function Details:**

- **`search(text: string, isQuick?: boolean)`**: Unified search function that handles both quick and slow search animations. 
  - `text`: The query string to search for (required)
  - `isQuick`: Optional boolean (default: `true`). When `true`, performs a quick search with a single fast pulse. When `false`, performs a slow search with a double pulse effect (two pulses).
  - The function sets the text in the search bar and triggers the appropriate search animation based on the `isQuick` parameter.
  - Returns a Promise that resolves when the search animation completes.
  - **Recommended**: Use this function for all search operations.

- **`highlightKeywords()`**: Highlights all keywords (enterprise, pricing, SMB) in the search query simultaneously. The keywords are highlighted in yellow. This is useful for drawing attention to specific terms in the query. Only highlights if there's text in the search bar (checks `displayedText`, `message` prop, or ref). If keywords are already highlighted, calling this again will toggle them off.

- **`setFinal(highlighted: boolean)`**: Sets the component to its final state. When `highlighted` is `true`, the component displays the message text with all keywords highlighted. When `highlighted` is `false`, the component displays the message text without any highlights. This is useful for showing the final state of a search without animations. Clears any ongoing search animations before setting the final state.

- **`reset()`**: Resets all component state to its initial state. Clears the displayed text, removes all highlights, stops any ongoing search animations, and resets all internal state. Use this to return the component to its starting state before beginning a new sequence of animations.

---

## ReasoningModel

**Location:** `components/graphics/elements/reasoning-model.tsx`

**Description:** Displays a reasoning/planning interface showing a query, thinking section, plan with multiple steps, and final answer. Steps can be in various states (pending, active, updating, retrieving, answering, completed) with animations for text updates, retrieval, and completion. Supports adding new tasks dynamically and running a complete sequence of operations.

**Props:**
```typescript
{
  query?: string                                  // Query text to display (default: "")
  onFunctionsReady?: (functions: {...}) => void  // Callback to receive exposed functions
  isActive?: boolean                             // Controls opacity (default: true)
  onRetrieve?: (query: string) => Promise<void>  // Called when a search/retrieval is needed with the query text
}
```

**Props Details:**
- **`query`**: The query text to display in the component. Optional, defaults to empty string. If not provided or empty, the component will use "What is the enterprise pricing?" as the default query text in final state.
- **`onFunctionsReady`**: Callback that receives the exposed functions object. Use this to get access to `insertQueryText`, `runRemainingSequence`, `setFinal`, and `reset` functions.
- **`isActive`**: Controls the opacity of the component. When `false`, the component appears dimmed (using `var(--inactive)` opacity).
- **`onRetrieve`**: Optional callback that is called whenever the component needs to perform a retrieval/search operation during the sequence. The callback receives the query text (the question being processed) as a parameter. This is called at each retrieval step during `runRemainingSequence()`. You can use this to trigger searches in other components (like Search components) that should happen in parallel with the reasoning model's retrieval steps. The component will wait for this promise to resolve before automatically continuing to the next step.

**Exposed Functions:**
```typescript
{
  insertQueryText: () => Promise<void>        // Inserts and highlights query text
  runRemainingSequence: () => Promise<void>   // Runs complete sequence
  setFinal: () => void                        // Sets final state (all steps completed)
  reset: () => void                           // Resets to initial state
  continueRetrieval: () => Promise<void>      // Manually continues the sequence after a retrieval step
}
```

**Exposed Functions Details:**

- **`insertQueryText()`**: Inserts the query text into the component and highlights it. This is the first step in the sequence. It:
  - Resets all component state to initial values
  - Displays the query text with a highlight effect
  - Keeps the query text highlighted (does not automatically remove the highlight)

- **`runRemainingSequence()`**: Runs the complete animation sequence after the query text has been inserted. This function:
  - Removes the highlight from the query text
  - Shows the "Thinking" section with animated lines
  - Displays the "Plan" section with all steps fading in sequentially
  - For each step (1-4): updates the question text, triggers retrieval (calls `onRetrieve` if provided), shows answering state, then completes
  - Adds a 5th task dynamically ("What is the enterprise pricing?")
  - Processes the new task through the same sequence (update → retrieval → answering → completed)
  - Shows the "Answer" section with animated lines
  - Reveals the final answer after the answering animation completes
  - Can be called multiple times; if already running, it will stop the current sequence
  - At each retrieval step, the sequence pauses and waits for `continueRetrieval()` to be called manually. The `onRetrieve` callback is called with the query text, but the sequence does not automatically continue until `continueRetrieval()` is invoked.

- **`setFinal()`**: Sets the component to its final state without animations. This:
  - Sets all steps to "completed" state
  - Adds the 5th task if not already added
  - Shows all sections (query, thinking, plan, answer) immediately
  - Displays the final answer without animation
  - Note: This function does not take any parameters

- **`reset()`**: Resets the component to its initial state. This:
  - Stops any running sequences or animations
  - Clears all timeouts
  - Resets all steps to "pending" state
  - Hides all sections (thinking, plan, answer)
  - Clears the query text display
  - Removes any added tasks
  - Returns the component to its initial empty state

- **`continueRetrieval()`**: Manually continues the sequence after a retrieval step has been triggered. This function:
  - Should be called after `onRetrieve` has been called and any external retrieval operations (e.g., search animations) have completed
  - Triggers the `onRetrieve` callback if it was provided (with the current retrieval query text)
  - Resolves the internal promise that was waiting for continuation
  - Allows the sequence to proceed to the next step (answering state)
  - Returns a Promise that resolves when the continuation is complete

**Usage Notes:**
- The typical flow is: `insertQueryText()` → do something else (e.g., trigger other animations) → `runRemainingSequence()`
- `runRemainingSequence()` includes pauses at retrieval points where it:
  1. Calls `onRetrieve(query)` with the current step's question text (if provided)
  2. Waits for `continueRetrieval()` to be called manually
  3. Continues to the next step after `continueRetrieval()` is called
- The `onRetrieve` callback is useful for triggering searches in other components (like Search components) that should happen in parallel with the reasoning model's retrieval steps
- You must call `continueRetrieval()` after your retrieval operations complete to allow the sequence to continue
- `setFinal()` sets the component to its final state internally - no prop needed

---

## BrowserWindow

**Location:** `components/graphics/helpers/browser-window.tsx`

**Description:** A presentational component that wraps content in a browser window-style container. Displays a title bar with optional macOS-style traffic light buttons (red, yellow, green) and contains scrollable content. Used as a wrapper for various components like APICall and ReasoningModel.

**Props:**
```typescript
{
  title?: string              // Window title displayed in the title bar
  content?: React.ReactNode   // Content to display inside the window
  menu?: boolean               // Whether to show traffic light buttons (default: true)
  fitContent?: boolean        // Whether to fit height to content (default: false, uses fixed height of 150px)
  pulsate?: boolean           // Whether to apply pulsate animation (default: false)
}
```

**Notes:**
- This is a presentational component with no programmatic control functions
- When `fitContent` is `false`, the window has a fixed height of `150px`
- When `fitContent` is `true`, the window height adjusts to fit its content
- The `pulsate` prop applies a CSS animation class (`browser-window-pulsate`) to draw attention to the window
- The component uses CSS variables for styling (traffic light colors, padding, etc.)
- Content is rendered in a container with flex layout and overflow hidden (not scrollable)

---

## APICall

**Location:** `components/graphics/helpers/api-call.tsx`

**Description:** Displays a code visualization of an API request call with syntax highlighting. Shows JavaScript/TypeScript code structure with highlighted variables for context and message sections. Can display either SID (Search-Informed Decoding) format with a `context` variable or RAG format with a `documents` array. Uses BrowserWindow internally as a wrapper. The component has been simplified with a flat structure - code is inlined directly in the component with a single `renderVariable` helper function for variable highlighting.

**Props:**
```typescript
{
  contextMode?: "sid" | "rag"  // Display mode: "sid" shows context variable, "rag" shows documents array
  animateContext?: boolean                 // Whether to animate context variable highlight (default: false)
  animateMessage?: boolean                 // Whether to animate message variable highlight (default: false)
  isFinal?: boolean                        // Internal state for final state (controlled via setFinal function)
  pulsate?: boolean                        // Whether to apply pulsate animation to the browser window (default: false)
}
```

**Context Modes:**
- **`"sid"`**: Shows `context` variable (green highlight) - SID format
- **`"rag"`**: Shows `documents` variable (yellow highlight, displayed as `[documents]`) - RAG format

**Notes:**
- This component does not expose programmatic control functions via `onFunctionsReady`
- Animation is controlled via props (`animateContext`, `animateMessage`)
- **Animation behavior**: 
  - When `isFinal` is `true`, all highlights are shown immediately without animation (both context and message)
  - When `isFinal` is `false`, highlights animate based on `animateContext` and `animateMessage` flags
  - To create a sequence, set `animateContext={true}` first, then `animateMessage={true}` after a delay
- **Highlight logic**: A variable highlights if `isFinal` is `true` OR the corresponding animate flag is `true` (e.g., `shouldHighlightContext = isFinal || animateContext`)
- **Reset**: To reset the component, set all animation props back to their default values: `animateContext={false}`, `animateMessage={false}`, and `isFinal={false}`. Since this is a controlled component, reset is typically handled by the parent component managing these state values

---


## PostRequest

**Location:** `components/graphics/elements/post-request.tsx`

**Description:** Displays an API request context visualization with highlighted context and message sections. Can show either a SID reasoning document (AnswerSection) or a DocumentStack of documents. Supports animation sequences for context highlighting, document appearance, and message display. Can also pulsate to draw attention. The component coordinates animations between the APICall code visualization, context documents/answer section, and user message display.

**Props:**
```typescript
{
  documents?: (string | DocumentItem)[]            // Documents to display in context section (determines mode)
  isActive?: boolean                               // Controls opacity (default: true)
  onFunctionsReady?: (functions: {...}) => void
}
```

**Exposed Functions (via `onFunctionsReady`):**
```typescript
{
  animate: () => Promise<void>         // Runs full animation sequence
  pulsate: () => Promise<void>         // Triggers pulsate animation on the browser window (lasts ~2 seconds)
  setFinal: () => void                 // Sets final state (all content visible with highlights, no animations)
  reset: () => void                    // Resets all animations and state to initial state
  documentStack: DocumentStackFunctions | null  // Direct access to DocumentStack functions (only available in RAG mode when documents are provided)
}
```

**DocumentStackFunctions type:**
```typescript
{
  animate: () => void                // Renders document stack animation - documents animate in with their specified highlights already visible
  setFinal: (highlighted: boolean) => void  // Shows stack in final stage: true = with highlights, false = without highlights
  reset: () => void                 // Hides all documents and resets to initial state
}
```

**`documents` prop behavior:**
The `documents` prop automatically determines the display mode and whether the context section is rendered:
- **If `documents` is `undefined`** → Context section is **not rendered at all** (only APICall code visualization is shown)
- **If `documents` is an empty array `[]`** → **SID mode** - shows single `Document` component with `AnswerSection` content from ReasoningModel
- **If `documents` has items** → **RAG mode** - shows `DocumentStack` component with the provided documents


**Animation Sequence (when `animate()` is called):**
1. **Initial delay** (600ms from `POST_REQUEST_TIMINGS.INITIAL_DELAY_BEFORE_ANIMATION_MS`)
2. **Phase 1 - Context highlight:**
   - Context variable highlight animation starts in APICall (850ms duration)
   - **SID mode** (empty array): Answer section appears 200ms after context highlight starts (`ANSWER_SECTION_DELAY_AFTER_CONTEXT_MS`)
   - **RAG mode** (has documents): Document stack animation starts simultaneously with context highlight (documents animate in with staggered delays, highlights appear immediately)
3. **Break** (300ms pause from `BREAK_BETWEEN_CONTEXT_AND_MESSAGE_MS`)
4. **Phase 2 - Message highlight:**
   - Message variable highlight animation starts in APICall
   - User message appears 200ms after message highlight starts (`MESSAGE_HIGHLIGHT_DELAY_AFTER_CONTEXT_MS`)
5. Animation completes and promise resolves

**Function Details:**
- **`animate()`**: Runs the complete animation sequence. Returns a Promise that resolves when the animation completes. The sequence includes context highlighting, document/answer section appearance, message highlighting, and user message display. Timing is coordinated between all child components. For RAG mode, the function waits for the document stack animation to complete (calculates max delay + animation duration) before starting Phase 2.
- **`pulsate()`**: Triggers a pulsate animation on the browser window wrapper. The animation lasts exactly 2 seconds (1 second up from `PULSATE_HALFWAY_MS`, 1 second down from `PULSATE_HALFWAY_MS`). Returns a Promise that resolves when the pulsate animation completes. This is typically used to draw attention before triggering assistant message animations in parent components.
- **`setFinal()`**: Sets the component to its final state immediately without animations. All content (context, documents/answer section, message, user message) appears with highlights. For RAG mode, also calls `setFinal(true)` on the DocumentStack to show documents with highlights. This is useful for showing the final state without going through the animation sequence.
- **`reset()`**: Resets all component state to initial values. Clears all timeouts via `useTimeoutManager`, hides all content, and resets child components (DocumentStack). Use this to return the component to its starting state before beginning a new sequence.

- **`documentStack`**: Provides direct access to the DocumentStack component's control functions. This property is:
  - `null` when `documents` is `undefined` or an empty array (SID mode or no context)
  - Available when `documents` has items (RAG mode)
  - Allows direct control of the document stack animation, final state, and reset operations
  - Useful for advanced use cases where you need fine-grained control over the document stack independently of the main PostRequest animation sequence

---

## Search

**Location:** `components/graphics/elements/search.tsx`

**Description:** Displays a search interface with a Database component and a grid of document previews. Documents are arranged in rows (max 5 per row) with automatic overlap calculation to fit within the container width. Supports quick and slow search animations, document highlighting, and database keyword highlighting. Documents appear with staggered animations and can be shown with or without highlights. The component automatically calculates horizontal overlap between documents in the same row and vertical overlap (80% of document height) between rows to create a stacked effect.

**Props:**
```typescript
{
  query: string                                     // Search query text - REQUIRED
  documents: DocumentItem[]                         // Array of documents to display - REQUIRED
  isActive?: boolean                                // Controls opacity (default: true)
  onFunctionsReady?: (functions: {...}) => void
}
```

**Exposed Functions (via `onFunctionsReady`):**
```typescript
{
  // Unified search function (recommended)
  search: (text: string, isQuick: boolean) => Promise<void>  // Unified search function - text: query string, isQuick: true for quick search without highlighting, false for slow search with highlighting
  
  // For slower searches (multi-step sequence)
  addText: (text?: string) => Promise<void>           // Adds text to database search bar with focus highlight
  removeFocus: () => Promise<void>                    // Removes focus highlight from database search bar
  slowSearchAndHighlight: () => Promise<void>         // Performs slow search animation and highlights documents (requires addText first) [Deprecated: use search(text, false)]
 
  // For quick search (single-step)
  textAndSearch: (text?: string) => Promise<void>     // Adds text and triggers quick search (fast document appearance, no highlights) [Deprecated: use search(text, true)]
  
  // General control
  setFinal: (highlighted: boolean) => void           // Sets final state
  reset: () => void                                   // Resets all state and hides documents
  database: DatabaseFunctions | null                  // Direct access to Database component functions
}
```

**Function Details:**

- **`search(text: string, isQuick: boolean)`**: Unified search function that combines quick and slow search functionality. 
  - `text`: The query string to search for (required)
  - `isQuick`: `true` for quick search without highlighting, `false` for slow search with highlighting
  - When `isQuick === true`: Performs a quick search with reduced timing (40% of normal timing window, 50% transition duration). Documents appear quickly without highlights. Similar to `textAndSearch()` but requires explicit text parameter.
  - When `isQuick === false`: Performs a slow search with full timing window. Documents appear with staggered delays, then highlights are applied to specified lines (from `doc.highlightLines`). Also highlights keywords in the database search bar. Similar to `slowSearchAndHighlight()` but requires explicit text parameter.
  - Returns a Promise that resolves after the search animation completes (and highlight animation if `isQuick === false`).
  - **Recommended**: Use this function instead of `textAndSearch()` or `slowSearchAndHighlight()` for new code.

- **`addText(text?: string)`**: Adds text to the database search bar with a focus highlight. If no text is provided, uses the current `query` prop value. The text appears with a blue focus highlight. This is the first step in a slow search sequence. Returns a Promise that resolves immediately after the text is added.

- **`removeFocus()`**: Removes the focus highlight from the database search bar. This is typically called after `addText()` to transition from a focused state to an unfocused state before performing a search. Returns a Promise that resolves immediately.

- **`slowSearchAndHighlight()`**: [Deprecated] Performs a slow search animation with a double pulse effect in the database, then animates documents appearing with staggered delays (using full timing window). After documents appear, highlights the specified lines in each document (from `doc.highlightLines`). **Note:** This function requires that `addText()` has been called first (checks `hasText` state). If text hasn't been added, the function resolves immediately without performing any action. Returns a Promise that resolves after the highlight animation completes. To highlight keywords in the database, you can access the database functions via `onFunctionsReady` and call `highlightKeywords()` separately. **Use `search(text, false)` instead.**

- **`textAndSearch(text?: string)`**: [Deprecated] A convenience function for quick searches. Adds text to the database (without focus) and immediately triggers a quick search animation (single fast pulse). Documents appear quickly with reduced timing (40% of normal timing window, 50% transition duration). Documents appear without highlights. If no text is provided, uses the current `query` prop value. Returns a Promise that resolves after all documents have appeared. **Use `search(text, true)` instead.**

- **`setFinal(highlighted: boolean)`**: Sets the component to its final state immediately without animations. When `highlighted` is `true`, all documents appear with their specified highlight lines (from `doc.highlightLines`) and the database shows keywords highlighted. When `highlighted` is `false`, all documents appear without any highlights. This is useful for showing the final state without going through the animation sequence.

- **`reset()`**: Resets all component state to its initial state. Clears all timeouts, hides all documents, removes all highlights, resets the database, and clears all internal state. Use this to return the component to its starting state before beginning a new sequence.

- **`database`**: Provides direct access to the Database component's control functions. This property is:
  - `null` when the Database component hasn't initialized yet
  - Available once the Database component is ready
  - Allows direct control of the database search bar, including `search()`, `highlightKeywords()`, `setFinal()`, and `reset()` functions
  - Useful for advanced use cases where you need fine-grained control over the database component independently of the main Search animation sequence

**Document Arrangement:**

The component automatically arranges documents in rows with intelligent overlap calculation:
- **Horizontal arrangement**: Documents are arranged in rows with a maximum of 5 documents per row
- **Horizontal overlap**: If documents don't fit within the container width, they automatically overlap horizontally (negative margin). The overlap is calculated to fit all documents within the container while maintaining visual consistency (all rows use the same overlap as the first row)
- **Vertical overlap**: Rows overlap vertically by 80% of the document height to create a stacked effect
- **Responsive**: The arrangement recalculates automatically on container resize using ResizeObserver

**Animation Timing:**

- **Quick search** (`textAndSearch`): Uses 40% of the normal timing window and 50% of the transition duration for faster document appearance
- **Slow search** (`slowSearchAndHighlight`): Uses full timing windows for a more deliberate, slower animation sequence
- Document appearance uses staggered delays based on the total time window divided by the number of documents

**Usage Notes:**

- **Recommended**: For all searches, use `search(text, isSlow)` - it's the unified function that handles both quick and slow searches
  - Quick search: `search(text, false)` - fast document appearance, no highlights
  - Slow search: `search(text, true)` - slower animation with document and keyword highlighting
- **Deprecated**: For backward compatibility, `textAndSearch()` and `slowSearchAndHighlight()` are still available but should be replaced with `search()` in new code
- For fine-grained control: Use the sequence `addText()` → `removeFocus()` → `search(text, true)` if you need to control the text addition and focus removal separately
- Documents must have `highlightLines` specified in the `DocumentItem` array for highlights to appear during slow search or `setFinal(true)`
- The component manages document visibility and highlight state internally - you don't need to manually control individual documents

---
