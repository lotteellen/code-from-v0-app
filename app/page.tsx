"use client"

import { useState, useCallback } from "react"
import { DocumentVariants } from "@/components/graphics/elements/document-variants"
import { SpreadsheetCard } from "@/components/graphics/elements/spreadsheet-card"
import { EmailCard } from "@/components/graphics/elements/email-card"
import { AIChatCard } from "@/components/graphics/elements/AI-chat"
import { PostRequestCard } from "@/components/graphics/elements/post-request-card"
import { ReasoningModelCard } from "@/components/graphics/elements/reasoning-model-card"
import { DatabaseSearchCard } from "@/components/graphics/elements/database-search-card"
import { RetrievedSearchCard } from "@/components/graphics/elements/retrieved-search-card"
import { RAGPipelineCard } from "@/components/graphics/rag-card"
import { SIDPipelineCard } from "@/components/graphics/sid-pipeline-card"
import { Button } from "@/components/ui/button"

type ViewType = "documents" | "chatgpt" | "database" | "post-request" | "reasoning" | "retrieved-search" | "rag" | "sid-pipeline"

export default function Home() {
  const [view, setView] = useState<ViewType>("documents")
  const [highlightDocuments, setHighlightDocuments] = useState(false)
  const [actionButtons, setActionButtons] = useState<React.ReactNode>(null)
  const [versionButtons, setVersionButtons] = useState<Map<string, React.ReactNode>>(new Map())

  // Memoize callbacks to prevent infinite loops
  const handleChatGPTCorrectButtons = useCallback((buttons: React.ReactNode) => {
    setVersionButtons(prev => new Map(prev).set("chatgpt-correct", buttons))
  }, [])

  const handleChatGPTIncorrectButtons = useCallback((buttons: React.ReactNode) => {
    setVersionButtons(prev => new Map(prev).set("chatgpt-incorrect", buttons))
  }, [])

  const handlePostRequestWithSIDButtons = useCallback((buttons: React.ReactNode) => {
    setVersionButtons(prev => new Map(prev).set("post-request-withSID", buttons))
  }, [])

  const handlePostRequestWithoutSIDButtons = useCallback((buttons: React.ReactNode) => {
    setVersionButtons(prev => new Map(prev).set("post-request-withoutSID", buttons))
  }, [])

  const handlePostRequestNoContextButtons = useCallback((buttons: React.ReactNode) => {
    setVersionButtons(prev => new Map(prev).set("post-request-noContext", buttons))
  }, [])

  const handleDatabaseDefaultButtons = useCallback((buttons: React.ReactNode) => {
    setVersionButtons(prev => new Map(prev).set("database-default", buttons))
  }, [])

  const handleDatabaseDarkModeButtons = useCallback((buttons: React.ReactNode) => {
    setVersionButtons(prev => new Map(prev).set("database-darkMode", buttons))
  }, [])

  const handleDatabaseFilledButtons = useCallback((buttons: React.ReactNode) => {
    setVersionButtons(prev => new Map(prev).set("database-filled", buttons))
  }, [])

  const handleRetrievedSearchButtons = useCallback((buttons: React.ReactNode) => {
    setVersionButtons(prev => new Map(prev).set("retrieved-search", buttons))
  }, [])

  const renderContent = () => {
    switch (view) {
      case "chatgpt":
        return (
          <>
            <div className="grid grid-cols-2 gap-4 justify-items-center">
              <div style={{ width: "200px" }}>
                <AIChatCard 
                  isCorrect={true}
                  onActionButtons={handleChatGPTCorrectButtons} 
                />
              </div>
              <div style={{ width: "200px" }}>
                <AIChatCard 
                  isCorrect={false}
                  onActionButtons={handleChatGPTIncorrectButtons} 
                />
              </div>
            </div>
            {versionButtons.size > 0 && (
              <div className="flex flex-col gap-4 items-center mt-4">
                {versionButtons.get("chatgpt-correct") && (
                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-xs text-gray-600 mb-1">Correct Answer (Green)</div>
                    <div className="flex flex-row gap-2 flex-wrap justify-center">
                      {versionButtons.get("chatgpt-correct")}
                    </div>
                  </div>
                )}
                {versionButtons.get("chatgpt-incorrect") && (
                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-xs text-gray-600 mb-1">Wrong Answer (Red)</div>
                    <div className="flex flex-row gap-2 flex-wrap justify-center">
                      {versionButtons.get("chatgpt-incorrect")}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )
      case "post-request":
        return (
          <>
            <div className="grid grid-cols-2 gap-20 justify-items-center">
              <div style={{ width: "200px" }}>
                <PostRequestCard 
                  showContext={true} 
                  withSID={true} 
                  onActionButtons={handlePostRequestWithSIDButtons} 
                />
              </div>
              <div style={{ width: "200px" }}>
                <PostRequestCard 
                  showContext={true} 
                  withSID={false} 
                  onActionButtons={handlePostRequestWithoutSIDButtons} 
                />
              </div>
              <div style={{ width: "200px" }} className="col-span-2 justify-self-center">
                <PostRequestCard 
                  showContext={false} 
                  onActionButtons={handlePostRequestNoContextButtons} 
                />
              </div>
            </div>
            {versionButtons.size > 0 && (
              <div className="flex flex-col gap-4 items-center mt-4">
                {versionButtons.get("post-request-withSID") && (
                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-xs text-gray-600 mb-1">With SID (Context)</div>
                    <div className="flex flex-row gap-2 flex-wrap justify-center">
                      {versionButtons.get("post-request-withSID")}
                    </div>
                  </div>
                )}
                {versionButtons.get("post-request-withoutSID") && (
                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-xs text-gray-600 mb-1">Without SID (Documents)</div>
                    <div className="flex flex-row gap-2 flex-wrap justify-center">
                      {versionButtons.get("post-request-withoutSID")}
                    </div>
                  </div>
                )}
                {versionButtons.get("post-request-noContext") && (
                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-xs text-gray-600 mb-1">No Context</div>
                    <div className="flex flex-row gap-2 flex-wrap justify-center">
                      {versionButtons.get("post-request-noContext")}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )
      case "reasoning":
        return (
          <div style={{ width: "200px" }}>
            <ReasoningModelCard onActionButtons={setActionButtons} />
          </div>
        )
      case "retrieved-search":
        return (
          <>
            <div style={{ width: "100%", maxWidth: "600px" }}>
              <RetrievedSearchCard 
                onActionButtons={handleRetrievedSearchButtons}
                highlightDocuments={highlightDocuments}
              />
            </div>
            {versionButtons.size > 0 && (
              <div className="flex flex-col gap-4 items-center mt-4">
                {versionButtons.get("retrieved-search") && (
                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-xs text-gray-600 mb-1">Retrieved Search</div>
                    <div className="flex flex-row gap-2 flex-wrap justify-center">
                      {versionButtons.get("retrieved-search")}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )
      case "rag":
        return (
          <div style={{ width: "100%" }}>
            <RAGPipelineCard onActionButtons={setActionButtons} />
          </div>
        )
      case "sid-pipeline":
        return (
          <div style={{ width: "100%" }}>
            <SIDPipelineCard onActionButtons={setActionButtons} />
          </div>
        )
      case "database":
        return (
          <>
            <div className="grid grid-cols-2 gap-20 justify-items-center">
            <div style={{ width: "200px" }}>
                <DatabaseSearchCard 
                  onActionButtons={handleDatabaseDefaultButtons} 
                />
              </div>
              <div style={{ width: "200px" }}>
                <DatabaseSearchCard 
                  darkMode={true} 
                  onActionButtons={handleDatabaseDarkModeButtons} 
                />
              </div>
              <div style={{ width: "200px" }}>
                <DatabaseSearchCard 
                  filled={true} 
                  onActionButtons={handleDatabaseFilledButtons} 
                />
              </div>
            </div>
            {versionButtons.size > 0 && (
              <div className="flex flex-col gap-4 items-center mt-4">
                {versionButtons.get("database-default") && (
                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-xs text-gray-600 mb-1">Default</div>
                    <div className="flex flex-row gap-2 flex-wrap justify-center">
                      {versionButtons.get("database-default")}
                    </div>
                  </div>
                )}
                {versionButtons.get("database-darkMode") && (
                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-xs text-gray-600 mb-1">Dark Mode</div>
                    <div className="flex flex-row gap-2 flex-wrap justify-center">
                      {versionButtons.get("database-darkMode")}
                    </div>
                  </div>
                )}
                {versionButtons.get("database-filled") && (
                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-xs text-gray-600 mb-1">Filled</div>
                    <div className="flex flex-row gap-2 flex-wrap justify-center">
                      {versionButtons.get("database-filled")}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )
      case "documents":
      default:
        return (
          <>
            <div className="flex flex-row gap-4 items-start justify-center flex-wrap">
              <div style={{ width: "80px" }}>
                <DocumentVariants title="simple" variant="simple" externalHighlight={highlightDocuments} />
              </div>
              <div style={{ width: "80px" }}>
                <DocumentVariants title="bullets" variant="bullets" />
              </div>
              <div style={{ width: "80px" }}>
                <DocumentVariants title="chart" variant="chart" />
              </div>
              <div style={{ width: "80px" }}>
                <DocumentVariants title="table" variant="table" />
              </div>
              <div style={{ width: "80px" }}>
                <DocumentVariants title="image" variant="image" />
              </div>
              <div style={{ width: "103px" }}>
                <SpreadsheetCard />
              </div>
              <div style={{ width: "80px" }}>
                <EmailCard />
              </div>
            </div>
            <Button onClick={() => setHighlightDocuments(!highlightDocuments)} size="sm">
              {highlightDocuments ? "Remove Highlight" : "Highlight"}
            </Button>
          </>
        )
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "white", padding: "32px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        
        {/* First row: Toggle between views */}
        <div className="flex flex-row gap-2 mb-4 justify-center">
          <Button 
            onClick={() => { setView("documents"); setActionButtons(null); setVersionButtons(new Map()) }} 
            variant={view === "documents" ? "default" : "outline"}
            size="sm"
          >
            All Documents
          </Button>
          <Button 
            onClick={() => { setView("chatgpt"); setActionButtons(null); setVersionButtons(new Map()) }} 
            variant={view === "chatgpt" ? "default" : "outline"}
            size="sm"
          >
            ChatGPT
          </Button>
          <Button 
            onClick={() => { setView("database"); setActionButtons(null); setVersionButtons(new Map()) }} 
            variant={view === "database" ? "default" : "outline"}
            size="sm"
          >
            Database
          </Button>
          <Button 
            onClick={() => { setView("post-request"); setActionButtons(null); setVersionButtons(new Map()) }} 
            variant={view === "post-request" ? "default" : "outline"}
            size="sm"
            
          >
            Post Request
          </Button>
          <Button 
            onClick={() => { setView("reasoning"); setActionButtons(null); setVersionButtons(new Map()) }} 
            variant={view === "reasoning" ? "default" : "outline"}
            size="sm"
          >
            Reasoning
          </Button>
          <Button 
            onClick={() => { setView("retrieved-search"); setActionButtons(null); setVersionButtons(new Map()) }} 
            variant={view === "retrieved-search" ? "default" : "outline"}
            size="sm"
          >
            Retrieved Search
          </Button>
          <Button 
            onClick={() => { setView("rag"); setActionButtons(null); setVersionButtons(new Map()) }} 
            variant={view === "rag" ? "default" : "outline"}
            size="sm"
          >
            RAG
          </Button>
          <Button 
            onClick={() => { setView("sid-pipeline"); setActionButtons(null); setVersionButtons(new Map()) }} 
            variant={view === "sid-pipeline" ? "default" : "outline"}
            size="sm"
          >
            SID Pipeline
          </Button>
        </div>

        {/* Second row: Action buttons for currently shown component */}
        {actionButtons && (
          <div className="flex flex-row gap-2 mb-4 flex-wrap justify-center">
            {actionButtons}
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col gap-4 items-center">
          {renderContent()}
        </div>

      </div>
    </main>
  )
}
