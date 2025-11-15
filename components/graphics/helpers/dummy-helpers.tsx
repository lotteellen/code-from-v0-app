import React from "react"

/**
 * Returns the CSS class for highlight animation state.
 * - Returns empty string if not highlighted
 * - Returns "dummy-highlight-final" if showFinal is true (no animation, immediate highlight)
 * - Returns "dummy-highlight-active" if showFinal is false (animated highlight)
 */
export function getHighlightClass(highlight: boolean, showFinal: boolean): string {
  if (!highlight) return ""
  return showFinal ? "dummy-highlight-final" : "dummy-highlight-active"
}

/**
 * Checks if a line index should be highlighted based on the highlightLines array.
 */
export function isLineHighlighted(lineIndex: number, highlightLines?: number[]): boolean {
  return highlightLines?.includes(lineIndex) ?? false
}

interface DummyLineProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  background?: string
  style?: React.CSSProperties
  highlight?: boolean
  className?: string
  showFinal?: boolean
}

export function DummyLine({
  width = "100%",
  height = "4px",
  borderRadius = "999px",
  background = "var(--light-grey)",
  style,
  highlight = false,
  className = "",
  showFinal = false,
}: DummyLineProps) {
  const highlightClass = getHighlightClass(highlight, showFinal)
  const classes = [highlightClass, className].filter(Boolean).join(" ")
  
  return (
    <div
      className={classes || undefined}
      style={{
        height,
        width,
        borderRadius,
        background,
        ...style,
      }}
    />
  )
}

interface DummyParagraphProps {
  items: React.ReactNode[]
  direction?: "row" | "column"
  gap?: string | number
  alignItems?: React.CSSProperties["alignItems"]
  justifyContent?: React.CSSProperties["justifyContent"]
  style?: React.CSSProperties
}

export function DummyParagraph({
  items,
  direction = "column",
  gap = "4px",
  alignItems,
  justifyContent,
  style,
}: DummyParagraphProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction,
        gap,
        ...(alignItems !== undefined && { alignItems }),
        ...(justifyContent !== undefined && { justifyContent }),
        ...style,
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>{item}</React.Fragment>
      ))}
    </div>
  )
}

