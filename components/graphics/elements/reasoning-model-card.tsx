"use client"

import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { BrowserWindow } from "../helpers/browser-window"
import { DummyLine, DummyParagraph } from "../helpers/dummy-helpers"
import { Section, type LineIconType, Search, Document, Answer, Checkbox, Spinner, Plus } from "../helpers/reasoning-components"
import { REASONING_MODEL_TIMINGS } from "../helpers/animation-timings"
import "../helpers/globals.css"

const STEP_DATA = {
  steps: [
    {
      question: "Where does user work?",
      answer: "Tomato, Inc.",
      documents_found: 12
    },
    {
      question: "When did they pivot?",
      updated_question: "When did Tomato pivot to SMB?",
      answer: "March 2023",
      documents_found: 12
    },
    {
      question: "Pricing before pivot?",
      updated_question: "Pricing before March 2023?",
      answer: "$499 / month / seat",
      documents_found: 7
    },
    {
      question: "Pricing after pivot?",
      updated_question: "Pricing after March 2023?",
      answer: "$99 / month / seat",
      documents_found: 3
    }
    
  ],
  final_answer: "$99/month/seat + $500 setup"
}


export const AnswerSection = ({ borderTop, animatedText, animatedLines, showText = true, isTransitioning = false }: { borderTop: boolean; animatedText?: string; animatedLines?: boolean[]; showText?: boolean; isTransitioning?: boolean }) => {
  // Use useMemo to ensure items array is stable and always includes all 5 lines from the start
  const items: React.ReactNode[] = useMemo(() => [
    <DummyLine key="line1" width="91%" height="var(--line-height-big)" className={animatedLines?.[0] ? "text-pulse" : ""} />,
    <div key="answer" className={`flex flex-row items-center gap-[var(--gap-big)] relative ${animatedLines?.[1] ? "text-pulse" : ""}`} style={{ minHeight: "var(--line-height-big)" }}> 
      <DummyLine width="24px" height="var(--line-height-big)" />
      <div className="relative" style={{ width: "92px", height: "var(--line-height-big)" }}>
        {/* Dummy line - fades out when revealing */}
        <div 
          className="answer-dummy-line flex items-center"
          style={{ 
            position: isTransitioning ? "absolute" : (showText ? "relative" : "absolute"),
            top: (isTransitioning || !showText) ? 0 : undefined,
            left: (isTransitioning || !showText) ? 0 : undefined,
            opacity: showText ? 1 : 0,
            transition: `opacity ${REASONING_MODEL_TIMINGS.ANSWER_TRANSITION_MS}ms ease-in-out`,
            pointerEvents: showText ? "auto" : "none",
            zIndex: isTransitioning ? 1 : undefined,
            height: "var(--line-height-big)",
            display: "flex",
            alignItems: "center"
          }}
        >
          <DummyLine width="92px" height="var(--line-height-big)" />
        </div>
        {/* Answer text - fades in when revealing */}
        <span 
          className="styling-text font-bold w-[92px] h-[var(--line-height-big)] pl-[1px] overflow-visible answer-text flex items-center" 
          style={{ 
            color: "var(--traffic-light-green)", 
            position: isTransitioning ? "absolute" : (showText ? "absolute" : "relative"),
            top: (isTransitioning || showText) ? "-1px" : undefined,
            left: (isTransitioning || showText) ? 0 : undefined,
            marginTop: (!isTransitioning && !showText) ? "-1px" : undefined,
            opacity: showText ? 0 : 1,
            transition: `opacity ${REASONING_MODEL_TIMINGS.ANSWER_TRANSITION_MS}ms ease-in-out`,
            pointerEvents: showText ? "none" : "auto",
            zIndex: isTransitioning ? 2 : undefined,
            display: "flex",
            alignItems: "center"
          }}
        >
          {animatedText !== undefined ? animatedText : STEP_DATA.final_answer}
        </span>
      </div>
      <DummyLine width="52px" height="var(--line-height-big)" />
    </div>
  ], [animatedText, animatedLines, showText, isTransitioning])
  
  return (
    <Section title="Answer" borderTop={borderTop}>
      <DummyParagraph
        items={items}
        gap="var(--gap-big)"
      />
    </Section>
  )
}

export const answerSection = () => (
  <AnswerSection borderTop={false} showText={true} />
) 

type StepState = "pending" | "active" | "updating" | "retrieving" | "answering" | "completed"
type Phase = "active" | "updating" | "retrieving" | "answering" | "completed"

const PHASES: Phase[] = ["active", "updating", "retrieving", "answering", "completed"]

type StepData = {
  question: string
  updated_question?: string
  answer: string
  documents_found: number
}

// Strip formatting markers to get plain text
function stripFormatting(text: string): string {
  return text.replace(/~[^~]+~/g, '').replace(/\*[^*]+\*/g, (match) => match.slice(1, -1))
}

// Find the common prefix between two strings
function findCommonPrefix(str1: string, str2: string): number {
  let i = 0
  const minLength = Math.min(str1.length, str2.length)
  while (i < minLength && str1[i] === str2[i]) {
    i++
  }
  return i
}

// Find the common suffix between two strings
function findCommonSuffix(str1: string, str2: string): number {
  let i = 0
  const minLength = Math.min(str1.length, str2.length)
  while (i < minLength && str1[str1.length - 1 - i] === str2[str2.length - 1 - i]) {
    i++
  }
  return i
}

// Parse text with ~text~ (strikethrough) and *text* (replacement/new text) formatting
function parseFormattedText(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let currentIndex = 0
  
  // Match ~text~ (strikethrough) or *text* (replacement)
  const pattern = /(~[^~]+~|\*[^*]+\*)/g
  let match
  
  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      parts.push(text.slice(currentIndex, match.index))
    }
    
    const matchedText = match[0]
    if (matchedText.startsWith('~') && matchedText.endsWith('~')) {
      // Strikethrough text
      const content = matchedText.slice(1, -1)
      parts.push(
        <span key={match.index} style={{ textDecoration: "line-through", opacity: 0.6 }}>
          {content}
        </span>
      )
    } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
      // Replacement/new text
      const content = matchedText.slice(1, -1)
      parts.push(
        <span key={match.index} style={{ fontWeight: "600" }}>
          {content}
        </span>
      )
    }
    
    currentIndex = match.index + matchedText.length
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex))
  }
  
  return parts.length > 0 ? parts : [text]
}

