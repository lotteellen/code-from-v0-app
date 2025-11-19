"use client"

import { useState, useCallback, useRef } from "react"
import {DocumentVariants, VARIANT_MAX_KEYS, DocumentVariant, AVAILABLE_DOCUMENT_VARIANTS, type DocumentVariantFunctions} from "@/components/graphics/elements/document-variants"
import { AIChat, type ChatGPTFunctions } from "@/components/graphics/elements/AI-chat"
import { PostRequest, type PostRequestFunctions } from "@/components/graphics/elements/post-request"
import { ReasoningModel, type ReasoningModelFunctions } from "@/components/graphics/elements/reasoning-model"
import { Database, type DatabaseFunctions } from "@/components/graphics/elements/database"
import { Search, type SearchFunctions } from "@/components/graphics/elements/search"
import { type DocumentItem } from "@/components/graphics/elements/document-variants"
import { RAGPipelineCard, type RAGPipelineFunctions } from "@/components/graphics/rag-card"
import { SIDPipelineCard } from "@/components/graphics/sid-pipeline-card"
import { PipelineComparison } from "@/components/graphics/pipeline-comparison"
import { APICall } from "@/components/graphics/helpers/api-call"
import { DocumentStack, type DocumentStackFunctions } from "@/components/graphics/helpers/document-stack"
import { Button } from "@/components/ui/button"

// View navigation configuration
const VIEWS = [
  { key: "documents", label: "All Documents" },
  { key: "chat", label: "Chat" },
  { key: "database", label: "Database" },
  { key: "api-call", label: "API Call" },
  { key: "reasoning", label: "Reasoning" },
  { key: "post-request", label: "Post Request" },
  { key: "retrieved-search", label: "Search" },
  { key: "rag", label: "RAG" },
  { key: "sid-pipeline", label: "SID Pipeline" },
  { key: "pipeline-comparison", label: "Pipeline Comparison" },
] as const

type ViewType = (typeof VIEWS)[number]["key"]

// Document variant titles mapping
const DOCUMENT_VARIANT_TITLES: Record<string, string> = {
  simple: "Simple Document",
  bullets: "Bullet Points",
  bullets2: "Bullet Points 2",
  chart: "Chart Document",
  chart2: "Chart Document 2",
  table: "Table Document",
  table2: "Table Document 2",
  image: "Image Document",
  image2: "Image Document 2",
  spreadsheet: "Spreadsheet",
  spreadsheet2: "Spreadsheet 2",
  email: "Email",
  email2: "Email 2",
  email3: "Email 3",
}

// Hardcoded highlight lines for each document variant
const DOCUMENT_VARIANTS_WITH_HIGHLIGHTS: DocumentItem[] = [
  { id: "simple", variant: "simple", highlightLines: [1, 3, 5] },
  { id: "bullets", variant: "bullets", highlightLines: [0, 2, 4] },
  { id: "bullets2", variant: "bullets2", highlightLines: [1, 3, 5] },
  { id: "chart", variant: "chart", highlightLines: [0, 2] },
  { id: "chart2", variant: "chart2", highlightLines: [0, 2] },
  { id: "table", variant: "table", highlightLines: [1, 4, 7] },
  { id: "table2", variant: "table2", highlightLines: [2, 5, 9] },
  { id: "image", variant: "image", highlightLines: [1, 3] },
  { id: "image2", variant: "image2", highlightLines: [2, 4, 6] },
  { id: "spreadsheet", variant: "spreadsheet", highlightLines: [5, 15, 25, 35] },
  { id: "spreadsheet2", variant: "spreadsheet2", highlightLines: [3, 10, 20, 30] },
  { id: "email", variant: "email", highlightLines: [0, 2] },
  { id: "email2", variant: "email2", highlightLines: [1, 3, 5] },
  { id: "email3", variant: "email3", highlightLines: [0, 2] },
]

// Document stack array used at the top of the page and in PostRequest
// Using 10 unique document variants
const DOCUMENT_STACK_ARRAY: (string | DocumentItem)[] = [
  { id: "email2-1", variant: "email2", highlightLines: [1, 3, 5] },
  { id: "table2-1", variant: "table2", highlightLines: [2, 5, 9] },
  { id: "chart-1", variant: "chart", highlightLines: [0, 2] },
  { id: "bullets2-1", variant: "bullets2", highlightLines: [1, 3, 5] },
  { id: "email-1", variant: "email", highlightLines: [0, 2] },
  { id: "spreadsheet-1", variant: "spreadsheet", highlightLines: [5, 15, 25, 35] },
  { id: "bullets-1", variant: "bullets", highlightLines: [0, 2, 4] },
  { id: "image-1", variant: "image2", highlightLines: [1, 3] },
  { id: "simple-1", variant: "simple", highlightLines: [1, 3, 5] },
  { id: "table-1", variant: "table", highlightLines: [1, 4, 7] },
]

