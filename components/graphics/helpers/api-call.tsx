"use client"

import React from "react"
import { IBM_Plex_Mono } from 'next/font/google'
import { BrowserWindow } from "./browser-window"
import { DummyLine } from "./dummy-helpers"
import "../helpers/globals.css"

// Constants
const DUMMY_HEIGHT = "var(--line-height-big)"
const DUMMY_COLOR = "var(--light-grey)"
const INDENT_BASE = "8px"
const LINE_HEIGHT = "10.5px"
const TEXT_SIZE = "7px"

// Dummy line widths
const DUMMY_WIDTHS = {
  aiCall: "80px",
  model: "30px",
  documents: "40px",
  messages: "8px",
  role: "50px",
  closing: "8px",
  final: "14px",
} as const

// Indent levels
const INDENT_LEVEL_1 = INDENT_BASE
const INDENT_LEVEL_2 = `calc(${INDENT_BASE} * 2)`
const INDENT_LEVEL_3 = `calc(${INDENT_BASE} * 3)`

// Font configuration
const ibmPlexMono = IBM_Plex_Mono({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
})

// Types
type HighlightColor = 'green' | 'yellow' | 'blue'

// Helper functions
const getIndent = (level: 1 | 2 | 3): string => {
  switch (level) {
    case 1: return INDENT_LEVEL_1
    case 2: return INDENT_LEVEL_2
    case 3: return INDENT_LEVEL_3
  }
}

// Helper component for highlighted text
const HighlightedText = ({
  children,
  shouldHighlight,
  showFinal,
  color,
}: {
  children: React.ReactNode
  shouldHighlight: boolean
  showFinal: boolean
  color: HighlightColor
}) => {
  if (!shouldHighlight) {
    return <>{children}</>
  }
  
  const baseClass = showFinal ? "highlight-final" : "highlight-active"
  const colorClass = `highlight-${color}`
  
  return (
    <span className={`${baseClass} ${colorClass}`} style={{ color: "var(--dark-grey)" }}>
      {children}
    </span>
  )
}

