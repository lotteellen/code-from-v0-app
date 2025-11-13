import React from "react"

export type LineIconType = "open" | "search" | "spinner" | "done" | "document" | "answer" | null

export function Section({ title, children, borderTop = true }: { title?: string; children: React.ReactNode; borderTop?: boolean }) {
  return (
    <div className={`${borderTop ? "border-t-[0.5px] border-[var(--medium-light-grey)] mt-[var(--padding)]" : ""}`}>
      {title && <p className="styling-text font-bold line-height-1 py-[var(--padding)]">{title}</p>}
      {children}
    </div>
  )
}

export function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div
      style={{
        width: "6px",
        height: "6px",
        borderRadius: "999px",
        background: checked ? "var(--traffic-light-green)" : "transparent",
        border: checked ? "none" : "0.5px solid var(--medium-grey)",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
        boxSizing: "border-box",
      }}
    >
      {checked && (
        <svg width="5" height="5" viewBox="0 0 22 22" fill="none">
          <path
            d="M 4 11 L 9 16 L 18 7"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  )
}

const iconProps = {
  width: "6",
  height: "6",
  fill: "none",
  stroke: "#9CA3AF",
  strokeWidth: "2",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  style: { flexShrink: 0 } as React.CSSProperties,
}

export function Search() {
  return (
    <div style={{ 
      width: "6px", 
      height: "6px", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      flexShrink: 0,
      boxSizing: "border-box",
    }}>
      <svg {...iconProps} width="5.5" height="5.5" viewBox="2 2 21 21">
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 6 6" strokeWidth="2.5" />
      </svg>
    </div>
  )
}

export function Document() {
  return (
    <div style={{ 
      width: "6px", 
      height: "6px", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      flexShrink: 0,
      boxSizing: "border-box",
    }}>
      <svg {...iconProps} width="5.5" height="5.5" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
    </div>
  )
}

export function Answer() {
  return (
    <div
      style={{
        width: "6px",
        height: "6px",
        borderRadius: "999px",
        background: "white",
        border: "none",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <svg width="5" height="5" viewBox="0 0 22 22" fill="none">
        <path
          d="M 4 11 L 9 16 L 18 7"
          stroke="var(--dark-grey)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export function Spinner() {
  return (
    <div
      style={{
        width: "6px",
        height: "6px",
        borderRadius: "999px",
        background: "transparent",
        border: "0.5px solid var(--medium-grey)",
        flexShrink: 0,
        animation: "spinner 2s ease-in-out infinite",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  )
}

export function Plus() {
  return (
    <div
      style={{
        width: "6px",
        height: "6px",
        borderRadius: "999px",
        background: "var(--medium-grey)",
        border: "none",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
        boxSizing: "border-box",
      }}
    >
      <svg width="4" height="4" viewBox="0 0 12 12" fill="none">
        <path
          d="M 6 2 L 6 10 M 2 6 L 10 6"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}


