"use client"

import { IBM_Plex_Mono } from 'next/font/google'
import { useState, useRef } from 'react'
import { BrowserWindow } from "./helpers/browser-window"
import { DummyLine } from "./helpers/dummy-helpers"
import { answerSection } from './reasoning-model-card'
import { userMessage } from './chatgpt-card'
import { Document } from './helpers/document'
import { DocumentVariants } from './document-variants'
import { Button } from '@/components/ui/button'
import "./helpers/globals.css"

const dummyHeight = "var(--line-height-big)"
const dummyColor = "var(--light-grey)"

const ibmPlexMono = IBM_Plex_Mono({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
})

const indent = "8px"
const height = "10.5px"

const createOriginalContent = (withSID: boolean = true) => (
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
      {!withSID && (
        <div className="flex items-center gap-0" style={{ marginLeft: indent }}>
          <span className="syntax-property">documents</span>
          <span className="syntax-punctuation pr-[var(--gap-small)]">:</span>
          <span className="syntax-punctuation">[</span>
          <DummyLine width="40px" height={dummyHeight} background={dummyColor} />
          <span className="syntax-punctuation">]</span>
        </div>
      )}
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
            {withSID ? (
              <>
                <span className="syntax-string">{'${'}</span>
                <span className="syntax-variable">context</span>
                <span className="syntax-string">{'}'}</span>
              </>
            ) : (
              <>
                <span className="syntax-string">{'${'}</span>
                <span className="syntax-variable">documents</span>
                <span className="syntax-punctuation">.</span>
                <span className="syntax-property">join</span>
                <span className="syntax-punctuation">(</span>
                <span className="syntax-string">'\\n'</span>
                <span className="syntax-punctuation">)</span>
                <span className="syntax-string">{'}'}</span>
              </>
            )}
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

const createHighlightedContent = (animateContext: boolean, animateMessage: boolean, contextResetKey: number, messageResetKey: number, withSID: boolean = true) => (
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
      {!withSID && (
        <div className="flex items-center gap-0" style={{ marginLeft: indent }}>
          <span style={{ color: "var(--medium-dark-grey)" }}>documents</span>
          <span style={{ color: "var(--medium-dark-grey)", paddingRight: "var(--gap-small)" }}>:</span>
          <span style={{ color: "var(--medium-dark-grey)" }}>[</span>
          <DummyLine width="40px" height={dummyHeight} background={dummyColor} />
          <span style={{ color: "var(--medium-dark-grey)" }}>]</span>
        </div>
      )}
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
            {withSID ? (
              <>
                <span style={{ color: "var(--dark-grey)" }}>{'${'}</span>
                {animateContext ? (
                  <span key={`context-${contextResetKey}`} className="highlight-animate highlight-context highlight-offset" style={{ color: "var(--dark-grey)", position: "relative", lineHeight: 1 }}>
                    <span style={{ position: "relative", zIndex: 1 }}>context</span>
                  </span>
                ) : (
                  <span style={{ color: "var(--dark-grey)" }}>context</span>
                )}
                <span style={{ color: "var(--dark-grey)" }}>{'}'}</span>
              </>
            ) : (
              <>
                <span style={{ color: "var(--dark-grey)" }}>{'${'}</span>
                {animateContext ? (
                  <span key={`documents-${contextResetKey}`} className="highlight-animate highlight-documents highlight-offset" style={{ color: "var(--dark-grey)", position: "relative", lineHeight: 1 }}>
                    <span style={{ position: "relative", zIndex: 1 }}>documents</span>
                  </span>
                ) : (
                  <>
                  <span style={{ color: "var(--dark-grey)" }}>[</span>
                  <span style={{ color: "var(--dark-grey)" }}>documents</span>
                  <span style={{ color: "var(--dark-grey)" }}>]</span>
                  </>
                )}
                <span style={{ color: "var(--dark-grey)" }}>{'}'}</span>
              </>
            )}
            <span style={{ color: "var(--dark-grey)" }}>{'\\n\\n'}</span>
            <span style={{ color: "var(--dark-grey)" }}>{'${'}</span>
            {animateMessage ? (
              <span key={`message-${messageResetKey}`} className="highlight-animate highlight-message highlight-offset" style={{ color: "var(--dark-grey)", position: "relative", lineHeight: 1 }}>
                <span style={{ position: "relative", zIndex: 1 }}>message</span>
              </span>
            ) : (
              <span style={{ color: "var(--dark-grey)" }}>message</span>
            )}
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

export function PostRequestCard({ showContext = false, withSID = true, documents = ["simple"] }: { showContext?: boolean; withSID?: boolean; documents?: string[] }) {
  const [animateContext, setAnimateContext] = useState(false)
  const [animateMessage, setAnimateMessage] = useState(false)
  const [contextResetKey, setContextResetKey] = useState(0)
  const [messageResetKey, setMessageResetKey] = useState(0)
  const [showUserMessage, setShowUserMessage] = useState(false)
  const userMessageRef = useRef<HTMLDivElement>(null)

  const handleAnimateContext = () => {
    // If already active, just restart the animation by changing the key
    if (animateContext) {
      setContextResetKey(prev => prev + 1)
    } else {
      // First time - start the animation
      setAnimateContext(true)
    }
  }

  const handleAnimateMessage = () => {
    // If already active, just restart the animation by changing the key
    if (animateMessage) {
      setMessageResetKey(prev => prev + 1)
    } else {
      // First time - start the animation
      setAnimateMessage(true)
      setShowUserMessage(true)
    }
  }

  const handleReset = () => {
    // Force immediate DOM manipulation to hide element
    if (userMessageRef.current) {
      userMessageRef.current.style.display = 'none'
      userMessageRef.current.style.visibility = 'hidden'
      userMessageRef.current.style.opacity = '0'
    }
    // Then update state
    setShowUserMessage(false)
    setAnimateMessage(false)
    setAnimateContext(false)
    setContextResetKey(prev => prev + 1)
    setMessageResetKey(prev => prev + 1)
  }

  const content = showContext ? createHighlightedContent(animateContext, animateMessage, contextResetKey, messageResetKey, withSID) : createOriginalContent(withSID)

  return (
    <div>
      {showContext && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
          <Button onClick={handleAnimateContext} size="sm" variant="outline">
            Context
          </Button>
          <Button onClick={handleAnimateMessage} size="sm" variant="outline">
            Message
          </Button>
          <Button onClick={handleReset} size="sm" variant="outline">
            Reset
          </Button>
        </div>
      )}
      <div style={{ position: "relative" }}>
        <BrowserWindow title="Post Request" content={content} fitContent={true} />
      {showContext && (
        <div style={{ position: "absolute", bottom: 0, right: 0, transform: "translateX(15%) translateY(30%)", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <div 
            ref={userMessageRef}
            key={`user-message-${messageResetKey}`}
            style={{
              position: "absolute", 
              zIndex: showUserMessage ? 1000 : -1, 
              bottom: "-10px",
              right: "-10px",
              display: showUserMessage ? undefined : 'none',
              visibility: showUserMessage ? undefined : 'hidden',
              opacity: showUserMessage ? undefined : 0,
              pointerEvents: showUserMessage ? undefined : 'none'
            }}
          >
            {userMessage({ animate: showUserMessage })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "200px", position: "relative" }}>
            {withSID ? (
              <div 
                key={`document-${contextResetKey}`}
                className={animateContext ? "user-message-animate" : ""}
                style={{
                  opacity: animateContext ? undefined : 0,
                  pointerEvents: animateContext ? undefined : "none",
                  display: animateContext ? undefined : 'none',
                  visibility: animateContext ? undefined : 'hidden'
                }}
              >
                <Document content={answerSection(false)} aspectRatio="" verticalPadding={false} />
              </div>
            ) : (
              <div 
                key={`documents-${contextResetKey}`}
                className={animateContext ? "user-message-animate" : ""}
                style={{
                  opacity: animateContext ? undefined : 0,
                  pointerEvents: animateContext ? undefined : "none",
                  display: animateContext ? "block" : 'none',
                  visibility: animateContext ? undefined : 'hidden',
                  position: "relative",
                  width: "100%",
                  minHeight: `${documents.length * 12 + 40}px`
                }}
              >
                {documents.map((variant, index) => {
                  // All documents at same height, but with rotation and offsets for messy stack
                  const rotation = (index % 2 === 0 ? 1 : -1) * (index * 0.8 + (index % 4) * 0.3);
                  // Translation offsets for messy stack effect
                  const translateX = (index % 2 === 0 ? 1 : -1) * (index * 2 + (index % 3) * 1.5);
                  const translateY = (index % 3 === 0 ? 1 : -1) * (index * 1.5 + (index % 2) * 0.8);
                  
                  return (
                    <div
                      key={`doc-${variant}-${index}`}
                      style={{
                        position: "absolute",
                        top: "0px",
                        left: "0px",
                        transform: `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg)`,
                        transformOrigin: "center center",
                        zIndex: documents.length - index,
                        width: "100%"
                      }}
                    >
                      <DocumentVariants variant={variant} baby={true} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
} 
