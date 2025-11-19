"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { AIChat, type ChatGPTFunctions } from "@/components/graphics/elements/AI-chat"
import { PostRequest, type PostRequestFunctions } from "@/components/graphics/elements/post-request"
import { Search, type SearchFunctions } from "@/components/graphics/elements/search"
import { type DocumentItem } from "@/components/graphics/elements/document-variants"
import { ReasoningModel, type ReasoningModelFunctions } from "@/components/graphics/elements/reasoning-model"
import { Container } from "@/components/graphics/container"
import {
  POST_REQUEST_TIMINGS,
  AI_CHAT_TIMINGS,
  RAG_HIGHLIGHT_TIMINGS,
} from "@/components/graphics/helpers/animation-timings"

// Helper function to get highlight lines for each document variant
const getHighlightLinesForVariant = (variant: string): number[] => {
  switch (variant.toLowerCase()) {
    case "simple":
      return [...RAG_HIGHLIGHT_TIMINGS.DOCUMENT_HIGHLIGHT_LINES.SIMPLE]
    case "bullets":
      return [...RAG_HIGHLIGHT_TIMINGS.DOCUMENT_HIGHLIGHT_LINES.BULLETS]
    case "chart":
      return [...RAG_HIGHLIGHT_TIMINGS.DOCUMENT_HIGHLIGHT_LINES.CHART]
    case "table":
      return [...RAG_HIGHLIGHT_TIMINGS.DOCUMENT_HIGHLIGHT_LINES.TABLE]
    case "image":
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

const DEFAULT_QUERY = "What was our enterprise pricing before we pivoted to SMB?"

export function SIDPipelineCard({
  query = DEFAULT_QUERY,
}: {
  query?: string
}) {
  const chatGPTFunctionsRef = useRef<ChatGPTFunctions | null>(null)
  const retrievedSearchFunctionsRef = useRef<SearchFunctions | null>(null)
  const postRequestFunctionsRef = useRef<PostRequestFunctions | null>(null)
  const reasoningModelFunctionsRef = useRef<ReasoningModelFunctions | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [chatActive, setChatActive] = useState(false)
  const [reasoningActive, setReasoningActive] = useState(false)
  const [postActive, setPostActive] = useState(false)
  const [retrievalActive, setRetrievalActive] = useState(false)
  const [showFinal, setShowFinal] = useState(false)

  const handleChatGPTFunctionsReady = useCallback((functions: ChatGPTFunctions) => {
    chatGPTFunctionsRef.current = functions
  }, [])

  const handleRetrievedSearchFunctionsReady = useCallback((functions: SearchFunctions) => {
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
      // Unhighlight lines in ChatGPT before inserting query text
      await chatGPT.unFocus()
      // The reasoning model will handle:
      // - onRetrieve: trigger retrieval in retrieved search (handled via callback)
      await reasoningModel.insertQueryText()
      await reasoningModel.runRemainingSequence()

      // Break between retrieval completion and post animation (same as RAG)
      await new Promise((resolve) =>
        setTimeout(resolve, POST_REQUEST_TIMINGS.DELAY_AFTER_RETRIEVAL_MS)
      )

      // Step 6: After reasoning sequence is done, trigger animate in post request (with SID context)
      // Post becomes active, reasoning becomes inactive
      setChatActive(false)
      setReasoningActive(false)
      setRetrievalActive(false)
      setPostActive(true)
      await postRequest.animateContext()
      await postRequest.animateUserMessage()

      // Step 7: Pulse post request and trigger assistant message
      const pulsatePromise = postRequest.pulsate()
      setTimeout(async () => {
        setChatActive(true)
        if (chatGPT) {
          await chatGPT.animateAssistantMessage()
        }
        setChatActive(false)
      }, 1000)
      await pulsatePromise

      // Post request animation is complete
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

  return (
    <Container
      left={
        <PostRequest
          documents={[]}
          onFunctionsReady={handlePostRequestFunctionsReady}
          isActive={postActive}
          onAnimateUserMessageStart={() => setRetrievalActive(false)}
        />
      }
      middle={
        <div className="flex flex-col gap-8 items-center h-full justify-between">
          <AIChat
            isCorrect={true}
            onFunctionsReady={handleChatGPTFunctionsReady}
            query={query}
            isActive={chatActive}
          />
          <div className="flex items-end">
            <ReasoningModel
              onFunctionsReady={handleReasoningModelFunctionsReady}
              query={query}
              isActive={reasoningActive}
              onRetrieve={async (retrievalText: string) => {
                // Each time a "wait" is called within the reasoning model (retrieval needed),
                // trigger a retrieval in the retrieved search
                // Retrieval becomes active during this process, reasoning becomes inactive
                setReasoningActive(false)
                setRetrievalActive(true)
                const retrievedSearch = retrievedSearchFunctionsRef.current
                if (retrievedSearch) {
                  // Perform quick search (fast, no highlights)
                  await retrievedSearch.search(retrievalText, true)
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
        <Search
          onFunctionsReady={handleRetrievedSearchFunctionsReady}
          query={query}
          isActive={retrievalActive}
          documents={generateSIDDocuments()}
        />
      }
      middleWrapper={{
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          height: "100%",
        },
      }}
      rightWrapper={{
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          height: "100%",
        },
      }}
    />
  )
}
