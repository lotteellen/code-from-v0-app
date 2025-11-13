"use client"

import { useState } from "react"
import { ChevronRightIcon } from "lucide-react";
import { BrowserWindow } from "./helpers/browser-window"
import { DummyLine, DummyParagraph } from "./helpers/dummy-helpers"
import { Button } from "@/components/ui/button"
import "./helpers/globals.css"

export const userMessage = (
  firstLine: string = "What was our enterprise pricing",
  secondLine: string = "before we pivoted to SMB?",

  style?: React.CSSProperties
) => (
    <div className="w-full flex justify-between pt-[var(--padding)]" style={style}>
        <div className="flex justify-end w-full">
          <div
            style={{
              background: "var(--light-blue)",
              borderRadius: "var(--border-radius) var(--border-radius) 0px var(--border-radius)",
              padding: "4px 6px",
              maxWidth: "100px",
              position: "relative",
              display: "inline-flex",
            }}
          >
            <div className="styling-text" style={{ whiteSpace: "normal", lineHeight: "1.3" }}>
          {firstLine}
          {secondLine}
        </div>
            </div>
          </div>
      </div>
)

const UserMessage = ({
  message = "What was our enterprise pricing before we pivoted to SMB?",
  style
}: { message?: string; style?: React.CSSProperties }) => {
  // TODO: Call select() method and combine with focus() to ensure the element is active
  // This should make the text appear focused/selected without replacing the text content

  return (
    <div className="w-full flex justify-between pt-[var(--padding)]" style={style}>
        <div className="flex justify-end w-full">
          <div
            style={{
              background: "var(--light-blue)",
              borderRadius: "var(--border-radius) var(--border-radius) 0px var(--border-radius)",
              padding: "4px 6px",
              maxWidth: "100px",
              position: "relative",
              display: "inline-flex",
            }}
          >
            <div className="styling-text" style={{ whiteSpace: "normal", lineHeight: "1.3" }}>
          {message}
          
        </div>
            </div>
          </div>
      </div>
  )
}

export function ChatGPTCard({ title = "AI Chat", answer = "$499 / month / seat", message }: { title?: string; answer?: string; message?: string }) {
  const [highlightedLine, setHighlightedLine] = useState<0 | 1 | 2>(0)

  const handleHighlight = () => {
    if (highlightedLine === 0) {
      setHighlightedLine(1)
    } else if (highlightedLine === 1) {
      setHighlightedLine(2)
    } else {
      setHighlightedLine(0)
    }
  }

  const content = (
    <div className="h-full justify-between">
    <div className="h-fit flex flex-col gap-[var(--padding)]">
      <UserMessage message={message} />
      <div className="w-full px-10">
        <DummyParagraph items={[
          <DummyLine key="line1" width="100%" height="var(--line-height-big)" highlight={highlightedLine === 1} />,
          <DummyLine key="line2" width="85%" height="var(--line-height-big)" highlight={highlightedLine === 2} />,
          <span key="answer" className="styling-text line-height-1 font-bold">{answer}</span>,
          <DummyLine key="line3" width="100%" height="var(--line-height-big)" />,
        ]} gap="var(--gap-big)" />
      </div>
      </div>
      {/* Input field at bottom */}
      <div className="mx-10 flex justify-end items-center" style={{ padding: '1px', border: '1px solid var(--light-grey)', borderRadius: 'var(--border-radius)', height: 'fit-content', lineHeight: 0 }}>
      <ChevronRightIcon className="w-[6px] h-[6px] text-[var(--medium-light-grey)]" style={{ display: 'block' }} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleHighlight} size="sm">
        Highlight Line
      </Button>
      <BrowserWindow title={title} content={content} />
    </div>
  );
}
