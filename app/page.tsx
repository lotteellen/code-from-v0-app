"use client"

import { useState, useCallback, useMemo } from "react"
import { DocumentVariants, VARIANT_MAX_KEYS, DocumentVariant } from "@/components/graphics/elements/document-variants"
import { AIChatCard } from "@/components/graphics/elements/AI-chat"
import { PostRequestCard } from "@/components/graphics/elements/post-request-card"
import { ReasoningModelCard } from "@/components/graphics/elements/reasoning-model-card"
import { DatabaseSearchCard } from "@/components/graphics/elements/database-search-card"
import { RetrievedSearchCard } from "@/components/graphics/elements/retrieved-search-card"
import { RAGPipelineCard } from "@/components/graphics/rag-card"
import { SIDPipelineCard } from "@/components/graphics/sid-pipeline-card"
import { PipelineComparison } from "@/components/graphics/pipeline-comparison"
import { DocumentStack } from "@/components/graphics/helpers/document-stack"
import { Button } from "@/components/ui/button"

type ViewType = "documents" | "chatgpt" | "database" | "post-request" | "reasoning" | "retrieved-search" | "rag" | "sid-pipeline" | "pipeline-comparison"

// Helper function to generate random highlight lines for a variant
function generateRandomHighlightLines(variant: DocumentVariant): number[] {
  const maxKey = VARIANT_MAX_KEYS[variant]
  if (maxKey < 0) return [] // No highlightable keys
  
  // For spreadsheets, generate more highlights since they have many cells
  const isSpreadsheet = variant === "spreadsheet" || variant === "spreadsheet2"
  const minHighlights = isSpreadsheet ? 3 : 1
  const maxHighlights = isSpreadsheet ? 8 : 3
  
  // Generate random number of highlights within the range
  const numHighlights = Math.floor(Math.random() * (maxHighlights - minHighlights + 1)) + minHighlights
  const actualNumHighlights = Math.min(numHighlights, maxKey + 1)
  
  const allKeys = Array.from({ length: maxKey + 1 }, (_, i) => i)
  
  // Shuffle and take random keys
  const shuffled = [...allKeys].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, actualNumHighlights).sort((a, b) => a - b)
}

