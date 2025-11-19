"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { APICall } from "../helpers/api-call"
import { AnswerSection } from './reasoning-model'
import { userMessage } from './AI-chat'
import { Document } from '../helpers/document'
import { DocumentStack, type DocumentStackFunctions } from '../helpers/document-stack'
import { type DocumentItem } from './document-variants'
import { POST_REQUEST_TIMINGS } from "../helpers/animation-timings"
import { useTimeoutManager } from "../helpers/use-timeout-manager"
import "../helpers/globals.css"

// Types
export type PostRequestFunctions = {
  animateContext: () => Promise<void>;
  animateUserMessage: () => Promise<void>;
  pulsate: () => Promise<void>;
  setFinal: () => void;
  reset: () => void;
  documentStack: DocumentStackFunctions | null;
}

type AnimationState = {
  context: boolean
  documents: boolean
  answerSection: boolean
  message: boolean
  userMessage: boolean
  pulsate: boolean
  isFinal: boolean
}

const INITIAL_ANIMATION_STATE: AnimationState = {
  context: false,
  documents: false,
  answerSection: false,
  message: false,
  userMessage: false,
  pulsate: false,
  isFinal: false,
}

export function PostRequest({ 
  documents, 
  onFunctionsReady,
  isActive = true,
  onAnimateUserMessageStart,
}: { 
  documents?: (string | DocumentItem)[]; 
  onFunctionsReady?: (functions: PostRequestFunctions) => void;
  isActive?: boolean;
  onAnimateUserMessageStart?: () => void;
}) {
  // Determine if we have documents to show (RAG mode) vs empty array (SID mode)
  const hasDocuments = documents !== undefined && documents.length > 0
  
  // Consolidated animation state
  const [animationState, setAnimationState] = useState<AnimationState>(INITIAL_ANIMATION_STATE)
  
  const documentStackRef = useRef<DocumentStackFunctions | null>(null)
  const timeoutManager = useTimeoutManager()

  // Helper to update animation state
  const updateAnimationState = useCallback((updates: Partial<AnimationState>) => {
    setAnimationState(prev => ({ ...prev, ...updates }))
  }, [])

  // Reset all animation states
  const resetAnimationState = useCallback(() => {
    setAnimationState(INITIAL_ANIMATION_STATE)
    documentStackRef.current?.reset()
  }, [])

  // Phase 2: Message highlight and user message
  const startMessagePhase = useCallback(async (): Promise<void> => {
    await timeoutManager.delay(POST_REQUEST_TIMINGS.BREAK_BETWEEN_CONTEXT_AND_MESSAGE_MS)
    updateAnimationState({ message: true })
    await timeoutManager.delay(POST_REQUEST_TIMINGS.MESSAGE_HIGHLIGHT_DELAY_AFTER_CONTEXT_MS)
    updateAnimationState({ userMessage: true })
  }, [timeoutManager, updateAnimationState])

  // Handle pulsate animation - duration matches assistant message animation (2000ms)
  const handlePulsate = useCallback(async (): Promise<void> => {
    // Pulsate duration: 2000ms (two pulses of 1000ms each)
    // Matches assistant message duration exactly: 1600ms delay + 400ms animation = 2000ms
    const PULSATE_DURATION_MS = POST_REQUEST_TIMINGS.PULSATE_HALFWAY_MS * 2 // 1000ms * 2 = 2000ms
    
    updateAnimationState({ pulsate: true })
    await timeoutManager.delay(PULSATE_DURATION_MS)
    updateAnimationState({ pulsate: false })
  }, [timeoutManager, updateAnimationState])

  // Handle context animation (Phase 1)
  const handleAnimateContext = useCallback(async (): Promise<void> => {
    timeoutManager.clearAll()
    resetAnimationState()
    
    // Initial delay
    await timeoutManager.delay(POST_REQUEST_TIMINGS.INITIAL_DELAY_BEFORE_ANIMATION_MS)
    
    // Phase 1: Context animation
    updateAnimationState({ context: true })
    
    if (!hasDocuments) {
      // SID mode: animate answer section
      await timeoutManager.delay(POST_REQUEST_TIMINGS.ANSWER_SECTION_DELAY_AFTER_CONTEXT_MS)
      updateAnimationState({ documents: true, answerSection: true })
      await timeoutManager.delay(POST_REQUEST_TIMINGS.CONTEXT_ANIMATION_DURATION_MS)
    } else {
      // RAG mode: animate document stack
      updateAnimationState({ documents: true })
      
      // Calculate when documents complete
      const maxDocumentDelay = Math.max(...POST_REQUEST_TIMINGS.DOCUMENT_STACK_DELAYS_MS)
      const documentsComplete = maxDocumentDelay + POST_REQUEST_TIMINGS.DOCUMENT_ANIMATION_DURATION_MS
      const phase1Complete = Math.max(
        POST_REQUEST_TIMINGS.CONTEXT_ANIMATION_DURATION_MS,
        documentsComplete
      )
      
      await timeoutManager.delay(phase1Complete)
    }
  }, [timeoutManager, resetAnimationState, updateAnimationState, hasDocuments])

  // Handle user message animation (Phase 2)
  const handleAnimateUserMessage = useCallback(async (): Promise<void> => {
    onAnimateUserMessageStart?.()
    await startMessagePhase()
  }, [startMessagePhase, onAnimateUserMessageStart])

  // Set final state (all visible, no animations)
  const handleSetFinal = useCallback(() => {
    setAnimationState({
      context: true,
      documents: true,
      answerSection: true,
      message: true,
      userMessage: true,
      pulsate: false,
      isFinal: true,
    })
    if (hasDocuments && documentStackRef.current) {
      documentStackRef.current.setFinal(true)
    }
  }, [hasDocuments])

  // Reset all states
  const handleReset = useCallback(() => {
    timeoutManager.clearAll()
    resetAnimationState()
  }, [timeoutManager, resetAnimationState])

  // Expose functions via onFunctionsReady
  useEffect(() => {
    onFunctionsReady?.({
      animateContext: handleAnimateContext,
      animateUserMessage: handleAnimateUserMessage,
      pulsate: handlePulsate,
      setFinal: handleSetFinal,
      reset: handleReset,
      documentStack: documentStackRef.current,
    })
  }, [onFunctionsReady, handleAnimateContext, handleAnimateUserMessage, handlePulsate, handleSetFinal, handleReset, documentStackRef.current])

  // Trigger document stack animation when documents state becomes true
  // But NOT during the message phase
  useEffect(() => {
    if (
      hasDocuments && 
      animationState.documents && 
      animationState.context && 
      !animationState.isFinal && 
      !animationState.message &&
      documentStackRef.current
    ) {
      documentStackRef.current.animate()
    }
  }, [hasDocuments, animationState])

  // Call setFinal on document stack when it becomes available and isFinal is true
  useEffect(() => {
    if (
      hasDocuments && 
      animationState.isFinal && 
      documentStackRef.current
    ) {
      documentStackRef.current.setFinal(true)
    }
  }, [animationState.isFinal, hasDocuments])

  // Memoized document container style
  // Documents should remain visible once shown, even during message phase
  const documentContainerStyle: React.CSSProperties = useMemo(() => ({
    opacity: animationState.isFinal || animationState.documents || animationState.answerSection ? 1 : 0,
  }), [animationState.isFinal, animationState.documents, animationState.answerSection])

  // Determine if documents should animate
  // Documents should NOT animate during the message phase
  const shouldAnimateDocuments = !animationState.isFinal && !animationState.message && (
    !hasDocuments ? animationState.answerSection : animationState.documents
  )

  // Generate keys for React reconciliation
  const documentKey = !hasDocuments 
    ? `document-${animationState.answerSection}-${animationState.isFinal}` 
    : `documents-${animationState.documents}-${animationState.isFinal}`
  
  const userMessageKey = `user-message-${animationState.message}-${animationState.isFinal}`

  return (
    <div 
      className="w-full h-fit flex flex-col items-center opacity-transition" 
      style={{ opacity: isActive ? 1 : "var(--inactive)" }}
    >
      <APICall
        contextMode={hasDocuments ? "rag" : "sid"}
        animateContext={animationState.context}
        animateMessage={animationState.message}
        isFinal={animationState.isFinal}
        pulsate={animationState.pulsate}
      />
      {documents !== undefined && (
        <div className="relative flex flex-col items-end">
          {animationState.userMessage && (
            <div 
              key={userMessageKey}
              style={{ zIndex: 1000 }}
            >
              {userMessage({ 
                animate: !animationState.isFinal && animationState.message, 
                style: { paddingTop: "0px" }
              })}
            </div>
          )}
          <div className="flex flex-col relative items-center justify-center">
            {(animationState.isFinal || animationState.documents) && (
              <div 
                key={documentKey}
                className={shouldAnimateDocuments ? "user-message-animate" : ""}
                style={documentContainerStyle}
              >
                {!hasDocuments ? (
                  <Document 
                    content={
                      <AnswerSection 
                        borderTop={false} 
                        showText={false} 
                        noTopMargin={true} 
                      />
                    } 
                    fitContent={true} 
                  />
                ) : (
                  <DocumentStack 
                    documents={documents} 
                    onFunctionsReady={(funcs) => {
                      documentStackRef.current = funcs
                      // If isFinal is already true, call setFinal immediately
                      if (animationState.isFinal) {
                        funcs.setFinal(true)
                      } else if (animationState.documents && animationState.context && !animationState.isFinal && !animationState.message) {
                        // If we're in animation phase (but NOT in message phase), trigger animate immediately
                        // This handles the case where DocumentStack just mounted
                        funcs.animate()
                      }
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
