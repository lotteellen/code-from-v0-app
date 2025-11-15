"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { AIChatCard } from "@/components/graphics/elements/AI-chat"
import { PostRequestCard } from "@/components/graphics/elements/post-request-card"
import { RetrievedSearchCard, type DocumentItem } from "@/components/graphics/elements/retrieved-search-card"
import { ReasoningModelCard } from "@/components/graphics/elements/reasoning-model-card"
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

// Generate fewer documents for SID (3 documents per query, much less than RAG's 10)
const generateSIDDocuments = (): DocumentItem[] => {
  const variants = ["simple", "table", "bullets"]
  return variants.map((variant, index) => ({
    id: `sid-doc-${index}`,
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

type ReasoningModelFunctions = {
  runSequentialFlow: () => Promise<void>;
  reset: () => void;
}

const DEFAULT_QUERY = "What was our enterprise pricing before we pivoted to SMB?"

export function SIDPipelineCard({
  onActionButtons,
  query = DEFAULT_QUERY,
}: {
  onActionButtons?: (buttons: React.ReactNode) => void;
  query?: string;
}) {
  const chatGPTFunctionsRef = useRef<ChatGPTFunctions | null>(null)
  const retrievedSearchFunctionsRef = useRef<RetrievedSearchFunctions | null>(null)
  const postRequestFunctionsRef = useRef<PostRequestFunctions | null>(null)
  const reasoningModelFunctionsRef = useRef<ReasoningModelFunctions | null>(null)
  const onActionButtonsRef = useRef(onActionButtons)
  const [isAnimating, setIsAnimating] = useState(false)
  const [chatActive, setChatActive] = useState(false)
  const [reasoningActive, setReasoningActive] = useState(false)
  const [postActive, setPostActive] = useState(false)
  const [retrievalActive, setRetrievalActive] = useState(false)
  const [showFinal, setShowFinal] = useState(false)
  const [finalQuery, setFinalQuery] = useState<string>(query)

  // Keep ref in sync with prop
  useEffect(() => {
    onActionButtonsRef.current = onActionButtons
  }, [onActionButtons])

  const handleChatGPTFunctionsReady = useCallback((functions: ChatGPTFunctions) => {
    chatGPTFunctionsRef.current = functions
  }, [])

  const handleRetrievedSearchFunctionsReady = useCallback((functions: RetrievedSearchFunctions) => {
    retrievedSearchFunctionsRef.current = functions
  }, [])

  const handlePostRequestFunctionsReady = useCallback((functions: PostRequestFunctions) => {
    postRequestFunctionsRef.current = functions
  }, [])

  const handleReasoningModelFunctionsReady = useCallback((functions: ReasoningModelFunctions) => {
    reasoningModelFunctionsRef.current = functions
  }, [])

  const runSequentialAnimation = useCallback(async () => {
    if (isAnimating) {
      return // Prevent multiple simultaneous animations
    }

    setIsAnimating(true)

    try {
      const chatGPT = chatGPTFunctionsRef.current
      const retrievedSearch = retrievedSearchFunctionsRef.current
      const postRequest = postRequestFunctionsRef.current
      const reasoningModel = reasoningModelFunctionsRef.current

      if (!chatGPT || !postRequest) {
        console.warn("Required component functions are not ready")
        setIsAnimating(false)
        return
      }

      if (!retrievedSearch) {
        console.warn("Retrieved search functions are not ready")
        setIsAnimating(false)
        return
      }

      if (!reasoningModel) {
        console.warn("Reasoning model functions are not ready")
        setIsAnimating(false)
        return
      }

      // Step 1: Animate user message in chatgpt component
      // Chat active initially
      setChatActive(true)
      setReasoningActive(false)
      setPostActive(false)
      setRetrievalActive(false)
      await chatGPT.animateUserMessage()

      // Step 2: Start reasoning model sequence
      // Reasoning becomes active, chat becomes inactive
      setChatActive(false)
      setReasoningActive(true)
      setRetrievalActive(false)
      setPostActive(false)
      // The reasoning model will handle:
      // - onThinkingStart: unhighlight lines in ChatGPT (handled via callback)
      // - onRetrievalReady: trigger retrieval in retrieved search (handled via callback)
      await reasoningModel.runSequentialFlow()

      // Break between retrieval completion and post animation (same as RAG)
      await new Promise(resolve => setTimeout(resolve, POST_REQUEST_TIMINGS.DELAY_AFTER_RETRIEVAL_MS))

      // Step 6: After reasoning sequence is done, trigger animate in post request (with SID context)
      // Post request now handles its own pulsing and calls AI chat animation internally
      // Post becomes active, reasoning becomes inactive
      setChatActive(false)
      setReasoningActive(false)
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
  }, [isAnimating])

  const handleReset = useCallback(() => {
    const chatGPT = chatGPTFunctionsRef.current
    const retrievedSearch = retrievedSearchFunctionsRef.current
    const postRequest = postRequestFunctionsRef.current
    const reasoningModel = reasoningModelFunctionsRef.current

    if (chatGPT) {
      chatGPT.reset()
    }
    if (retrievedSearch) {
      retrievedSearch.reset()
    }
    if (postRequest) {
      postRequest.reset()
    }
    if (reasoningModel) {
      reasoningModel.reset()
    }
    
    setIsAnimating(false)
    // Reset all active states
    setChatActive(false)
    setReasoningActive(false)
    setPostActive(false)
    setRetrievalActive(false)
    setShowFinal(false)
  }, [])

  const showFinalStage = useCallback(() => {
    // Set showFinal prop on all components to show final state immediately
    setShowFinal(true)
    // Set all stages to active (finished state)
    setChatActive(true)
    setReasoningActive(true)
    setPostActive(true)
    setRetrievalActive(true)
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
  }, [runSequentialAnimation, isAnimating, handleReset, showFinalStage, onActionButtons])

  return (
    <Container
      left={
        <PostRequestCard 
              showContext={true} 
              withSID={true} 
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
        <div className="flex flex-col gap-8 items-center h-full justify-between">
         <AIChatCard 
          isCorrect={true}
          onFunctionsReady={handleChatGPTFunctionsReady}
          query={query}
          isActive={chatActive}
          showFinal={showFinal}
        />
                  <div className="flex items-end">

          <ReasoningModelCard 
            onActionButtons={undefined} 
            onFunctionsReady={handleReasoningModelFunctionsReady}
            query={query}
            isActive={reasoningActive}
            showFinal={showFinal}
            onFinalQueryChange={(finalQueryText: string) => {
              setFinalQuery(finalQueryText)
            }}
            onBeforeQueryText={async () => {
              // Unhighlight lines in AI chat right before query text is inserted
              const chatGPT = chatGPTFunctionsRef.current
              if (chatGPT) {
                await chatGPT.unhighlightLines()
              }
            }}
            onRetrievalReady={async (stepIndex: number, retrievalText: string) => {
              // Each time a "wait" is called within the reasoning model (retrieval needed),
              // trigger a retrieval in the retrieved search
              // Retrieval becomes active during this process, reasoning becomes inactive
              setReasoningActive(false)
              setRetrievalActive(true)
              const retrievedSearch = retrievedSearchFunctionsRef.current
              if (retrievedSearch) {
                // First: insert text, unhighlight, and start retrieval
                await retrievedSearch.addTextAndRemoveHighlight(retrievalText)
                // Then: perform quick search (fast, no highlights)
                await retrievedSearch.quickSearch()
              }
              // Retrieval becomes inactive after search completes, reasoning becomes active again
              setRetrievalActive(false)
              setReasoningActive(true)
            }}
          />
            
          </div>
        </div>
      }
      right={
        <RetrievedSearchCard 
          onFunctionsReady={handleRetrievedSearchFunctionsReady}
          highlightDatabase={false}
          query={showFinal ? finalQuery : query}
          darkMode={true}
          isActive={retrievalActive}
          showFinal={showFinal}
          documents={generateSIDDocuments()}
        />
      }
      middleWrapper={{
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
    />
  )
}

