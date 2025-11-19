"use client"

import React, { useState, useEffect, useCallback } from "react"
import { ChevronRightIcon, Check, X } from "lucide-react"
import { BrowserWindow } from "../helpers/browser-window"
import { DummyLine, DummyParagraph } from "../helpers/dummy-helpers"
import { AI_CHAT_TIMINGS, POST_REQUEST_TIMINGS } from "../helpers/animation-timings"
import "../helpers/globals.css"

const DEFAULT_FIRST_LINE: string = "What was our enterprise pricing"
const DEFAULT_SECOND_LINE: string = "before we pivoted to SMB?"

export type ChatGPTFunctions = {
  animateUserMessage: () => Promise<void>
  focus: () => Promise<void>
  unFocus: () => Promise<void>
  animateAssistantMessage: () => Promise<void>
  animateIndicator: () => Promise<void>
  setFinal: () => void
  reset: () => void
}

export const userMessage = ({
  highlightLine1 = false,
  highlightLine2 = false,
  animate = false,
  style,
  firstLine = DEFAULT_FIRST_LINE,
  secondLine = DEFAULT_SECOND_LINE,
}: {
  highlightLine1?: boolean
  highlightLine2?: boolean
  animate?: boolean
  style?: React.CSSProperties
  firstLine?: string
  secondLine?: string
}) => {
  return (
    <div
      className={`w-full flex justify-between pt-[var(--padding)] ${animate ? "user-message-animate" : ""}`}
      style={style}
    >
      <div className="flex justify-end w-full">
        <div
          style={{
            background: "var(--light-blue)",
            borderRadius: "var(--border-radius) var(--border-radius) 0px var(--border-radius)",
            padding: "4px 6px",
            maxWidth: "100px",
            position: "relative",
            display: "inline-flex",
          }}
        >
          <div className="styling-text" style={{ whiteSpace: "normal", position: "relative" }}>
            <div style={{ position: "relative", display: "block" }}>
              <span
                className={highlightLine1 ? "text-focus-active" : ""}
                style={{ position: "relative", display: "inline-block" }}
              >
                <span style={{ position: "relative", zIndex: 1 }}>{firstLine}</span>
              </span>
            </div>
            <div style={{ position: "relative", display: "block" }}>
              <span
                className={highlightLine2 ? "text-focus-active" : ""}
                style={{ position: "relative", display: "inline-block" }}
              >
                <span style={{ position: "relative", zIndex: 1 }}>{secondLine}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AIChat({
  answer,
  isCorrect = true,
  onFunctionsReady,
  query,
  isActive = true,
}: {
  answer?: string
  isCorrect?: boolean
  onFunctionsReady?: (functions: ChatGPTFunctions) => void
  query: string
  isActive?: boolean
}) {
  // Parse query into two lines
  const [firstLine, secondLine] = (() => {
    const words = query.split(/\s+/)
    const midPoint = Math.ceil(words.length / 2)
    return [words.slice(0, midPoint).join(" "), words.slice(midPoint).join(" ")]
  })()
  // Determine answer based on isCorrect if answer prop is not provided
  const displayAnswer =
    answer ?? (isCorrect ? "$99/month/seat + $500 setup" : "$499 / month / seat")
  const [highlightLine1, setHighlightLine1] = useState(false)
  const [highlightLine2, setHighlightLine2] = useState(false)
  const [isUserAnimating, setIsUserAnimating] = useState(false)
  const [isAssistantAnimating, setIsAssistantAnimating] = useState(false)
  const [userMessageAnimate, setUserMessageAnimate] = useState(false)
  const [showUserMessage, setShowUserMessage] = useState(false)
  const [revealLine1, setRevealLine1] = useState(false)
  const [revealLine2, setRevealLine2] = useState(false)
  const [revealAnswer, setRevealAnswer] = useState(false)
  const [revealLine3, setRevealLine3] = useState(false)
  const [showIndicator, setShowIndicator] = useState(false)
  const [isIndicatorAnimating, setIsIndicatorAnimating] = useState(false)
  const [isFinal, setIsFinal] = useState(false)
  const allTimeoutsRef = React.useRef<NodeJS.Timeout[]>([])
  const indicatorRef = React.useRef<HTMLDivElement>(null)

  // Calculate path lengths for animation when indicator is shown
  useEffect(() => {
    if (showIndicator && indicatorRef.current) {
      requestAnimationFrame(() => {
        const svg = indicatorRef.current?.querySelector("svg")
        if (svg) {
          const isCheck = svg.classList.contains("indicator-check")
          const paths = svg.querySelectorAll("path")
          paths.forEach((path) => {
            const pathElement = path as SVGPathElement
            const length = pathElement.getTotalLength()
            if (length > 0) {
              path.style.setProperty("--path-length", `${length}`)

              // For checkmark, reverse the path to animate from bottom-left to top-right
              if (isCheck) {
                const numSamples = 50 // Reduced from 100 for better performance
                const points: { x: number; y: number }[] = []
                for (let i = 0; i <= numSamples; i++) {
                  const point = pathElement.getPointAtLength((length * i) / numSamples)
                  points.push({ x: point.x, y: point.y })
                }

                // Reverse and rebuild path
                if (points.length >= 2) {
                  const reversedPath = points
                    .reverse()
                    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
                    .join(" ")
                  pathElement.setAttribute("d", reversedPath)
                }
              }
            }
          })
        }
      })
    }
  }, [showIndicator])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      allTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      allTimeoutsRef.current = []
    }
  }, [])

  const animateUserMessage = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      // Clear any existing timeouts
      allTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      allTimeoutsRef.current = []

      if (isUserAnimating) {
        // Reset animation
        setIsUserAnimating(false)
        setUserMessageAnimate(false)
        setShowUserMessage(false)
        setHighlightLine1(false)
        setHighlightLine2(false)
        resolve()
        return
      }

      setIsUserAnimating(true)
      setUserMessageAnimate(false)
      setShowUserMessage(false) // Keep message hidden during delay
      setHighlightLine1(false)
      setHighlightLine2(false)

      // Wait for initial delay before starting animation
      const startDelayTimeout = setTimeout(() => {
        // Show message and start animation
        setShowUserMessage(true)
        // Animate user message fade in from below
        setUserMessageAnimate(true)

        // Wait for animation to complete
        const animationTimeout = setTimeout(() => {
          setIsUserAnimating(false)
          resolve()
        }, AI_CHAT_TIMINGS.USER_MESSAGE_ANIMATION_MS)

        allTimeoutsRef.current.push(animationTimeout)
      }, AI_CHAT_TIMINGS.USER_MESSAGE_START_DELAY_MS)

      allTimeoutsRef.current.push(startDelayTimeout)
    })
  }, [isUserAnimating])

  const focus = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      setHighlightLine1(true)
      setHighlightLine2(true)
      // Resolve immediately as highlighting is instant
      setTimeout(() => resolve(), 0)
    })
  }, [])

  const unFocus = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      setHighlightLine1(false)
      setHighlightLine2(false)
      // Resolve immediately as unhighlighting is instant
      setTimeout(() => resolve(), 0)
    })
  }, [])

  const animateAssistantMessage = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      // Clear any existing timeouts
      allTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      allTimeoutsRef.current = []

      if (isAssistantAnimating) {
        // Reset animation
        setIsAssistantAnimating(false)
        setRevealLine1(false)
        setRevealLine2(false)
        setRevealAnswer(false)
        setRevealLine3(false)
        resolve()
        return
      }

      setIsAssistantAnimating(true)
      setRevealLine1(false)
      setRevealLine2(false)
      setRevealAnswer(false)
      setRevealLine3(false)

      // Start revealing assistant lines sequentially
      const timeout1 = setTimeout(() => {
        setRevealLine1(true)
      }, AI_CHAT_TIMINGS.ASSISTANT_LINE_1_DELAY_MS)

      const timeout2 = setTimeout(() => {
        setRevealLine2(true)
      }, AI_CHAT_TIMINGS.ASSISTANT_LINE_2_DELAY_MS)

      const timeout3 = setTimeout(() => {
        setRevealAnswer(true)
      }, AI_CHAT_TIMINGS.ASSISTANT_ANSWER_DELAY_MS)

      const timeout4 = setTimeout(() => {
        setRevealLine3(true)
      }, AI_CHAT_TIMINGS.ASSISTANT_LINE_3_DELAY_MS)

      // Calculate actual assistant message duration: last line delay + animation duration
      const ASSISTANT_LINE_ANIMATION_MS = 400 // CSS animation duration for assistant lines
      const totalDuration = AI_CHAT_TIMINGS.ASSISTANT_LINE_3_DELAY_MS + ASSISTANT_LINE_ANIMATION_MS // 1600ms + 400ms = 2000ms (two pulses)
      const timeout5 = setTimeout(() => {
        setIsAssistantAnimating(false)
        resolve()
      }, totalDuration) // Total duration matches actual assistant message completion

      allTimeoutsRef.current = [timeout1, timeout2, timeout3, timeout4, timeout5]
    })
  }, [isAssistantAnimating])

  const animateIndicator = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      // Clear any existing timeouts
      allTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      allTimeoutsRef.current = []

      if (isIndicatorAnimating) {
        // Reset animation
        setShowIndicator(false)
        setIsIndicatorAnimating(false)
        resolve()
        return
      }

      setIsIndicatorAnimating(true)
      setShowIndicator(false)

      // Trigger indicator animation after a quick break
      const indicatorTimeout = setTimeout(() => {
        setShowIndicator(true)
        // Mark indicator animation as complete after it finishes
        const completeTimeout = setTimeout(() => {
          setIsIndicatorAnimating(false)
          resolve()
        }, AI_CHAT_TIMINGS.INDICATOR_DURATION_MS)
        allTimeoutsRef.current.push(completeTimeout)
      }, AI_CHAT_TIMINGS.BREAK_BEFORE_INDICATOR_MS)
      allTimeoutsRef.current.push(indicatorTimeout)
    })
  }, [isIndicatorAnimating])

  const resetAll = useCallback(() => {
    // Clear all timeouts
    allTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    allTimeoutsRef.current = []

    // Reset all animation states
    setIsFinal(false)
    setIsUserAnimating(false)
    setIsAssistantAnimating(false)
    setUserMessageAnimate(false)
    setShowUserMessage(false) // Hide user message
    setRevealLine1(false)
    setRevealLine2(false)
    setRevealAnswer(false)
    setRevealLine3(false)
    setShowIndicator(false)
    setIsIndicatorAnimating(false)

    // Reset highlight states
    setHighlightLine1(false)
    setHighlightLine2(false)
  }, [])

  const handleSetFinal = useCallback(() => {
    setIsFinal(true)
    setShowUserMessage(true)
    setUserMessageAnimate(false)
    setHighlightLine1(false)
    setHighlightLine2(false)
    setRevealLine1(true)
    setRevealLine2(true)
    setRevealAnswer(true)
    setRevealLine3(true)
    setShowIndicator(true)
    setIsIndicatorAnimating(false)
  }, [])

  const content = (
    <div className="h-full justify-between">
      <div className="h-fit flex flex-col gap-[var(--padding)]">
        {/* User message container - always in DOM when isFinal is true to prevent layout shift */}
        <div
          style={{
            // Always render container when isFinal is true to reserve space
            display: isFinal ? "block" : showUserMessage ? "block" : "none",
            // When isFinal is true, container is always visible and takes up space
            visibility: isFinal ? "visible" : showUserMessage ? "visible" : "hidden",
            opacity: isFinal ? 1 : showUserMessage ? 1 : 0,
            // Reserve minimum height when isFinal is true to prevent layout shift
            minHeight: isFinal ? "32px" : undefined,
          }}
        >
          {userMessage({
            highlightLine1: highlightLine1,
            highlightLine2: highlightLine2,
            animate: isFinal ? false : userMessageAnimate,
            firstLine,
            secondLine,
          })}
        </div>
        <div className="w-full px-10">
          <DummyParagraph
            items={[
              <DummyLine
                key="line1"
                width="100%"
                height="var(--line-height-big)"
                highlightClassName={isFinal ? "" : revealLine1 ? "assistant-line-reveal" : ""}
                customStyle={{
                  clipPath: isFinal || revealLine1 ? undefined : "inset(0 100% 0 0)",
                  overflow: "hidden",
                }}
              />,
              <DummyLine
                key="line2"
                width="85%"
                height="var(--line-height-big)"
                highlightClassName={isFinal ? "" : revealLine2 ? "assistant-line-reveal" : ""}
                customStyle={{
                  clipPath: isFinal || revealLine2 ? undefined : "inset(0 100% 0 0)",
                  overflow: "hidden",
                }}
              />,
              <span
                key="answer"
                className={`styling-text font-bold ${isFinal ? "" : revealAnswer ? "assistant-line-reveal" : ""}`}
                style={{
                  clipPath: isFinal || revealAnswer ? undefined : "inset(0 100% 0 0)",
                  display: "inline-block",
                  position: "relative",
                  overflow: "hidden",
                  color: isFinal || showIndicator
                    ? isCorrect
                      ? "var(--traffic-light-green)"
                      : "var(--traffic-light-red)"
                    : "var(--dark-grey)",
                  transition: isFinal ? "none" : `color ${AI_CHAT_TIMINGS.INDICATOR_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                }}
              >
                {displayAnswer}
              </span>,
              <DummyLine
                key="line3"
                width="100%"
                height="var(--line-height-big)"
                highlightClassName={isFinal ? "" : revealLine3 ? "assistant-line-reveal" : ""}
                customStyle={{
                  clipPath: isFinal || revealLine3 ? undefined : "inset(0 100% 0 0)",
                  overflow: "hidden",
                }}
              />,
            ]}
            gap="var(--gap-big)"
          />
        </div>
      </div>
      {/* Input field at bottom */}
      <div
        className="mx-10 flex justify-end items-center"
        style={{
          padding: "1px",
          border: "1px solid var(--light-grey)",
          borderRadius: "var(--border-radius)",
          height: "fit-content",
          lineHeight: 0,
        }}
      >
        <ChevronRightIcon
          className="w-[6px] h-[6px] text-[var(--medium-light-grey)]"
          style={{ display: "block" }}
        />
      </div>
    </div>
  )

  // Expose functions to parent component
  useEffect(() => {
    if (onFunctionsReady) {
      onFunctionsReady({
        animateUserMessage,
        focus,
        unFocus,
        animateAssistantMessage,
        animateIndicator,
        setFinal: handleSetFinal,
        reset: resetAll,
      })
    }
  }, [
    onFunctionsReady,
    animateUserMessage,
    focus,
    unFocus,
    animateAssistantMessage,
    animateIndicator,
    handleSetFinal,
    resetAll,
  ])

  return (
    <div className="relative opacity-transition" style={{ width: "200px", opacity: isActive ? 1 : "var(--inactive)" }}>
      <BrowserWindow title="AI Chat" content={content} />
      {showIndicator && (
        <div
          ref={indicatorRef}
          className={`absolute flex items-center justify-center ${isFinal ? "" : "indicator-path-reveal"}`}
          style={{
            bottom: "-16px",
            right: "-16px",
            zIndex: 10,
            width: "40px",
            height: "40px",
          }}
        >
          {isCorrect ? (
            <Check
              className="indicator-check"
              style={{
                stroke: "var(--traffic-light-green)",
                fill: "none",
                width: "40px",
                height: "40px",
                strokeWidth: 3,
                flexShrink: 0,
              }}
            />
          ) : (
            <X
              className="indicator-x"
              style={{
                stroke: "var(--traffic-light-red)",
                fill: "none",
                width: "40px",
                height: "40px",
                strokeWidth: 3,
                flexShrink: 0,
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}
