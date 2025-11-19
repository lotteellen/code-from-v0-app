import React from "react"
import "./globals.css"

export function Document({
  title,
  content,
  fitContent = false,
}: {
  title?: string
  content?: React.ReactNode
  fitContent?: boolean
}) {
  return (
    <div className="document-outer h-full w-full" style={fitContent ? {} : { aspectRatio: "8.5 / 11" }}>
      <div className="styling-outer document fold-corner-clip" style={{ padding: fitContent ? "var(--padding)" : "var(--padding-vertical) var(--padding)" }}>
        <div className="h-full overflow-hidden flex flex-col">
          {title && (
            <div className="styling-title" style={{ paddingBottom: "var(--padding-vertical)" }}>
              {title}
            </div>
          )}
          {content && (
            <div className="document-content flex flex-col grow overflow-hidden" style={{ minHeight: 0 }}>
              {content}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
