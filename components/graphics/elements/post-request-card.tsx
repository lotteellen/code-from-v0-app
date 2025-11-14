"use client"

import { IBM_Plex_Mono } from 'next/font/google'
import { useState, useRef, useEffect, useCallback } from 'react'
import { BrowserWindow } from "../helpers/browser-window"
import { DummyLine } from "../helpers/dummy-helpers"
import { AnswerSection } from './reasoning-model-card'
import { userMessage } from './AI-chat'
import { Document } from '../helpers/document'
import { DocumentVariants } from './document-variants'
import { Button } from '@/components/ui/button'
import { POST_REQUEST_TIMINGS, RAG_HIGHLIGHT_TIMINGS } from "../helpers/animation-timings"
import "../helpers/globals.css"

const dummyHeight = "var(--line-height-big)"
const dummyColor = "var(--light-grey)"

const ibmPlexMono = IBM_Plex_Mono({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
})

const indent = "8px"
const height = "10.5px"

const createOriginalContent = (withSID: boolean = true) => (
  <div className={`${ibmPlexMono.className} pt-[var(--padding)] h-full text-[7px] font-normal`}>
    <div className="flex flex-col">
      <div className="flex items-center gap-[var(--gap-small)]">
        <span className="syntax-keyword">const</span>
        <span className="syntax-variable">answer</span>
        <span className="syntax-punctuation">=</span>
        <span className="syntax-keyword">await</span>
        <span className="syntax-variable">AI</span>
        <DummyLine width="80px" height={dummyHeight} background={dummyColor} />
      </div>
      <div className="flex items-center gap-0" style={{ marginLeft: indent }}>
        <span className="syntax-property">model</span>
        <span className="syntax-punctuation pr-[var(--gap-small)]">:</span>
        <DummyLine width="30px" height={dummyHeight} background={dummyColor} />
      </div>
      {!withSID && (
        <div className="flex items-center gap-0" style={{ marginLeft: indent }}>
          <span className="syntax-property">documents</span>
          <span className="syntax-punctuation pr-[var(--gap-small)]">:</span>
          <span className="syntax-punctuation">[</span>
          <DummyLine width="40px" height={dummyHeight} background={dummyColor} />
          <span className="syntax-punctuation">]</span>
        </div>
      )}
      <div className="flex items-center gap-0" style={{ marginLeft: indent }}>
        <span className="syntax-property">messages</span>
        <span className="syntax-punctuation pr-[var(--gap-small)]">:</span>
        <DummyLine width="8px" height={dummyHeight} background={dummyColor} />
      </div>
            <div className="syntax-punctuation" style={{ marginLeft: `calc(${indent} * 2)` }}>{"{"}</div>
            <div className="flex items-center" style={{ marginLeft: `calc(${indent} * 3)`, height: height }}>
              <DummyLine width="50px" height={dummyHeight} background={dummyColor} />
            </div>
            <div className="flex items-center gap-0" style={{ marginLeft: `calc(${indent} * 3)` }}>
            <span className="syntax-property">content</span>
            <span className="syntax-punctuation">:</span>
            <span className="syntax-string">{'`'}</span>
            {withSID ? (
              <>
                <span className="syntax-string">{'${'}</span>
                <span className="syntax-variable">context</span>
                <span className="syntax-string">{'}'}</span>
              </>
            ) : (
              <>
                <span className="syntax-string">{'${'}</span>
                <span className="syntax-variable">documents</span>
                <span className="syntax-punctuation">.</span>
                <span className="syntax-property">join</span>
                <span className="syntax-punctuation">(</span>
                <span className="syntax-string">'\\n'</span>
                <span className="syntax-punctuation">)</span>
                <span className="syntax-string">{'}'}</span>
              </>
            )}
            <span className="syntax-string">{'\\n\\n'}</span>
            <span className="syntax-string">{'${'}</span>
            <span className="syntax-variable">message</span>
            <span className="syntax-string">{'}'}</span>
            <span className="syntax-string">{'`'}</span>
            </div>
          <div className="syntax-punctuation" style={{ marginLeft: `calc(${indent} * 2)` }}>{"}"}</div>
      <div className="flex items-center" style={{ marginLeft: indent, height: height }}>
        <DummyLine width="8px" height={dummyHeight} background={dummyColor} />
            </div>
      <div className="flex items-center" style={ {height: height }}>
      <DummyLine width="14px" height={dummyHeight} background={dummyColor} />
      </div>
    </div>
  </div>
)

