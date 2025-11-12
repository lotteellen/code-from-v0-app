import React from "react"


interface DummyLineProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  background?: string
  marginBottom?: string | number
  flex?: number | string
  style?: React.CSSProperties
}

export function DummyLine({
  width = "100%",
  height = "4px",
  borderRadius = "999px",
  background = "var(--very-light-grey)",
  marginBottom,
  flex,
  style,
}: DummyLineProps) {
  return (
    <div
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
  style?: React.CSSProperties
}

export function DummyParagraph({
  items,
  direction = "column",
  gap = "4px",
  alignItems,
  style,
}: DummyParagraphProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction,
        gap,
        ...(alignItems !== undefined && { alignItems }),
        ...style,
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>{item}</React.Fragment>
      ))}
    </div>
  )
}

