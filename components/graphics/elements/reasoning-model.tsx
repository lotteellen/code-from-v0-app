"use client"

import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from "react"
import { BrowserWindow } from "../helpers/browser-window"
import { DummyLine, DummyParagraph } from "../helpers/dummy-helpers"
import {
  Section,
  type LineIconType,
  Search,
  Document,
  Answer,
  Checkbox,
  Spinner,
  Plus,
} from "../helpers/reasoning-components"
import { REASONING_MODEL_TIMINGS } from "../helpers/animation-timings"
import "../helpers/globals.css"

const STEP_DATA = {
  steps: [
    {
      question: "Where does user work?",
      answer: "Tomato, Inc.",
      documents_found: 12,
    },
    {
      question: "When did they pivot?",
      updated_question: "When did Tomato pivot to SMB?",
      answer: "March 2023",
      documents_found: 12,
    },
    {
      question: "Pricing before pivot?",
      updated_question: "Pricing before March 2023?",
      answer: "$499 / month / seat",
      documents_found: 7,
    },
    {
      question: "Pricing after pivot?",
      updated_question: "Pricing after March 2023?",
      answer: "$99 / month / seat",
      documents_found: 3,
    },
  ],
  final_answer: "$99/month/seat + $500 setup",
}

export const AnswerSection = ({
  borderTop,
  animatedText,
  animatedLines,
  showText = true,
  isTransitioning = false,
  noTopMargin = false,
}: {
  borderTop: boolean
  animatedText?: string
  animatedLines?: boolean[]
  showText?: boolean
  isTransitioning?: boolean
  noTopMargin?: boolean
}) => {
  // Use useMemo to ensure items array is stable and always includes all 5 lines from the start
  const items: React.ReactNode[] = useMemo(
    () => [
      <DummyLine
        key="line1"
        width="91%"
        height="var(--line-height-big)"
        highlightClassName={animatedLines?.[0] ? "text-pulse" : ""}
      />,
      <div
        key="answer"
        className={`flex flex-row items-center gap-[var(--gap-big)] relative ${animatedLines?.[1] ? "text-pulse" : ""}`}
        style={{ minHeight: "var(--line-height-big)" }}
      >
        <DummyLine width="24px" height="var(--line-height-big)" />
        <div className="relative" style={{ width: "92px", height: "var(--line-height-big)" }}>
          {/* Dummy line - fades out when revealing */}
          <div
            className="answer-dummy-line flex items-center"
            style={{
              position: isTransitioning ? "absolute" : showText ? "relative" : "absolute",
              top: isTransitioning || !showText ? 0 : undefined,
              left: isTransitioning || !showText ? 0 : undefined,
              opacity: showText ? 1 : 0,
              transition: `opacity ${REASONING_MODEL_TIMINGS.ANSWER_TRANSITION_MS}ms ease-in-out`,
              pointerEvents: showText ? "auto" : "none",
              zIndex: isTransitioning ? 1 : undefined,
              height: "var(--line-height-big)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <DummyLine width="92px" height="var(--line-height-big)" />
          </div>
          {/* Answer text - fades in when revealing */}
          <span
            className="styling-text font-bold w-[92px] h-[var(--line-height-big)] pl-[1px] overflow-visible answer-text flex items-center"
            style={{
              color: "var(--traffic-light-green)",
              fontWeight: "700",
              position: isTransitioning ? "absolute" : showText ? "absolute" : "relative",
              top: isTransitioning || showText ? "-1px" : undefined,
              left: isTransitioning || showText ? 0 : undefined,
              marginTop: !isTransitioning && !showText ? "-1px" : undefined,
              opacity: showText ? 0 : 1,
              transition: `opacity ${REASONING_MODEL_TIMINGS.ANSWER_TRANSITION_MS}ms ease-in-out`,
              pointerEvents: showText ? "none" : "auto",
              zIndex: isTransitioning ? 2 : undefined,
              display: "flex",
              alignItems: "center",
            }}
          >
            {animatedText !== undefined ? animatedText : STEP_DATA.final_answer}
          </span>
        </div>
        <DummyLine width="52px" height="var(--line-height-big)" />
      </div>,
    ],
    [animatedText, animatedLines, showText, isTransitioning]
  )

  return (
    <Section title="Answer" borderTop={borderTop} noTopMargin={noTopMargin}>
      <DummyParagraph items={items} gap="var(--gap-big)" />
    </Section>
  )
}

type StepState = "pending" | "active" | "updating" | "retrieving" | "answering" | "completed"

type StepData = {
  question: string
  updated_question?: string
  answer: string
  documents_found: number
}

// Helper to clear all timeouts in a ref array
function clearTimeouts(timeoutsRef: React.MutableRefObject<NodeJS.Timeout[]>) {
  timeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
  timeoutsRef.current = []
}

// Strip formatting markers to get plain text
function stripFormatting(text: string): string {
  return text.replace(/~[^~]+~/g, "").replace(/\*[^*]+\*/g, (match) => match.slice(1, -1))
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
    if (matchedText.startsWith("~") && matchedText.endsWith("~")) {
      // Strikethrough text
      const content = matchedText.slice(1, -1)
      parts.push(
        <span key={match.index} style={{ textDecoration: "line-through", opacity: 0.6 }}>
          {content}
        </span>
      )
    } else if (matchedText.startsWith("*") && matchedText.endsWith("*")) {
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

// Helper to find text position (full or partial match for typing animation)
function findTextPosition(searchArea: string, text: string, offset: number): { start: number; end: number; text: string } | null {
  const fullIndex = searchArea.indexOf(text)
  if (fullIndex !== -1) {
    return { start: offset + fullIndex, end: offset + fullIndex + text.length, text }
  }
  // Handle partial match during typing animation
  for (let i = text.length; i >= 1; i--) {
    const partial = text.slice(0, i)
    const partialIndex = searchArea.indexOf(partial)
    if (partialIndex !== -1) {
      return { start: offset + partialIndex, end: offset + partialIndex + partial.length, text: partial }
    }
  }
  return null
}

// Render text with only the new parts in bold
function renderTextWithBoldNewParts(
  fullText: string,
  newTextParts: string[],
  prefix: string = "",
  suffix: string = ""
): React.ReactNode {
  if (newTextParts.length === 0) return fullText

  const prefixLength = prefix.length
  const suffixLength = suffix.length
  const searchStart = prefixLength
  const searchEnd = fullText.length - suffixLength
  const searchArea = fullText.slice(searchStart, searchEnd)

  // Find all positions where new text parts appear
  const positions = newTextParts
    .map((part) => findTextPosition(searchArea, part, searchStart))
    .filter((pos): pos is { start: number; end: number; text: string } => pos !== null)
    .sort((a, b) => a.start - b.start)

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
    if (pos.start > currentIndex) {
      parts.push({ text: fullText.slice(currentIndex, pos.start), isBold: false })
    }
    parts.push({ text: pos.text, isBold: true })
    currentIndex = pos.end
  }

  if (currentIndex < fullText.length) {
    parts.push({ text: fullText.slice(currentIndex), isBold: false })
  }

  return (
    <>
      {parts.map((part, index) =>
        part.isBold ? (
          <span key={index} style={{ fontWeight: "600" }}>
            {part.text}
          </span>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </>
  )
}

function Step({
  step,
  state,
  shouldShow,
  isNewlyAdded = false,
  onTypingStart,
  isFinal = false,
}: {
  step: StepData
  state: StepState
  shouldShow: boolean
  isNewlyAdded?: boolean
  onTypingStart?: () => void
  isFinal?: boolean
}) {
  if (!shouldShow) return null

  // When isFinal is true, always treat state as "completed" for rendering
  const effectiveState: StepState = isFinal ? "completed" : state

  const [animatedText, setAnimatedText] = useState<string>(isNewlyAdded ? "" : "")
  const [isAnimating, setIsAnimating] = useState<boolean>(isNewlyAdded)
  const [isHighlighting, setIsHighlighting] = useState(false)
  const [highlightSuffix, setHighlightSuffix] = useState<string>("")
  const [highlightPrefix, setHighlightPrefix] = useState<string>("")
  const [highlightSuffixText, setHighlightSuffixText] = useState<string>("")
  const [finalSuffix, setFinalSuffix] = useState<string>("")
  const [newTextParts, setNewTextParts] = useState<string[]>([]) // Track parts of text that are newly typed
  const animationTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  const previousStateRef = useRef<StepState>(effectiveState)
  const [statusAnimationClass, setStatusAnimationClass] = useState<string>("")
  const hasTypedNewTaskRef = useRef<boolean>(false)

  // When isFinal is true, immediately set newTextParts for bold formatting
  useEffect(() => {
    if (isFinal && step.updated_question && effectiveState === "completed") {
      const oldText = step.question || ""
      const newTextPlain = stripFormatting(step.updated_question)

      // If oldText is empty (newly added task), show entire updated question in bold
      if (!oldText) {
        setAnimatedText(newTextPlain)
        setNewTextParts([newTextPlain])
        setIsAnimating(false)
        return
      }

      // Find common prefix and suffix
      const commonPrefixLength = findCommonPrefix(oldText, newTextPlain)
      const commonSuffixLength = findCommonSuffix(oldText, newTextPlain)

      const prefix = oldText.slice(0, commonPrefixLength)
      const suffix = oldText.slice(oldText.length - commonSuffixLength)
      const oldMiddle = oldText.slice(commonPrefixLength, oldText.length - commonSuffixLength)
      const newMiddle = newTextPlain.slice(
        commonPrefixLength,
        newTextPlain.length - commonSuffixLength
      )

      // Determine what parts are new
      let wordToHighlight = oldMiddle
      let firstPartToType = ""
      let secondPartToType = ""

      if (oldMiddle.includes(" ") && newMiddle.startsWith(oldMiddle.split(" ")[0])) {
        const firstOldWord = oldMiddle.split(" ")[0]
        wordToHighlight = firstOldWord
        const remainingNew = newMiddle.slice(firstOldWord.length)
        secondPartToType = remainingNew
      } else if (
        oldText === "When did they pivot?" &&
        newTextPlain === "When did Tomato pivot to SMB?"
      ) {
        wordToHighlight = "they"
        firstPartToType = "Tomato"
        secondPartToType = " to SMB"
      } else {
        firstPartToType = newMiddle
      }

      // Set the parts that should be bold
      const parts: string[] = []
      if (firstPartToType) parts.push(firstPartToType)
      if (secondPartToType) parts.push(secondPartToType)
      setNewTextParts(parts)

      // Set animatedText to the final updated question
      setAnimatedText(newTextPlain)
      setIsAnimating(false)
    }
  }, [isFinal, step.updated_question, step.question, effectiveState])

  // Handle text animation when state changes to "updating"
  useEffect(() => {
    // Skip animations when isFinal is true
    if (isFinal) {
      return
    }

    // Clear any existing animation timeouts
    clearTimeouts(animationTimeoutsRef)

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
      const newMiddle = newTextPlain.slice(
        commonPrefixLength,
        newTextPlain.length - commonSuffixLength
      )

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
      } else if (
        oldText === "When did they pivot?" &&
        newTextPlain === "When did Tomato pivot to SMB?"
      ) {
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
                const currentText =
                  prefix +
                  firstPartToType.slice(0, index) +
                  oldMiddle.slice(wordToHighlight.length) +
                  suffix
                setAnimatedText(currentText)
                if (index < firstPartToType.length) {
                  const timeout = setTimeout(
                    () => typeFirstPart(index + 1),
                    REASONING_MODEL_TIMINGS.TYPING_SPEED_MS_PER_CHAR
                  )
                  animationTimeoutsRef.current.push(timeout)
                } else {
                  // After first part is typed, type second part
                  if (secondPartToType) {
                    const typeSecondPart = (index: number) => {
                      if (index <= secondPartToType.length) {
                        const currentText =
                          prefix +
                          firstPartToType +
                          oldMiddle.slice(wordToHighlight.length) +
                          secondPartToType.slice(0, index) +
                          suffix
                        setAnimatedText(currentText)
                        if (index < secondPartToType.length) {
                          const timeout = setTimeout(
                            () => typeSecondPart(index + 1),
                            REASONING_MODEL_TIMINGS.TYPING_SPEED_MS_PER_CHAR
                          )
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
                const currentText =
                  prefix +
                  oldMiddle.slice(wordToHighlight.length) +
                  secondPartToType.slice(0, index) +
                  suffix
                setAnimatedText(currentText)
                if (index < secondPartToType.length) {
                  const timeout = setTimeout(
                    () => typeSecondPart(index + 1),
                    REASONING_MODEL_TIMINGS.TYPING_SPEED_MS_PER_CHAR
                  )
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
                  const timeout = setTimeout(
                    () => typeChar(index + 1),
                    REASONING_MODEL_TIMINGS.TYPING_SPEED_MS_PER_CHAR
                  )
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
      animationTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      animationTimeoutsRef.current = []
    }
  }, [state, step.question, step.updated_question, isFinal])

  // Handle typing animation for newly added tasks
  useEffect(() => {
    // Skip animations when isFinal is true
    if (isFinal) {
      return
    }

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
            const timeout = setTimeout(
              () => typeChar(index + 1),
              REASONING_MODEL_TIMINGS.TYPING_SPEED_MS_PER_CHAR
            )
            animationTimeoutsRef.current.push(timeout)
          } else {
            setIsAnimating(false)
          }
        }
      }
      // Start typing immediately
      typeChar(0)

      return () => {
        clearTimeouts(animationTimeoutsRef)
      }
    }
  }, [isNewlyAdded, state, step.question, onTypingStart, isFinal])

  // Handle status transition animations
  useEffect(() => {
    // Skip animations when isFinal is true
    if (isFinal) {
      setStatusAnimationClass("")
      previousStateRef.current = effectiveState
      return
    }

    const previousState = previousStateRef.current
    const shouldAnimate = (prev: StepState, curr: StepState) => {
      // Animate transitions between: retrieving -> answering -> completed
      return (
        (prev === "retrieving" && curr === "answering") ||
        (prev === "answering" && curr === "completed") ||
        (prev !== "retrieving" && curr === "retrieving")
      )
    }

    if (shouldAnimate(previousState, effectiveState)) {
      // Smooth fade out and in for all transitions
      setStatusAnimationClass("status-fade-in")
      const clearAnimationTimeout = setTimeout(() => {
        setStatusAnimationClass("")
      }, REASONING_MODEL_TIMINGS.STATUS_TRANSITION_MS)
      return () => clearTimeout(clearAnimationTimeout)
    } else {
      setStatusAnimationClass("")
    }

    previousStateRef.current = effectiveState
  }, [effectiveState, isFinal])

  const displayQuestion = isAnimating
    ? animatedText
    : effectiveState === "pending" || effectiveState === "active" || effectiveState === "updating"
      ? animatedText || step.question
      : step.updated_question || step.question
  const questionIcon: LineIconType =
    effectiveState === "pending" ? "open" : effectiveState === "completed" ? "done" : "spinner"
  const showDetails =
    effectiveState !== "pending" && effectiveState !== "active" && effectiveState !== "updating"

  const statusMessages = {
    active: "",
    updating: "",
    retrieving: "Retrieving",
    answering: "Reading",
    completed: step.answer,
  }

  const statusIconComponent =
    effectiveState === "completed" ? (
      <Answer />
    ) : effectiveState === "answering" ? (
      <Document />
    ) : (
      <Search />
    )

  const leftPart = (
    <div
      id="left-part"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        flex: "1 1 0",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      {questionIcon && (
        <div style={{ flexShrink: 0 }}>
          {isNewlyAdded && effectiveState === "pending" ? (
            <Plus />
          ) : questionIcon === "open" ? (
            <Checkbox checked={false} showFinal={isFinal} />
          ) : questionIcon === "done" ? (
            <Checkbox checked={true} showFinal={isFinal} />
          ) : questionIcon === "spinner" ? (
            <Spinner />
          ) : null}
        </div>
      )}
      <span
        className="styling-text"
        style={{
          color: "var(--dark-grey)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          minWidth: 0,
        }}
      >
        {isHighlighting ? (
          <>
            {highlightPrefix}
            <span
              className="text-focus-active"
              style={{ position: "relative", display: "inline-block" }}
            >
              <span style={{ position: "relative", zIndex: 1 }}>{highlightSuffix}</span>
            </span>
            {highlightSuffixText}
          </>
        ) : isAnimating && !isHighlighting && newTextParts.length > 0 ? (
          // During typing animation (not highlighting), show new text parts in bold
          renderTextWithBoldNewParts(displayQuestion, newTextParts)
        ) : effectiveState !== "pending" &&
          effectiveState !== "active" &&
          step.updated_question &&
          newTextParts.length > 0 ? (
          // After completion, show new text parts in bold
          renderTextWithBoldNewParts(displayQuestion, newTextParts)
        ) : displayQuestion.includes("~") || displayQuestion.includes("*") ? (
          parseFormattedText(displayQuestion)
        ) : (
          displayQuestion
        )}
      </span>
    </div>
  )

  const rightPart = showDetails ? (
    <div
      id="right-part"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "2px",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <div
        key={`icon-${effectiveState}`}
        className={statusAnimationClass}
        style={{ flexShrink: 0 }}
      >
        {statusIconComponent}
      </div>
      {effectiveState === "completed" ? (
        <span
          key={`text-${effectiveState}`}
          className={`styling-text ${statusAnimationClass}`}
          style={{
            color: "var(--traffic-light-green)",
            fontWeight: "500",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {statusMessages[effectiveState]}
        </span>
      ) : (
        <em
          key={`text-${effectiveState}`}
          className={`styling-text ${effectiveState === "retrieving" || effectiveState === "answering" ? "text-pulse" : ""} ${statusAnimationClass}`}
          style={{
            color: "var(--dark-grey)",
            fontStyle: "italic",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {statusMessages[effectiveState]}
        </em>
      )}
    </div>
  ) : null

  return (
    <div
      style={{
        marginBottom: "8px",
        transition: "all 0.1s ease",
        whiteSpace: "nowrap",
        width: "100%",
        paddingLeft: "4px",
        paddingRight: "4px",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          gap: "4px",
          minWidth: 0,
          minHeight: "6px",
          height: "6px",
        }}
      >
        {leftPart}
        {rightPart}
      </div>
    </div>
  )
}

export type ReasoningModelFunctions = {
  insertQueryText: () => Promise<void>
  runRemainingSequence: () => Promise<void>
  setFinal: () => void
  reset: () => void
  continueRetrieval: () => Promise<void>
}

export function ReasoningModel({
  onFunctionsReady,
  onRetrieve,
  isActive = true,
  query = "",
}: {
  onFunctionsReady?: (functions: ReasoningModelFunctions) => void
  onRetrieve?: (query: string) => Promise<void>
  isActive?: boolean
  query?: string
}) {
  const [steps, setSteps] = useState<StepData[]>(STEP_DATA.steps)
  const [stepStates, setStepStates] = useState<StepState[]>(STEP_DATA.steps.map(() => "pending"))
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
  const [isFinal, setIsFinal] = useState(false)
  const startAnsweringTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  const sequentialTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  const [isRunningSequential, setIsRunningSequential] = useState(false)
  const [isWaitingForRetrieval, setIsWaitingForRetrieval] = useState(false)
  const currentRetrievalQueryRef = useRef<string>("")
  const retrievalResolverRef = useRef<(() => void) | null>(null)
  const onFunctionsReadyRef = useRef(onFunctionsReady)
  const onRetrieveRef = useRef(onRetrieve)
  const retrievalPromisesRef = useRef<Map<number, Promise<void>>>(new Map())

  // Handler for setting final state
  const handleSetFinal = useCallback(() => {
    // Stop any running sequential flow when setting final state
    if (isRunningSequential) {
      clearTimeouts(sequentialTimeoutsRef)
      setIsRunningSequential(false)
    }

    // Clear all timeouts when setting final state to prevent conflicts
    clearTimeouts(thinkingTimeoutsRef)
    clearTimeouts(planTimeoutsRef)
    clearTimeouts(startAnsweringTimeoutsRef)

    // Add the additional task if not already added
    const finalQueryText = query || "What is the enterprise pricing?"
    if (!hasAddedTask) {
      const newTask: StepData = {
        question: "",
        updated_question: finalQueryText,
        answer: "$500 setup",
        documents_found: 2,
      }
      setSteps((prevSteps) => {
        const newSteps = [...prevSteps, newTask]
        const newIndex = newSteps.length - 1
        setAddedTaskIndex(newIndex)
        // Set all steps to completed (including the new task)
        setStepStates((prevStates) => [...prevStates, "completed"])
        setHasAddedTask(true)
        setNewTaskTypingStarted(true)
        // Show all plan steps including the new one
        setVisiblePlanSteps(new Set([...Array(newSteps.length).keys()]))
        return newSteps
      })
    } else {
      // Set all steps to completed (including the additional task if it exists)
      setStepStates((prevStates) => {
        // Ensure all plan steps are visible based on current step states length
        setVisiblePlanSteps(new Set([...Array(prevStates.length).keys()]))
        return prevStates.map(() => "completed")
      })
    }

    // Show answer section
    setShowAnswer(true)
    setIsAnswerRevealed(true)
    setIsAnswerTransitioning(false)
    setAnimatedAnswerLines([true, true, true])
    setIsAnsweringComplete(true)
    // Show thinking and plan sections
    setShowThinking(true)
    setShowPlanSection(true)
    setShowQueryText(true)
    setIsQueryHighlighted(false)
     // Set animated lines to show (no animation, just visible)
     // Don't set animatedLines to true when final - we want them visible but not pulsing
     setAnimatedLines([false, false, false])
     setIsThinking(false)
     setIsFinal(true)
   }, [query, hasAddedTask, isRunningSequential])

  const handleReset = useCallback(() => {
    // Stop any running sequential flow first
    if (isRunningSequential) {
      clearTimeouts(sequentialTimeoutsRef)
      setIsRunningSequential(false)
    }

    // Clear all timeouts
    clearTimeouts(thinkingTimeoutsRef)
    clearTimeouts(planTimeoutsRef)
    clearTimeouts(startAnsweringTimeoutsRef)
    clearTimeouts(sequentialTimeoutsRef)

    // Clear retrieval promises and state
    retrievalPromisesRef.current.clear()
    retrievalResolverRef.current = null
    setIsWaitingForRetrieval(false)
    currentRetrievalQueryRef.current = ""

    // Reset to initial state - just thinking section, no animations
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
    setIsRunningSequential(false)
    setIsFinal(false)
  }, [isRunningSequential])

  const thinkingTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  const planTimeoutsRef = useRef<NodeJS.Timeout[]>([])

  // Helper function to wait for a promise
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  // Consolidated animation helper: Animate lines sequentially
  // Can be used for both thinking lines and answer lines
  const animateLinesSequentially = (
    timeoutsRef: React.MutableRefObject<NodeJS.Timeout[]>,
    setAnimatedLines: React.Dispatch<React.SetStateAction<boolean[]>>,
    delays: [number, number, number],
    onComplete?: () => void,
    completeDelay?: number
  ) => {
    setAnimatedLines([false, false, false])
    const timeout1 = setTimeout(() => setAnimatedLines([true, false, false]), delays[0])
    timeoutsRef.current.push(timeout1)
    const timeout2 = setTimeout(() => setAnimatedLines([true, true, false]), delays[1])
    timeoutsRef.current.push(timeout2)
    const timeout3 = setTimeout(() => setAnimatedLines([true, true, true]), delays[2])
    timeoutsRef.current.push(timeout3)
    if (onComplete && completeDelay !== undefined) {
      const timeout4 = setTimeout(() => onComplete(), completeDelay)
      timeoutsRef.current.push(timeout4)
    }
  }

  // Helper function to perform retrieval - waits for manual trigger via continueRetrieval
  const performRetrieval = useCallback(async (retrievalText: string) => {
    // Store the query and wait for manual trigger
    currentRetrievalQueryRef.current = retrievalText
    setIsWaitingForRetrieval(true)
    
    // Return a promise that waits for continueRetrieval to be called
    return new Promise<void>((resolve) => {
      retrievalResolverRef.current = resolve
    })
  }, [])

  // Function to continue after retrieval is manually triggered
  const continueRetrieval = useCallback(async () => {
    if (!retrievalResolverRef.current) return
    
    // Trigger the retrieval callback if provided
    if (onRetrieveRef.current && currentRetrievalQueryRef.current) {
      await onRetrieveRef.current(currentRetrievalQueryRef.current)
    }
    
    // Resolve the promise to continue the sequence
    retrievalResolverRef.current()
    retrievalResolverRef.current = null
    setIsWaitingForRetrieval(false)
    currentRetrievalQueryRef.current = ""
  }, [])

  // Part 1: Insert query text and keep it highlighted
  const insertQueryText = useCallback(async () => {
    // Clear all existing timeouts
    clearTimeouts(thinkingTimeoutsRef)
    clearTimeouts(planTimeoutsRef)
    clearTimeouts(startAnsweringTimeoutsRef)
    clearTimeouts(sequentialTimeoutsRef)

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

    // Show query text without highlight
    // Ensure query text is visible immediately
    setShowQueryText(true)
    setIsQueryHighlighted(false)
    // Don't wait - just show it immediately
  }, [])

  // Part 2: Run the remaining sequence (unhighlight, thinking, plan, steps, etc.)
  const runRemainingSequence = useCallback(async () => {
    if (isRunningSequential) {
      // Stop the sequence
      clearTimeouts(sequentialTimeoutsRef)
      setIsRunningSequential(false)
      return
    }

    setIsRunningSequential(true)

    // 3. Remove highlight
    setIsQueryHighlighted(false)
    await wait(REASONING_MODEL_TIMINGS.SEQUENTIAL_FLOW.PAUSE_AFTER_REMOVE_HIGHLIGHT_MS)

    // 4. Show thinking section with thinking animation
    setShowThinking(true)
    setIsThinking(true)
    animateLinesSequentially(sequentialTimeoutsRef, setAnimatedLines, [
      REASONING_MODEL_TIMINGS.THINKING_LINE_1_DELAY_MS,
      REASONING_MODEL_TIMINGS.THINKING_LINE_2_DELAY_MS,
      REASONING_MODEL_TIMINGS.THINKING_LINE_3_DELAY_MS,
    ])

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
      setVisiblePlanSteps((prev) => new Set([...prev, allSteps[i].index]))
    }

    await wait(REASONING_MODEL_TIMINGS.SEQUENTIAL_FLOW.PLAN_DISPLAY_WAIT_MS)

    // 3. FOR EACH LINE 1-4: replace text -> retrieval -> answer
    for (let lineIndex = 0; lineIndex < 4; lineIndex++) {
      // Special handling for lines 2 and 3 (pricing questions) - process together
      if (lineIndex === 2) {
        // Replace text for both steps 2 and 3 at the same time
        setStepStates((prevStates) => {
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
        const typingTime2 = step2.updated_question
          ? stripFormatting(step2.updated_question).length *
              REASONING_MODEL_TIMINGS.TYPING_SPEED_MS_PER_CHAR +
            REASONING_MODEL_TIMINGS.TEXT_HIGHLIGHT_DURATION_MS +
            REASONING_MODEL_TIMINGS.PAUSE_BETWEEN_DELETE_AND_TYPE_MS
          : 500
        const typingTime3 = step3.updated_question
          ? stripFormatting(step3.updated_question).length *
              REASONING_MODEL_TIMINGS.TYPING_SPEED_MS_PER_CHAR +
            REASONING_MODEL_TIMINGS.TEXT_HIGHLIGHT_DURATION_MS +
            REASONING_MODEL_TIMINGS.PAUSE_BETWEEN_DELETE_AND_TYPE_MS
          : 500
        const maxTypingTime = Math.max(typingTime2, typingTime3)
        await wait(maxTypingTime)

        // Retrieval for both steps 2 and 3 at the same time
        setStepStates((prevStates) => {
          const newStates = [...prevStates]
          if (newStates[2] === "updating") {
            newStates[2] = "retrieving"
          }
          if (newStates[3] === "updating") {
            newStates[3] = "retrieving"
          }
          return newStates
        })

        // Single retrieval call for both steps - use retrieval
        const retrievalText = step2?.updated_question || step2?.question || ""
        await performRetrieval(retrievalText)

        // Move both directly from retrieving to answering (skip documents_found)
        setStepStates((prevStates) => {
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
        setStepStates((prevStates) => {
          const newStates = [...prevStates]
          if (newStates[2] === "answering") {
            newStates[2] = "completed"
          }
          return newStates
        })

        await wait(REASONING_MODEL_TIMINGS.SEQUENTIAL_FLOW.PAUSE_BEFORE_COMPLETE_STEP_3_MS)

        // Complete step 3
        setStepStates((prevStates) => {
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
        setStepStates((prevStates) => {
          const newStates = [...prevStates]
          if (newStates[lineIndex] === "pending" || newStates[lineIndex] === "active") {
            newStates[lineIndex] = "updating"
          }
          return newStates
        })

        // Wait for replace text animation to complete (estimate based on typing speed)
        const currentStep = STEP_DATA.steps[lineIndex]
        if (currentStep.updated_question) {
          const typingTime =
            stripFormatting(currentStep.updated_question).length *
              REASONING_MODEL_TIMINGS.TYPING_SPEED_MS_PER_CHAR +
            REASONING_MODEL_TIMINGS.TEXT_HIGHLIGHT_DURATION_MS +
            REASONING_MODEL_TIMINGS.PAUSE_BETWEEN_DELETE_AND_TYPE_MS
          await wait(typingTime)
        } else {
          await wait(500)
        }

        // Retrieval
        setStepStates((prevStates) => {
          const newStates = [...prevStates]
          if (newStates[lineIndex] === "updating") {
            newStates[lineIndex] = "retrieving"
          }
          return newStates
        })

        // Wait for retrieval to complete - use retrieval
        const retrievalText = currentStep?.updated_question || currentStep?.question || ""
        await performRetrieval(retrievalText)

        // Move directly from retrieving to answering (skip documents_found)
        setStepStates((prevStates) => {
          const newStates = [...prevStates]
          if (newStates[lineIndex] === "retrieving") {
            newStates[lineIndex] = "answering"
          }
          return newStates
        })

        await wait(REASONING_MODEL_TIMINGS.SEQUENTIAL_FLOW.ANSWERING_ANIMATION_WAIT_MS)

        setStepStates((prevStates) => {
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
      updated_question: "What is the enterprise pricing?",
      answer: "$500 setup",
      documents_found: 2,
    }

    // Calculate line5Index before state updates
    const line5Index = steps.length

    setSteps((prevSteps) => {
      const newSteps = [...prevSteps, newTask]
      setAddedTaskIndex(line5Index)
      setVisiblePlanSteps((prev) => new Set([...prev, line5Index]))
      return newSteps
    })
    setStepStates((prevStates) => [...prevStates, "pending"])
    setHasAddedTask(true)
    setNewTaskTypingStarted(true)

    // Wait for task to be added and typed
    const taskTypingTime =
      (newTask.updated_question || "").length * REASONING_MODEL_TIMINGS.TYPING_SPEED_MS_PER_CHAR +
      200
    await wait(taskTypingTime)

    // Replace text for line 5
    setStepStates((prevStates) => {
      const newStates = [...prevStates]
      if (newStates[line5Index] === "pending") {
        newStates[line5Index] = "updating"
      }
      return newStates
    })

    await wait(taskTypingTime) // Wait for replace text animation

    // Retrieval for line 5
    setStepStates((prevStates) => {
      const newStates = [...prevStates]
      if (newStates[line5Index] === "updating") {
        newStates[line5Index] = "retrieving"
      }
      return newStates
    })

    // Wait for retrieval to complete - use retrieval
    const retrievalText = newTask?.updated_question || newTask?.question || ""
    await performRetrieval(retrievalText)

    // Move directly from retrieving to answering (skip documents_found)
    setStepStates((prevStates) => {
      const newStates = [...prevStates]
      if (newStates[line5Index] === "retrieving") {
        newStates[line5Index] = "answering"
      }
      return newStates
    })

    await wait(REASONING_MODEL_TIMINGS.SEQUENTIAL_FLOW.ANSWERING_ANIMATION_WAIT_MS)

    setStepStates((prevStates) => {
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
    animateLinesSequentially(
      sequentialTimeoutsRef,
      setAnimatedAnswerLines,
      [
        REASONING_MODEL_TIMINGS.ANSWER_LINE_1_DELAY_MS,
        REASONING_MODEL_TIMINGS.ANSWER_LINE_2_DELAY_MS,
        REASONING_MODEL_TIMINGS.ANSWER_LINE_3_DELAY_MS,
      ],
      () => setIsAnsweringComplete(true),
      REASONING_MODEL_TIMINGS.ANSWER_COMPLETE_DELAY_MS
    )

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
  }, [
    isRunningSequential,
    steps,
    stepStates,
    showPlanSection,
    hasAddedTask,
    addedTaskIndex,
    performRetrieval,
  ])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearTimeouts(thinkingTimeoutsRef)
      clearTimeouts(planTimeoutsRef)
      clearTimeouts(startAnsweringTimeoutsRef)
      clearTimeouts(sequentialTimeoutsRef)
    }
  }, [])

  // Keep refs in sync with props
  useEffect(() => {
    onRetrieveRef.current = onRetrieve
  }, [onRetrieve])

  useEffect(() => {
    onFunctionsReadyRef.current = onFunctionsReady
  }, [onFunctionsReady])

  // Expose functions to parent component
  useEffect(() => {
    if (onFunctionsReadyRef.current) {
      onFunctionsReadyRef.current({
        insertQueryText: insertQueryText,
        runRemainingSequence: runRemainingSequence,
        setFinal: handleSetFinal,
        reset: handleReset,
        continueRetrieval: continueRetrieval,
      })
    }
  }, [insertQueryText, runRemainingSequence, handleSetFinal, handleReset, continueRetrieval])

  // Handler for resetting to initial state
  const handleResetToInitial = useCallback(() => {
    handleReset()
  }, [handleReset])

  return (
    <div
      className="opacity-transition"
      style={{
        position: "relative",
        width: "100%",
        margin: "0 auto",
        opacity: isActive ? 1 : "var(--inactive)",
      }}
    >
      <BrowserWindow
        title="SID Reasoning Retriever"
        menu={false}
        fitContent={true}
        content={
          <>
            <div className="" style={{ borderTop: "none" }}>
              <p className="styling-text mt-[var(--padding)]">
                <span className="styling-text font-bold" style={{ marginRight: "2px" }}>
                  Query:
                </span>
                <span
                  className={isQueryHighlighted ? "text-focus-active" : ""}
                  style={{
                    position: "relative",
                    display: "inline",
                    opacity: isFinal || showQueryText ? 1 : 0,
                    transition: "none",
                  }}
                >
                  <span style={{ position: "relative", zIndex: 1 }}>
                    {isFinal && !query
                      ? "What is the enterprise pricing?"
                      : query || "What is the enterprise pricing?"}
                  </span>
                </span>
              </p>
            </div>
            {showThinking && (
              <Section title="Thinking">
                <DummyParagraph
                  items={[
                    <DummyLine
                      width="100%"
                      height="var(--line-height-big)"
                      highlightClassName={isFinal || !animatedLines[0] ? "" : "text-pulse"}
                    />,
                    <DummyLine
                      width="87%"
                      height="var(--line-height-big)"
                      highlightClassName={isFinal || !animatedLines[1] ? "" : "text-pulse"}
                    />,
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
                    index,
                  }))
                  .map(({ step, index }) => {
                    const isNewlyAdded = hasAddedTask && addedTaskIndex === index
                    const isVisible = showPlanSection ? visiblePlanSteps.has(index) : true
                    // For newly added tasks, only show (opacity 1) if typing has started
                    const shouldShow = isNewlyAdded ? newTaskTypingStarted : true

                    return (
                      <div
                        key={`step-${index}-${step.question}`}
                        className={
                          isFinal || !isVisible || isNewlyAdded ? "" : "plan-step-fade-in"
                        }
                        style={{
                          opacity: isFinal
                            ? 1
                            : showPlanSection
                              ? isVisible && shouldShow
                                ? 1
                                : 0
                              : 1,
                          transition: isFinal
                            ? "none"
                            : showPlanSection && !isNewlyAdded
                              ? `opacity ${REASONING_MODEL_TIMINGS.STATUS_TRANSITION_MS}ms ease-in`
                              : "none",
                        }}
                      >
                        <Step
                          step={step}
                          state={stepStates[index]}
                          shouldShow={true}
                          isNewlyAdded={isNewlyAdded}
                          onTypingStart={
                            isNewlyAdded
                              ? () => {
                                  setNewTaskTypingStarted(true)
                                }
                              : undefined
                          }
                          isFinal={isFinal}
                        />
                      </div>
                    )
                  })}
              </Section>
            )}
            {showAnswer && (
              <AnswerSection
                borderTop={true}
                animatedLines={
                  isFinal
                    ? undefined
                    : isAnswerRevealed
                      ? undefined
                      : isStartAnswering
                        ? animatedAnswerLines
                        : undefined
                }
                showText={isFinal ? false : isAnswerRevealed ? false : true}
                isTransitioning={isFinal ? false : isAnswerTransitioning}
              />
            )}
          </>
        }
      />
    </div>
  )
}
