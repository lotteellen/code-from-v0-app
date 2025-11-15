"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { AIChatCard } from "@/components/graphics/elements/AI-chat"
import { PostRequestCard } from "@/components/graphics/elements/post-request-card"
import { RetrievedSearchCard, type DocumentItem } from "@/components/graphics/elements/retrieved-search-card"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/graphics/container"
import { POST_REQUEST_TIMINGS, AI_CHAT_TIMINGS, RAG_HIGHLIGHT_TIMINGS } from "@/components/graphics/helpers/animation-timings"

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
      return [0] // Image variant doesn't have predefined highlights
    default:
      return [0]
  }
}

// Generate 10 documents for RAG (same as post-request-card)
const generateRAGDocuments = (): DocumentItem[] => {
  const variants = ["bullets", "table", "image", "simple", "chart", "simple", "table", "image", "chart", "bullets"]
  return variants.map((variant, index) => ({
    id: `rag-doc-${index}`,
    title: variant,
    variant: variant,
    highlightLines: getHighlightLinesForVariant(variant),
  }))
}

type ChatGPTFunctions = {
  animateUserMessage: () => Promise<void>;
  unhighlightLines: () => Promise<void>;
  animateAssistantMessage: () => Promise<void>;
  animateIndicator: () => Promise<void>;
  reset: () => void;
}

type RetrievedSearchFunctions = {
  addTextAndRemoveHighlight: (text?: string) => Promise<void>;
  quickSearch: () => Promise<void>;
  slowSearchAndHighlight: () => Promise<void>;
  reset: () => void;
  setQuery: (text: string) => void;
}

type PostRequestFunctions = {
  animate: () => Promise<void>;
  reset: () => void;
}

const DEFAULT_QUERY = "What was our enterprise pricing before we pivoted to SMB?"

