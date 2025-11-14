"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChatGPTCard } from "@/components/graphics/chatgpt-card"
import { PostRequestCard } from "@/components/graphics/post-request-card"
import { RetrievedSearchCard } from "@/components/graphics/retrieved-search-card"
import { Button } from "@/components/ui/button"

type ChatGPTFunctions = {
  animateUserMessage: () => Promise<void>;
  unhighlightLines: () => Promise<void>;
  animateAssistantMessage: () => Promise<void>;
  reset: () => void;
}

type RetrievedSearchFunctions = {
  addTextAndRemoveHighlight: () => Promise<void>;
  search: () => Promise<void>;
  highlight: () => Promise<void>;
  reset: () => void;
}

type PostRequestFunctions = {
  animate: () => Promise<void>;
  reset: () => void;
}

export function RAGCard({
  onActionButtons
}: {
  onActionButtons?: (buttons: React.ReactNode) => void;
}) {
  const chatGPTFunctionsRef = useRef<ChatGPTFunctions | null>(null)
  const retrievedSearchFunctionsRef = useRef<RetrievedSearchFunctions | null>(null)
  const postRequestFunctionsRef = useRef<PostRequestFunctions | null>(null)
  const onActionButtonsRef = useRef(onActionButtons)
  const [isAnimating, setIsAnimating] = useState(false)

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

  const runSequentialAnimation = useCallback(async () => {
    if (isAnimating) {
      return // Prevent multiple simultaneous animations
    }

    setIsAnimating(true)

    try {
      const chatGPT = chatGPTFunctionsRef.current
      const retrievedSearch = retrievedSearchFunctionsRef.current
      const postRequest = postRequestFunctionsRef.current

      if (!chatGPT || !retrievedSearch || !postRequest) {
        console.warn("Not all component functions are ready")
        setIsAnimating(false)
        return
      }

      // Step 1: Animate user message in chatgpt component
      await chatGPT.animateUserMessage()

      // Step 2: When done: Call add text + remove highlight in retrieved search data
      await retrievedSearch.addTextAndRemoveHighlight()

      // Step 3: When done: Call unhighlight function in chatgpt
      await chatGPT.unhighlightLines()

      // Step 4: When done: Trigger search in retrieved search
      await retrievedSearch.search()

      // Step 5: When done: Trigger highlight in retrieved search
      await retrievedSearch.highlight()

      // Step 6: When done: Trigger animate in post request
      await postRequest.animate()

      // Step 7: When done: Trigger assistant in chatgpt
      await chatGPT.animateAssistantMessage()
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
  }, [])

  useEffect(() => {
    if (onActionButtonsRef.current) {
      const buttons = (
        <div className="flex gap-2">
          <Button 
            onClick={runSequentialAnimation} 
            size="sm"
            disabled={isAnimating}
          >
            {isAnimating ? "Animating..." : "Run Full Sequence"}
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
  }, [runSequentialAnimation, isAnimating, handleReset])

  return (
    <div className="flex flex-row gap-8 items-start justify-center w-full flex-wrap">
      {/* Leftmost: Chat with wrong answer */}
      <div style={{ width: "200px", flexShrink: 0 }}>
        <ChatGPTCard 
          isCorrect={false}
          onFunctionsReady={handleChatGPTFunctionsReady}
        />
      </div>
      
      {/* Middle: Post request with documents */}
      <div style={{ width: "200px", flexShrink: 0 }}>
        <PostRequestCard 
          showContext={true} 
          withSID={false} 
          onFunctionsReady={handlePostRequestFunctionsReady}
        />
      </div>
      
      {/* Rightmost: Retrieved search */}
      <div style={{ flex: "1 1 auto", minWidth: "300px", maxWidth: "600px" }}>
        <RetrievedSearchCard 
          onFunctionsReady={handleRetrievedSearchFunctionsReady}
        />
      </div>
    </div>
  )
}