const createHighlightedContent = (animateContext: boolean, animateMessage: boolean, contextResetKey: number, messageResetKey: number, withSID: boolean = true) => (
  <div className={`${ibmPlexMono.className} pt-[var(--padding)] h-full text-[7px] font-normal`}>
    <div className="flex flex-col">
      <div className="flex items-center gap-[var(--gap-small)]">
        <span style={{ color: "var(--dark-grey)" }}>const</span>
        <span style={{ color: "var(--dark-grey)" }}>answer</span>
        <span style={{ color: "var(--medium-dark-grey)" }}>=</span>
        <span style={{ color: "var(--dark-grey)" }}>await</span>
        <span style={{ color: "var(--dark-grey)" }}>AI</span>
        <DummyLine width="80px" height={dummyHeight} background={dummyColor} />
      </div>
      <div className="flex items-center gap-0" style={{ marginLeft: indent }}>
        <span style={{ color: "var(--medium-dark-grey)" }}>model</span>
        <span style={{ color: "var(--medium-dark-grey)", paddingRight: "var(--gap-small)" }}>:</span>
        <DummyLine width="30px" height={dummyHeight} background={dummyColor} />
      </div>
      {!withSID && (
        <div className="flex items-center gap-0" style={{ marginLeft: indent }}>
          <span style={{ color: "var(--medium-dark-grey)" }}>documents</span>
          <span style={{ color: "var(--medium-dark-grey)", paddingRight: "var(--gap-small)" }}>:</span>
          <span style={{ color: "var(--medium-dark-grey)" }}>[</span>
          <DummyLine width="40px" height={dummyHeight} background={dummyColor} />
          <span style={{ color: "var(--medium-dark-grey)" }}>]</span>
        </div>
      )}
      <div className="flex items-center gap-0" style={{ marginLeft: indent }}>
        <span style={{ color: "var(--medium-dark-grey)" }}>messages</span>
        <span style={{ color: "var(--medium-dark-grey)", paddingRight: "var(--gap-small)" }}>:</span>
        <DummyLine width="8px" height={dummyHeight} background={dummyColor} />
      </div>
            <div style={{ marginLeft: `calc(${indent} * 2)`, color: "var(--medium-dark-grey)" }}>{"{"}</div>
            <div className="flex items-center" style={{ marginLeft: `calc(${indent} * 3)`, height: height }}>
              <DummyLine width="50px" height={dummyHeight} background={dummyColor} />
            </div>
            <div className="flex items-center gap-0" style={{ marginLeft: `calc(${indent} * 3)`, height: height }}>
            <span style={{ color: "var(--medium-dark-grey)" }}>content</span>
            <span style={{ color: "var(--medium-dark-grey)" }}>:</span>
            <span style={{ color: "var(--dark-grey)" }}>{'`'}</span>
            {withSID ? (
              <>
                <span style={{ color: "var(--dark-grey)" }}>{'${'}</span>
                {animateContext ? (
                  <span key={`context-${contextResetKey}`} className="highlight-animate highlight-context highlight-offset" style={{ color: "var(--dark-grey)", position: "relative", lineHeight: 1 }}>
                    <span style={{ position: "relative", zIndex: 1 }}>context</span>
                  </span>
                ) : (
                  <span style={{ color: "var(--dark-grey)" }}>context</span>
                )}
                <span style={{ color: "var(--dark-grey)" }}>{'}'}</span>
              </>
            ) : (
              <>
                <span style={{ color: "var(--dark-grey)" }}>{'${'}</span>
                {animateContext ? (
                  <span key={`documents-${contextResetKey}`} className="highlight-animate highlight-documents highlight-offset" style={{ color: "var(--dark-grey)", position: "relative", lineHeight: 1 }}>
                    <span style={{ color: "var(--dark-grey)", zIndex: 1 }}>[</span>
                    <span style={{ color: "var(--dark-grey)", zIndex: 1 }}>documents</span>
                    <span style={{ color: "var(--dark-grey)", zIndex: 1 }}>]</span>                  </span>
                ) : (
                  <>
                  <span style={{ color: "var(--dark-grey)" }}>[</span>
                  <span style={{ color: "var(--dark-grey)" }}>documents</span>
                  <span style={{ color: "var(--dark-grey)" }}>]</span>
                  </>
                )}
                <span style={{ color: "var(--dark-grey)" }}>{'}'}</span>
              </>
            )}
            <span style={{ color: "var(--dark-grey)" }}>{'\\n\\n'}</span>
            <span style={{ color: "var(--dark-grey)" }}>{'${'}</span>
            {animateMessage ? (
              <span key={`message-${messageResetKey}`} className="highlight-animate highlight-message highlight-offset" style={{ color: "var(--dark-grey)", position: "relative", lineHeight: 1 }}>
                <span style={{ position: "relative", zIndex: 1 }}>message</span>
              </span>
            ) : (
              <span style={{ color: "var(--dark-grey)" }}>message</span>
            )}
            <span style={{ color: "var(--dark-grey)" }}>{'}'}</span>
            <span style={{ color: "var(--dark-grey)" }}>{'`'}</span>
            </div>
          <div style={{ marginLeft: `calc(${indent} * 2)`, color: "var(--medium-dark-grey)" }}>{"}"}</div>
      <div className="flex items-center" style={{ marginLeft: indent, height: height }}>
        <DummyLine width="8px" height={dummyHeight} background={dummyColor} />
            </div>
      <div className="flex items-center" style={ {height: height }}>
      <DummyLine width="14px" height={dummyHeight} background={dummyColor} />
      </div>
    </div>
  </div>
)