const DEFAULT_QUERY = "What was our enterprise pricing before we pivoted to SMB?"

// ============================================================================
// Helper Functions & Components (within same file)
// ============================================================================

type DocumentVariantRef = DocumentVariantFunctions | null
type SearchFunctionsRef = SearchFunctions | null

// Initialize all DocumentVariant refs
function useDocumentVariantRefs() {
  return {
    simpleDocRef: useRef<DocumentVariantRef>(null),
    bulletsDocRef: useRef<DocumentVariantRef>(null),
    bullets2DocRef: useRef<DocumentVariantRef>(null),
    chartDocRef: useRef<DocumentVariantRef>(null),
    chart2DocRef: useRef<DocumentVariantRef>(null),
    tableDocRef: useRef<DocumentVariantRef>(null),
    table2DocRef: useRef<DocumentVariantRef>(null),
    imageDocRef: useRef<DocumentVariantRef>(null),
    image2DocRef: useRef<DocumentVariantRef>(null),
    spreadsheetDocRef: useRef<DocumentVariantRef>(null),
    spreadsheet2DocRef: useRef<DocumentVariantRef>(null),
    emailDocRef: useRef<DocumentVariantRef>(null),
    email2DocRef: useRef<DocumentVariantRef>(null),
    email3DocRef: useRef<DocumentVariantRef>(null),
  }
}

// Get all document variant refs as an array
function getAllDocumentVariantRefs(refs: ReturnType<typeof useDocumentVariantRefs>) {
  return Object.values(refs)
}

// View navigation buttons component
function ViewNavigationButtons({ view, setView }: { view: ViewType; setView: (view: ViewType) => void }) {
  return (
    <div className="flex flex-col gap-2 shrink-0">
      {VIEWS.map(({ key, label }) => (
        <Button
          key={key}
          onClick={() => setView(key)}
          variant={view === key ? "default" : "outline"}
          className="h-6 px-2 text-xs w-full justify-start"
        >
          {label}
        </Button>
      ))}
    </div>
  )
}

// Document action buttons component
function DocumentActionButtons({
  handleDocumentAnimate,
  handleDocumentReset,
  documentVariantRefs,
  documentStackRef,
  showFinalDocumentStack,
  setShowFinalDocumentStack,
}: {
  handleDocumentAnimate: () => void
  handleDocumentReset: () => void
  documentVariantRefs: ReturnType<typeof useDocumentVariantRefs>
  documentStackRef: React.MutableRefObject<DocumentStackFunctions | null>
  showFinalDocumentStack: boolean
  setShowFinalDocumentStack: (value: boolean) => void
}) {
  const handleDocumentFinalTrue = useCallback(() => {
    const allRefs = getAllDocumentVariantRefs(documentVariantRefs)
    allRefs.forEach((ref, index) => {
      const funcs = ref.current
      const docItem = DOCUMENT_VARIANTS_WITH_HIGHLIGHTS[index]
      if (funcs && docItem && docItem.highlightLines) {
        funcs.setFinal(true)
        docItem.highlightLines.forEach((lineIndex) => {
          funcs.animateHighlight(lineIndex)
        })
      }
    })
  }, [documentVariantRefs])

  const handleDocumentFinalFalse = useCallback(() => {
    const allRefs = getAllDocumentVariantRefs(documentVariantRefs)
    allRefs.forEach((ref) => {
      const funcs = ref.current
      if (funcs) {
        funcs.setFinal(false)
        funcs.reset()
      }
    })
  }, [documentVariantRefs])

  return (
    <div style={{ width: "80px" }}>
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-700 mb-1">Document Variants</div>
        <Button onClick={handleDocumentAnimate} size="sm" className="w-full" variant="outline">
          Animate
        </Button>
        <Button onClick={handleDocumentReset} size="sm" className="w-full" variant="outline">
          Reset
        </Button>
        <Button onClick={handleDocumentFinalTrue} size="sm" className="w-full" variant="outline">
          Final (true)
        </Button>
        <Button onClick={handleDocumentFinalFalse} size="sm" className="w-full" variant="outline">
          Final (false)
        </Button>
        <div className="text-xs font-semibold text-gray-700 mb-1 mt-2">Document Stack</div>
        <Button onClick={() => documentStackRef.current?.animate()} size="sm" className="w-full" variant="outline">
          Animate
        </Button>
        <Button onClick={() => documentStackRef.current?.reset()} size="sm" className="w-full" variant="outline">
          Reset
        </Button>
        <Button
          onClick={() => {
            documentStackRef.current?.setFinal(true)
            setShowFinalDocumentStack(true)
          }}
          size="sm"
          className="w-full"
          variant={showFinalDocumentStack ? "default" : "outline"}
        >
          Final (true)
        </Button>
        <Button
          onClick={() => {
            documentStackRef.current?.setFinal(false)
            setShowFinalDocumentStack(false)
          }}
          size="sm"
          className="w-full"
          variant={!showFinalDocumentStack ? "default" : "outline"}
        >
          Final (false)
        </Button>
      </div>
    </div>
  )
}

