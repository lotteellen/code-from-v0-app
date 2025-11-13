import React from "react"


interface DummyLineProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  background?: string
  marginBottom?: string | number
  flex?: number | string
  style?: React.CSSProperties
  highlight?: boolean
}

export function DummyLine({
  width = "100%",
  height = "4px",
  borderRadius = "999px",
  background = "var(--light-grey)",
  marginBottom,
  flex,
  style,
  highlight = false,
}: DummyLineProps) {
  return (
    <div
      className={highlight ? "dummy-highlight-active" : ""}
      style={{
        height,
        width,
        borderRadius,
        background,
        ...(marginBottom !== undefined && { marginBottom }),
        ...(flex !== undefined && { flex }),
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

