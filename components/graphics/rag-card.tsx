"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { AIChat, type ChatGPTFunctions } from "@/components/graphics/elements/AI-chat"
import { PostRequest, type PostRequestFunctions } from "@/components/graphics/elements/post-request"
import { Search, type SearchFunctions } from "@/components/graphics/elements/search"
import { type DocumentItem } from "@/components/graphics/elements/document-variants"
import { type DatabaseFunctions } from "@/components/graphics/elements/database"
import { type DocumentStackFunctions } from "@/components/graphics/helpers/document-stack"
import { Container } from "@/components/graphics/container"
import {POST_REQUEST_TIMINGS, DATABASE_SEARCH_TIMINGS, AI_CHAT_TIMINGS, RETRIEVED_SEARCH_TIMINGS } from "@/components/graphics/helpers/animation-timings"

// Hardcoded 10 documents for RAG - used by both Search and PostRequest
const RAG_DOCUMENTS: DocumentItem[] = [
  { id: "rag-doc-0", title: "bullets", variant: "bullets", highlightLines: [0, 2, 4] },
  { id: "rag-doc-1", title: "table", variant: "table", highlightLines: [1, 4, 7] },
  { id: "rag-doc-2", title: "table", variant: "table", highlightLines: [0] },
  { id: "rag-doc-3", title: "simple", variant: "simple", highlightLines: [1, 3, 5] },
  { id: "rag-doc-4", title: "chart", variant: "chart", highlightLines: [0, 2] },
  { id: "rag-doc-5", title: "simple", variant: "simple", highlightLines: [1, 3, 5] },
  { id: "rag-doc-6", title: "table", variant: "table", highlightLines: [1, 4, 7] },
  { id: "rag-doc-7", title: "image", variant: "image", highlightLines: [0] },
  { id: "rag-doc-8", title: "chart", variant: "chart", highlightLines: [0, 2] },
  { id: "rag-doc-9", title: "bullets", variant: "bullets", highlightLines: [0, 2, 4] },
]

const DEFAULT_QUERY = "What was our enterprise pricing before we pivoted to SMB?"

export type RAGPipelineFunctions = {
  animate: () => Promise<void>
  setFinal: () => void
  reset: () => void
  // Child component refs
  aiChat: ChatGPTFunctions | null
  postRequest: PostRequestFunctions | null
  search: SearchFunctions | null
  database: DatabaseFunctions | null
  documentStack: DocumentStackFunctions | null
}

