"use client"

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { APICall } from "../helpers/api-call"
import { AnswerSection } from './reasoning-model-card'
import { userMessage } from './AI-chat'
import { Document } from '../helpers/document'
import { DocumentStack } from '../helpers/document-stack'
import { Button } from '@/components/ui/button'
import { POST_REQUEST_TIMINGS } from "../helpers/animation-timings"
import "../helpers/globals.css"

// Constants
const ANIMATION_DELAY_MS = "400ms"
  // Documents should appear halfway through the context highlight animation
  // Context highlight is 800ms, so halfway is 400ms
const CONTEXT_HIGHLIGHT_HALFWAY_MS = 400

 
const outerMostContainerClassName = "w-full h-fit flex flex-col"
// Container styles
const lowerContainerStyle: React.CSSProperties = {
  // bottom: 0,
  // right: 0,
  // transform: `translateX(${CONTEXT_OFFSET_X}) translateY(${CONTEXT_OFFSET_Y})`,
  // gap: "8px"
}
const lowerContainerClassName = "relative flex flex-col items-end"
const userMessageContainerStyle: React.CSSProperties = { zIndex: 1000}
const userMessageContainerClassName = ""

// Content styles
const contentContainerStyle: React.CSSProperties = {}
const contentContainerClassName = "flex flex-col relative items-center justify-center"