// Helper component for code lines with indentation
const CodeLine = ({
  indentLevel,
  children,
  className = "flex items-center gap-0",
  style,
}: {
  indentLevel?: 1 | 2 | 3
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) => (
  <div 
    className={className} 
    style={{
      ...(indentLevel ? { marginLeft: getIndent(indentLevel) } : {}),
      ...style,
    }}
  >
    {children}
  </div>
)

// Helper component for property lines
const PropertyLine = ({
  name,
  dummyWidth,
  indentLevel = 1,
}: {
  name: string
  dummyWidth: string
  indentLevel?: 1 | 2 | 3
}) => (
  <CodeLine indentLevel={indentLevel}>
    <span className="syntax-property">{name}</span>
    <span className="syntax-punctuation pr-[var(--gap-small)]">:</span>
    <DummyLine width={dummyWidth} height={DUMMY_HEIGHT} background={DUMMY_COLOR} />
  </CodeLine>
)

// Helper component for variable highlight
const VariableHighlight = ({
  variable,
  showContext,
  shouldHighlight,
  showFinal,
  color,
  resetKey,
  children,
}: {
  variable: string
  showContext: boolean
  shouldHighlight: boolean
  showFinal: boolean
  color: HighlightColor
  resetKey: number
  children?: React.ReactNode
}) => {
  const content = children || <span className="syntax-variable">{variable}</span>
  
  return showContext ? (
    <HighlightedText
      key={`${variable}-${resetKey}`}
      shouldHighlight={shouldHighlight}
      showFinal={showFinal}
      color={color}
    >
      {content}
    </HighlightedText>
  ) : (
    <>{content}</>
  )
}

// Component for template string content
const TemplateStringContent = ({
  withSID,
  showContext,
  animateContext,
  animateMessage,
  contextResetKey,
  messageResetKey,
  showFinal,
}: {
  withSID: boolean
  showContext: boolean
  animateContext: boolean
  animateMessage: boolean
  contextResetKey: number
  messageResetKey: number
  showFinal: boolean
}) => {
  const renderContextVariable = () => {
    if (withSID) {
      return (
        <VariableHighlight
          variable="context"
          showContext={showContext}
          shouldHighlight={showFinal || animateContext}
          showFinal={showFinal}
          color="green"
          resetKey={contextResetKey}
        />
      )
    }

    // Non-SID mode: documents variable
    if (showContext) {
      return (
        <VariableHighlight
          variable="documents"
          showContext={showContext}
          shouldHighlight={showFinal || animateContext}
          showFinal={showFinal}
          color="yellow"
          resetKey={contextResetKey}
        >
          <span className="syntax-punctuation">[</span>
          <span className="syntax-variable">documents</span>
          <span className="syntax-punctuation">]</span>
        </VariableHighlight>
      )
    }

    return (
      <>
        <span className="syntax-variable">documents</span>
        <span className="syntax-punctuation">.</span>
        <span className="syntax-property">join</span>
        <span className="syntax-punctuation">(</span>
        <span className="syntax-string">'\\n'</span>
        <span className="syntax-punctuation">)</span>
      </>
    )
  }

  return (
    <>
      <span className="syntax-string">{'${'}</span>
      {renderContextVariable()}
      <span className="syntax-string">{'}'}</span>
      <span className="syntax-string">{'\\n\\n'}</span>
      <span className="syntax-string">{'${'}</span>
      <VariableHighlight
        variable="message"
        showContext={showContext}
        shouldHighlight={showFinal || animateMessage}
        showFinal={showFinal}
        color="blue"
        resetKey={messageResetKey}
      />
      <span className="syntax-string">{'}'}</span>
    </>
  )
}

// Main content component
const createContent = (
  showContext: boolean,
  animateContext: boolean,
  animateMessage: boolean,
  contextResetKey: number,
  messageResetKey: number,
  withSID: boolean = true,
  showFinal: boolean = false
) => (
  <div className={`${ibmPlexMono.className} pt-[var(--padding)] h-full text-[7px] font-normal`}>
    <div className="flex flex-col">
      {/* const answer = await AI */}
      <div className="flex items-center gap-[var(--gap-small)]">
        <span className="syntax-keyword">const</span>
        <span className="syntax-variable">answer</span>
        <span className="syntax-punctuation">=</span>
        <span className="syntax-keyword">await</span>
        <span className="syntax-variable">AI</span>
        <DummyLine width={DUMMY_WIDTHS.aiCall} height={DUMMY_HEIGHT} background={DUMMY_COLOR} />
      </div>

      {/* model: */}
      <PropertyLine name="model" dummyWidth={DUMMY_WIDTHS.model} />

      {/* documents: (only if !withSID) */}
      {!withSID && (
        <CodeLine indentLevel={1}>
          <span className="syntax-property">documents</span>
          <span className="syntax-punctuation pr-[var(--gap-small)]">:</span>
          <span className="syntax-punctuation">[</span>
          <DummyLine width={DUMMY_WIDTHS.documents} height={DUMMY_HEIGHT} background={DUMMY_COLOR} />
          <span className="syntax-punctuation">]</span>
        </CodeLine>
      )}

      {/* messages: */}
      <PropertyLine name="messages" dummyWidth={DUMMY_WIDTHS.messages} />

      {/* { */}
      <div className="syntax-punctuation" style={{ marginLeft: INDENT_LEVEL_2 }}>{"{"}</div>

      {/* role: */}
      <CodeLine indentLevel={3} className="flex items-center" style={{ height: LINE_HEIGHT }}>
        <DummyLine width={DUMMY_WIDTHS.role} height={DUMMY_HEIGHT} background={DUMMY_COLOR} />
      </CodeLine>

      {/* content: `...` */}
      <CodeLine indentLevel={3}>
        <span className="syntax-property">content</span>
        <span className="syntax-punctuation">:</span>
        <span className="syntax-string">{'`'}</span>
        <TemplateStringContent
          withSID={withSID}
          showContext={showContext}
          animateContext={animateContext}
          animateMessage={animateMessage}
          contextResetKey={contextResetKey}
          messageResetKey={messageResetKey}
          showFinal={showFinal}
        />
        <span className="syntax-string">{'`'}</span>
      </CodeLine>

      {/* } */}
      <div className="syntax-punctuation" style={{ marginLeft: INDENT_LEVEL_2 }}>{"}"}</div>

      {/* Closing lines */}
      <CodeLine indentLevel={1} className="flex items-center" style={{ height: LINE_HEIGHT }}>
        <DummyLine width={DUMMY_WIDTHS.closing} height={DUMMY_HEIGHT} background={DUMMY_COLOR} />
      </CodeLine>
      <CodeLine className="flex items-center" style={{ height: LINE_HEIGHT }}>
        <DummyLine width={DUMMY_WIDTHS.final} height={DUMMY_HEIGHT} background={DUMMY_COLOR} />
      </CodeLine>
    </div>
  </div>
)

// Main exported component
export function APICall({
  showContext = false,
  withSID = true,
  animateContext = false,
  animateMessage = false,
  contextResetKey = 0,
  messageResetKey = 0,
  showFinal = false,
  pulsate = false,
}: {
  showContext?: boolean;
  withSID?: boolean;
  animateContext?: boolean;
  animateMessage?: boolean;
  contextResetKey?: number;
  messageResetKey?: number;
  showFinal?: boolean;
  pulsate?: boolean;
}) {
  const content = createContent(
    showContext,
    animateContext,
    animateMessage,
    contextResetKey,
    messageResetKey,
    withSID,
    showFinal
  )

  return (
    <BrowserWindow 
      title="Post Request" 
      content={content} 
      fitContent={true} 
      pulsate={pulsate} 
    />
  )
}

