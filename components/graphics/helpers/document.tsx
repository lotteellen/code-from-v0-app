import React from "react"
import "./globals.css"


export function Document({ title, content, aspectRatio = "8.5 / 11", verticalPadding = true }: { title?: string; content?: React.ReactNode; aspectRatio?: string; verticalPadding?: boolean;}) {
  const shouldFitContent = aspectRatio === "no-aspect-ratio"
  const heightClass = shouldFitContent ? "h-fit" : "h-full"
  const widthClass = shouldFitContent ? "" : "w-full"
  const aspectRatioStyle = shouldFitContent ? {} : { aspectRatio: aspectRatio }
  
  return (
    <div className={`document-outer ${heightClass} ${widthClass}`} style={aspectRatioStyle}>
        <div className="styling-outer document fold-corner-clip" style={{ padding: verticalPadding ? "var(--padding-vertical) var(--padding)" : "var(--padding)" }}>
          <div className={`${heightClass} overflow-hidden flex flex-col`}>
            {title && <div className="styling-title" style={{ paddingBottom: verticalPadding ? "var(--padding-vertical)" : "var(--padding)" }}>{title}</div>}
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