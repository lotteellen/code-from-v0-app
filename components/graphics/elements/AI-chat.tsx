"use client"

import React, { useState, useEffect, useCallback } from "react"
import { ChevronRightIcon, Check, X } from "lucide-react";
import { BrowserWindow } from "../helpers/browser-window"
import { DummyLine, DummyParagraph } from "../helpers/dummy-helpers"
import { Button } from "@/components/ui/button"
import { AI_CHAT_TIMINGS } from "../helpers/animation-timings"
import "../helpers/globals.css"

const DEFAULT_FIRST_LINE: string = "What was our enterprise pricing"
const DEFAULT_SECOND_LINE: string = "before we pivoted to SMB?"


export const userMessage = ({
  highlightLine1 = false,
  highlightLine2 = false,
  animate = false,
  style,
  firstLine = DEFAULT_FIRST_LINE,
  secondLine = DEFAULT_SECOND_LINE,
}: { 
  highlightLine1?: boolean;
  highlightLine2?: boolean;
  animate?: boolean;
  style?: React.CSSProperties;
  firstLine?: string;
  secondLine?: string;
}) => {
  return (
    <div className={`w-full flex justify-between pt-[var(--padding)] ${animate ? 'user-message-animate' : ''}`} style={style}>
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
            <div className="styling-text" style={{ whiteSpace: "normal", lineHeight: "1.3", position: "relative" }}>
              <div style={{ position: "relative", display: "block" }}>
                <span className={highlightLine1 ? "text-focus-active" : ""} style={{ position: "relative", display: "inline-block" }}>
                  <span style={{ position: "relative", zIndex: 1 }}>
                    {firstLine}
                  </span>
                </span>
              </div>
              <div style={{ position: "relative", display: "block" }}>
                <span className={highlightLine2 ? "text-focus-active" : ""} style={{ position: "relative", display: "inline-block" }}>
                  <span style={{ position: "relative", zIndex: 1 }}>
                    {secondLine}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export function AIChatCard({ 
  title = "AI Chat", 
  answer,
  onActionButtons,
  isCorrect = true,
  onFunctionsReady,
  width = "200px",
  query,
  isActive = true,
}: { 
  title?: string; 
  answer?: string; 
  onActionButtons?: (buttons: React.ReactNode) => void;
  isCorrect?: boolean;
  onFunctionsReady?: (functions: {
    animateUserMessage: () => Promise<void>;
    unhighlightLines: () => Promise<void>;
    animateAssistantMessage: () => Promise<void>;
    reset: () => void;
  }) => void;
  width?: string;
  query?: string;
  isActive?: boolean;
}) {
  // Parse query into two lines if provided, otherwise use defaults
  // Try to split at natural break points (after "pricing", "before", etc.)
  const getQueryLines = (queryText: string): [string, string] => {
    const words = queryText.split(/\s+/);
    const midPoint = Math.ceil(words.length / 2);
    
    // Try to find a natural break point near the middle
    const breakWords = ['before', 'after', 'when', 'where', 'how', 'why'];
    let splitIndex = midPoint;
    
    for (let i = Math.max(0, midPoint - 3); i < Math.min(words.length, midPoint + 3); i++) {
      if (breakWords.some(bw => words[i].toLowerCase() === bw.toLowerCase())) {
        splitIndex = i;
        break;
      }
    }
    
    const firstLine = words.slice(0, splitIndex).join(' ');
    const secondLine = words.slice(splitIndex).join(' ');
    return [firstLine, secondLine];
  };
  
  const [firstLine, secondLine] = query 
    ? getQueryLines(query)
    : [DEFAULT_FIRST_LINE, DEFAULT_SECOND_LINE];
  // Determine answer based on isCorrect if answer prop is not provided
  const displayAnswer = answer ?? (isCorrect ? "$99/month/seat + $500 setup" : "$499 / month / seat");
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
  const userTimeoutsRef = React.useRef<NodeJS.Timeout[]>([])
  const assistantTimeoutsRef = React.useRef<NodeJS.Timeout[]>([])
  const indicatorTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const indicatorRef = React.useRef<HTMLDivElement>(null)
  const onActionButtonsRef = React.useRef(onActionButtons)

  // Keep ref in sync with prop
  useEffect(() => {
    onActionButtonsRef.current = onActionButtons
  }, [onActionButtons])

  // Calculate path lengths for animation when indicator is shown
  useEffect(() => {
    if (showIndicator && indicatorRef.current) {
      // Use requestAnimationFrame to ensure SVG is rendered
      requestAnimationFrame(() => {
        const svg = indicatorRef.current?.querySelector('svg')
        if (svg) {
          const isCheck = svg.classList.contains('indicator-check')
          const paths = svg.querySelectorAll('path')
          paths.forEach((path) => {
            const pathElement = path as SVGPathElement
            const length = pathElement.getTotalLength()
            if (length > 0) {
              // Set individual path length as CSS variable for animation
              path.style.setProperty('--path-length', `${length}`)
              
              // For checkmark, reverse the path to animate from the end
              if (isCheck) {
                const pathData = pathElement.getAttribute('d')
                if (pathData) {
                  // Sample points along the path
                  const points: { x: number; y: number }[] = []
                  const numSamples = 100
                  for (let i = 0; i <= numSamples; i++) {
                    const point = pathElement.getPointAtLength((length * i) / numSamples)
                    points.push({ x: point.x, y: point.y })
                  }
                  
                  // Reverse the points and rebuild as a simple line path
                  points.reverse()
                  
                  if (points.length >= 2) {
                    let reversedPath = `M ${points[0].x} ${points[0].y}`
                    for (let i = 1; i < points.length; i++) {
                      reversedPath += ` L ${points[i].x} ${points[i].y}`
                    }
                    pathElement.setAttribute('d', reversedPath)
                  }
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
      userTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      userTimeoutsRef.current = []
      assistantTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      assistantTimeoutsRef.current = []
      if (indicatorTimeoutRef.current) {
        clearTimeout(indicatorTimeoutRef.current)
      }
    }
  }, [])

  const animateUserMessage = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      // Clear any existing timeouts
      userTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      userTimeoutsRef.current = []

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
        
        // Wait for animation to complete, then highlight both lines
        const animationTimeout = setTimeout(() => {
          setHighlightLine1(true)
          setHighlightLine2(true)
          setIsUserAnimating(false)
          resolve()
        }, AI_CHAT_TIMINGS.USER_MESSAGE_ANIMATION_MS)
        
        userTimeoutsRef.current.push(animationTimeout)
      }, AI_CHAT_TIMINGS.USER_MESSAGE_START_DELAY_MS)
      
      userTimeoutsRef.current = [startDelayTimeout]
    })
  }, [isUserAnimating])

  const unhighlightLines = useCallback((): Promise<void> => {
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
      assistantTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      assistantTimeoutsRef.current = []
      if (indicatorTimeoutRef.current) {
        clearTimeout(indicatorTimeoutRef.current)
        indicatorTimeoutRef.current = null
      }

      if (isAssistantAnimating) {
        // Reset animation
        setIsAssistantAnimating(false)
        setRevealLine1(false)
        setRevealLine2(false)
        setRevealAnswer(false)
        setRevealLine3(false)
        setShowIndicator(false)
        setIsIndicatorAnimating(false)
        resolve()
        return
      }

      setIsAssistantAnimating(true)
      setRevealLine1(false)
      setRevealLine2(false)
      setRevealAnswer(false)
      setRevealLine3(false)
      setShowIndicator(false)
      setIsIndicatorAnimating(false)
      
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
      
      // Wait for line3 animation to complete before showing indicator
      const timeout5 = setTimeout(() => {
        setIsAssistantAnimating(false)
        
        // Automatically trigger indicator animation after ALL assistant animations complete
        setIsIndicatorAnimating(true)
        const indicatorTimeout = setTimeout(() => {
          setShowIndicator(true)
          // Mark indicator animation as complete after it finishes
          const completeTimeout = setTimeout(() => {
            setIsIndicatorAnimating(false)
            resolve()
          }, AI_CHAT_TIMINGS.INDICATOR_DURATION_MS)
          indicatorTimeoutRef.current = completeTimeout
        }, 0)
        indicatorTimeoutRef.current = indicatorTimeout
      }, AI_CHAT_TIMINGS.INDICATOR_START_DELAY_MS)
      
      assistantTimeoutsRef.current = [timeout1, timeout2, timeout3, timeout4, timeout5]
    })
  }, [isAssistantAnimating])

  const resetAll = useCallback(() => {
    // Clear all timeouts
    userTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    userTimeoutsRef.current = []
    assistantTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    assistantTimeoutsRef.current = []
    if (indicatorTimeoutRef.current) {
      clearTimeout(indicatorTimeoutRef.current)
      indicatorTimeoutRef.current = null
    }
    
    // Reset all animation states
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

  const content = (
    <div className="h-full justify-between">
    <div className="h-fit flex flex-col gap-[var(--padding)]">
      <div style={{ display: showUserMessage ? undefined : 'none' }}>
        {userMessage({
          highlightLine1: highlightLine1,
          highlightLine2: highlightLine2,
          animate: userMessageAnimate,
          firstLine,
          secondLine,
        })}
      </div>
      <div className="w-full px-10">
        <DummyParagraph items={[
          <DummyLine 
            key="line1" 
            width="100%" 
            height="var(--line-height-big)" 
            className={revealLine1 ? "assistant-line-reveal" : ""}
            style={{ 
              clipPath: revealLine1 ? undefined : "inset(0 100% 0 0)",
              overflow: "hidden"
            }}
          />,
          <DummyLine 
            key="line2" 
            width="85%" 
            height="var(--line-height-big)" 
            className={revealLine2 ? "assistant-line-reveal" : ""}
            style={{ 
              clipPath: revealLine2 ? undefined : "inset(0 100% 0 0)",
              overflow: "hidden"
            }}
          />,
          <span 
            key="answer" 
            className={`styling-text line-height-1 font-bold ${revealAnswer ? "assistant-line-reveal" : ""}`}
            style={{ 
              clipPath: revealAnswer ? undefined : "inset(0 100% 0 0)",
              display: "inline-block",
              position: "relative",
              overflow: "hidden",
              color: isCorrect ? "var(--traffic-light-green)" : "var(--traffic-light-red)"
            }}
          >
            {displayAnswer}
          </span>,
          <DummyLine 
            key="line3" 
            width="100%" 
            height="var(--line-height-big)" 
            className={revealLine3 ? "assistant-line-reveal" : ""}
            style={{ 
              clipPath: revealLine3 ? undefined : "inset(0 100% 0 0)",
              overflow: "hidden"
            }}
          />,
        ]} gap="var(--gap-big)" />
      </div>
      </div>
      {/* Input field at bottom */}
      <div className="mx-10 flex justify-end items-center" style={{ padding: '1px', border: '1px solid var(--light-grey)', borderRadius: 'var(--border-radius)', height: 'fit-content', lineHeight: 0 }}>
      <ChevronRightIcon className="w-[6px] h-[6px] text-[var(--medium-light-grey)]" style={{ display: 'block' }} />
      </div>
    </div>
  );

  // Expose functions to parent component
  useEffect(() => {
    if (onFunctionsReady) {
      onFunctionsReady({
        animateUserMessage,
        unhighlightLines,
        animateAssistantMessage,
        reset: resetAll,
      })
    }
  }, [onFunctionsReady, animateUserMessage, unhighlightLines, animateAssistantMessage, resetAll])

  useEffect(() => {
    if (onActionButtonsRef.current) {
      const buttons = (
        <div className="flex gap-2">
    
          <Button onClick={() => animateUserMessage()} size="sm">
            {isUserAnimating ? "Stop User" : "Animate User + Highlight"}
          </Button>
          <Button onClick={() => unhighlightLines()} size="sm">
            Unhighlight
          </Button>
          <Button onClick={() => animateAssistantMessage()} size="sm">
            {isAssistantAnimating ? "Stop Assistant" : "Animate Assistant"}
          </Button>
          <Button onClick={resetAll} size="sm" variant="outline">
            Reset All
          </Button>
        </div>
      )
      onActionButtonsRef.current(buttons)
    }
  }, [isUserAnimating, isAssistantAnimating, animateUserMessage, unhighlightLines, animateAssistantMessage, resetAll])

  return (
    <div className="relative" style={{ width: width, opacity: isActive ? 1 : "var(--inactive)" }}>
      <BrowserWindow title={title} content={content} />
      {showIndicator && (
        <div 
          ref={indicatorRef}
          className="absolute flex items-center justify-center indicator-path-reveal"
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
                flexShrink: 0 
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
                flexShrink: 0 
              }} 
            />
          )}
        </div>
      )}
    </div>
  );
}