export function RAGPipelineCard({
  onActionButtons,
  query = DEFAULT_QUERY,
}: {
  onActionButtons?: (buttons: React.ReactNode) => void;
  query?: string;
}) {
  const chatGPTFunctionsRef = useRef<ChatGPTFunctions | null>(null)
  const retrievedSearchFunctionsRef = useRef<RetrievedSearchFunctions | null>(null)
  const postRequestFunctionsRef = useRef<PostRequestFunctions | null>(null)
  const onActionButtonsRef = useRef(onActionButtons)
  const [isAnimating, setIsAnimating] = useState(false)
  const isAnimatingRef = useRef(false)
  const [chatActive, setChatActive] = useState(false)
  const [retrievalActive, setRetrievalActive] = useState(false)
  const [postActive, setPostActive] = useState(false)
  const [showFinal, setShowFinal] = useState(false)

  // Keep ref in sync with prop
  useEffect(() => {
    onActionButtonsRef.current = onActionButtons
  }, [onActionButtons])

  // Keep isAnimatingRef in sync with isAnimating state
  useEffect(() => {
    isAnimatingRef.current = isAnimating
  }, [isAnimating])

  const handleChatGPTFunctionsReady = useCallback((functions: ChatGPTFunctions) => {
    chatGPTFunctionsRef.current = functions
  }, [])

  const handleRetrievedSearchFunctionsReady = useCallback((functions: RetrievedSearchFunctions) => {
    retrievedSearchFunctionsRef.current = functions
  }, [])

  const handlePostRequestFunctionsReady = useCallback((functions: PostRequestFunctions) => {
    postRequestFunctionsRef.current = functions
  }, [])

  const runSequentialAnimation = useCallback(async () => {
    if (isAnimatingRef.current) {
      return // Prevent multiple simultaneous animations
    }

    // Reset before starting animation sequence
    const chatGPT = chatGPTFunctionsRef.current
    const retrievedSearch = retrievedSearchFunctionsRef.current
    const postRequest = postRequestFunctionsRef.current

    if (chatGPT) {
      chatGPT.reset()
    }
    if (retrievedSearch) {
      retrievedSearch.reset()
    }
    if (postRequest) {
      postRequest.reset()
    }
    
    // Reset all active states
    setChatActive(false)
    setRetrievalActive(false)
    setPostActive(false)

    setIsAnimating(true)

    try {
      if (!chatGPT || !retrievedSearch || !postRequest) {
        console.warn("Not all component functions are ready")
        setIsAnimating(false)
        return
      }

      // Step 1: Animate user message in chatgpt component
      // Chat and retrieval active briefly, post inactive
      setChatActive(true)
      setRetrievalActive(true)
      setPostActive(false)
      await chatGPT.animateUserMessage()

      // Step 2: When done: Call add text + remove highlight in retrieved search data
      // Chat and retrieval still active briefly
      await retrievedSearch.addTextAndRemoveHighlight()

      // Step 3: When done: Call unhighlight function in chatgpt
      // Chat becomes inactive, retrieval still active (steps 2-5)
      setChatActive(false)
      await chatGPT.unhighlightLines()

      // Step 4-5: When done: Trigger slow search + highlight in retrieved search
      // Retrieval still active (steps 2-5)
      await retrievedSearch.slowSearchAndHighlight()

      // Break between retrieval completion and post animation
      await new Promise(resolve => setTimeout(resolve, POST_REQUEST_TIMINGS.DELAY_AFTER_RETRIEVAL_MS))

      // Step 6: Trigger animate in post request
      // Post request now handles its own pulsing and calls AI chat animation internally
      // Post active, chat will become active when AI chat animation is triggered
      setChatActive(false)
      setRetrievalActive(false)
      setPostActive(true)
      await postRequest.animate()
      
      // Post request animation is complete (including pulsing and AI chat animation)
      setChatActive(false)
      setPostActive(false)
    } catch (error) {
      console.error("Animation sequence error:", error)
    } finally {
      setIsAnimating(false)
    }
  }, [])

  const handleReset = useCallback(() => {
    const chatGPT = chatGPTFunctionsRef.current
    const retrievedSearch = retrievedSearchFunctionsRef.current
    const postRequest = postRequestFunctionsRef.current

    if (chatGPT) {
      chatGPT.reset()
    }
    if (retrievedSearch) {
      retrievedSearch.reset()
    }
    if (postRequest) {
      postRequest.reset()
    }
    
    setIsAnimating(false)
    // Reset all active states
    setChatActive(false)
    setRetrievalActive(false)
    setPostActive(false)
    setShowFinal(false)
  }, [])

  const showFinalStage = useCallback(() => {
    // Set showFinal prop on all components to show final state immediately
    setShowFinal(true)
    // Set all stages to active (finished state)
    setChatActive(true)
    setRetrievalActive(true)
    setPostActive(true)
  }, [])

  useEffect(() => {
    if (onActionButtonsRef.current) {
      const buttons = (
        <div className="flex gap-2 flex-col">
          <Button 
            onClick={runSequentialAnimation} 
            size="sm"
            disabled={isAnimating}
          >
            {isAnimating ? "Animating..." : "Run Full Sequence"}
          </Button>
          <Button 
            onClick={showFinalStage} 
            size="sm"
            variant="default"
          >
            Show Final Stage
          </Button>
          <Button 
            onClick={handleReset} 
            size="sm"
            variant="outline"
            disabled={isAnimating}
          >
            Reset
          </Button>
        </div>
      )
      onActionButtonsRef.current(buttons)
    }
  }, [runSequentialAnimation, isAnimating, handleReset, showFinalStage])

  return (
    
    <Container
      left={
        <PostRequestCard 
          showContext={true} 
          withSID={false} 
          onFunctionsReady={handlePostRequestFunctionsReady}
          isActive={postActive}
          showFinal={showFinal}
          onToggleFinal={() => setShowFinal(!showFinal)}
          onReset={() => setShowFinal(false)}
          onAnimateAssistantMessage={async () => {
            // When post request triggers AI chat animation, activate chat
            setChatActive(true)
            const chatGPT = chatGPTFunctionsRef.current
            if (chatGPT) {
              await chatGPT.animateAssistantMessage()
            }
            setChatActive(false)
          }}
        />
      }
      middle={
        <AIChatCard 
          isCorrect={false}
          onFunctionsReady={handleChatGPTFunctionsReady}
          query={query}
          isActive={chatActive}
          showFinal={showFinal}
        />
      }
      right={
        <RetrievedSearchCard 
          onFunctionsReady={handleRetrievedSearchFunctionsReady}
          query={query}
          darkMode={true}
          isActive={retrievalActive}
          showFinal={showFinal}
          documents={generateRAGDocuments()}
        />
      }
      leftWrapper={{
        style: { 
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          height: "100%"
        }
      }}
      rightWrapper={{
        style: { 
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          height: "100%"
        }
      }}
      middleWrapper={{
        // style: {
        //   display: "flex",
        //   flexDirection: "column",
        //   justifyContent: "flex-start",
        //   height: "100%"
        // }
      }}
    />
  )
}