export function PostRequestCard({ 
  showContext = false, 
  withSID = true, 
  documents = ["bullets", "table", "image", "simple", "chart", "simple", "table", "image", "chart", "bullets"], 
  onActionButtons,
  onFunctionsReady,
  isActive = true,
  pulsate = false,
  onAnimateAssistantMessage,
  showFinal = false,
  onToggleFinal,
  onReset,
}: { 
  showContext?: boolean; 
  withSID?: boolean; 
  documents?: string[]; 
  onActionButtons?: (buttons: React.ReactNode) => void;
  onFunctionsReady?: (functions: {
    animate: () => Promise<void>;
    reset: () => void;
    pulsate: () => Promise<void>;
  }) => void;
  isActive?: boolean;
  pulsate?: boolean;
  onAnimateAssistantMessage?: () => Promise<void>;
  showFinal?: boolean;
  onToggleFinal?: () => void;
  onReset?: () => void;
}) {
  // Animation timing constants
  const CONTEXT_HIGHLIGHT_HALFWAY_MS = 400
  const MESSAGE_HIGHLIGHT_HALFWAY_MS = 400
  const DOCUMENT_ANIMATION_DURATION_MS = 300
  const PULSATE_DURATION_MS = 2000
  const PULSATE_HALFWAY_MS = 1000

  const [animateContext, setAnimateContext] = useState(false)
  const [animateMessage, setAnimateMessage] = useState(false)
  const [contextResetKey, setContextResetKey] = useState(0)
  const [messageResetKey, setMessageResetKey] = useState(0)
  const [showUserMessage, setShowUserMessage] = useState(false)
  const [internalPulsate, setInternalPulsate] = useState(false)
  const onActionButtonsRef = useRef(onActionButtons)
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutsRef.current = []
  }, [])

  // Sync state with showFinal prop
  useLayoutEffect(() => {
    if (showFinal) {
      setAnimateContext(true)
      setAnimateMessage(true)
      setShowUserMessage(true)
      setInternalPulsate(false)
      setContextResetKey(prev => prev + 1)
      setMessageResetKey(prev => prev + 1)
    } else {
      setAnimateContext(false)
      setAnimateMessage(false)
      setShowUserMessage(false)
      setInternalPulsate(false)
      setContextResetKey(prev => prev + 1)
      setMessageResetKey(prev => prev + 1)
    }
  }, [showFinal])

  const handlePulsate = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      clearAllTimeouts()
      setInternalPulsate(true)
      
      const aiChatTimeout = setTimeout(async () => {
        if (onAnimateAssistantMessage) {
          await onAnimateAssistantMessage()
        }
        const pulsateTimeout = setTimeout(() => {
          setInternalPulsate(false)
          resolve()
        }, PULSATE_HALFWAY_MS)
        timeoutsRef.current.push(pulsateTimeout)
      }, PULSATE_HALFWAY_MS)
      timeoutsRef.current.push(aiChatTimeout)
    })
  }, [onAnimateAssistantMessage, clearAllTimeouts])

  const handleAnimate = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      clearAllTimeouts()
      setShowUserMessage(false)
      setAnimateMessage(false)
      setAnimateContext(false)
      setInternalPulsate(false)
      
      const initialDelayTimeout = setTimeout(() => {
        setAnimateContext(true)
        setContextResetKey(prev => prev + 1)
        
        const maxDocumentDelay = Math.max(...POST_REQUEST_TIMINGS.DOCUMENT_STACK_DELAYS_MS)
        const documentsFullyApparent = CONTEXT_HIGHLIGHT_HALFWAY_MS + maxDocumentDelay + DOCUMENT_ANIMATION_DURATION_MS
        
        const messageTimeout = setTimeout(() => {
          setAnimateMessage(true)
          setMessageResetKey(prev => prev + 1)
          
          const userMessageTimeout = setTimeout(() => {
            setShowUserMessage(true)
            resolve()
          }, MESSAGE_HIGHLIGHT_HALFWAY_MS)
          timeoutsRef.current.push(userMessageTimeout)
        }, documentsFullyApparent)
        timeoutsRef.current.push(messageTimeout)
      }, POST_REQUEST_TIMINGS.INITIAL_DELAY_BEFORE_ANIMATION_MS)
      timeoutsRef.current.push(initialDelayTimeout)
    })
  }, [clearAllTimeouts])

  const handleReset = useCallback(() => {
    clearAllTimeouts()
    if (onReset) {
      onReset()
    }
    setShowUserMessage(false)
    setAnimateMessage(false)
    setAnimateContext(false)
    setInternalPulsate(false)
    setContextResetKey(prev => prev + 1)
    setMessageResetKey(prev => prev + 1)
  }, [onReset, clearAllTimeouts])

  useEffect(() => {
    onActionButtonsRef.current = onActionButtons
  }, [onActionButtons])

  useEffect(() => {
    return () => clearAllTimeouts()
  }, [clearAllTimeouts])

  useEffect(() => {
    if (onFunctionsReady) {
      onFunctionsReady({
        animate: handleAnimate,
        reset: handleReset,
        pulsate: handlePulsate,
      })
    }
  }, [onFunctionsReady, handleAnimate, handleReset, handlePulsate])

  useEffect(() => {
    if (onActionButtonsRef.current) {
      const buttons = (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
          {showContext && (
            <>
              <Button onClick={() => handleAnimate()} size="sm" variant="outline">
                Animate
              </Button>
              <Button onClick={() => handlePulsate()} size="sm" variant="outline">
                Pulse
              </Button>
            </>
          )}
          {onToggleFinal && (
            <Button onClick={onToggleFinal} size="sm" variant={showFinal ? "default" : "outline"}>
              Final State
            </Button>
          )}
        </div>
      )
      onActionButtonsRef.current(buttons)
    }
  }, [animateContext, animateMessage, showContext, handleAnimate, handlePulsate, showFinal, onToggleFinal])

  // Use internal pulsate if not controlled externally, otherwise use prop
  const shouldPulsate = pulsate || internalPulsate

  // Extract common conditionals
  const isVisible = showFinal || animateContext
  const shouldAnimate = !showFinal && animateContext
  const animationClassName = shouldAnimate ? "user-message-animate" : ""

  // Common visibility styles
  const baseVisibilityStyle: React.CSSProperties = {
    pointerEvents: isVisible ? "auto" : "none",
    visibility: isVisible ? undefined : "hidden",
  }

  const animationContainerStyle: React.CSSProperties = {
    ...baseVisibilityStyle,
    opacity: showFinal ? 1 : 0,
    display: isVisible ? "undefined" : "none",
    animationDelay: shouldAnimate ? ANIMATION_DELAY_MS : "0ms",
  }  

  return (
    <div className={outerMostContainerClassName} style={{ opacity: isActive ? 1 : "var(--inactive)" }}>
        <APICall
          showContext={showContext}
          withSID={withSID}
          animateContext={animateContext}
          animateMessage={animateMessage}
          contextResetKey={contextResetKey}
          messageResetKey={messageResetKey}
          showFinal={showFinal}
          pulsate={shouldPulsate}
        />
        {showContext && (
          <div 
            className={lowerContainerClassName}
            style={lowerContainerStyle}
          >
            {showUserMessage && (
              <div 
                key={`user-message-${messageResetKey}`}
                className={userMessageContainerClassName}
                style={userMessageContainerStyle}
              >
                {userMessage({ animate: !showFinal && animateMessage, style: {paddingTop: "0px"}})}
              </div>
            )}
            <div className={contentContainerClassName} style={contentContainerStyle}>
              {withSID ? (
                <div 
                  key={`document-${contextResetKey}`}
                  className={animationClassName}
                  style={animationContainerStyle}
                >
                  <Document content={<AnswerSection borderTop={false} showText={false} />} aspectRatio="" verticalPadding={false} />
                </div>
              ) : (
                <div 
                  key={`documents-${contextResetKey}`}
                  className={animationClassName}
                  style={animationContainerStyle}
                >
                  <DocumentStack 
                    documents={documents} 
                    animateContext={animateContext} 
                    showFinal={showFinal} 
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
  );
}
