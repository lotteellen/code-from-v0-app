"use client"

import React, { useState, useEffect } from "react"
import { ChevronRightIcon } from "lucide-react";
import { BrowserWindow } from "./helpers/browser-window"
import { DummyLine, DummyParagraph } from "./helpers/dummy-helpers"
import { Button } from "@/components/ui/button"
import "./helpers/globals.css"

const firstLine: string = "What was our enterprise pricing"
const secondLine: string = "before we pivoted to SMB?"


export const userMessage = ({
  highlightLine1 = false,
  highlightLine2 = false,
  animate = false,
  style
}: { 
  highlightLine1?: boolean;
  highlightLine2?: boolean;
  animate?: boolean;
  style?: React.CSSProperties 
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

export function ChatGPTCard({ 
  title = "AI Chat", 
  answer = "$499 / month / seat", 
}: { 
  title?: string; 
  answer?: string; 
  firstLine?: string;
  secondLine?: string;
}) {
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
  const userTimeoutsRef = React.useRef<NodeJS.Timeout[]>([])
  const assistantTimeoutsRef = React.useRef<NodeJS.Timeout[]>([])

  // Automatically trigger line 2 right after line 1 appears, with no break
  useEffect(() => {
    if (highlightLine1 && !highlightLine2) {
      const timer = setTimeout(() => {
        setHighlightLine2(true)
      }, 50) // Small delay so line 1 appears first, then line 2 immediately after
      return () => clearTimeout(timer)
    }
  }, [highlightLine1, highlightLine2])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      userTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      userTimeoutsRef.current = []
      assistantTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      assistantTimeoutsRef.current = []
    }
  }, [])

  const handleHighlight = () => {
    if (!highlightLine1 && !highlightLine2) {
      setHighlightLine1(true)
    } else {
      setHighlightLine1(false)
      setHighlightLine2(false)
    }
  }

  const animateUserMessage = () => {
    // Clear any existing timeouts
    userTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    userTimeoutsRef.current = []

    if (isUserAnimating) {
      // Reset animation
      setIsUserAnimating(false)
      setUserMessageAnimate(false)
      setShowUserMessage(false)
      return
    }

    setIsUserAnimating(true)
    setUserMessageAnimate(false)
    setShowUserMessage(true)
    
    // Animate user message fade in from below
    setUserMessageAnimate(true)
    
    // Mark animation as complete after it finishes
    const timeout = setTimeout(() => {
      setIsUserAnimating(false)
    }, 500) // Duration of user message animation
    
    userTimeoutsRef.current = [timeout]
  }

  const animateAssistantMessage = () => {
    // Clear any existing timeouts
    assistantTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    assistantTimeoutsRef.current = []

    if (isAssistantAnimating) {
      // Reset animation
      setIsAssistantAnimating(false)
      setRevealLine1(false)
      setRevealLine2(false)
      setRevealAnswer(false)
      setRevealLine3(false)
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
    }, 0) // Start immediately
    
    const timeout2 = setTimeout(() => {
      setRevealLine2(true)
    }, 600) // After line1 reveal completes
    
    const timeout3 = setTimeout(() => {
      setRevealAnswer(true)
    }, 600 + 600) // After line2 reveal completes
    
    const timeout4 = setTimeout(() => {
      setRevealLine3(true)
      setIsAssistantAnimating(false)
    }, 600 + 600 + 600) // After answer reveal completes
    
    assistantTimeoutsRef.current = [timeout1, timeout2, timeout3, timeout4]
  }

  const resetAll = () => {
    // Clear all timeouts
    userTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    userTimeoutsRef.current = []
    assistantTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    assistantTimeoutsRef.current = []
    
    // Reset all animation states
    setIsUserAnimating(false)
    setIsAssistantAnimating(false)
    setUserMessageAnimate(false)
    setShowUserMessage(false) // Hide user message
    setRevealLine1(false)
    setRevealLine2(false)
    setRevealAnswer(false)
    setRevealLine3(false)
    
    // Reset highlight states
    setHighlightLine1(false)
    setHighlightLine2(false)
  }

  const content = (
    <div className="h-full justify-between">
    <div className="h-fit flex flex-col gap-[var(--padding)]">
      <div style={{ display: showUserMessage ? undefined : 'none' }}>
        {userMessage({
          highlightLine1: highlightLine1,
          highlightLine2: highlightLine2,
          animate: userMessageAnimate,
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
              overflow: "hidden"
            }}
          >
            {answer}
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button onClick={handleHighlight} size="sm">
          Highlight Line
        </Button>
        <Button onClick={animateUserMessage} size="sm">
          {isUserAnimating ? "Stop User" : "Animate User"}
        </Button>
        <Button onClick={animateAssistantMessage} size="sm">
          {isAssistantAnimating ? "Stop Assistant" : "Animate Assistant"}
        </Button>
        <Button onClick={resetAll} size="sm" variant="outline">
          Reset All
        </Button>
      </div>
      <BrowserWindow title={title} content={content} />
    </div>
  );
}
