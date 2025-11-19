"use client"

import React from "react"
import { IBM_Plex_Mono } from "next/font/google"
import { BrowserWindow } from "./browser-window"
import { DummyLine } from "./dummy-helpers"
import "../helpers/globals.css"

const ibmPlexMono = IBM_Plex_Mono({ weight: "400" })

const renderVariable = (
  variable: string,
  shouldHighlight: boolean,
  isFinal: boolean,
  color: "green" | "yellow" | "blue",
  children?: React.ReactNode
) => {
  const content = children || <span className="syntax-variable">{variable}</span>

  if (!shouldHighlight) {
    return content
  }

  return (
    <span
      key={`${variable}-${isFinal}-${shouldHighlight}`}
      className={`${isFinal ? "highlight-final" : "highlight-active"} highlight-${color}`}
      style={{ color: "var(--dark-grey)" }}
    >
      {content}
    </span>
  )
}

export function APICall({
  contextMode = "sid",
  animateContext = false,
  animateMessage = false,
  isFinal = false,
  pulsate = false,
}: {
  contextMode?: "sid" | "rag"
  animateContext?: boolean
  animateMessage?: boolean
  isFinal?: boolean
  pulsate?: boolean
}) {
  const shouldHighlightContext = isFinal || animateContext
  const shouldHighlightMessage = isFinal || animateMessage

  const content = (
    <div className={`${ibmPlexMono.className} pt-[var(--padding)] h-full text-[7px] font-normal`}>
      <div className="flex flex-col">
        {/* const answer = await AI */}
        <div className="flex items-center gap-[var(--gap-small)]">
          <span className="syntax-keyword">const</span>
          <span className="syntax-variable">answer</span>
          <span className="syntax-punctuation">=</span>
          <span className="syntax-keyword">await</span>
          <span className="syntax-variable">AI</span>
          <DummyLine
            width="80px"
            height="var(--line-height-big)"
            background="var(--light-grey)"
          />
        </div>

        {/* model: */}
        <div className="flex items-center gap-0" style={{ marginLeft: "8px" }}>
          <span className="syntax-property">model</span>
          <span className="syntax-punctuation pr-[var(--gap-small)]">:</span>
          <DummyLine width="30px" height="var(--line-height-big)" background="var(--light-grey)" />
        </div>

        {/* messages: */}
        <div className="flex items-center gap-0" style={{ marginLeft: "8px" }}>
          <span className="syntax-property">messages</span>
          <span className="syntax-punctuation pr-[var(--gap-small)]">:</span>
          <DummyLine width="8px" height="var(--line-height-big)" background="var(--light-grey)" />
        </div>

        {/* { */}
        <div className="syntax-punctuation" style={{ marginLeft: "16px" }}>
          {"{"}
        </div>

        {/* role: */}
        <div
          className="flex items-center"
          style={{ marginLeft: "24px", height: "10.5px" }}
        >
          <DummyLine width="50px" height="var(--line-height-big)" background="var(--light-grey)" />
        </div>

        {/* content: `...` */}
        <div className="flex items-center gap-0" style={{ marginLeft: "24px" }}>
          <span className="syntax-property">content</span>
          <span className="syntax-punctuation">:</span>
          <span className="syntax-string">{"`"}</span>
          <span className="syntax-string">{"${"}</span>
          {contextMode === "sid" ? (
            renderVariable("context", shouldHighlightContext, isFinal, "green")
          ) : (
            renderVariable(
              "documents",
              shouldHighlightContext,
              isFinal,
              "yellow",
              <>
                <span className="syntax-punctuation">[</span>
                <span className="syntax-variable">documents</span>
                <span className="syntax-punctuation">]</span>
              </>
            )
          )}
          <span className="syntax-string">{"}"}</span>
          <span className="syntax-string">{"\\n\\n"}</span>
          <span className="syntax-string">{"${"}</span>
          {renderVariable("message", shouldHighlightMessage, isFinal, "blue")}
          <span className="syntax-string">{"}"}</span>
          <span className="syntax-string">{"`"}</span>
        </div>

        {/* } */}
        <div className="syntax-punctuation" style={{ marginLeft: "16px" }}>
          {"}"}
        </div>

        {/* Closing lines */}
        <div
          className="flex items-center"
          style={{ marginLeft: "8px", height: "10.5px" }}
        >
          <DummyLine width="8px" height="var(--line-height-big)" background="var(--light-grey)" />
        </div>
        <div className="flex items-center" style={{ height: "10.5px" }}>
          <DummyLine width="14px" height="var(--line-height-big)" background="var(--light-grey)" />
        </div>
      </div>
    </div>
  )

  return (
    <BrowserWindow title="Post Request" content={content} fitContent={true} pulsate={pulsate} />
  )
}