// Helper function to get highlight lines for each document variant
const getHighlightLinesForVariant = (variant: string): number[] => {
  switch (variant.toLowerCase()) {
    case 'simple':
      return [...RAG_HIGHLIGHT_TIMINGS.DOCUMENT_HIGHLIGHT_LINES.SIMPLE]
    case 'bullets':
      return [...RAG_HIGHLIGHT_TIMINGS.DOCUMENT_HIGHLIGHT_LINES.BULLETS]
    case 'chart':
      return [...RAG_HIGHLIGHT_TIMINGS.DOCUMENT_HIGHLIGHT_LINES.CHART]
    case 'table':
      return [...RAG_HIGHLIGHT_TIMINGS.DOCUMENT_HIGHLIGHT_LINES.TABLE]
    case 'image':
      // Image variant doesn't have predefined highlights, so use at least one line
      return [0]
    default:
      // For any unknown variant, ensure at least one highlight (use first line)
      return [0]
  }
}

const documentStack = (documents: string[], animateContext: boolean) => {
  const stackStyle = [
    { rotate: '0deg', bottom: -56, left: -45 },    // bullets (leftmost, behind) - messy
    { rotate: '7deg', bottom: -61, left: -20 },     // table (center-left) - tilted right
    { rotate: '-5deg', bottom: -59, left: 25 },     // image (center) - slightly left tilt
    { rotate: '11deg', bottom: -65, left: 60 },      // simple (center-right) - more tilted
    { rotate: '3deg', bottom: -62, left: 90 },      // chart (rightmost, behind) - slight tilt
    { rotate: '-9deg', bottom: -58, left: -70 },    // additional document - far left
    { rotate: '13deg', bottom: -64, left: 10 },     // additional document - center-left
    { rotate: '-7deg', bottom: -60, left: 45 },     // additional document - center-right
    { rotate: '5deg', bottom: -62, left: 80 },      // additional document - right
    { rotate: '-10deg', bottom: -63, left: 105 },   // additional document - far right
  ]

  // Entry directions for each paper - completely random, chaotic pattern from all directions
  // Some from left, some from right, some from middle, all over the place
  const entryDirections = [
    { translateX: '-65px', translateY: '50px' },   // far left
    { translateX: '45px', translateY: '40px' },     // right side
    { translateX: '-35px', translateY: '55px' },     // left-middle
    { translateX: '70px', translateY: '45px' },      // far right
    { translateX: '5px', translateY: '60px' },      // center (slight right)
    { translateX: '-80px', translateY: '48px' },     // very far left
    { translateX: '30px', translateY: '52px' },      // right-middle
    { translateX: '-50px', translateY: '43px' },     // left
    { translateX: '55px', translateY: '58px' },      // right
    { translateX: '-10px', translateY: '47px' },     // left-center
  ]

  // Completely random delays - no pattern, all over the place
  // bullets (index 0) should be last
  const randomDelays = POST_REQUEST_TIMINGS.DOCUMENT_STACK_DELAYS_MS
  
  // Documents should only appear AFTER the highlight animation completes
  // Add the highlight duration to each delay so they appear after highlight finishes
  const highlightDuration = POST_REQUEST_TIMINGS.CONTEXT_ANIMATION_DURATION_MS

  const totalDocuments = stackStyle.length

  return (
    //  All on top of each other in a stack
    <div className="relative" style={{ width: '250px', height: '100%' }}>
      {stackStyle.map((style, index) => {
        const entryDir = entryDirections[index % entryDirections.length]
        // Completely random delays - no z-index ordering, just chaos
        // Add highlight duration so documents appear AFTER highlight completes
        const baseDelay = randomDelays[index % randomDelays.length]
        const animationDelay = animateContext ? highlightDuration + baseDelay : 0
        
        return (
          <div 
            key={index} 
            className={`absolute w-[80px] ${animateContext ? 'paper-stack-animate' : ''}`}
            style={{
              '--paper-rotation': style.rotate,
              '--entry-x': entryDir.translateX,
              '--entry-y': entryDir.translateY,
              transform: animateContext ? `scale(0.8)` : `scale(0.8) rotate(${style.rotate})`,
              bottom: `${style.bottom}px`,
              left: `${style.left}px`,
              zIndex: totalDocuments - index,
              animationDelay: `${animationDelay}ms`,
              opacity: animateContext ? undefined : 1, // Ensure visible when not animating
            } as React.CSSProperties}
          >
            <DocumentVariants 
              variant={documents[index]} 
              highlightLines={getHighlightLinesForVariant(documents[index])}
            />
          </div>
        )
      })}
    </div>
  )
}

