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

export interface DummyLineProps {
  width?: string | number
  height?: string | number
  background?: string
  customStyle?: React.CSSProperties
  highlightClassName?: string
}

export function DummyLine({
  width = "100%",
  height = "4px",
  background = "var(--light-grey)",
  customStyle,
  highlightClassName = "",
}: DummyLineProps) {
  return (
    <div
      className={highlightClassName || undefined}
      style={{
        height,
        width,
        borderRadius: "999px",
        background,
        ...customStyle,
      }}
    />
  )
}

export interface DummyParagraphProps {
  items: React.ReactNode[]
  direction?: "row" | "column"
  gap?: string | number
  style?: React.CSSProperties
}

export function DummyParagraph({
  items,
  direction = "column",
  gap = "4px",
  style,
}: DummyParagraphProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction,
        gap,
        ...style,
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>{item}</React.Fragment>
      ))}
    </div>
  )
}
