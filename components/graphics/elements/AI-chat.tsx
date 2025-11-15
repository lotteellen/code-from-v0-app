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
            <div className="styling-text" style={{ whiteSpace: "normal", position: "relative" }}>
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
  showFinal = false,
}: { 
  title?: string; 
  answer?: string; 
  onActionButtons?: (buttons: React.ReactNode) => void;
  isCorrect?: boolean;
  onFunctionsReady?: (functions: {
    animateUserMessage: () => Promise<void>;
    unhighlightLines: () => Promise<void>;
    animateAssistantMessage: () => Promise<void>;
    animateIndicator: () => Promise<void>;
    reset: () => void;
  }) => void;
  width?: string;
  query?: string;
  isActive?: boolean;
  showFinal?: boolean;
}) {
  // Parse query into two lines if provided, otherwise use defaults
  const [firstLine, secondLine] = query 
    ? (() => {
        const words = query.split(/\s+/);
        const midPoint = Math.ceil(words.length / 2);
        return [
          words.slice(0, midPoint).join(' '),
          words.slice(midPoint).join(' ')
        ];
      })()
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
  const allTimeoutsRef = React.useRef<NodeJS.Timeout[]>([])
  const indicatorRef = React.useRef<HTMLDivElement>(null)
  const onActionButtonsRef = React.useRef(onActionButtons)

  // Set final state when showFinal prop is true
  useEffect(() => {
    if (showFinal) {
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
    }
  }, [showFinal])

  // Keep ref in sync with prop
  useEffect(() => {
    onActionButtonsRef.current = onActionButtons
  }, [onActionButtons])

  // Calculate path lengths for animation when indicator is shown
  useEffect(() => {
    if (showIndicator && indicatorRef.current) {
      requestAnimationFrame(() => {
        const svg = indicatorRef.current?.querySelector('svg')
        if (svg) {
          const isCheck = svg.classList.contains('indicator-check')
          const paths = svg.querySelectorAll('path')
          paths.forEach((path) => {
            const pathElement = path as SVGPathElement
            const length = pathElement.getTotalLength()
            if (length > 0) {
              path.style.setProperty('--path-length', `${length}`)
              
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
                    .map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)
                    .join(' ')
                  pathElement.setAttribute('d', reversedPath)
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
      allTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      allTimeoutsRef.current = []
    }
  }, [])

  const animateUserMessage = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      // Clear any existing timeouts
      allTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
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
        
        // Wait for animation to complete, then highlight both lines
        const animationTimeout = setTimeout(() => {
          setHighlightLine1(true)
          setHighlightLine2(true)
          setIsUserAnimating(false)
          resolve()
        }, AI_CHAT_TIMINGS.USER_MESSAGE_ANIMATION_MS)
        
        allTimeoutsRef.current.push(animationTimeout)
      }, AI_CHAT_TIMINGS.USER_MESSAGE_START_DELAY_MS)
      
      allTimeoutsRef.current.push(startDelayTimeout)
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
      allTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
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
      
      // Wait for line3 animation to complete
      const timeout5 = setTimeout(() => {
        setIsAssistantAnimating(false)
        resolve()
      }, AI_CHAT_TIMINGS.ASSISTANT_LINE_3_DELAY_MS + 400) // Wait for line3 animation to complete
      
      allTimeoutsRef.current = [timeout1, timeout2, timeout3, timeout4, timeout5]
    })
  }, [isAssistantAnimating])

  const animateIndicator = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      // Clear any existing timeouts
      allTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
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
      
      // Trigger indicator animation
      const indicatorTimeout = setTimeout(() => {
        setShowIndicator(true)
        // Mark indicator animation as complete after it finishes
        const completeTimeout = setTimeout(() => {
          setIsIndicatorAnimating(false)
          resolve()
        }, AI_CHAT_TIMINGS.INDICATOR_DURATION_MS)
        allTimeoutsRef.current.push(completeTimeout)
      }, 0)
      allTimeoutsRef.current.push(indicatorTimeout)
    })
  }, [isIndicatorAnimating])

  const resetAll = useCallback(() => {
    // Clear all timeouts
    allTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    allTimeoutsRef.current = []
    
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
      {/* User message container - always in DOM when showFinal is true to prevent layout shift */}
      <div style={{ 
        // Always render container when showFinal is true to reserve space
        display: showFinal ? 'block' : (showUserMessage ? 'block' : 'none'),
        // When showFinal is true, container is always visible and takes up space
        visibility: showFinal ? 'visible' : (showUserMessage ? 'visible' : 'hidden'),
        opacity: showFinal ? 1 : (showUserMessage ? 1 : 0),
        // Reserve minimum height when showFinal is true to prevent layout shift
        minHeight: showFinal ? '32px' : undefined,
      }}>
        {userMessage({
          highlightLine1: highlightLine1,
          highlightLine2: highlightLine2,
          animate: showFinal ? false : userMessageAnimate,
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
            className={showFinal ? "" : (revealLine1 ? "assistant-line-reveal" : "")}
            style={{ 
              clipPath: (showFinal || revealLine1) ? undefined : "inset(0 100% 0 0)",
              overflow: "hidden"
            }}
          />,
          <DummyLine 
            key="line2" 
            width="85%" 
            height="var(--line-height-big)" 
            className={showFinal ? "" : (revealLine2 ? "assistant-line-reveal" : "")}
            style={{ 
              clipPath: (showFinal || revealLine2) ? undefined : "inset(0 100% 0 0)",
              overflow: "hidden"
            }}
          />,
          <span 
            key="answer" 
            className={`styling-text font-bold ${showFinal ? "" : (revealAnswer ? "assistant-line-reveal" : "")}`}
            style={{ 
              clipPath: (showFinal || revealAnswer) ? undefined : "inset(0 100% 0 0)",
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
            className={showFinal ? "" : (revealLine3 ? "assistant-line-reveal" : "")}
            style={{ 
              clipPath: (showFinal || revealLine3) ? undefined : "inset(0 100% 0 0)",
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
        animateIndicator,
        reset: resetAll,
      })
    }
  }, [onFunctionsReady, animateUserMessage, unhighlightLines, animateAssistantMessage, animateIndicator, resetAll])

  // Generate debug buttons if onActionButtons is provided
  useEffect(() => {
    if (!onActionButtonsRef.current) return
    
    const buttons = (
      <div className="flex gap-2">
        <Button onClick={animateUserMessage} size="sm">
          {isUserAnimating ? "Stop User" : "Animate User + Highlight"}
        </Button>
        <Button onClick={unhighlightLines} size="sm">Unhighlight</Button>
        <Button onClick={animateAssistantMessage} size="sm">
          {isAssistantAnimating ? "Stop Assistant" : "Animate Assistant"}
        </Button>
        <Button onClick={animateIndicator} size="sm">
          {isIndicatorAnimating ? "Stop Indicator" : "Animate Check/Cross"}
        </Button>
        <Button onClick={resetAll} size="sm" variant="outline">Reset All</Button>
      </div>
    )
    onActionButtonsRef.current(buttons)
  }, [isUserAnimating, isAssistantAnimating, isIndicatorAnimating, animateUserMessage, unhighlightLines, animateAssistantMessage, animateIndicator, resetAll])

  return (
    <div className="relative" style={{ width: width, opacity: isActive ? 1 : "var(--inactive)" }}>
      <BrowserWindow title={title} content={content} />
      {showIndicator && (
        <div 
          ref={indicatorRef}
          className={`absolute flex items-center justify-center ${showFinal ? "" : "indicator-path-reveal"}`}
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