export function RAGPipelineCard({
  query = DEFAULT_QUERY,
  onFunctionsReady,
}: {
  query?: string
  onFunctionsReady?: (functions: RAGPipelineFunctions) => void
}) {
  // Shared document array - used by both Search and PostRequest
  const ragDocuments = RAG_DOCUMENTS
  
  const chatGPTFunctionsRef = useRef<ChatGPTFunctions | null>(null)
  const retrievedSearchFunctionsRef = useRef<SearchFunctions | null>(null)
  const postRequestFunctionsRef = useRef<PostRequestFunctions | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [chatActive, setChatActive] = useState(false)
  const [retrievalActive, setRetrievalActive] = useState(false)
  const [postActive, setPostActive] = useState(false)

  const showFinalStage = useCallback(() => {
    // Set all stages to active (finished state)
    setChatActive(true)
    setRetrievalActive(true)
    setPostActive(true)
    
    // Get references to child component functions
    const chatGPT = chatGPTFunctionsRef.current
    const retrievedSearch = retrievedSearchFunctionsRef.current
    const postRequest = postRequestFunctionsRef.current
    
    // Set final state on all components
    if (chatGPT) {
      chatGPT.setFinal() // AIChat.setFinal()
    }
    if (retrievedSearch) {
      retrievedSearch.setFinal(false) // Search.setFinal(false) - unhighlighted (final stage)
    }
    if (postRequest) {
      postRequest.setFinal() // PostRequest.setFinal()
    }
  }, [])

  const runSequentialAnimation = useCallback(async () => {
    if (isAnimating) {
      return // Prevent multiple simultaneous animations
    }

    // Get references to child component functions
    const chatGPT = chatGPTFunctionsRef.current
    const retrievedSearch = retrievedSearchFunctionsRef.current
    const postRequest = postRequestFunctionsRef.current

    // Reset Phase: Reset all child components to initial state
    if (chatGPT) {
      chatGPT.reset() // AIChat.reset()
    }
    if (retrievedSearch) {
      retrievedSearch.reset() // Search.reset()
    }
    if (postRequest) {
      postRequest.reset() // PostRequest.reset()
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

      // Step 1: User Message Animation (database stays at low opacity)
      setChatActive(true)
      await chatGPT.animateUserMessage() // AIChat.animateUserMessage()
      // Step 2: Focus on User Message, Add Text, and Unfocus
      // Break before focus
      await new Promise((resolve) =>
        setTimeout(resolve, AI_CHAT_TIMINGS.BREAK_BEFORE_FOCUS_MS)
      )
      // Focus on user message
      await chatGPT.focus() // AIChat.focus()
      // Activate Database (blend in immediately after focus)
      setRetrievalActive(true)
      // Wait for opacity transition to complete (400ms from CSS)
      const OPACITY_TRANSITION_DURATION_MS = 400 // matches --opacity-transition-duration: 0.4s
      await new Promise((resolve) =>
        setTimeout(resolve, OPACITY_TRANSITION_DURATION_MS)
      )
      // Break before addText
      await new Promise((resolve) =>
        setTimeout(resolve, RETRIEVED_SEARCH_TIMINGS.BREAK_BEFORE_ADD_TEXT_MS)
      )
      // Add text to database
      await retrievedSearch.addText(query) // Search.addText(query)
      // Break before unfocus
      await new Promise((resolve) =>
        setTimeout(resolve, AI_CHAT_TIMINGS.BREAK_AFTER_FOCUS_BEFORE_UNFOCUS_MS)
      )
      // Unfocus User Message
      await chatGPT.unFocus() // AIChat.unFocus()

      // Step 4: Database Search Animation
      // Break before search animation
      await new Promise((resolve) =>
        setTimeout(resolve, DATABASE_SEARCH_TIMINGS.BREAK_BEFORE_SEARCH_ANIMATION_MS)
      )
      // Set chat active to false
      setChatActive(false)
      // Start search animation (skip addText since it was already called in Step 2)
      await retrievedSearch.search(query, false, true) // Search.search(query, false, true) - slow search with skipAddText

      // Step 5: Break after highlighting completes (part of Step 5 completion)
      await new Promise((resolve) =>
        setTimeout(resolve, RETRIEVED_SEARCH_TIMINGS.BREAK_AFTER_HIGHLIGHT_BEFORE_POST_REQUEST_MS)
      )

      // Step 6: Post Request Animation - Context Phase
      // Break after retrieval
      await new Promise((resolve) =>
        setTimeout(resolve, POST_REQUEST_TIMINGS.DELAY_AFTER_RETRIEVAL_MS)
      )
      setPostActive(true)
      // Break after post becomes active and before animation starts
      await new Promise((resolve) =>
        setTimeout(resolve, POST_REQUEST_TIMINGS.BREAK_AFTER_POST_ACTIVE_BEFORE_ANIMATION_MS)
      )
      await postRequest.animateContext() // PostRequest.animateContext()
      await postRequest.animateUserMessage() // PostRequest.animateUserMessage()
      
      // Step 8: Break After Post Animation
      // Set retrievalActive to false slightly earlier to start fade-out
      setRetrievalActive(false)
      // Quick break after post-request animation completes
      await new Promise((resolve) =>
        setTimeout(resolve, POST_REQUEST_TIMINGS.BREAK_AFTER_POST_ANIMATION_MS)
      )

      // Break before pulsate starts
      await new Promise((resolve) =>
        setTimeout(resolve, POST_REQUEST_TIMINGS.BREAK_BEFORE_PULSATE_MS)
      )

      // Step 9: Pulsate API Call + Animate Assistant Message
      setChatActive(true)
      // Start pulsation and assistant message animation simultaneously
      const pulsatePromise = postRequest.pulsate() // PostRequest.pulsate()
      const assistantMessagePromise = chatGPT.animateAssistantMessage() // AIChat.animateAssistantMessage()
      // Wait for both to complete
      await Promise.all([pulsatePromise, assistantMessagePromise])

      // Step 10: Animate Indicator
      setPostActive(false)
      await chatGPT.animateIndicator() // AIChat.animateIndicator()

      // Break before final blend
      await new Promise((resolve) =>
        setTimeout(resolve, AI_CHAT_TIMINGS.BREAK_BEFORE_FINAL_BLEND_MS)
      )

      // Step 11: Final State - Set all components to final visible state
      showFinalStage()

      // Completion
      // Note: showFinalStage() already sets all panels to active, so we don't need to set them inactive here
    } catch (error) {
      console.error("Animation sequence error:", error)
    } finally {
      setIsAnimating(false)
    }
  }, [isAnimating, query, showFinalStage])

  const handleReset = useCallback(() => {
    // Get references to child component functions
    const chatGPT = chatGPTFunctionsRef.current
    const retrievedSearch = retrievedSearchFunctionsRef.current
    const postRequest = postRequestFunctionsRef.current

    // Reset all child components
    if (chatGPT) {
      chatGPT.reset() // AIChat.reset()
    }
    if (retrievedSearch) {
      retrievedSearch.reset() // Search.reset()
    }
    if (postRequest) {
      postRequest.reset() // PostRequest.reset()
    }

    // Reset all active states
    setIsAnimating(false)
    setChatActive(false)
    setRetrievalActive(false)
    setPostActive(false)
  }, [])

  // Update exposed functions whenever child refs or main functions change
  const updateExposedFunctions = useCallback(() => {
    if (onFunctionsReady) {
      onFunctionsReady({
        animate: runSequentialAnimation,
        setFinal: showFinalStage,
        reset: handleReset,
        aiChat: chatGPTFunctionsRef.current,
        postRequest: postRequestFunctionsRef.current,
        search: retrievedSearchFunctionsRef.current,
        database: null, // Database functions are no longer exposed by Search component
        documentStack: postRequestFunctionsRef.current?.documentStack || null,
      })
    }
  }, [onFunctionsReady, runSequentialAnimation, showFinalStage, handleReset])

  // Handlers that set refs and trigger function exposure update
  const handleChatGPTFunctionsReady = useCallback((functions: ChatGPTFunctions) => {
    chatGPTFunctionsRef.current = functions
    updateExposedFunctions()
  }, [updateExposedFunctions])

  const handleRetrievedSearchFunctionsReady = useCallback((functions: SearchFunctions) => {
    retrievedSearchFunctionsRef.current = functions
    updateExposedFunctions()
  }, [updateExposedFunctions])

  const handlePostRequestFunctionsReady = useCallback((functions: PostRequestFunctions) => {
    postRequestFunctionsRef.current = functions
    updateExposedFunctions()
  }, [updateExposedFunctions])

  // Expose functions to parent component when main functions change
  useEffect(() => {
    updateExposedFunctions()
  }, [updateExposedFunctions])

  return (
    <Container
      left={
        <PostRequest
          documents={ragDocuments}
          onFunctionsReady={handlePostRequestFunctionsReady}
          isActive={postActive}
          onAnimateUserMessageStart={() => setRetrievalActive(false)}
        />
      }
      middle={
        <AIChat
          isCorrect={false}
          onFunctionsReady={handleChatGPTFunctionsReady}
          query={query}
          isActive={chatActive}
        />
      }
      right={
        <Search
          onFunctionsReady={handleRetrievedSearchFunctionsReady}
          query={query}
          isActive={retrievalActive}
          documents={[...ragDocuments].reverse()}
        />
      }
      leftWrapper={{
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
      middleWrapper={
        {
          // style: {
          //   display: "flex",
          //   flexDirection: "column",
          //   justifyContent: "flex-start",
          //   height: "100%"
          // }
        }
      }
    />
  )
}