export function PostRequestCard({ 
  showContext = false, 
  withSID = true, 
  documents = ["bullets", "table", "image", "simple", "chart", "simple", "table", "image", "chart", "bullets"], 
  onActionButtons,
  onFunctionsReady,
  isActive = true,
  pulsate = false,
}: { 
  showContext?: boolean; 
  withSID?: boolean; 
  documents?: string[]; 
  onActionButtons?: (buttons: React.ReactNode) => void;
  onFunctionsReady?: (functions: {
    animate: () => Promise<void>;
    reset: () => void;
  }) => void;
  isActive?: boolean;
  pulsate?: boolean;
}) {
  const [animateContext, setAnimateContext] = useState(false)
  const [animateMessage, setAnimateMessage] = useState(false)
  const [contextResetKey, setContextResetKey] = useState(0)
  const [messageResetKey, setMessageResetKey] = useState(0)
  const [showUserMessage, setShowUserMessage] = useState(false)
  const userMessageRef = useRef<HTMLDivElement>(null)
  const onActionButtonsRef = useRef(onActionButtons)
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const userMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialDelayTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleAnimate = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      // Clear any existing timeouts
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current)
        messageTimeoutRef.current = null
      }
      if (userMessageTimeoutRef.current) {
        clearTimeout(userMessageTimeoutRef.current)
        userMessageTimeoutRef.current = null
      }
      if (initialDelayTimeoutRef.current) {
        clearTimeout(initialDelayTimeoutRef.current)
        initialDelayTimeoutRef.current = null
      }
      
      // Reset everything first
      setShowUserMessage(false)
      setAnimateMessage(false)
      setAnimateContext(false)
      
      // Wait for initial delay before starting animations
      const initialDelay = POST_REQUEST_TIMINGS.INITIAL_DELAY_BEFORE_ANIMATION_MS
      
      initialDelayTimeoutRef.current = setTimeout(() => {
        initialDelayTimeoutRef.current = null
        // Start context animation
        setAnimateContext(true)
        setContextResetKey(prev => prev + 1)
        
        // Calculate when context animation completes:
        // - Documents: max delay + animation duration
        // - Highlight animation: 800ms (CSS) + 50ms buffer
        // Wait for the longer one plus a small buffer
        const contextAnimationDuration = POST_REQUEST_TIMINGS.CONTEXT_ANIMATION_DURATION_MS
        
        // After context animation completes, start message animation
        messageTimeoutRef.current = setTimeout(() => {
          setAnimateMessage(true)
          setMessageResetKey(prev => prev + 1)
          messageTimeoutRef.current = null
          // Wait for message highlight to complete before showing user message
          // Message highlight animation is 800ms (CSS) + 50ms buffer = 850ms
          userMessageTimeoutRef.current = setTimeout(() => {
            setShowUserMessage(true)
            userMessageTimeoutRef.current = null
          }, contextAnimationDuration)
          // Resolve after message animation completes (message animation is instant, so resolve immediately)
          resolve()
        }, contextAnimationDuration)
      }, initialDelay)
    })
  }, [])

  const handleReset = useCallback(() => {
    // Clear any pending timeouts
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current)
      messageTimeoutRef.current = null
    }
    if (userMessageTimeoutRef.current) {
      clearTimeout(userMessageTimeoutRef.current)
      userMessageTimeoutRef.current = null
    }
    if (initialDelayTimeoutRef.current) {
      clearTimeout(initialDelayTimeoutRef.current)
      initialDelayTimeoutRef.current = null
    }
    // Reset all state
    setShowUserMessage(false)
    setAnimateMessage(false)
    setAnimateContext(false)
    setContextResetKey(prev => prev + 1)
    setMessageResetKey(prev => prev + 1)
  }, [])

  const content = showContext ? createHighlightedContent(animateContext, animateMessage, contextResetKey, messageResetKey, withSID) : createOriginalContent(withSID)

  // Keep ref in sync with prop
  useEffect(() => {
    onActionButtonsRef.current = onActionButtons
  }, [onActionButtons])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current)
      }
      if (userMessageTimeoutRef.current) {
        clearTimeout(userMessageTimeoutRef.current)
      }
      if (initialDelayTimeoutRef.current) {
        clearTimeout(initialDelayTimeoutRef.current)
      }
    }
  }, [])

  // Expose functions to parent component
  useEffect(() => {
    if (onFunctionsReady) {
      onFunctionsReady({
        animate: handleAnimate,
        reset: handleReset,
      })
    }
  }, [onFunctionsReady, handleAnimate, handleReset])

  useEffect(() => {
    if (onActionButtonsRef.current && showContext) {
      const buttons = (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
          <Button onClick={() => handleAnimate()} size="sm" variant="outline">
            Animate
          </Button>
          <Button onClick={handleReset} size="sm" variant="outline">
            Reset
          </Button>
        </div>
      )
      onActionButtonsRef.current(buttons)
    }
  }, [animateContext, animateMessage, showContext, handleAnimate, handleReset])

  return (
    <div style={{ position: "relative", opacity: isActive ? 1 : "var(--inactive)" }}>
      <BrowserWindow title="Post Request" content={content} fitContent={true} pulsate={pulsate} />
      {showContext && (
        <div style={{ position: "absolute", bottom: 0, right: 0, transform: "translateX(15%) translateY(30%)", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          {showUserMessage && (
            <div 
              ref={userMessageRef}
              key={`user-message-${messageResetKey}`}
              style={{
                position: "absolute", 
                zIndex: 1000, 
                bottom: "-10px",
                right: "-10px"
              }}
            >
              {userMessage({ animate: animateMessage })}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "200px", position: "relative" }}>
            {withSID ? (
              <div 
                key={`document-${contextResetKey}`}
                className={animateContext ? "user-message-animate" : ""}
                style={{
                  opacity: animateContext ? undefined : 0,
                  pointerEvents: animateContext ? undefined : "none",
                  display: animateContext ? undefined : 'none',
                  visibility: animateContext ? undefined : 'hidden',
                  // Delay animation until after highlight completes
                  animationDelay: animateContext ? `${POST_REQUEST_TIMINGS.CONTEXT_ANIMATION_DURATION_MS}ms` : '0ms'
                }}
              >
                <Document content={<AnswerSection borderTop={false} showText={false} />} aspectRatio="" verticalPadding={false} />
              </div>
            ) : (
              <div 
                key={`documents-${contextResetKey}`}
                className={animateContext ? "user-message-animate" : ""}
                style={{
                  opacity: animateContext ? undefined : 0,
                  pointerEvents: animateContext ? undefined : "none",
                  display: animateContext ? "flex" : 'none',
                  visibility: animateContext ? undefined : 'hidden',
                  flexDirection: "row",
                  gap: "8px",
                  alignItems: "center",
                  width: "100%",
                  marginLeft: "60px",
                  marginTop: "10px"
                }}
              >
                {documentStack(documents, animateContext)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
