import React from "react"
import "./globals.css"

export function Document({ 
  title, 
  content, 
  aspectRatio = "8.5 / 11", 
  verticalPadding = true 
}: { 
  title?: string; 
  content?: React.ReactNode; 
  aspectRatio?: string; 
  verticalPadding?: boolean;
}) {
  // If aspectRatio is falsy or "no-aspect-ratio", fit content instead of using aspect ratio
  const shouldFitContent = !aspectRatio || aspectRatio === "no-aspect-ratio"
  const basePadding = verticalPadding ? "var(--padding-vertical) var(--padding)" : "var(--padding)"
  const titleBottomPadding = verticalPadding ? "var(--padding-vertical)" : "var(--padding)"
  
  return (
    <div 
      className={`document-outer ${shouldFitContent ? "h-fit" : "h-full w-full"}`} 
      style={shouldFitContent ? {} : { aspectRatio }}
    >
      <div className="styling-outer document fold-corner-clip" style={{ padding: basePadding }}>
        <div className={`${shouldFitContent ? "h-fit" : "h-full"} overflow-hidden flex flex-col`}>
          {title && (
            <div className="styling-title" style={{ paddingBottom: titleBottomPadding }}>
              {title}
            </div>
          )}
          {content && (
            <div 
              className={`document-content flex flex-col ${shouldFitContent ? "" : "grow"} overflow-hidden`}
              style={shouldFitContent ? {} : { minHeight: 0 }}
            >
              {content}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}