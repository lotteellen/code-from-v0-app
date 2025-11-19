import React, { useState, useEffect, useCallback, useRef } from "react"
import { DocumentVariants } from "../elements/document-variants"
import { POST_REQUEST_TIMINGS } from "./animation-timings"
import { type DocumentItem } from "../elements/document-variants"
import "./globals.css"

export type DocumentStackFunctions = {
  animate: () => void
  setFinal: (highlighted: boolean) => void
  reset: () => void
}

export interface DocumentStackProps {
  documents: (string | DocumentItem)[]
  onFunctionsReady?: (functions: DocumentStackFunctions) => void
}

// Export stack positions with bottom values for unshuffle offset calculation
// Container height is 108px, so bottom = 108 - top
export const STACK_POSITIONS = [
  { rotate: "10deg", bottom: 108 - 0.5, left: -1.0 },
  { rotate: "-5deg", bottom: 108 - 1.5, left: 24.0 },
  { rotate: "7deg", bottom: 108 - 3.5, left: 59.0 },
  { rotate: "-13deg", bottom: 108 - (-0.5), left: 94.0 },
  { rotate: "9deg", bottom: 108 - 5.5, left: 174.0 },
  { rotate: "-3deg", bottom: 108 - 1.5, left: 14.0 },
  { rotate: "-11deg", bottom: 108 - (-1.5), left: 44.0 },
  { rotate: "5deg", bottom: 108 - 4.5, left: 79.0 },
  { rotate: "-7deg", bottom: 108 - 2.5, left: 124.0 },
  { rotate: "0deg", bottom: 108 - 7.5, left: 149.0 },
]

