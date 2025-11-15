import React, { useRef, useEffect, useState } from "react"
import { DocumentVariants } from "../elements/document-variants"
import { POST_REQUEST_TIMINGS, RAG_HIGHLIGHT_TIMINGS } from "./animation-timings"
import "./globals.css"

// Constants
const CONTEXT_HIGHLIGHT_HALFWAY_MS = 400

// Document stack styles
const documentStackClassName = "relative"
const documentStackStyle: React.CSSProperties = {
  contain: 'layout style'
}
const documentVariantsClassName = "absolute"
const documentVariantsStyle: React.CSSProperties = {
  contain: 'layout style'
}

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

export interface DocumentStackProps {
  documents: string[]
  animateContext: boolean
  showFinal?: boolean
}

export function DocumentStack({ documents, animateContext, showFinal = false }: DocumentStackProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
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
  const randomDelays = POST_REQUEST_TIMINGS.DOCUMENT_STACK_DELAYS_MS
  
  const totalDocuments = stackStyle.length

  return (
    //  All on top of each other in a stack
    <div 
      ref={containerRef}
      className={documentStackClassName} 
      style={{
        ...documentStackStyle,
        width: '200px',
        height: '80px',
        margin: '0 auto',
        overflow: 'visible',
      }}
    >
      {stackStyle.map((style, index) => {
        const entryDir = entryDirections[index % entryDirections.length]
        // Documents start appearing halfway through context highlight (at 400ms)
        // Then each document has its own delay on top of that
        const baseDelay = randomDelays[index % randomDelays.length]
        const animationDelay = (showFinal || !animateContext) ? 0 : (CONTEXT_HIGHLIGHT_HALFWAY_MS + baseDelay)
        
        return (
          <div 
            key={index} 
            className={`${documentVariantsClassName} ${(showFinal || !animateContext) ? '' : 'paper-stack-animate'}`}
            style={{
              ...documentVariantsStyle,
              '--paper-rotation': style.rotate,
              '--entry-x': entryDir.translateX,
              '--entry-y': entryDir.translateY,
              transform: `scale(0.8) rotate(${style.rotate})`,
              bottom: `${style.bottom}px`,
              left: `${style.left}px`,
              zIndex: totalDocuments - index,
              animationDelay: `${animationDelay}ms`,
              opacity: showFinal ? 1 : undefined, // Let CSS animation control opacity when animating
            } as React.CSSProperties}
          >
            <DocumentVariants 
              variant={documents[index]} 
              highlightLines={getHighlightLinesForVariant(documents[index])}
              externalHighlight={showFinal}
              showFinal={showFinal}
            />
          </div>
        )
      })}
    </div>
  )
}