// Chat action buttons component
function ChatActionButtons({
  chatCorrectFunctionsRef,
  chatIncorrectFunctionsRef,
  showFinalChatCorrect,
  showFinalChatIncorrect,
  setShowFinalChatCorrect,
  setShowFinalChatIncorrect,
}: {
  chatCorrectFunctionsRef: React.MutableRefObject<ChatGPTFunctions | null>
  chatIncorrectFunctionsRef: React.MutableRefObject<ChatGPTFunctions | null>
  showFinalChatCorrect: boolean
  showFinalChatIncorrect: boolean
  setShowFinalChatCorrect: (value: boolean) => void
  setShowFinalChatIncorrect: (value: boolean) => void
}) {
  return (
    <div style={{ width: "140px" }}>
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-700 mb-1">Chat (Correct)</div>
        <Button
          onClick={async () => await chatCorrectFunctionsRef.current?.animateUserMessage()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Animate User Message
        </Button>
        <Button
          onClick={async () => await chatCorrectFunctionsRef.current?.focus()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Focus Lines
        </Button>
        <Button
          onClick={async () => await chatCorrectFunctionsRef.current?.unFocus()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Unfocus Lines
        </Button>
        <Button
          onClick={async () => await chatCorrectFunctionsRef.current?.animateAssistantMessage()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Animate Assistant
        </Button>
        <Button
          onClick={async () => await chatCorrectFunctionsRef.current?.animateIndicator()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Animate Indicator
        </Button>
        <Button
          onClick={() => {
            chatCorrectFunctionsRef.current?.setFinal()
            setShowFinalChatCorrect(true)
          }}
          size="sm"
          className="w-full"
          variant={showFinalChatCorrect ? "default" : "outline"}
        >
          Final
        </Button>
        <Button
          onClick={() => chatCorrectFunctionsRef.current?.reset()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Reset
        </Button>
        <div className="text-xs font-semibold text-gray-700 mb-1 mt-2">Chat (Incorrect)</div>
        <Button
          onClick={async () => await chatIncorrectFunctionsRef.current?.animateUserMessage()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Animate User Message
        </Button>
        <Button
          onClick={async () => await chatIncorrectFunctionsRef.current?.focus()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Focus Lines
        </Button>
        <Button
          onClick={async () => await chatIncorrectFunctionsRef.current?.unFocus()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Unfocus Lines
        </Button>
        <Button
          onClick={async () => await chatIncorrectFunctionsRef.current?.animateAssistantMessage()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Animate Assistant
        </Button>
        <Button
          onClick={async () => await chatIncorrectFunctionsRef.current?.animateIndicator()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Animate Indicator
        </Button>
        <Button
          onClick={() => {
            chatIncorrectFunctionsRef.current?.setFinal()
            setShowFinalChatIncorrect(true)
          }}
          size="sm"
          className="w-full"
          variant={showFinalChatIncorrect ? "default" : "outline"}
        >
          Final
        </Button>
        <Button
          onClick={() => chatIncorrectFunctionsRef.current?.reset()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Reset
        </Button>
      </div>
    </div>
  )
}

// Database action buttons component
function DatabaseActionButtons({
  showFinalDatabaseDarkMode,
  setShowFinalDatabaseDarkMode,
  databaseFunctionsRef,
  databaseMode,
  setDatabaseMode,
}: {
  showFinalDatabaseDarkMode: boolean | "unhighlighted"
  setShowFinalDatabaseDarkMode: (value: boolean | "unhighlighted") => void
  databaseFunctionsRef: React.MutableRefObject<DatabaseFunctions | null>
  databaseMode: "light" | "dark" | "filled"
  setDatabaseMode: (mode: "light" | "dark" | "filled") => void
}) {
  return (
    <div style={{ width: "140px" }}>
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-700 mb-1">Database Settings</div>
        <Button
          onClick={() => {
            const modes: ("light" | "dark" | "filled")[] = ["light", "dark", "filled"]
            const currentIndex = modes.indexOf(databaseMode)
            const nextIndex = (currentIndex + 1) % modes.length
            setDatabaseMode(modes[nextIndex])
          }}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Mode: {databaseMode}
        </Button>
        <div className="text-xs font-semibold text-gray-700 mb-1 mt-2">Database Functions</div>
        <Button
          onClick={async () => await databaseFunctionsRef.current?.addText(DEFAULT_QUERY)}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Add Text
        </Button>
        <Button
          onClick={async () => await databaseFunctionsRef.current?.search(true)}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Quick Search
        </Button>
        <Button
          onClick={async () => {
            await databaseFunctionsRef.current?.addText(DEFAULT_QUERY)
            await databaseFunctionsRef.current?.search(false)
          }}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Slow Search
        </Button>
       
        <Button
          onClick={() => databaseFunctionsRef.current?.highlightKeywords()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Highlight Keywords
        </Button>
        <Button
          onClick={() => {
            databaseFunctionsRef.current?.setFinal(true)
            setShowFinalDatabaseDarkMode(true)
          }}
          size="sm"
          className="w-full"
          variant={showFinalDatabaseDarkMode === true ? "default" : "outline"}
        >
          Final (Highlighted)
        </Button>
        <Button
          onClick={() => {
            databaseFunctionsRef.current?.setFinal(false)
            setShowFinalDatabaseDarkMode("unhighlighted")
          }}
          size="sm"
          className="w-full"
          variant={showFinalDatabaseDarkMode === "unhighlighted" ? "default" : "outline"}
        >
          Final (Unhighlighted)
        </Button>
        <Button
          onClick={() => {
            databaseFunctionsRef.current?.reset()
            setShowFinalDatabaseDarkMode(false)
          }}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Reset
        </Button>
      </div>
    </div>
  )
}

// Search action buttons component (reusable for both 2 and 7 document searches)
function SearchActionButtons({
  label,
  searchFunctionsRef,
  showFinal,
  setShowFinal,
}: {
  label: string
  searchFunctionsRef: React.MutableRefObject<SearchFunctionsRef>
  showFinal: boolean | "unhighlighted"
  setShowFinal: (value: boolean | "unhighlighted") => void
}) {
  return (
    <>
      <div className="text-xs font-semibold text-gray-700 mb-1">{label}</div>
      <Button onClick={async () => await searchFunctionsRef.current?.search(DEFAULT_QUERY, true)} size="sm" className="w-full" variant="outline">
        Quick Search
      </Button>
      <Button onClick={async () => await searchFunctionsRef.current?.search(DEFAULT_QUERY, false)} size="sm" className="w-full" variant="outline">
        Slow Search
      </Button>
      <Button
        onClick={async () => await searchFunctionsRef.current?.shuffle()}
        size="sm"
        className="w-full"
        variant="outline"
      >
        Shuffle
      </Button>
      <Button
        onClick={async () => await searchFunctionsRef.current?.unshuffle()}
        size="sm"
        className="w-full"
        variant="outline"
      >
        Unshuffle
      </Button>
      <Button
        onClick={() => searchFunctionsRef.current?.setFinal(true)}
        size="sm"
        className="w-full"
        variant={showFinal === true ? "default" : "outline"}
      >
        Final (Highlighted)
      </Button>
      <Button
        onClick={() => searchFunctionsRef.current?.setFinal(false)}
        size="sm"
        className="w-full"
        variant={showFinal === "unhighlighted" ? "default" : "outline"}
      >
        Final (Unhighlighted)
      </Button>
      <Button
        onClick={() => {
          searchFunctionsRef.current?.reset()
          setShowFinal(false)
        }}
        size="sm"
        className="w-full"
        variant="outline"
      >
        Reset
      </Button>
    </>
  )
}

// Post request action buttons component
function PostRequestActionButtons({
  postRequestWithSIDFunctionsRef,
  postRequestWithoutSIDFunctionsRef,
  showFinalWithSID,
  showFinalWithoutSID,
  setShowFinalWithSID,
  setShowFinalWithoutSID,
}: {
  postRequestWithSIDFunctionsRef: React.MutableRefObject<PostRequestFunctions | null>
  postRequestWithoutSIDFunctionsRef: React.MutableRefObject<PostRequestFunctions | null>
  showFinalWithSID: boolean
  showFinalWithoutSID: boolean
  setShowFinalWithSID: (value: boolean) => void
  setShowFinalWithoutSID: (value: boolean) => void
}) {
  return (
    <div style={{ width: "140px" }}>
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-700 mb-1">Post Request (With SID)</div>
        <Button
          onClick={async () => {
            await postRequestWithSIDFunctionsRef.current?.animateContext()
          }}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Animate Context
        </Button>
        <Button
          onClick={async () => {
            await postRequestWithSIDFunctionsRef.current?.animateUserMessage()
          }}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Animate User Message
        </Button>
        <Button
          onClick={async () => {
            await postRequestWithSIDFunctionsRef.current?.pulsate()
          }}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Pulsate
        </Button>
        <Button
          onClick={() => {
            postRequestWithSIDFunctionsRef.current?.setFinal()
            setShowFinalWithSID(true)
          }}
          size="sm"
          className="w-full"
          variant={showFinalWithSID ? "default" : "outline"}
        >
          Final
        </Button>
        <Button
          onClick={() => {
            postRequestWithSIDFunctionsRef.current?.reset()
            setShowFinalWithSID(false)
          }}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Reset
        </Button>
        <div className="text-xs font-semibold text-gray-700 mb-1 mt-2">Post Request (Without SID)</div>
        <Button
          onClick={async () => {
            await postRequestWithoutSIDFunctionsRef.current?.animateContext()
          }}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Animate Context
        </Button>
        <Button
          onClick={async () => {
            await postRequestWithoutSIDFunctionsRef.current?.animateUserMessage()
          }}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Animate User Message
        </Button>
        <Button
          onClick={async () => {
            await postRequestWithoutSIDFunctionsRef.current?.pulsate()
          }}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Pulsate
        </Button>
        <Button
          onClick={() => {
            postRequestWithoutSIDFunctionsRef.current?.setFinal()
            setShowFinalWithoutSID(true)
          }}
          size="sm"
          className="w-full"
          variant={showFinalWithoutSID ? "default" : "outline"}
        >
          Final
        </Button>
        <Button
          onClick={() => {
            postRequestWithoutSIDFunctionsRef.current?.reset()
            setShowFinalWithoutSID(false)
          }}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Reset
        </Button>
      </div>
    </div>
  )
}

// API call action buttons component
function APICallActionButtons({
  animateContext,
  setAnimateContext,
  animateMessage,
  setAnimateMessage,
  isFinal,
  setIsFinal,
  pulsate,
  setPulsate,
}: {
  animateContext: boolean
  setAnimateContext: (value: boolean) => void
  animateMessage: boolean
  setAnimateMessage: (value: boolean) => void
  isFinal: boolean
  setIsFinal: (value: boolean) => void
  pulsate: boolean
  setPulsate: (value: boolean) => void
}) {
  return (
    <div style={{ width: "140px" }}>
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-700 mb-1">API Call Functions</div>
        <Button
          onClick={() => setAnimateContext(!animateContext)}
          size="sm"
          className="w-full"
          variant={animateContext ? "default" : "outline"}
        >
          Animate Context
        </Button>
        <Button
          onClick={() => setAnimateMessage(!animateMessage)}
          size="sm"
          className="w-full"
          variant={animateMessage ? "default" : "outline"}
        >
          Animate Message
        </Button>
        <Button
          onClick={() => {
            setIsFinal(true)
            setAnimateContext(true)
            setAnimateMessage(true)
          }}
          size="sm"
          className="w-full"
          variant={isFinal ? "default" : "outline"}
        >
          Final
        </Button>
        <Button
          onClick={() => {
            setIsFinal(false)
            setAnimateContext(false)
            setAnimateMessage(false)
          }}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Reset
        </Button>
        <Button
          onClick={() => setPulsate(!pulsate)}
          size="sm"
          className="w-full"
          variant={pulsate ? "default" : "outline"}
        >
          Pulsate
        </Button>
      </div>
    </div>
  )
}

// Reasoning action buttons component
function ReasoningActionButtons({
  reasoningFunctionsRef,
  onRetrieve,
}: {
  reasoningFunctionsRef: React.MutableRefObject<ReasoningModelFunctions | null>
  onRetrieve?: (query: string) => Promise<void>
}) {
  return (
    <div style={{ width: "140px" }}>
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-700 mb-1">Reasoning Functions</div>
        <Button
          onClick={async () => await reasoningFunctionsRef.current?.insertQueryText()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Insert Query Text
        </Button>
        <Button
          onClick={async () => await reasoningFunctionsRef.current?.runRemainingSequence()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Run Remaining Sequence
        </Button>
        <Button
          onClick={() => reasoningFunctionsRef.current?.setFinal()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Set Final
        </Button>
        <Button
          onClick={() => reasoningFunctionsRef.current?.reset()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Reset
        </Button>
        <Button
          onClick={async () => {
            // Continue the sequence - this will call onRetrieve with the stored query
            await reasoningFunctionsRef.current?.continueRetrieval()
          }}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Continue Retrieval
        </Button>
      </div>
    </div>
  )
}

// RAG action buttons component
function RAGActionButtons({
  ragFunctionsRef,
}: {
  ragFunctionsRef: React.MutableRefObject<RAGPipelineFunctions | null>
}) {
  return (
    <div style={{ width: "140px" }}>
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-700 mb-1">RAG Pipeline</div>
        <Button
          onClick={async () => await ragFunctionsRef.current?.animate()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Animate
        </Button>
        <Button
          onClick={() => ragFunctionsRef.current?.setFinal()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Final
        </Button>
        <Button
          onClick={() => ragFunctionsRef.current?.reset()}
          size="sm"
          className="w-full"
          variant="outline"
        >
          Reset
        </Button>
      </div>
    </div>
  )
}

// Retrieved search action buttons component
function RetrievedSearchActionButtons({
  search7FunctionsRef,
  showFinalRetrievedSearch7,
  setShowFinalRetrievedSearch7,
}: {
  search7FunctionsRef: React.MutableRefObject<SearchFunctionsRef>
  showFinalRetrievedSearch7: boolean | "unhighlighted"
  setShowFinalRetrievedSearch7: (value: boolean | "unhighlighted") => void
}) {
  return (
    <div style={{ width: "140px" }}>
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-700 mb-1 mt-2">Search (10 Documents)</div>
        <SearchActionButtons
          label=""
          searchFunctionsRef={search7FunctionsRef}
          showFinal={showFinalRetrievedSearch7}
          setShowFinal={setShowFinalRetrievedSearch7}
        />
      </div>
    </div>

  )
}

export default function Home() {
  // State
  const [view, setView] = useState<ViewType>("documents")
  const [showFinalWithSID, setShowFinalWithSID] = useState(false)
  const [showFinalWithoutSID, setShowFinalWithoutSID] = useState(false)
  // Handler for onRetrieve callback
  const handleReasoningRetrieve = useCallback(async (query: string) => {
    console.log("onRetrieve called with query:", query)
    // Return a promise that can be awaited
    return Promise.resolve()
  }, [])
  const [showFinalRetrievedSearch7, setShowFinalRetrievedSearch7] = useState<boolean | "unhighlighted">(false)
  const [showFinalChatCorrect, setShowFinalChatCorrect] = useState(false)
  const [showFinalChatIncorrect, setShowFinalChatIncorrect] = useState(false)
  const [showFinalDatabaseDarkMode, setShowFinalDatabaseDarkMode] = useState<boolean | "unhighlighted">(false)
  const [showFinalDocumentStack, setShowFinalDocumentStack] = useState(false)
  const [databaseMode, setDatabaseMode] = useState<"light" | "dark" | "filled">("dark")
  const [apiCallAnimateContext, setApiCallAnimateContext] = useState(false)
  const [apiCallAnimateMessage, setApiCallAnimateMessage] = useState(false)
  const [apiCallIsFinal, setApiCallIsFinal] = useState(false)
  const [apiCallPulsate, setApiCallPulsate] = useState(false)
  
  // Refs
  const documentStackRef = useRef<DocumentStackFunctions | null>(null)
  const search7FunctionsRef = useRef<SearchFunctionsRef>(null)
  const databaseFunctionsRef = useRef<DatabaseFunctions | null>(null)
  const documentVariantRefs = useDocumentVariantRefs()
  const postRequestWithSIDFunctionsRef = useRef<PostRequestFunctions | null>(null)
  const postRequestWithoutSIDFunctionsRef = useRef<PostRequestFunctions | null>(null)
  const chatCorrectFunctionsRef = useRef<ChatGPTFunctions | null>(null)
  const chatIncorrectFunctionsRef = useRef<ChatGPTFunctions | null>(null)
  const reasoningFunctionsRef = useRef<ReasoningModelFunctions | null>(null)
  const ragFunctionsRef = useRef<RAGPipelineFunctions | null>(null)

  // Document variant handlers
  const handleDocumentAnimate = useCallback(() => {
    const allRefs = getAllDocumentVariantRefs(documentVariantRefs)
    allRefs.forEach((ref, index) => {
      const funcs = ref.current
      const docItem = DOCUMENT_VARIANTS_WITH_HIGHLIGHTS[index]
      if (funcs && docItem && docItem.highlightLines) {
        funcs.reset()
        funcs.setFinal(false)
        docItem.highlightLines.forEach((lineIndex) => {
          funcs.animateHighlight(lineIndex)
        })
      }
    })
  }, [documentVariantRefs])

  const handleDocumentReset = useCallback(() => {
    const allRefs = getAllDocumentVariantRefs(documentVariantRefs)
    allRefs.forEach((ref) => {
      ref.current?.reset()
    })
  }, [documentVariantRefs])


  const handleDatabaseFunctionsReady = useCallback(
    (functions: DatabaseFunctions): void => {
      databaseFunctionsRef.current = functions
    },
    []
  )



  const handleRetrievedSearch7FunctionsReady = useCallback(
    (functions: SearchFunctions) => {
      search7FunctionsRef.current = functions
    },
    []
  )



  const handlePostRequestWithSIDFunctionsReady = useCallback(
    (functions: PostRequestFunctions) => {
      postRequestWithSIDFunctionsRef.current = functions
    },
    []
  )

  const handlePostRequestWithoutSIDFunctionsReady = useCallback(
    (functions: PostRequestFunctions) => {
      postRequestWithoutSIDFunctionsRef.current = functions
    },
    []
  )

  const handleChatCorrectFunctionsReady = useCallback(
    (functions: ChatGPTFunctions) => {
      chatCorrectFunctionsRef.current = functions
    },
    []
  )

  const handleChatIncorrectFunctionsReady = useCallback(
    (functions: ChatGPTFunctions) => {
      chatIncorrectFunctionsRef.current = functions
    },
    []
  )

  const handleReasoningFunctionsReady = useCallback(
    (functions: ReasoningModelFunctions) => {
      reasoningFunctionsRef.current = functions
    },
    []
  )

  const renderContent = () => {
    switch (view) {
      case "chat":
        return (
          <div className="grid grid-cols-2 gap-4 justify-items-center">
            <div style={{ width: "200px" }}>
              <AIChat
                isCorrect={true}
                onFunctionsReady={handleChatCorrectFunctionsReady}
                query={DEFAULT_QUERY}
              />
            </div>
            <div style={{ width: "200px" }}>
              <AIChat
                isCorrect={false}
                onFunctionsReady={handleChatIncorrectFunctionsReady}
                query={DEFAULT_QUERY}
              />
            </div>
          </div>
        )
      case "post-request":
        return (
          <div className="grid grid-cols-2 gap-20 justify-items-center">
            <div style={{ width: "200px" }}>
              <PostRequest
                documents={[]}
                onFunctionsReady={handlePostRequestWithSIDFunctionsReady}
              />
            </div>
            <div style={{ width: "200px" } }>
              <PostRequest
                documents={DOCUMENT_STACK_ARRAY}
                onFunctionsReady={handlePostRequestWithoutSIDFunctionsReady}
              />
            </div>
          </div>
        )
      case "reasoning":
        return (
          <div style={{ width: "200px" }}>
            <ReasoningModel
              onFunctionsReady={handleReasoningFunctionsReady}
              query={DEFAULT_QUERY}
              onRetrieve={handleReasoningRetrieve}
            />
          </div>
        )
      case "retrieved-search":
        return (
          <div
            className="flex flex-col gap-8 justify-items-center items-center mx-auto"
          >
              <Search
                onFunctionsReady={handleRetrievedSearch7FunctionsReady}
                documents={DOCUMENT_STACK_ARRAY as DocumentItem[]}
                query={DEFAULT_QUERY}
              />
          </div>
        )
      case "rag":
        return (
          <div style={{ width: "100%" }}>
            <RAGPipelineCard
              query={DEFAULT_QUERY}
              onFunctionsReady={(functions) => {
                ragFunctionsRef.current = functions
              }}
            />
          </div>
        )
      case "sid-pipeline":
        return (
          <div style={{ width: "100%" }}>
            <SIDPipelineCard query={DEFAULT_QUERY} />
          </div>
        )
      case "pipeline-comparison":
        return (
          <div style={{ width: "100%" }}>
            <PipelineComparison query={DEFAULT_QUERY} />
          </div>
        )
      case "database":
        return (
          <div style={{ width: "200px" }}>
            <Database
              mode={databaseMode}
              onFunctionsReady={handleDatabaseFunctionsReady}
              message={DEFAULT_QUERY}
            />
          </div>
        )
      case "api-call":
        return (
          <div className="grid grid-cols-2 gap-20 justify-items-center">
            <div style={{ width: "200px" }}>
              <APICall
                contextMode="sid"
                animateContext={apiCallAnimateContext}
                animateMessage={apiCallAnimateMessage}
                isFinal={apiCallIsFinal}
                pulsate={apiCallPulsate}
              />
            </div>
            <div style={{ width: "200px" }}>
              <APICall
                contextMode="rag"
                animateContext={apiCallAnimateContext}
                animateMessage={apiCallAnimateMessage}
                isFinal={apiCallIsFinal}
                pulsate={apiCallPulsate}
              />
            </div>
          </div>
        )
      case "documents":
      default:
        return (
          <>
            <div className="flex flex-row gap-4 items-start justify-center flex-wrap">
              {DOCUMENT_VARIANTS_WITH_HIGHLIGHTS.map((docItem, index) => {
                const refs = getAllDocumentVariantRefs(documentVariantRefs)
                const ref = refs[index]
                return (
                  <DocumentVariants
                    key={docItem.id}
                    variant={docItem.variant}
                    title={DOCUMENT_VARIANT_TITLES[docItem.variant]}
                    onFunctionsReady={(funcs) => {
                      if (ref) ref.current = funcs
                    }}
                  />
                )
              })}
            </div>
            <DocumentStack
              documents={DOCUMENT_STACK_ARRAY}
              onFunctionsReady={(funcs) => {
                documentStackRef.current = funcs
              }}
            />
          </>
        )
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "white", padding: "8px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div className="flex flex-row gap-6 items-start">
          {/* Left side: Toggle buttons stacked vertically */}
          <ViewNavigationButtons view={view} setView={setView} />

          {/* Middle: Content area */}
          <div id="content-area" className="flex-1 flex flex-col gap-4 items-center">{renderContent()}</div>

          {/* Right side: Action buttons stacked vertically */}
          <div
            id="action-buttons"
            className="flex flex-col gap-2 shrink-0"
            style={{ width: view === "reasoning" ? "200px" : "auto" }}
          >
            {view === "documents" && (
              <DocumentActionButtons
                handleDocumentAnimate={handleDocumentAnimate}
                handleDocumentReset={handleDocumentReset}
                documentVariantRefs={documentVariantRefs}
                documentStackRef={documentStackRef}
                showFinalDocumentStack={showFinalDocumentStack}
                setShowFinalDocumentStack={setShowFinalDocumentStack}
              />
            )}
            {view === "chat" && (
              <ChatActionButtons
                chatCorrectFunctionsRef={chatCorrectFunctionsRef}
                chatIncorrectFunctionsRef={chatIncorrectFunctionsRef}
                showFinalChatCorrect={showFinalChatCorrect}
                showFinalChatIncorrect={showFinalChatIncorrect}
                setShowFinalChatCorrect={setShowFinalChatCorrect}
                setShowFinalChatIncorrect={setShowFinalChatIncorrect}
              />
            )}
            {view === "post-request" && (
              <PostRequestActionButtons
                postRequestWithSIDFunctionsRef={postRequestWithSIDFunctionsRef}
                postRequestWithoutSIDFunctionsRef={postRequestWithoutSIDFunctionsRef}
                showFinalWithSID={showFinalWithSID}
                showFinalWithoutSID={showFinalWithoutSID}
                setShowFinalWithSID={setShowFinalWithSID}
                setShowFinalWithoutSID={setShowFinalWithoutSID}
              />
            )}
            {view === "reasoning" && (
              <ReasoningActionButtons
                reasoningFunctionsRef={reasoningFunctionsRef}
                onRetrieve={handleReasoningRetrieve}
              />
            )}
            {view === "database" && (
              <DatabaseActionButtons
                showFinalDatabaseDarkMode={showFinalDatabaseDarkMode}
                setShowFinalDatabaseDarkMode={setShowFinalDatabaseDarkMode}
                databaseFunctionsRef={databaseFunctionsRef}
                databaseMode={databaseMode}
                setDatabaseMode={setDatabaseMode}
              />
            )}
            {view === "api-call" && (
              <APICallActionButtons
                animateContext={apiCallAnimateContext}
                setAnimateContext={setApiCallAnimateContext}
                animateMessage={apiCallAnimateMessage}
                setAnimateMessage={setApiCallAnimateMessage}
                isFinal={apiCallIsFinal}
                setIsFinal={setApiCallIsFinal}
                pulsate={apiCallPulsate}
                setPulsate={setApiCallPulsate}
              />
            )}
            {view === "retrieved-search" && (
              <RetrievedSearchActionButtons
                search7FunctionsRef={search7FunctionsRef}
                showFinalRetrievedSearch7={showFinalRetrievedSearch7}
                setShowFinalRetrievedSearch7={setShowFinalRetrievedSearch7}
              />
            )}
            {view === "rag" && (
              <RAGActionButtons ragFunctionsRef={ragFunctionsRef} />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