export function DocumentStack({
  documents,
  onFunctionsReady,
}: DocumentStackProps) {
  // Direct state management - simpler than internal mode system
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showFinal, setShowFinal] = useState(false)
  const [finalHighlighted, setFinalHighlighted] = useState(false)
  
  // Refs to store child component functions
  const documentVariantRefs = useRef<Map<string, {
    setFinal: (highlighted: boolean) => void
    animateHighlight: (lineIndex: number | number[]) => void
    reset: () => void
  }>>(new Map())
  const documentHighlightLinesRef = useRef<Map<string, number[]>>(new Map())

  const positions = [
    { rotate: "10deg", top: 0.5, left: -1.0 },
    { rotate: "-5deg", top: 1.5, left: 24.0 },
    { rotate: "7deg", top: 3.5, left: 59.0 },
    { rotate: "-13deg", top: -0.5, left: 94.0 },
    { rotate: "9deg", top: 5.5, left: 174.0 },
    { rotate: "-3deg", top: 1.5, left: 14.0 },
    { rotate: "-11deg", top: -1.5, left: 44.0 },
    { rotate: "5deg", top: 4.5, left: 79.0 },
    { rotate: "-7deg", top: 2.5, left: 124.0 },
    { rotate: "0deg", top: 7.5, left: 149.0 },
  ]

  const entryAnimations = [
    { translateX: "10px", translateY: "47px" },
    { translateX: "-55px", translateY: "58px" },
    { translateX: "50px", translateY: "43px" },
    { translateX: "-30px", translateY: "52px" },
    { translateX: "80px", translateY: "48px" },
    { translateX: "-5px", translateY: "60px" },
    { translateX: "-70px", translateY: "45px" },
    { translateX: "35px", translateY: "55px" },
    { translateX: "-45px", translateY: "40px" },
    { translateX: "65px", translateY: "50px" },
  ]

  const delays = POST_REQUEST_TIMINGS.DOCUMENT_STACK_DELAYS_MS

  // Handle animate function - triggers animation with highlights already visible
  const handleAnimate = useCallback(() => {
    setIsVisible(true)
    setIsAnimating(true)
    // Set final state with highlights immediately - highlights should be there, not animated
    setShowFinal(true)
    setFinalHighlighted(true)
    
    // Apply final state with highlights to all child components immediately
    setTimeout(() => {
      documentVariantRefs.current.forEach((funcs, docId) => {
        funcs.setFinal(true)
        const highlightLines = documentHighlightLinesRef.current.get(docId)
        if (highlightLines && highlightLines.length > 0) {
          highlightLines.forEach((lineIndex) => {
            funcs.animateHighlight(lineIndex)
          })
        }
      })
    }, 10)
    
    // After animation completes, stop animating but keep final state
    // Animation duration is 0.3s (300ms) + max delay + initial 200ms offset
    const maxDelay = Math.max(...delays) + 200 + 300
    setTimeout(() => {
      setIsAnimating(false)
    }, maxDelay)
  }, [delays])

  // Handle setFinal function - sets final state immediately
  const handleSetFinal = useCallback((highlighted: boolean) => {
    setIsVisible(true)
    setIsAnimating(false)
    setShowFinal(true)
    setFinalHighlighted(highlighted)
    
    // Apply final state to all child components
    setTimeout(() => {
      documentVariantRefs.current.forEach((funcs, docId) => {
        if (highlighted) {
          funcs.setFinal(true)
          const highlightLines = documentHighlightLinesRef.current.get(docId)
          if (highlightLines && highlightLines.length > 0) {
            highlightLines.forEach((lineIndex) => {
              funcs.animateHighlight(lineIndex)
            })
          }
        } else {
          // For setFinal(false), never show highlights
          // First reset to clear any existing highlights, then set final state without highlights
          funcs.reset()
          funcs.setFinal(false)
          // Do NOT call animateHighlight - highlights should never appear
        }
      })
    }, 10)
  }, [])

  // Handle reset function - resets all state
  const handleReset = useCallback(() => {
    setIsVisible(false)
    setIsAnimating(false)
    setShowFinal(false)
    setFinalHighlighted(false)
    
    // Reset all child components
    documentVariantRefs.current.forEach((funcs) => {
      funcs.reset()
    })
    
    // Clear refs
    documentVariantRefs.current.clear()
    documentHighlightLinesRef.current.clear()
  }, [])

  // Expose functions via onFunctionsReady - following the same pattern as other components
  useEffect(() => {
    if (onFunctionsReady) {
      onFunctionsReady({
        animate: handleAnimate,
        setFinal: handleSetFinal,
        reset: handleReset,
      })
    }
  }, [onFunctionsReady, handleAnimate, handleSetFinal, handleReset])

  // Early return for reset state
  if (!isVisible) {
    return (
      <div
        className="relative"
        style={{
          width: "250px",
          height: "108px",
          margin: "0 auto",
          overflow: "visible",
        }}
      />
    )
  }

  // Determine rendering properties
  const shouldAnimate = isAnimating
  const isFinalImmediate = showFinal && !isAnimating && finalHighlighted
  const isFinalUnhighlighted = showFinal && !isAnimating && !finalHighlighted

  return (
    <div
      className="relative"
      style={{
        width: "250px",
        height: "108px",
        margin: "0 auto",
        overflow: "visible",
      }}
    >
      {documents.slice(0, positions.length).map((doc, i) => {
        const pos = positions[i]
        const entry = entryAnimations[i % entryAnimations.length]
        const delay = shouldAnimate ? 200 + delays[i % delays.length] : 0
        
        // Extract variant and highlightLines from doc
        const variant = typeof doc === "string" ? doc : doc.variant
        const highlightLines = typeof doc === "string" ? undefined : doc.highlightLines
        const title = typeof doc === "string" ? undefined : doc.title
        const docId = typeof doc === "string" ? `${variant}-${i}` : doc.id

        // Determine opacity and visibility
        // For animation: let CSS handle opacity (starts at 0, animates to 1)
        // For final with highlights: show immediately with opacity 1
        // For final without highlights: show immediately with opacity 1
        const isDocVisible = isFinalImmediate || shouldAnimate || isFinalUnhighlighted
        const opacity = isFinalImmediate || isFinalUnhighlighted ? 1 : (shouldAnimate ? undefined : 0)

        return (
          <div
            key={docId}
            className={shouldAnimate ? "paper-stack-animate" : ""}
            style={{
              position: "absolute",
              "--paper-rotation": pos.rotate,
              "--entry-x": entry.translateX,
              "--entry-y": entry.translateY,
              transform: `scale(0.8) rotate(${pos.rotate})`,
              top: `${pos.top}px`,
              left: `${pos.left}px`,
              zIndex: i + 1,
              animationDelay: shouldAnimate ? `${delay}ms` : undefined,
              opacity: opacity,
              visibility: isDocVisible ? "visible" : "hidden",
            } as React.CSSProperties}
          >
            <DocumentVariants 
              variant={variant}
              title={title}
              onFunctionsReady={(funcs) => {
                // Store ref for later updates
                documentVariantRefs.current.set(docId, funcs)
                
                // Store highlightLines for this document
                if (highlightLines && highlightLines.length > 0) {
                  documentHighlightLinesRef.current.set(docId, highlightLines)
                }
                
                // Set initial state based on current state
                if (showFinal) {
                  if (finalHighlighted) {
                    funcs.setFinal(true)
                    if (highlightLines && highlightLines.length > 0) {
                      highlightLines.forEach((lineIndex) => {
                        funcs.animateHighlight(lineIndex)
                      })
                    }
                  } else {
                    // For final without highlights, never show highlights
                    // Reset first to clear any existing highlights, then set final state
                    funcs.reset()
                    funcs.setFinal(false)
                    // Do NOT call animateHighlight
                  }
                } else if (isAnimating && finalHighlighted) {
                  // During animation with highlights, set highlights immediately
                  funcs.setFinal(true)
                  if (highlightLines && highlightLines.length > 0) {
                    highlightLines.forEach((lineIndex) => {
                      funcs.animateHighlight(lineIndex)
                    })
                  }
                }
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