// Render text with only the new parts in bold
function renderTextWithBoldNewParts(fullText: string, newTextParts: string[], prefix: string = "", suffix: string = ""): React.ReactNode {
  if (newTextParts.length === 0) {
    return fullText
  }
  
  // Find all positions where new text parts appear (full or partial matches during typing)
  const positions: Array<{ start: number; end: number; text: string }> = []
  const prefixLength = prefix.length
  const suffixLength = suffix.length
  const searchStart = prefixLength
  const searchEnd = fullText.length - suffixLength
  
  for (const newPart of newTextParts) {
    // Search within the expected area (after prefix, before suffix)
    const searchArea = fullText.slice(searchStart, searchEnd)
    
    // First try to find the full match
    const fullIndex = searchArea.indexOf(newPart)
    if (fullIndex !== -1) {
      positions.push({ 
        start: searchStart + fullIndex, 
        end: searchStart + fullIndex + newPart.length, 
        text: newPart 
      })
    } else {
      // If full match not found, check for partial match at the expected position
      // This handles typing animation where only part of the text is typed so far
      for (let i = newPart.length; i >= 1; i--) {
        const partial = newPart.slice(0, i)
        const partialIndex = searchArea.indexOf(partial)
        if (partialIndex !== -1) {
          positions.push({ 
            start: searchStart + partialIndex, 
            end: searchStart + partialIndex + partial.length, 
            text: partial 
          })
          break
        }
      }
    }
  }
  
  // Sort by position
  positions.sort((a, b) => a.start - b.start)
  
  // Remove overlapping positions (keep first occurrence)
  const nonOverlapping: Array<{ start: number; end: number; text: string }> = []
  for (const pos of positions) {
    if (nonOverlapping.length === 0 || pos.start >= nonOverlapping[nonOverlapping.length - 1].end) {
      nonOverlapping.push(pos)
    }
  }
  
  // Build parts array
  const parts: Array<{ text: string; isBold: boolean }> = []
  let currentIndex = 0
  
  for (const pos of nonOverlapping) {
    // Add text before this bold part
    if (pos.start > currentIndex) {
      parts.push({ text: fullText.slice(currentIndex, pos.start), isBold: false })
    }
    // Add the bold part
    parts.push({ text: pos.text, isBold: true })
    currentIndex = pos.end
  }
  
  // Add remaining text
  if (currentIndex < fullText.length) {
    parts.push({ text: fullText.slice(currentIndex), isBold: false })
  }
  
  return (
    <>
      {parts.map((part, index) => 
        part.isBold ? (
          <span key={index} style={{ fontWeight: "600" }}>{part.text}</span>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </>
  )
}

function Step({ step, state, shouldShow, isNewlyAdded = false, onTypingStart }: { step: StepData; state: StepState; shouldShow: boolean; isNewlyAdded?: boolean; onTypingStart?: () => void }) {
  if (!shouldShow) return null

  const [animatedText, setAnimatedText] = useState<string>(isNewlyAdded ? "" : "")
  const [isAnimating, setIsAnimating] = useState<boolean>(isNewlyAdded)
  const [isHighlighting, setIsHighlighting] = useState(false)
  const [highlightSuffix, setHighlightSuffix] = useState<string>("")
  const [highlightPrefix, setHighlightPrefix] = useState<string>("")
  const [highlightSuffixText, setHighlightSuffixText] = useState<string>("")
  const [finalSuffix, setFinalSuffix] = useState<string>("")
  const [newTextParts, setNewTextParts] = useState<string[]>([]) // Track parts of text that are newly typed
  const animationTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  const previousStateRef = useRef<StepState>(state)
  const [statusAnimationClass, setStatusAnimationClass] = useState<string>("")
  const hasTypedNewTaskRef = useRef<boolean>(false)

  // Handle text animation when state changes to "updating"
  useEffect(() => {
    // Clear any existing animation timeouts
    animationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    animationTimeoutsRef.current = []

    if (state === "updating" && step.updated_question) {
      const oldText = step.question
      // Set animatedText immediately to prevent flash of updated question
      setAnimatedText(oldText)
      setIsAnimating(true)
      const newTextPlain = stripFormatting(step.updated_question)
      
      // Find common prefix and suffix to handle word-in-middle replacements
      const commonPrefixLength = findCommonPrefix(oldText, newTextPlain)
      const commonSuffixLength = findCommonSuffix(oldText, newTextPlain)
      
      const prefix = oldText.slice(0, commonPrefixLength)
      const suffix = oldText.slice(oldText.length - commonSuffixLength)
      const oldMiddle = oldText.slice(commonPrefixLength, oldText.length - commonSuffixLength)
      const newMiddle = newTextPlain.slice(commonPrefixLength, newTextPlain.length - commonSuffixLength)

      // Special handling for "When did they pivot?" -> "When did Tomato pivot to SMB?"
      // We want to highlight only "they", delete it, type "Tomato", then type " pivot to SMB"
      let wordToHighlight = oldMiddle
      let firstPartToType = ""
      let secondPartToType = ""
      
      // Check if we're replacing a single word and then adding more text
      // For "they" -> "Tomato pivot to SMB", we want to highlight just "they"
      if (oldMiddle.includes(" ") && newMiddle.startsWith(oldMiddle.split(" ")[0])) {
        // If new text starts with the first word of old text, highlight just that word
        const firstOldWord = oldMiddle.split(" ")[0]
        wordToHighlight = firstOldWord
        const remainingOld = oldMiddle.slice(firstOldWord.length)
        const remainingNew = newMiddle.slice(firstOldWord.length)
        firstPartToType = ""
        secondPartToType = remainingNew
      } else if (oldText === "When did they pivot?" && newTextPlain === "When did Tomato pivot to SMB?") {
        // Special case: highlight "they", type "Tomato", then type " to SMB"
        wordToHighlight = "they"
        firstPartToType = "Tomato"
        secondPartToType = " to SMB"
      } else {
        // Default: highlight entire oldMiddle, replace with newMiddle
        firstPartToType = newMiddle
        secondPartToType = ""
      }

      // animatedText is already set above
      setHighlightSuffix(wordToHighlight)
      setHighlightPrefix(prefix)
      setHighlightSuffixText(oldMiddle.slice(wordToHighlight.length) + suffix)
      setFinalSuffix(suffix)
      // Track which parts are newly typed (to show in bold)
      const parts: string[] = []
      if (firstPartToType) parts.push(firstPartToType)
      if (secondPartToType) parts.push(secondPartToType)
      setNewTextParts(parts)

      // Helper function to start typing animation
      const startTyping = () => {
        // Phase 2: Instantly remove the highlighted text (if any was highlighted)
        const afterDelete = prefix + oldMiddle.slice(wordToHighlight.length) + suffix
        setAnimatedText(afterDelete)
        setHighlightSuffix("")
        
        // Phase 3: Small pause before typing new text
        const pauseTimeout = setTimeout(() => {
          // Phase 4: Type first part (if any)
          if (firstPartToType) {
            const typeFirstPart = (index: number) => {
              if (index <= firstPartToType.length) {
                const currentText = prefix + firstPartToType.slice(0, index) + oldMiddle.slice(wordToHighlight.length) + suffix
                setAnimatedText(currentText)
                if (index < firstPartToType.length) {
                  const timeout = setTimeout(() => typeFirstPart(index + 1), REASONING_MODEL_TIMINGS.TYPING_SPEED_MS_PER_CHAR)
                  animationTimeoutsRef.current.push(timeout)
                } else {
                  // After first part is typed, type second part
                  if (secondPartToType) {
                    const typeSecondPart = (index: number) => {
                      if (index <= secondPartToType.length) {
                        const currentText = prefix + firstPartToType + oldMiddle.slice(wordToHighlight.length) + secondPartToType.slice(0, index) + suffix
                        setAnimatedText(currentText)
                        if (index < secondPartToType.length) {
                          const timeout = setTimeout(() => typeSecondPart(index + 1), REASONING_MODEL_TIMINGS.TYPING_SPEED_MS_PER_CHAR)
                          animationTimeoutsRef.current.push(timeout)
                        } else {
                          setIsAnimating(false)
                        }
                      }
                    }
                    typeSecondPart(0)
                  } else {
                    setIsAnimating(false)
                  }
                }
              }
            }
            typeFirstPart(0)
          } else if (secondPartToType) {
            // Only second part to type
            const typeSecondPart = (index: number) => {
              if (index <= secondPartToType.length) {
                const currentText = prefix + oldMiddle.slice(wordToHighlight.length) + secondPartToType.slice(0, index) + suffix
                setAnimatedText(currentText)
                if (index < secondPartToType.length) {
                  const timeout = setTimeout(() => typeSecondPart(index + 1), REASONING_MODEL_TIMINGS.TYPING_SPEED_MS_PER_CHAR)
                  animationTimeoutsRef.current.push(timeout)
                } else {
                  setIsAnimating(false)
                }
              }
            }
            typeSecondPart(0)
          } else {
            // Default: type entire newMiddle
            const typeChar = (index: number) => {
              if (index <= newMiddle.length) {
                setAnimatedText(prefix + newMiddle.slice(0, index) + suffix)
                if (index < newMiddle.length) {
                  const timeout = setTimeout(() => typeChar(index + 1), REASONING_MODEL_TIMINGS.TYPING_SPEED_MS_PER_CHAR)
                  animationTimeoutsRef.current.push(timeout)
                } else {
                  setIsAnimating(false)
                }
              }
            }
            typeChar(0)
          }
        }, REASONING_MODEL_TIMINGS.PAUSE_BETWEEN_DELETE_AND_TYPE_MS)
        animationTimeoutsRef.current.push(pauseTimeout)
      }

      // Check if there's actually something to highlight
      if (wordToHighlight && wordToHighlight.trim().length > 0) {
        // Phase 1: Highlight the text to be deleted
        setIsHighlighting(true)
        const highlightTimeout = setTimeout(() => {
          setIsHighlighting(false)
          startTyping()
        }, REASONING_MODEL_TIMINGS.TEXT_HIGHLIGHT_DURATION_MS)
        animationTimeoutsRef.current.push(highlightTimeout)
      } else {
        // No text to highlight, skip directly to typing
        setIsHighlighting(false)
        startTyping()
      }
    } else {
      setIsAnimating(false)
      setIsHighlighting(false)
      setHighlightSuffix("")
      setHighlightPrefix("")
      setHighlightSuffixText("")
      setFinalSuffix("")
      // Only clear newTextParts when going back to pending/active states
      // Keep it for other states (retrieving, etc.) to maintain bold formatting
      if (state === "pending" || state === "active") {
        setNewTextParts([])
        setAnimatedText(step.question)
      } else if (state !== "updating") {
        // Don't clear newTextParts here - keep it to show bold formatting
        setAnimatedText(step.updated_question || step.question)
      }
    }

    return () => {
      animationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      animationTimeoutsRef.current = []
    }
  }, [state, step.question, step.updated_question])

  // Handle typing animation for newly added tasks
  useEffect(() => {
    if (isNewlyAdded && state === "pending" && !hasTypedNewTaskRef.current) {
      hasTypedNewTaskRef.current = true
      
      // Notify parent that typing is starting so it can make the task visible
      if (onTypingStart) {
        onTypingStart()
      }
      
      // Type the question character by character
      const questionText = step.question
      const typeChar = (index: number) => {
        if (index <= questionText.length) {
          setAnimatedText(questionText.slice(0, index))
          if (index < questionText.length) {
            const timeout = setTimeout(() => typeChar(index + 1), REASONING_MODEL_TIMINGS.TYPING_SPEED_MS_PER_CHAR)
            animationTimeoutsRef.current.push(timeout)
          } else {
            setIsAnimating(false)
          }
        }
      }
      // Start typing immediately
      typeChar(0)
      
      return () => {
        animationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
        animationTimeoutsRef.current = []
      }
    }
  }, [isNewlyAdded, state, step.question, onTypingStart])

  // Handle status transition animations
  useEffect(() => {
    const previousState = previousStateRef.current
    const shouldAnimate = (prev: StepState, curr: StepState) => {
      // Animate transitions between: retrieving -> answering -> completed
      return (
        (prev === "retrieving" && curr === "answering") ||
        (prev === "answering" && curr === "completed") ||
        (prev !== "retrieving" && curr === "retrieving")
      )
    }

    if (shouldAnimate(previousState, state)) {
      // Smooth fade out and in for all transitions
      setStatusAnimationClass("status-fade-in")
      const clearAnimationTimeout = setTimeout(() => {
        setStatusAnimationClass("")
      }, REASONING_MODEL_TIMINGS.STATUS_TRANSITION_MS)
      return () => clearTimeout(clearAnimationTimeout)
    } else {
      setStatusAnimationClass("")
    }

    previousStateRef.current = state
  }, [state])

  const displayQuestion = isAnimating 
    ? animatedText
    : state === "pending" || state === "active" || state === "updating"
    ? (animatedText || step.question)
    : (step.updated_question || step.question)
  const questionIcon: LineIconType = state === "pending" ? "open" : state === "completed" ? "done" : "spinner"
  const showDetails = state !== "pending" && state !== "active" && state !== "updating"

  const statusMessages = {
    active: "",
    updating: "",
    retrieving: "Retrieving",
    answering: "Reading",
    completed: step.answer,
  }

  const statusIconComponent = state === "completed" ? <Answer /> : state === "answering" ? <Document /> : <Search />

  const leftPart = (
    <div id="left-part" style={{ display: "flex", alignItems: "center", gap: "4px", flex: "1 1 0", minWidth: 0, overflow: "hidden" }}>
      {questionIcon && (
        <div style={{ flexShrink: 0 }}>
          {isNewlyAdded && state === "pending" ? (
            <Plus />
          ) : questionIcon === "open" ? (
            <Checkbox checked={false} />
          ) : 
           questionIcon === "done" ? <Checkbox checked={true} /> : 
           questionIcon === "spinner" ? <Spinner /> : null}
        </div>
      )}
      <span className="styling-text" style={{ color: "var(--dark-grey)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
        {isHighlighting ? (
          <>
            {highlightPrefix}
            <span className="text-focus-active" style={{ position: "relative", display: "inline-block" }}>
              <span style={{ position: "relative", zIndex: 1 }}>
                {highlightSuffix}
              </span>
            </span>
            {highlightSuffixText}
          </>
        ) : (isAnimating && !isHighlighting && newTextParts.length > 0) ? (
          // During typing animation (not highlighting), show new text parts in bold
          renderTextWithBoldNewParts(displayQuestion, newTextParts)
        ) : (state !== "pending" && state !== "active" && step.updated_question && newTextParts.length > 0) ? (
          // After completion, show new text parts in bold
          renderTextWithBoldNewParts(displayQuestion, newTextParts)
        ) : (displayQuestion.includes('~') || displayQuestion.includes('*') ? parseFormattedText(displayQuestion) : displayQuestion)}
      </span>
    </div>
  )

  const rightPart = showDetails ? (
    <div id="right-part" style={{ display: "flex", alignItems: "center", gap: "2px", whiteSpace: "nowrap", flexShrink: 0 }}>
      <div key={`icon-${state}`} className={statusAnimationClass} style={{ flexShrink: 0 }}>
        {statusIconComponent}
      </div>
      {state === "completed" ? (
        <span key={`text-${state}`} className={`styling-text ${statusAnimationClass}`} style={{ color: "var(--dark-grey)", fontWeight: "500", whiteSpace: "nowrap", flexShrink: 0 }}>
          {statusMessages[state]}
        </span>
      ) : (
        <em key={`text-${state}`} className={`styling-text ${state === "retrieving" || state === "answering" ? "text-pulse" : ""} ${statusAnimationClass}`} style={{ color: "var(--dark-grey)", fontStyle: "italic", whiteSpace: "nowrap", flexShrink: 0 }}>
          {statusMessages[state]}
        </em>
      )}
    </div>
  ) : null

  return (
    <div style={{ marginBottom: "8px", transition: "all 0.1s ease", whiteSpace: "nowrap", width: "100%", paddingLeft: "4px", paddingRight: "4px", overflow: "hidden", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "4px", minWidth: 0, minHeight: "6px", height: "6px" }}>
        {leftPart}
        {rightPart}
      </div>
    </div>
  )
}

function updateStepState(states: StepState[], index: number, newState: StepState): StepState[] {
  const newStates = [...states]
  newStates[index] = newState
  return newStates
}

function findNextStepIndex(
  currentIndex: number,
  steps: StepData[],
  stepStates: StepState[]
): number | null {
  // Find next available step
  for (let i = currentIndex + 1; i < steps.length; i++) {
    if (stepStates[i] === "pending") {
      return i
    }
  }
  return null
}

export function ReasoningModelCard({ 
  onActionButtons,
  onRetrievalReady,
  onBeforeQueryText,
  onFunctionsReady,
  isActive = true,
  query = ""
}: { 
  onActionButtons?: (buttons: React.ReactNode) => void;
  onRetrievalReady?: (stepIndex: number, retrievalText: string) => Promise<void>;
  onBeforeQueryText?: () => void | Promise<void>;
  onFunctionsReady?: (functions: { runSequentialFlow: () => Promise<void>; reset: () => void }) => void;
  isActive?: boolean;
  query?: string;
} = {}) {
  const [steps, setSteps] = useState<StepData[]>(STEP_DATA.steps)
  const [stepStates, setStepStates] = useState<StepState[]>(
    STEP_DATA.steps.map(() => "pending")
  )
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null)
  const [currentPhase, setCurrentPhase] = useState<Phase>("active")
  const [showAnswer, setShowAnswer] = useState(false)
  const [showThinking, setShowThinking] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [animatedLines, setAnimatedLines] = useState<boolean[]>([false, false, false])
  const [isStartAnswering, setIsStartAnswering] = useState(false)
  const [animatedAnswerLines, setAnimatedAnswerLines] = useState<boolean[]>([false, false, false])
  const [isAnsweringComplete, setIsAnsweringComplete] = useState(false)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
  const [isAnswerTransitioning, setIsAnswerTransitioning] = useState(false)
  const [showPlanSection, setShowPlanSection] = useState(false)
  const [visiblePlanSteps, setVisiblePlanSteps] = useState<Set<number>>(new Set())
  const [hasAddedTask, setHasAddedTask] = useState(false)
  const [addedTaskIndex, setAddedTaskIndex] = useState<number | null>(null)
  const [newTaskTypingStarted, setNewTaskTypingStarted] = useState(false)
  const [showQueryText, setShowQueryText] = useState(false)
  const [isQueryHighlighted, setIsQueryHighlighted] = useState(false)
  const startAnsweringTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  const sequentialTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  const [isRunningSequential, setIsRunningSequential] = useState(false)
  const [isWaitingForContinue, setIsWaitingForContinue] = useState(false)
  const continueResolversRef = useRef<Map<number, () => void>>(new Map())
  const onActionButtonsRef = useRef(onActionButtons)
  const onRetrievalReadyRef = useRef(onRetrievalReady)
  const onBeforeQueryTextRef = useRef(onBeforeQueryText)
  const onFunctionsReadyRef = useRef(onFunctionsReady)
  const retrievalPromisesRef = useRef<Map<number, Promise<void>>>(new Map())

  const handleReset = useCallback(() => {
    // Clear all timeouts
    thinkingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    thinkingTimeoutsRef.current = []
    planTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    planTimeoutsRef.current = []
    startAnsweringTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    startAnsweringTimeoutsRef.current = []
    sequentialTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    sequentialTimeoutsRef.current = []
    // Clear retrieval promises and continue resolvers
    retrievalPromisesRef.current.clear()
    continueResolversRef.current.clear()
    setIsWaitingForContinue(false)
    
    // Reset to initial state - just thinking section, no animations
    setSteps(STEP_DATA.steps)
    setCurrentStepIndex(null)
    setCurrentPhase("active")
    setStepStates(STEP_DATA.steps.map(() => "pending"))
    setShowAnswer(false)
    setShowThinking(false)
    setIsThinking(false)
    setAnimatedLines([false, false, false])
    setIsStartAnswering(false)
    setAnimatedAnswerLines([false, false, false])
    setIsAnsweringComplete(false)
    setIsAnswerRevealed(false)
    setIsAnswerTransitioning(false)
    setShowPlanSection(false)
    setVisiblePlanSteps(new Set())
    setHasAddedTask(false)
    setAddedTaskIndex(null)
    setNewTaskTypingStarted(false)
    setShowQueryText(false)
    setIsQueryHighlighted(false)
    setIsRunningSequential(false)
  }, [])

  const thinkingTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  const planTimeoutsRef = useRef<NodeJS.Timeout[]>([])

  const handleToggleThinking = useCallback(() => {
    // Clear any existing timeouts
    thinkingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    thinkingTimeoutsRef.current = []

    if (!isThinking) {
      // Start thinking - show section and animate lines sequentially
      setShowThinking(true)
      setIsThinking(true)
      setAnimatedLines([false, false, false])
      
      // Animate first line immediately
      const timeout1 = setTimeout(() => setAnimatedLines([true, false, false]), REASONING_MODEL_TIMINGS.THINKING_LINE_1_DELAY_MS)
      thinkingTimeoutsRef.current.push(timeout1)
      
      // Animate second line after a split second
      const timeout2 = setTimeout(() => setAnimatedLines([true, true, false]), REASONING_MODEL_TIMINGS.THINKING_LINE_2_DELAY_MS)
      thinkingTimeoutsRef.current.push(timeout2)
      
      // Animate third line after another split second
      const timeout3 = setTimeout(() => setAnimatedLines([true, true, true]), REASONING_MODEL_TIMINGS.THINKING_LINE_3_DELAY_MS)
      thinkingTimeoutsRef.current.push(timeout3)
    } else {
      // Stop thinking - clear all animations
      setIsThinking(false)
      setAnimatedLines([false, false, false])
      // Optionally hide the section when stopping
      // setShowThinking(false)
    }
  }, [isThinking])

  const handleToggleStartAnswering = useCallback(() => {
    // Clear any existing timeouts
    startAnsweringTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    startAnsweringTimeoutsRef.current = []

    if (!isStartAnswering) {
      // Start answering - animate lines sequentially
      setIsStartAnswering(true)
      setIsAnsweringComplete(false)
      setIsAnswerRevealed(false)
      setAnimatedAnswerLines([false, false, false])
      
      // Ensure answer section is shown
      if (!showAnswer) {
        setShowAnswer(true)
      }
      
      // Animate first line immediately
      const timeout1 = setTimeout(() => setAnimatedAnswerLines([true, false, false]), REASONING_MODEL_TIMINGS.ANSWER_LINE_1_DELAY_MS)
      startAnsweringTimeoutsRef.current.push(timeout1)
      
      // Animate second line (middle line with text) after a split second
      const timeout2 = setTimeout(() => setAnimatedAnswerLines([true, true, false]), REASONING_MODEL_TIMINGS.ANSWER_LINE_2_DELAY_MS)
      startAnsweringTimeoutsRef.current.push(timeout2)
      
      // Animate third line after another split second
      const timeout3 = setTimeout(() => setAnimatedAnswerLines([true, true, true]), REASONING_MODEL_TIMINGS.ANSWER_LINE_3_DELAY_MS)
      startAnsweringTimeoutsRef.current.push(timeout3)
      
      // Mark answering as complete after animation finishes
      const timeout4 = setTimeout(() => setIsAnsweringComplete(true), REASONING_MODEL_TIMINGS.ANSWER_COMPLETE_DELAY_MS)
      startAnsweringTimeoutsRef.current.push(timeout4)
    } else {
      // Stop answering - clear all animations
      setIsStartAnswering(false)
      setIsAnsweringComplete(false)
      setIsAnswerRevealed(false)
      setAnimatedAnswerLines([false, false, false])
    }
  }, [isStartAnswering, showAnswer])

  const handleRevealAnswer = useCallback(() => {
    if (isAnswerRevealed) {
      // Unreveal - hide the answer and show dummy content
      setIsAnswerTransitioning(true)
      setIsAnswerRevealed(false)
      setIsAnsweringComplete(false)
      // Clear transition state after animation completes
      setTimeout(() => {
        setIsAnswerTransitioning(false)
      }, REASONING_MODEL_TIMINGS.ANSWER_TRANSITION_MS)
    } else {
      // Reveal - stop all animations and show the answer
      startAnsweringTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      startAnsweringTimeoutsRef.current = []
      
      // Start transition
      setIsAnswerTransitioning(true)
      
      // Stop the flickering animation and reveal the answer
      setIsAnswerRevealed(true)
      setAnimatedAnswerLines([false, false, false])
      setIsStartAnswering(false)
      setIsAnsweringComplete(true)
      
      // Ensure answer section is shown
      if (!showAnswer) {
        setShowAnswer(true)
      }
      
      // Clear transition state after animation completes
      setTimeout(() => {
        setIsAnswerTransitioning(false)
      }, REASONING_MODEL_TIMINGS.ANSWER_TRANSITION_MS)
    }
  }, [isAnswerRevealed, showAnswer])

  const handleShowPlan = useCallback(() => {
    // Clear any existing timeouts
    planTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    planTimeoutsRef.current = []

    if (!showPlanSection) {
      // Show plan section (just visual display, doesn't start execution)
      setShowPlanSection(true)
      setVisiblePlanSteps(new Set())
      
      // Get all steps (use stateful steps array)
      const allSteps = steps.map((step, index) => ({
        step,
        index
      }))
      
      // Fade in each step sequentially
      allSteps.forEach(({ index }, i) => {
        const timeout = setTimeout(() => {
          setVisiblePlanSteps(prev => new Set([...prev, index]))
        }, i * REASONING_MODEL_TIMINGS.PLAN_STEP_FADE_IN_DELAY_MS)
        planTimeoutsRef.current.push(timeout)
      })
    } else {
      // Hide plan section
      setShowPlanSection(false)
      setVisiblePlanSteps(new Set())
    }
  }, [showPlanSection, steps])

  const handleReplaceText = useCallback(() => {
    // Replace old question with new (updated_question) for all active/pending steps
    // Even if no updated_question, set to "updating" to trigger spinner animation
    const newStates = stepStates.map((state, index) => {
      if (state === "active" || state === "pending") {
        // Set to "updating" to trigger spinner, even if no updated_question
        return "updating"
      }
      return state
    })
    setStepStates(newStates)
  }, [stepStates])

  const handleRetrieval = useCallback(async () => {
    // Do retrieval to docs found for all updating/active/pending steps
    const stepsToRetrieve: number[] = []
    let newStates = stepStates.map((state, index) => {
      if (state === "updating" || state === "active" || state === "pending") {
        stepsToRetrieve.push(index)
        return "retrieving"
      }
      return state
    })
    setStepStates(newStates)
    
    // Wait for all retrieval promises to resolve
    const promises = stepsToRetrieve.map(async (stepIndex) => {
      // Check if we already have a promise for this step
      if (!retrievalPromisesRef.current.has(stepIndex)) {
        // Call the retrieval ready callback if provided
        if (onRetrievalReadyRef.current) {
          // Get the retrieval text for this step (use updated_question if available, otherwise question)
          const step = steps[stepIndex]
          const retrievalText = step?.updated_question || step?.question || ""
          const promise = onRetrievalReadyRef.current(stepIndex, retrievalText)
          retrievalPromisesRef.current.set(stepIndex, promise)
          await promise
          retrievalPromisesRef.current.delete(stepIndex)
        } else {
          // Default: wait for continue button
          await new Promise<void>((resolve) => {
            continueResolversRef.current.set(stepIndex, resolve)
            setIsWaitingForContinue(true)
          })
          continueResolversRef.current.delete(stepIndex)
          if (continueResolversRef.current.size === 0) {
            setIsWaitingForContinue(false)
          }
        }
      } else {
        // Wait for existing promise
        await retrievalPromisesRef.current.get(stepIndex)
      }
    })

    // Wait for all retrievals to complete
    await Promise.all(promises)
    
    // Move all retrieving steps directly to answering (skip documents_found)
    setStepStates(prevStates => 
      prevStates.map((state, index) => {
        if (state === "retrieving") {
          return "answering"
        }
        return state
      })
    )
  }, [stepStates, steps])

  const handleAnswer = useCallback(() => {
    // Move all answering steps to completed
    let newStates = stepStates.map((state, index) => {
      if (state === "answering") {
        return "completed"
      }
      return state
    })
    setStepStates(newStates)
    
    // After a brief delay, move to completed
    setTimeout(() => {
      setStepStates(prevStates => 
        prevStates.map((state, index) => {
          if (state === "answering") {
            return "completed"
          }
          return state
        })
      )
    }, 500)
  }, [stepStates])

  const handleToggleTask = useCallback(() => {
    if (!hasAddedTask) {
      // Add the task
      const newTask: StepData = {
        question: "",
        updated_question: "Are there any additional fees?",
        answer: "$500 setup",
        documents_found: 2,
      }
      
      setSteps(prevSteps => {
        const newSteps = [...prevSteps, newTask]
        const newIndex = newSteps.length - 1
        setAddedTaskIndex(newIndex)
        
        // If plan section is showing, add to visiblePlanSteps immediately
        // so the component renders (but it will be opacity 0 until typing starts)
        if (showPlanSection) {
          setVisiblePlanSteps(prev => new Set([...prev, newIndex]))
        }
        
        return newSteps
      })
      setStepStates(prevStates => [...prevStates, "pending"])
      setHasAddedTask(true)
    } else {
      // Remove the task
      if (addedTaskIndex !== null) {
        const indexToRemove = addedTaskIndex
        setSteps(prevSteps => prevSteps.filter((_, index) => index !== indexToRemove))
        setStepStates(prevStates => prevStates.filter((_, index) => index !== indexToRemove))
        // Remove from visible steps and adjust indices
        setVisiblePlanSteps(prev => {
          const newSet = new Set<number>()
          prev.forEach(index => {
            if (index < indexToRemove) {
              newSet.add(index)
            } else if (index > indexToRemove) {
              newSet.add(index - 1)
            }
            // Skip the removed index
          })
          return newSet
        })
        setHasAddedTask(false)
        setAddedTaskIndex(null)
      }
    }
  }, [hasAddedTask, addedTaskIndex, showPlanSection, steps, stepStates])

  // Helper function to wait for a promise
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const handleSequentialFlow = useCallback(async () => {
    if (isRunningSequential) {
      // Stop the sequence
      sequentialTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      sequentialTimeoutsRef.current = []
      setIsRunningSequential(false)
      return
    }

    setIsRunningSequential(true)
    
    // Clear all existing timeouts
    thinkingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    thinkingTimeoutsRef.current = []
    planTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    planTimeoutsRef.current = []
    startAnsweringTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    startAnsweringTimeoutsRef.current = []
    sequentialTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    sequentialTimeoutsRef.current = []

    // Reset state first
    setSteps(STEP_DATA.steps)
    setStepStates(STEP_DATA.steps.map(() => "pending"))
    setShowAnswer(false)
    setShowThinking(false)
    setIsThinking(false)
    setAnimatedLines([false, false, false])
    setIsStartAnswering(false)
    setAnimatedAnswerLines([false, false, false])
    setIsAnsweringComplete(false)
    setIsAnswerRevealed(false)
    setIsAnswerTransitioning(false)
    setShowPlanSection(false)
    setVisiblePlanSteps(new Set())
    setHasAddedTask(false)
    setAddedTaskIndex(null)
    setNewTaskTypingStarted(false)
    setShowQueryText(false)
    setIsQueryHighlighted(false)

    await wait(REASONING_MODEL_TIMINGS.SEQUENTIAL_FLOW.STATE_RESET_DELAY_MS)

    // 1. Trigger callback right before showing query text
    if (onBeforeQueryTextRef.current) {
      await onBeforeQueryTextRef.current()
    }

    // 2. Show query text with highlight active
    setShowQueryText(true)
    setIsQueryHighlighted(true)
    await wait(REASONING_MODEL_TIMINGS.SEQUENTIAL_FLOW.QUERY_HIGHLIGHT_MS)

    // 3. Remove highlight
    setIsQueryHighlighted(false)
    await wait(REASONING_MODEL_TIMINGS.SEQUENTIAL_FLOW.PAUSE_AFTER_REMOVE_HIGHLIGHT_MS)

    // 4. Show thinking section with thinking animation
    setShowThinking(true)
    setIsThinking(true)
    setAnimatedLines([false, false, false])
    
    // Animate lines sequentially
    const timeout1 = setTimeout(() => setAnimatedLines([true, false, false]), REASONING_MODEL_TIMINGS.THINKING_LINE_1_DELAY_MS)
    sequentialTimeoutsRef.current.push(timeout1)
    const timeout2 = setTimeout(() => setAnimatedLines([true, true, false]), REASONING_MODEL_TIMINGS.THINKING_LINE_2_DELAY_MS)
    sequentialTimeoutsRef.current.push(timeout2)
    const timeout3 = setTimeout(() => setAnimatedLines([true, true, true]), REASONING_MODEL_TIMINGS.THINKING_LINE_3_DELAY_MS)
    sequentialTimeoutsRef.current.push(timeout3)

    // Wait for thinking timer
    await wait(REASONING_MODEL_TIMINGS.SEQUENTIAL_FLOW.THINKING_TIMER_MS)

    // 2. When timer done, stop thinking + show plan
    setIsThinking(false)
    setAnimatedLines([false, false, false])
    setShowPlanSection(true)
    setVisiblePlanSteps(new Set())
    
    // Get all steps and fade them in
    const allSteps = STEP_DATA.steps.map((step, index) => ({ step, index }))
    for (let i = 0; i < allSteps.length; i++) {
      await wait(REASONING_MODEL_TIMINGS.PLAN_STEP_FADE_IN_DELAY_MS)
      setVisiblePlanSteps(prev => new Set([...prev, allSteps[i].index]))
    }

    await wait(REASONING_MODEL_TIMINGS.SEQUENTIAL_FLOW.PLAN_DISPLAY_WAIT_MS)

    // 3. FOR EACH LINE 1-4: replace text -> retrieval -> answer
    for (let lineIndex = 0; lineIndex < 4; lineIndex++) {
      // Special handling for lines 2 and 3 (pricing questions) - process together
      if (lineIndex === 2) {
        // Replace text for both steps 2 and 3 at the same time
        setStepStates(prevStates => {
          const newStates = [...prevStates]
          if (newStates[2] === "pending" || newStates[2] === "active") {
            newStates[2] = "updating"
          }
          if (newStates[3] === "pending" || newStates[3] === "active") {
            newStates[3] = "updating"
          }
          return newStates
        })
        
        // Wait for replace text animation to complete (use the longer typing time)
        const step2 = STEP_DATA.steps[2]
        const step3 = STEP_DATA.steps[3]
        const typingTime2 = step2.updated_question ? stripFormatting(step2.updated_question).length * REASONING_MODEL_TIMINGS.TYPING_SPEED_MS_PER_CHAR + REASONING_MODEL_TIMINGS.TEXT_HIGHLIGHT_DURATION_MS + REASONING_MODEL_TIMINGS.PAUSE_BETWEEN_DELETE_AND_TYPE_MS : 500
        const typingTime3 = step3.updated_question ? stripFormatting(step3.updated_question).length * REASONING_MODEL_TIMINGS.TYPING_SPEED_MS_PER_CHAR + REASONING_MODEL_TIMINGS.TEXT_HIGHLIGHT_DURATION_MS + REASONING_MODEL_TIMINGS.PAUSE_BETWEEN_DELETE_AND_TYPE_MS : 500
        const maxTypingTime = Math.max(typingTime2, typingTime3)
        await wait(maxTypingTime)

        // Retrieval for both steps 2 and 3 at the same time
        setStepStates(prevStates => {
          const newStates = [...prevStates]
          if (newStates[2] === "updating") {
            newStates[2] = "retrieving"
          }
          if (newStates[3] === "updating") {
            newStates[3] = "retrieving"
          }
          return newStates
        })
        
        // Single retrieval call for both steps (call with step 2 index)
        if (onRetrievalReadyRef.current) {
          // Check if we already have a promise for step 2
          if (!retrievalPromisesRef.current.has(2)) {
            const step2 = STEP_DATA.steps[2]
            const retrievalText = step2?.updated_question || step2?.question || ""
            const promise = onRetrievalReadyRef.current(2, retrievalText)
            retrievalPromisesRef.current.set(2, promise)
            retrievalPromisesRef.current.set(3, promise) // Share the same promise for step 3
            await promise
            retrievalPromisesRef.current.delete(2)
            retrievalPromisesRef.current.delete(3)
          } else {
            await retrievalPromisesRef.current.get(2)
          }
        } else {
          // Default: wait for continue button
          await new Promise<void>((resolve) => {
            continueResolversRef.current.set(2, resolve)
            continueResolversRef.current.set(3, resolve) // Share the same resolver
            setIsWaitingForContinue(true)
          })
          continueResolversRef.current.delete(2)
          continueResolversRef.current.delete(3)
          if (continueResolversRef.current.size === 0) {
            setIsWaitingForContinue(false)
          }
        }
        
        // Move both directly from retrieving to answering (skip documents_found)
        setStepStates(prevStates => {
          const newStates = [...prevStates]
          if (newStates[2] === "retrieving") {
            newStates[2] = "answering"
          }
          if (newStates[3] === "retrieving") {
            newStates[3] = "answering"
          }
          return newStates
        })
        
        await wait(REASONING_MODEL_TIMINGS.SEQUENTIAL_FLOW.ANSWERING_ANIMATION_WAIT_MS)
        
        // Complete step 2 first
        setStepStates(prevStates => {
          const newStates = [...prevStates]
          if (newStates[2] === "answering") {
            newStates[2] = "completed"
          }
          return newStates
        })
        
        await wait(REASONING_MODEL_TIMINGS.SEQUENTIAL_FLOW.PAUSE_BEFORE_COMPLETE_STEP_3_MS)
        
        // Complete step 3
        setStepStates(prevStates => {
          const newStates = [...prevStates]
          if (newStates[3] === "answering") {
            newStates[3] = "completed"
          }
          return newStates
        })
        
        await wait(REASONING_MODEL_TIMINGS.SEQUENTIAL_FLOW.PAUSE_BEFORE_NEXT_LINE_MS)
        // Skip lineIndex 3 in the loop since we already processed it
        lineIndex = 3
      } else {
        // Normal processing for other lines
        // Replace text
        setStepStates(prevStates => {
          const newStates = [...prevStates]
          if (newStates[lineIndex] === "pending" || newStates[lineIndex] === "active") {
            newStates[lineIndex] = "updating"
          }
          return newStates
        })
        
        // Wait for replace text animation to complete (estimate based on typing speed)
        const currentStep = STEP_DATA.steps[lineIndex]
        if (currentStep.updated_question) {
          const typingTime = stripFormatting(currentStep.updated_question).length * REASONING_MODEL_TIMINGS.TYPING_SPEED_MS_PER_CHAR + REASONING_MODEL_TIMINGS.TEXT_HIGHLIGHT_DURATION_MS + REASONING_MODEL_TIMINGS.PAUSE_BETWEEN_DELETE_AND_TYPE_MS
          await wait(typingTime)
        } else {
          await wait(500)
        }

        // Retrieval
        setStepStates(prevStates => {
          const newStates = [...prevStates]
          if (newStates[lineIndex] === "updating") {
            newStates[lineIndex] = "retrieving"
          }
          return newStates
        })
        
        // Wait for retrieval to complete (via callback if provided, or wait for continue button)
        if (onRetrievalReadyRef.current) {
          // Check if we already have a promise for this step
          if (!retrievalPromisesRef.current.has(lineIndex)) {
            const currentStep = STEP_DATA.steps[lineIndex]
            const retrievalText = currentStep?.updated_question || currentStep?.question || ""
            const promise = onRetrievalReadyRef.current(lineIndex, retrievalText)
            retrievalPromisesRef.current.set(lineIndex, promise)
            await promise
            retrievalPromisesRef.current.delete(lineIndex)
          } else {
            await retrievalPromisesRef.current.get(lineIndex)
          }
        } else {
          // Default: wait for continue button
          await new Promise<void>((resolve) => {
            continueResolversRef.current.set(lineIndex, resolve)
            setIsWaitingForContinue(true)
          })
          continueResolversRef.current.delete(lineIndex)
          if (continueResolversRef.current.size === 0) {
            setIsWaitingForContinue(false)
          }
        }
        
        // Move directly from retrieving to answering (skip documents_found)
        setStepStates(prevStates => {
          const newStates = [...prevStates]
          if (newStates[lineIndex] === "retrieving") {
            newStates[lineIndex] = "answering"
          }
          return newStates
        })
        
        await wait(REASONING_MODEL_TIMINGS.SEQUENTIAL_FLOW.ANSWERING_ANIMATION_WAIT_MS)
        
        setStepStates(prevStates => {
          const newStates = [...prevStates]
          if (newStates[lineIndex] === "answering") {
            newStates[lineIndex] = "completed"
          }
          return newStates
        })
        
        await wait(REASONING_MODEL_TIMINGS.SEQUENTIAL_FLOW.PAUSE_BEFORE_NEXT_LINE_MS)
      }
    }

    // 4. FOR LINE 5: add task -> replace text -> retrieval -> answer
    const newTask: StepData = {
      question: "",
      updated_question: "Are there any additional fees?",
      answer: "$500 setup",
      documents_found: 2,
    }
    
    // Calculate line5Index before state updates
    const line5Index = steps.length
    
    setSteps(prevSteps => {
      const newSteps = [...prevSteps, newTask]
      setAddedTaskIndex(line5Index)
      setVisiblePlanSteps(prev => new Set([...prev, line5Index]))
      return newSteps
    })
    setStepStates(prevStates => [...prevStates, "pending"])
    setHasAddedTask(true)
    setNewTaskTypingStarted(true)
    
    // Wait for task to be added and typed
    const taskTypingTime = (newTask.updated_question || "").length * REASONING_MODEL_TIMINGS.TYPING_SPEED_MS_PER_CHAR + 200
    await wait(taskTypingTime)

    // Replace text for line 5
    setStepStates(prevStates => {
      const newStates = [...prevStates]
      if (newStates[line5Index] === "pending") {
        newStates[line5Index] = "updating"
      }
      return newStates
    })
    
    await wait(taskTypingTime) // Wait for replace text animation

    // Retrieval for line 5
    setStepStates(prevStates => {
      const newStates = [...prevStates]
      if (newStates[line5Index] === "updating") {
        newStates[line5Index] = "retrieving"
      }
      return newStates
    })
    
    // Wait for retrieval to complete (via callback if provided, or wait for continue button)
    if (onRetrievalReadyRef.current) {
      if (!retrievalPromisesRef.current.has(line5Index)) {
        const retrievalText = newTask?.updated_question || newTask?.question || ""
        const promise = onRetrievalReadyRef.current(line5Index, retrievalText)
        retrievalPromisesRef.current.set(line5Index, promise)
        await promise
        retrievalPromisesRef.current.delete(line5Index)
      } else {
        await retrievalPromisesRef.current.get(line5Index)
      }
    } else {
      // Default: wait for continue button
      await new Promise<void>((resolve) => {
        continueResolversRef.current.set(line5Index, resolve)
        setIsWaitingForContinue(true)
      })
      continueResolversRef.current.delete(line5Index)
      if (continueResolversRef.current.size === 0) {
        setIsWaitingForContinue(false)
      }
    }
    
    // Move directly from retrieving to answering (skip documents_found)
    setStepStates(prevStates => {
      const newStates = [...prevStates]
      if (newStates[line5Index] === "retrieving") {
        newStates[line5Index] = "answering"
      }
      return newStates
    })
    
    await wait(REASONING_MODEL_TIMINGS.SEQUENTIAL_FLOW.ANSWERING_ANIMATION_WAIT_MS)
    
    setStepStates(prevStates => {
      const newStates = [...prevStates]
      const line5Index = newStates.length - 1
      if (newStates[line5Index] === "answering") {
        newStates[line5Index] = "completed"
      }
      return newStates
    })
    
    await wait(REASONING_MODEL_TIMINGS.SEQUENTIAL_FLOW.PAUSE_BEFORE_START_ANSWERING_MS)

    // 5. Start answering for a timer
    setShowAnswer(true)
    setIsStartAnswering(true)
    setIsAnsweringComplete(false)
    setIsAnswerRevealed(false)
    setAnimatedAnswerLines([false, false, false])
    
    // Animate answer lines sequentially
    const answerTimeout1 = setTimeout(() => setAnimatedAnswerLines([true, false, false]), REASONING_MODEL_TIMINGS.ANSWER_LINE_1_DELAY_MS)
    sequentialTimeoutsRef.current.push(answerTimeout1)
    const answerTimeout2 = setTimeout(() => setAnimatedAnswerLines([true, true, false]), REASONING_MODEL_TIMINGS.ANSWER_LINE_2_DELAY_MS)
    sequentialTimeoutsRef.current.push(answerTimeout2)
    const answerTimeout3 = setTimeout(() => setAnimatedAnswerLines([true, true, true]), REASONING_MODEL_TIMINGS.ANSWER_LINE_3_DELAY_MS)
    sequentialTimeoutsRef.current.push(answerTimeout3)
    const answerTimeout4 = setTimeout(() => setIsAnsweringComplete(true), REASONING_MODEL_TIMINGS.ANSWER_COMPLETE_DELAY_MS)
    sequentialTimeoutsRef.current.push(answerTimeout4)

    // Wait for answering timer
    await wait(REASONING_MODEL_TIMINGS.SEQUENTIAL_FLOW.ANSWERING_TIMER_MS)

    // 6. When timer done, reveal answer
    setIsAnswerTransitioning(true)
    setIsAnswerRevealed(true)
    setAnimatedAnswerLines([false, false, false])
    setIsStartAnswering(false)
    setIsAnsweringComplete(true)
    
    await wait(REASONING_MODEL_TIMINGS.ANSWER_TRANSITION_MS)
    setIsAnswerTransitioning(false)
    
    setIsRunningSequential(false)
  }, [isRunningSequential, steps, stepStates, showPlanSection, hasAddedTask, addedTaskIndex])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      thinkingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      planTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      startAnsweringTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      sequentialTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    }
  }, [])

  // Keep refs in sync with props
  useEffect(() => {
    onActionButtonsRef.current = onActionButtons
  }, [onActionButtons])

  useEffect(() => {
    onRetrievalReadyRef.current = onRetrievalReady
  }, [onRetrievalReady])

  useEffect(() => {
    onBeforeQueryTextRef.current = onBeforeQueryText
  }, [onBeforeQueryText])

  useEffect(() => {
    onFunctionsReadyRef.current = onFunctionsReady
  }, [onFunctionsReady])

  // Expose functions to parent component
  useEffect(() => {
    if (onFunctionsReadyRef.current) {
      onFunctionsReadyRef.current({
        runSequentialFlow: handleSequentialFlow,
        reset: handleReset,
      })
    }
  }, [handleSequentialFlow, handleReset])

  // Memoize the handleToggleQueryHighlight callback to keep it stable
  const handleToggleQueryHighlight = useCallback(() => {
    if (!showQueryText) {
      setShowQueryText(true)
      setIsQueryHighlighted(true)
    } else {
      setIsQueryHighlighted(!isQueryHighlighted)
    }
  }, [showQueryText, isQueryHighlighted])

  // Memoize buttons to avoid recreating on every render
  const buttons = useMemo(() => {
    return (
      <div className="flex flex-col gap-2 items-center">
        <div className="flex flex-row gap-2">
          <Button onClick={handleSequentialFlow} size="sm" variant={isRunningSequential ? "destructive" : "default"}>
            {isRunningSequential ? "Stop Sequence" : "Run Full Sequence"}
          </Button>
          <Button onClick={handleReset} size="sm">
            Reset
          </Button>
        </div>
          {isWaitingForContinue && (
            <Button 
              onClick={() => {
                // Resolve all waiting promises
                continueResolversRef.current.forEach((resolve) => {
                  resolve()
                })
                continueResolversRef.current.clear()
                setIsWaitingForContinue(false)
              }} 
              size="sm"
              variant="default"
              style={{ backgroundColor: "var(--traffic-light-green)", color: "white" }}
            >
              Continue
            </Button>
          )}
      </div>
    )
  }, [
    isRunningSequential,
    isThinking,
    showPlanSection,
    isStartAnswering,
    isAnswerRevealed,
    hasAddedTask,
    isQueryHighlighted,
    showQueryText,
    isWaitingForContinue,
    handleSequentialFlow,
    handleReset,
    handleToggleThinking,
    handleShowPlan,
    handleReplaceText,
    handleRetrieval,
    handleAnswer,
    handleToggleStartAnswering,
    handleRevealAnswer,
    handleToggleTask,
    handleToggleQueryHighlight,
  ])

  useEffect(() => {
    if (onActionButtonsRef.current) {
      onActionButtonsRef.current(buttons)
    }
  }, [buttons])

  return (
    <div style={{ position: "relative", width: "100%", margin: "0 auto", opacity: isActive ? 1 : "var(--inactive)" }}>
      <BrowserWindow
        title="SID Reasoning Retriever"
        menu={false}
        fitContent={true}
        content={
          <>
          <div className="" style={{ borderTop: "none" }}>
            <p className="styling-text line-height-1 mt-[var(--padding)]">
              <span className="styling-text font-bold" style={{ marginRight: "0.5em" }}>Query:</span>
              <span 
                className={isQueryHighlighted ? "text-focus-active" : ""} 
                style={{ 
                  position: "relative", 
                  display: "inline-block",
                  opacity: showQueryText ? 1 : 0, 
                  transition: `opacity ${REASONING_MODEL_TIMINGS.STATUS_TRANSITION_MS}ms ease-in-out`
                }}
              >
                <span style={{ position: "relative", zIndex: 1 }}>
                  {query}
                </span>
              </span>
            </p>
          </div>
            {showThinking && (
              <Section title="Thinking">
                <DummyParagraph
                  items={[
                    <DummyLine width="100%" height="var(--line-height-big)" className={animatedLines[0] ? "text-pulse" : ""} />, 
                    <DummyLine width="87%" height="var(--line-height-big)" className={animatedLines[1] ? "text-pulse" : ""} />,
                  ]}
                  gap="var(--gap-big)"
                />
              </Section>
            )}
            {showPlanSection && (
              <Section title="Plan">
                {steps
                  .map((step, index) => ({
                    step,
                    index
                  }))
                  .map(({ step, index }) => {
                    const isNewlyAdded = hasAddedTask && addedTaskIndex === index
                    const isVisible = showPlanSection ? visiblePlanSteps.has(index) : true
                    // For newly added tasks, only show (opacity 1) if typing has started
                    const shouldShow = isNewlyAdded ? newTaskTypingStarted : true
                    
                    return (
                      <div
                        key={`step-${index}-${step.question}`}
                        className={isVisible && !isNewlyAdded ? "plan-step-fade-in" : ""}
                        style={{
                          opacity: showPlanSection ? (isVisible && shouldShow ? 1 : 0) : 1,
                          transition: showPlanSection && !isNewlyAdded ? `opacity ${REASONING_MODEL_TIMINGS.STATUS_TRANSITION_MS}ms ease-in` : "none"
                        }}
                      >
                        <Step
                          step={step}
                          state={stepStates[index]}
                          shouldShow={true}
                          isNewlyAdded={isNewlyAdded}
                          onTypingStart={isNewlyAdded ? () => {
                            setNewTaskTypingStarted(true)
                          } : undefined}
                        />
                      </div>
                    )
                  })}
              </Section>
            )}
            {showAnswer && <AnswerSection borderTop={true} animatedLines={isAnswerRevealed ? undefined : (isStartAnswering ? animatedAnswerLines : undefined)} showText={isAnswerRevealed ? false : true} isTransitioning={isAnswerTransitioning} />}
          </>
        }
      />
    </div>
  )
}

