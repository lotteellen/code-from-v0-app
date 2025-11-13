import { IBM_Plex_Mono } from 'next/font/google'
import { BrowserWindow } from "./helpers/browser-window"
import { DummyLine } from "./helpers/dummy-helpers"
import { answerSection } from './reasoning-model-card'
import { userMessage } from './chatgpt-card'
import { Document } from './helpers/document'
import "./helpers/globals.css"

const dummyHeight = "var(--line-height-big)"
const dummyColor = "var(--light-grey)"

const ibmPlexMono = IBM_Plex_Mono({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
})

const indent = "8px"
const height = "10.5px"

const createOriginalContent = () => (
  <div className={`${ibmPlexMono.className} pt-[var(--padding)] h-full text-[7px] font-normal`}>
    <div className="flex flex-col">
      <div className="flex items-center gap-[var(--gap-small)]">
        <span className="syntax-keyword">const</span>
        <span className="syntax-variable">answer</span>
        <span className="syntax-punctuation">=</span>
        <span className="syntax-keyword">await</span>
        <span className="syntax-variable">AI</span>
        <DummyLine width="80px" height={dummyHeight} background={dummyColor} />
      </div>
      <div className="flex items-center gap-0" style={{ marginLeft: indent }}>
        <span className="syntax-property">model</span>
        <span className="syntax-punctuation pr-[var(--gap-small)]">:</span>
        <DummyLine width="30px" height={dummyHeight} background={dummyColor} />
      </div>
      <div className="flex items-center gap-0" style={{ marginLeft: indent }}>
        <span className="syntax-property">messages</span>
        <span className="syntax-punctuation pr-[var(--gap-small)]">:</span>
        <DummyLine width="8px" height={dummyHeight} background={dummyColor} />
      </div>
            <div className="syntax-punctuation" style={{ marginLeft: `calc(${indent} * 2)` }}>{"{"}</div>
            <div className="flex items-center" style={{ marginLeft: `calc(${indent} * 3)`, height: height }}>
              <DummyLine width="50px" height={dummyHeight} background={dummyColor} />
            </div>
            <div className="flex items-center gap-0" style={{ marginLeft: `calc(${indent} * 3)` }}>
            <span className="syntax-property">content</span>
            <span className="syntax-punctuation">:</span>
            <span className="syntax-string">{'`'}</span>
            <span className="syntax-string">{'${'}</span>
            <span className="syntax-variable">context</span>
            <span className="syntax-string">{'}'}</span>
            <span className="syntax-string">{'\\n\\n'}</span>
            <span className="syntax-string">{'${'}</span>
            <span className="syntax-variable">message</span>
            <span className="syntax-string">{'}'}</span>
            <span className="syntax-string">{'`'}</span>
            </div>
          <div className="syntax-punctuation" style={{ marginLeft: `calc(${indent} * 2)` }}>{"}"}</div>
      <div className="flex items-center" style={{ marginLeft: indent, height: height }}>
        <DummyLine width="8px" height={dummyHeight} background={dummyColor} />
            </div>
      <div className="flex items-center" style={ {height: height }}>
      <DummyLine width="14px" height={dummyHeight} background={dummyColor} />
      </div>
    </div>
  </div>
)

const createHighlightedContent = () => (
  <div className={`${ibmPlexMono.className} pt-[var(--padding)] h-full text-[7px] font-normal`}>
    <div className="flex flex-col">
      <div className="flex items-center gap-[var(--gap-small)]">
        <span style={{ color: "var(--dark-grey)" }}>const</span>
        <span style={{ color: "var(--dark-grey)" }}>answer</span>
        <span style={{ color: "var(--medium-dark-grey)" }}>=</span>
        <span style={{ color: "var(--dark-grey)" }}>await</span>
        <span style={{ color: "var(--dark-grey)" }}>AI</span>
        <DummyLine width="80px" height={dummyHeight} background={dummyColor} />
      </div>
      <div className="flex items-center gap-0" style={{ marginLeft: indent }}>
        <span style={{ color: "var(--medium-dark-grey)" }}>model</span>
        <span style={{ color: "var(--medium-dark-grey)", paddingRight: "var(--gap-small)" }}>:</span>
        <DummyLine width="30px" height={dummyHeight} background={dummyColor} />
      </div>
      <div className="flex items-center gap-0" style={{ marginLeft: indent }}>
        <span style={{ color: "var(--medium-dark-grey)" }}>messages</span>
        <span style={{ color: "var(--medium-dark-grey)", paddingRight: "var(--gap-small)" }}>:</span>
        <DummyLine width="8px" height={dummyHeight} background={dummyColor} />
      </div>
            <div style={{ marginLeft: `calc(${indent} * 2)`, color: "var(--medium-dark-grey)" }}>{"{"}</div>
            <div className="flex items-center" style={{ marginLeft: `calc(${indent} * 3)`, height: height }}>
              <DummyLine width="50px" height={dummyHeight} background={dummyColor} />
            </div>
            <div className="flex items-center gap-0" style={{ marginLeft: `calc(${indent} * 3)`, height: height }}>
            <span style={{ color: "var(--medium-dark-grey)" }}>content</span>
            <span style={{ color: "var(--medium-dark-grey)" }}>:</span>
            <span style={{ color: "var(--dark-grey)" }}>{'`'}</span>
            <span style={{ color: "var(--dark-grey)" }}>{'${'}</span>
            <span style={{ 
              background: "rgba(40, 200, 64, 0.3)", 
              color: "var(--dark-grey)",
              padding: "0px 2px",
              borderRadius: "2px",
              lineHeight: height,
              display: "inline-block"
            }}>context</span>
            <span style={{ color: "var(--dark-grey)" }}>{'}'}</span>
            <span style={{ color: "var(--dark-grey)" }}>{'\\n\\n'}</span>
            <span style={{ color: "var(--dark-grey)" }}>{'${'}</span>
            <span style={{ 
              background: "var(--light-blue)", 
              color: "var(--dark-grey)",
              padding: "0px 2px",
              borderRadius: "2px",
              lineHeight: height,
              display: "inline-block"
            }}>message</span>
            <span style={{ color: "var(--dark-grey)" }}>{'}'}</span>
            <span style={{ color: "var(--dark-grey)" }}>{'`'}</span>
            </div>
          <div style={{ marginLeft: `calc(${indent} * 2)`, color: "var(--medium-dark-grey)" }}>{"}"}</div>
      <div className="flex items-center" style={{ marginLeft: indent, height: height }}>
        <DummyLine width="8px" height={dummyHeight} background={dummyColor} />
            </div>
      <div className="flex items-center" style={ {height: height }}>
      <DummyLine width="14px" height={dummyHeight} background={dummyColor} />
      </div>
    </div>
  </div>
)

export function PostRequestCard({ showContext = false }: { showContext?: boolean }) {

  
  const content = showContext ? createHighlightedContent() : createOriginalContent()

  return (
    <div style={{ position: "relative" }}>
      <BrowserWindow title="Post Request" content={content} fitContent={true} />
      {showContext && (
        <div style={{ position: "absolute", bottom: 0, right: 0, transform: "translateX(15%) translateY(30%)", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          {userMessage(undefined, {position: "absolute", zIndex: 1000, transform: "translateX(8%) translateY(65%)" })}
          <Document content={answerSection(false)} aspectRatio="" verticalPadding={false} />
        </div>
      )}
    </div>
  );
} 