export default function Home() {
  const [view, setView] = useState<ViewType>("documents")
  const [highlightDocuments, setHighlightDocuments] = useState(false)
  const [actionButtons, setActionButtons] = useState<React.ReactNode>(null)
  const [versionButtons, setVersionButtons] = useState<Map<string, React.ReactNode>>(new Map())
  const [showFinalWithSID, setShowFinalWithSID] = useState(false)
  const [showFinalWithoutSID, setShowFinalWithoutSID] = useState(false)
  const [showFinalNoContext, setShowFinalNoContext] = useState(false)
  const [showFinalReasoning, setShowFinalReasoning] = useState(false)
  const [showFinalRetrievedSearch, setShowFinalRetrievedSearch] = useState(false)
  
  // Generate random highlight lines for each document variant
  // Regenerate when view changes to ensure fresh random highlights
  const documentHighlightLines = useMemo(() => {
    const variants: DocumentVariant[] = [
      "simple", "bullets", "bullets2", "chart", "chart2", 
      "table", "table2", "image", "image2", 
      "spreadsheet", "spreadsheet2", "email", "email2", "email3"
    ]
    const highlights: Record<string, number[]> = {}
    variants.forEach(variant => {
      highlights[variant] = generateRandomHighlightLines(variant)
    })
    return highlights
  }, [view]) // Regenerate when view changes

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

  const handleToggleFinalWithSID = useCallback(() => {
    setShowFinalWithSID(prev => !prev)
  }, [])

  const handleToggleFinalWithoutSID = useCallback(() => {
    setShowFinalWithoutSID(prev => !prev)
  }, [])

  const handleToggleFinalNoContext = useCallback(() => {
    setShowFinalNoContext(prev => !prev)
  }, [])

  const handleToggleFinalReasoning = useCallback(() => {
    setShowFinalReasoning(prev => !prev)
  }, [])

  const handleToggleFinalRetrievedSearch = useCallback(() => {
    setShowFinalRetrievedSearch(prev => !prev)
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
                  showFinal={showFinalWithSID}
                  onToggleFinal={handleToggleFinalWithSID}
                />
              </div>
              <div style={{ width: "200px" }}>
                <PostRequestCard 
                  showContext={true} 
                  withSID={false} 
                  onActionButtons={handlePostRequestWithoutSIDButtons}
                  showFinal={showFinalWithoutSID}
                  onToggleFinal={handleToggleFinalWithoutSID}
                />
              </div>
              <div style={{ width: "200px" }} className="col-span-2 justify-self-center">
                <PostRequestCard 
                  showContext={false} 
                  onActionButtons={handlePostRequestNoContextButtons}
                  showFinal={showFinalNoContext}
                  onToggleFinal={handleToggleFinalNoContext}
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
            <ReasoningModelCard 
              onActionButtons={setActionButtons}
              showFinal={showFinalReasoning}
              onToggleFinal={handleToggleFinalReasoning}
            />
          </div>
        )
      case "retrieved-search":
        return (
          <>
            <div style={{ width: "100%", maxWidth: "600px" }}>
              <RetrievedSearchCard 
                onActionButtons={handleRetrievedSearchButtons}
                highlightDocuments={highlightDocuments}
                showFinal={showFinalRetrievedSearch}
                onToggleFinal={handleToggleFinalRetrievedSearch}
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
      case "pipeline-comparison":
        return (
          <div style={{ width: "100%" }}>
            <PipelineComparison onActionButtons={setActionButtons} />
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
                <DocumentVariants title="simple" variant="simple" externalHighlight={highlightDocuments} highlightLines={highlightDocuments ? documentHighlightLines.simple : undefined} />
              </div>
              <div style={{ width: "80px" }}>
                <DocumentVariants title="bullets" variant="bullets" highlightLines={highlightDocuments ? documentHighlightLines.bullets : undefined} />
              </div>
              <div style={{ width: "80px" }}>
                <DocumentVariants title="bullets2" variant="bullets2" highlightLines={highlightDocuments ? documentHighlightLines.bullets2 : undefined} />
              </div>
              <div style={{ width: "80px" }}>
                <DocumentVariants title="chart" variant="chart" highlightLines={highlightDocuments ? documentHighlightLines.chart : undefined} />
              </div>
              <div style={{ width: "80px" }}>
                <DocumentVariants title="chart2" variant="chart2" highlightLines={highlightDocuments ? documentHighlightLines.chart2 : undefined} />
              </div>
              <div style={{ width: "80px" }}>
                <DocumentVariants title="table" variant="table" highlightLines={highlightDocuments ? documentHighlightLines.table : undefined} />
              </div>
              <div style={{ width: "80px" }}>
                <DocumentVariants title="table2" variant="table2" highlightLines={highlightDocuments ? documentHighlightLines.table2 : undefined} />
              </div>
              <div style={{ width: "80px" }}>
                <DocumentVariants title="image" variant="image" highlightLines={highlightDocuments ? documentHighlightLines.image : undefined} />
              </div>
              <div style={{ width: "80px" }}>
                <DocumentVariants title="image2" variant="image2" highlightLines={highlightDocuments ? documentHighlightLines.image2 : undefined} />
              </div>
              <div style={{ width: "80px" }}>
                <DocumentVariants title="sheet" variant="spreadsheet" highlightLines={highlightDocuments ? documentHighlightLines.spreadsheet : undefined} />
              </div>
              <div style={{ width: "80px" }}>
                <DocumentVariants title="sheet2" variant="spreadsheet2" highlightLines={highlightDocuments ? documentHighlightLines.spreadsheet2 : undefined} />
              </div>
              <div style={{ width: "80px" }}>
                <DocumentVariants title="email" variant="email" highlightLines={highlightDocuments ? documentHighlightLines.email : undefined} />
              </div>
              <div style={{ width: "80px" }}>
                <DocumentVariants title="email2" variant="email2" highlightLines={highlightDocuments ? documentHighlightLines.email2 : undefined} />
              </div>
              <div style={{ width: "80px" }}>
                <DocumentVariants title="email3" variant="email3" highlightLines={highlightDocuments ? documentHighlightLines.email3 : undefined} />
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <DocumentStack 
                documents={["bullets", "table", "image", "simple", "chart", "simple", "table", "image", "chart", "bullets"]} 
                animateContext={false} 
                showFinal={true} 
              />
            </div>
            <Button onClick={() => setHighlightDocuments(!highlightDocuments)} size="sm">
              {highlightDocuments ? "Remove Highlight" : "Highlight"}
            </Button>
          </>
        )
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "white", padding: "8px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div className="flex flex-row gap-6 items-start">
          {/* Left side: Toggle buttons stacked vertically */}
          <div className="flex flex-col gap-2 shrink-0">
            <Button 
              onClick={() => { setView("documents"); setActionButtons(null); setVersionButtons(new Map()) }} 
              variant={view === "documents" ? "default" : "outline"}
              className="h-6 px-2 text-xs w-full justify-start"
            >
              All Documents
            </Button>
            <Button 
              onClick={() => { setView("chatgpt"); setActionButtons(null); setVersionButtons(new Map()) }} 
              variant={view === "chatgpt" ? "default" : "outline"}
              className="h-6 px-2 text-xs w-full justify-start"
            >
              ChatGPT
            </Button>
            <Button 
              onClick={() => { setView("database"); setActionButtons(null); setVersionButtons(new Map()) }} 
              variant={view === "database" ? "default" : "outline"}
              className="h-6 px-2 text-xs w-full justify-start"
            >
              Database
            </Button>
            <Button 
              onClick={() => { setView("reasoning"); setActionButtons(null); setVersionButtons(new Map()) }} 
              variant={view === "reasoning" ? "default" : "outline"}
              className="h-6 px-2 text-xs w-full justify-start"
            >
              Reasoning
            </Button>
            <Button 
              onClick={() => { setView("post-request"); setActionButtons(null); setVersionButtons(new Map()) }} 
              variant={view === "post-request" ? "default" : "outline"}
              className="h-6 px-2 text-xs w-full justify-start"
            >
              Post Request
            </Button>
            <Button 
              onClick={() => { setView("retrieved-search"); setActionButtons(null); setVersionButtons(new Map()) }} 
              variant={view === "retrieved-search" ? "default" : "outline"}
              className="h-6 px-2 text-xs w-full justify-start"
            >
              Retrieved Search
            </Button>
            <Button 
              onClick={() => { setView("rag"); setActionButtons(null); setVersionButtons(new Map()) }} 
              variant={view === "rag" ? "default" : "outline"}
              className="h-6 px-2 text-xs w-full justify-start"
            >
              RAG
            </Button>
            <Button 
              onClick={() => { setView("sid-pipeline"); setActionButtons(null); setVersionButtons(new Map()) }} 
              variant={view === "sid-pipeline" ? "default" : "outline"}
              className="h-6 px-2 text-xs w-full justify-start"
            >
              SID Pipeline
            </Button>
            <Button 
              onClick={() => { setView("pipeline-comparison"); setActionButtons(null); setVersionButtons(new Map()) }} 
              variant={view === "pipeline-comparison" ? "default" : "outline"}
              className="h-6 px-2 text-xs w-full justify-start"
            >
              Pipeline Comparison
            </Button>
          </div>

          {/* Middle: Content area */}
          <div className="flex-1 flex flex-col gap-4 items-center">
            {renderContent()}
          </div>

          {/* Right side: Action buttons stacked vertically */}
          {actionButtons && (
            <div className="flex flex-col gap-2 shrink-0" style={{ width: view === "reasoning" ? "200px" : "auto" }}>
              {actionButtons}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

