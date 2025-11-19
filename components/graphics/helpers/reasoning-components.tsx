import React from "react"

export type LineIconType = "open" | "search" | "spinner" | "done" | "document" | "answer" | null

export function Section({
  title,
  children,
  borderTop = true,
  noTopMargin = false,
}: {
  title?: string
  children: React.ReactNode
  borderTop?: boolean
  noTopMargin?: boolean
}) {
  return (
    <div
      className={`${borderTop ? "border-t-[0.5px] border-[var(--medium-light-grey)]" : ""} ${borderTop && !noTopMargin ? "mt-[var(--padding)]" : ""}`}
    >
      {title && <p className={`styling-text font-bold line-height-1 ${noTopMargin ? "pb-[var(--padding)]" : "py-[var(--padding)]"}`}>{title}</p>}
      {children}
    </div>
  )
}

// Shared icon wrapper styles
const iconWrapperStyle: React.CSSProperties = {
  width: "6px",
  height: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  boxSizing: "border-box",
}

// Helper to create icon wrapper with merged styles
function IconWrapper({
  children,
  style,
}: {
  children?: React.ReactNode
  style?: React.CSSProperties
}) {
  return <div style={{ ...iconWrapperStyle, ...style }}>{children}</div>
}

// Shared SVG props for Search and Document icons
const svgIconProps = {
  width: "5.5",
  height: "5.5",
  fill: "none" as const,
  stroke: "#9CA3AF",
  strokeWidth: "2",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

// Shared checkmark SVG component
function Checkmark({ stroke = "white" }: { stroke?: string }) {
  return (
    <svg width="5" height="5" viewBox="0 0 22 22" fill="none">
      <path
        d="M 4 11 L 9 16 L 18 7"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Checkbox({
  checked,
  showFinal = false,
}: {
  checked: boolean
  showFinal?: boolean
}) {
  return (
    <IconWrapper
      style={{
        borderRadius: "999px",
        background: checked ? "var(--traffic-light-green)" : "transparent",
        border: checked ? "none" : "0.5px solid var(--medium-grey)",
        transition: showFinal ? "none" : "all 0.2s ease",
      }}
    >
      {checked && <Checkmark />}
    </IconWrapper>
  )
}

export function Search() {
  return (
    <IconWrapper>
      <svg {...svgIconProps} viewBox="2 2 21 21">
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 6 6" strokeWidth="2.5" />
      </svg>
    </IconWrapper>
  )
}

export function Document() {
  return (
    <IconWrapper>
      <svg {...svgIconProps} viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
    </IconWrapper>
  )
}

export function Answer() {
  return (
    <IconWrapper style={{ borderRadius: "999px", background: "white", border: "none" }}>
      <Checkmark stroke="var(--dark-grey)" />
    </IconWrapper>
  )
}

export function Spinner() {
  return (
    <IconWrapper
      style={{
        borderRadius: "999px",
        background: "transparent",
        border: "0.5px solid var(--medium-grey)",
        animation: "spinner 2s ease-in-out infinite",
      }}
    />
  )
}

export function Plus() {
  return (
    <IconWrapper style={{ borderRadius: "999px", background: "var(--medium-grey)", border: "none" }}>
      <svg width="4" height="4" viewBox="0 0 12 12" fill="none">
        <path
          d="M 6 2 L 6 10 M 2 6 L 10 6"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </IconWrapper>
  )
}
