"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { DocumentVariants } from "@/components/graphics/elements/document-variants"
import { RETRIEVED_SEARCH_TIMINGS, RAG_HIGHLIGHT_TIMINGS } from "../helpers/animation-timings"
import "../helpers/globals.css"
import { DatabaseSearchCard } from "@/components/graphics/elements/database-search-card"

type DatabaseFunctions = {
  addText: (text?: string) => void;
  removeHighlight: () => void;
  search: () => void;
  highlightEnterprise: () => void;
  highlightPricing: () => void;
  highlightSMB: () => void;
  reset: () => void;
}

export function RetrievedSearchCard({ 
    filled = false,
  darkMode = false, 
  onActionButtons,
  highlightDocuments = false,
  onFunctionsReady,
  width = "200px",
  highlightDatabase = true,
  query,
  isActive = true,
}: { 
  filled?: boolean;
  darkMode?: boolean; 
  onActionButtons?: (buttons: React.ReactNode) => void;
  highlightDocuments?: boolean;
  onFunctionsReady?: (functions: {
    addTextAndRemoveHighlight: (text?: string) => Promise<void>;
    search: () => Promise<void>;
    highlight: () => Promise<void>;
    reset: () => void;
    setQuery: (text: string) => void;
  }) => void;
  width?: string;
  highlightDatabase?: boolean;
  query?: string;
  isActive?: boolean;
}) {
  const [simpleVisible, setSimpleVisible] = useState(false)
  const [bulletsVisible, setBulletsVisible] = useState(false)
  const [chartVisible, setChartVisible] = useState(false)
  const [tableVisible, setTableVisible] = useState(false)
  const [internalHighlightDocuments, setInternalHighlightDocuments] = useState(false)
  const [simpleHighlightLines, setSimpleHighlightLines] = useState<number[]>([])
  const [bulletsHighlightLines, setBulletsHighlightLines] = useState<number[]>([])
  const [chartHighlightLines, setChartHighlightLines] = useState<number[]>([])
  const [tableHighlightLines, setTableHighlightLines] = useState<number[]>([])
  const [isDone, setIsDone] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const isDoneRef = useRef(false)
  const databaseFunctionsRef = useRef<DatabaseFunctions | null>(null)
  const onActionButtonsRef = useRef(onActionButtons)
  const timeoutRefsRef = useRef<NodeJS.Timeout[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const firstDocumentRef = useRef<HTMLDivElement>(null)
  const [calculatedMargin, setCalculatedMargin] = useState<number>(-20)
  const [currentQuery, setCurrentQuery] = useState<string>(query || "")

  // Keep ref in sync with prop
  useEffect(() => {
    onActionButtonsRef.current = onActionButtons
  }, [onActionButtons])

  // Update currentQuery when query prop changes
  useEffect(() => {
    if (query !== undefined) {
      setCurrentQuery(query)
    }
  }, [query])

  // Keep isDoneRef in sync with isDone state
  useEffect(() => {
    isDoneRef.current = isDone
  }, [isDone])

  // Calculate margin to fit documents within parent width
  useEffect(() => {
    const calculateMargin = () => {
      if (!containerRef.current || !firstDocumentRef.current) return

      const parentWidth = containerRef.current.offsetWidth
      const documentWidth = firstDocumentRef.current.offsetWidth
      const numberOfDocuments = 4

      // Calculate total width if documents were side by side
      const totalWidth = documentWidth * numberOfDocuments

      // Calculate overlap needed per document (except first)
      // Formula: (totalWidth - parentWidth) / (numberOfDocuments - 1)
      const overlap = totalWidth > parentWidth 
        ? (totalWidth - parentWidth) / (numberOfDocuments - 1)
        : 0

      setCalculatedMargin(-overlap)
    }

    // Small delay to ensure DOM is rendered
    const timeout = setTimeout(() => {
      calculateMargin()
    }, 0)

    // Recalculate on window resize
    const resizeObserver = new ResizeObserver(() => {
      calculateMargin()
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    if (firstDocumentRef.current) {
      resizeObserver.observe(firstDocumentRef.current)
    }

    return () => {
      clearTimeout(timeout)
      resizeObserver.disconnect()
    }
  }, [width])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefsRef.current.forEach(timeout => clearTimeout(timeout))
      timeoutRefsRef.current = []
    }
  }, [])

  const handleFunctionsReady = useCallback((functions: DatabaseFunctions) => {
    databaseFunctionsRef.current = functions
  }, [])

  // Button 1: Add text and remove highlight
  const handleAddTextAndRemoveHighlight = useCallback((text?: string): Promise<void> => {
    return new Promise((resolve) => {
      const functions = databaseFunctionsRef.current
      if (!functions) {
        resolve()
        return
      }

      // Determine the text to use
      const textToUse = text !== undefined ? text : currentQuery
      
      // Update query if text is provided
      if (text !== undefined) {
        setCurrentQuery(text)
      }

      // Add text immediately with the text to use
      functions.addText(textToUse)
      
      // Remove highlight after delay, then resolve
      const timeout = setTimeout(() => {
        functions.removeHighlight()
        resolve()
      }, RETRIEVED_SEARCH_TIMINGS.REMOVE_HIGHLIGHT_DELAY_MS)
      timeoutRefsRef.current.push(timeout)
    })
  }, [currentQuery])

  // Button 2: Perform retrieval (search animation and render documents)
  const handleRetrieve = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const functions = databaseFunctionsRef.current
      if (!functions) {
        resolve()
        return
      }

      // Reset isDone if it was previously set (check ref for synchronous access)
      if (isDoneRef.current) {
        setIsDone(false)
        isDoneRef.current = false
      }

      // Clear any existing timeouts
      timeoutRefsRef.current.forEach(timeout => clearTimeout(timeout))
      timeoutRefsRef.current = []

      // Force remount of documents by incrementing reset key
      setResetKey(prev => prev + 1)

      // Reset document visibility
      setSimpleVisible(false)
      setBulletsVisible(false)
      setChartVisible(false)
      setTableVisible(false)
      setInternalHighlightDocuments(false)
      setSimpleHighlightLines([])
      setBulletsHighlightLines([])
      setChartHighlightLines([])
      setTableHighlightLines([])

      // Start search animation and render all documents in the DOM (hidden)
      // Documents appear sequentially from left to right
      functions.search()
      
      // Documents appear from left to right in order
      // Space them out evenly over the total time window
      const documents = [
        { setter: setSimpleVisible, name: 'simple' },
        { setter: setBulletsVisible, name: 'bullets' },
        { setter: setChartVisible, name: 'chart' },
        { setter: setTableVisible, name: 'table' },
      ]

      // Calculate delays: first document at reset delay, last at total time window, evenly spaced
      const resetDelay = RETRIEVED_SEARCH_TIMINGS.DOCUMENT_RESET_DELAY_MS
      const totalTimeWindow = RETRIEVED_SEARCH_TIMINGS.DOCUMENT_TOTAL_TIME_WINDOW_MS
      const delayBetweenDocuments = totalTimeWindow / (documents.length - 1)

      documents.forEach((doc, index) => {
        const delay = resetDelay + (index * delayBetweenDocuments)
        const timeout = setTimeout(() => {
          doc.setter(true)
        }, delay)
        timeoutRefsRef.current.push(timeout)
      })

      // Resolve after search animation completes
      const maxDelay = RETRIEVED_SEARCH_TIMINGS.DOCUMENT_SEARCH_COMPLETION_MS
      const resolveTimeout = setTimeout(() => {
        // Force all documents visible as backup
        setSimpleVisible(true)
        setBulletsVisible(true)
        setChartVisible(true)
        setTableVisible(true)
        setIsDone(true)
        isDoneRef.current = true
        resolve()
      }, maxDelay)
      timeoutRefsRef.current.push(resolveTimeout)
    })
  }, [])

  // Button 3: Highlight documents
  const handleHighlight = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const functions = databaseFunctionsRef.current
      if (!functions) {
        resolve()
        return
      }

      setInternalHighlightDocuments(true)
      
      // Set highlight lines for each document
      setSimpleHighlightLines([...RAG_HIGHLIGHT_TIMINGS.DOCUMENT_HIGHLIGHT_LINES.SIMPLE])
      setBulletsHighlightLines([...RAG_HIGHLIGHT_TIMINGS.DOCUMENT_HIGHLIGHT_LINES.BULLETS])
      setChartHighlightLines([...RAG_HIGHLIGHT_TIMINGS.DOCUMENT_HIGHLIGHT_LINES.CHART])
      setTableHighlightLines([...RAG_HIGHLIGHT_TIMINGS.DOCUMENT_HIGHLIGHT_LINES.TABLE])
      
      // Only highlight database if highlightDatabase prop is true
      if (highlightDatabase) {
        functions.highlightEnterprise()
        functions.highlightPricing()
        functions.highlightSMB()
      }
      
      // Wait for highlight animation to complete (includes buffer for CSS animation)
      const highlightAnimationDuration = RAG_HIGHLIGHT_TIMINGS.HIGHLIGHT_ANIMATION_DURATION_MS
      const timeout = setTimeout(() => {
        resolve()
      }, highlightAnimationDuration)
      timeoutRefsRef.current.push(timeout)
    })
  }, [highlightDatabase])

  const handleReset = useCallback(() => {
    // Clear any pending timeouts
    timeoutRefsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutRefsRef.current = []

    const functions = databaseFunctionsRef.current
    if (functions) {
      functions.reset()
    }
    // Force remount of documents by incrementing reset key
    setResetKey(prev => prev + 1)
    setSimpleVisible(false)
    setBulletsVisible(false)
    setChartVisible(false)
    setTableVisible(false)
    setInternalHighlightDocuments(false)
    setSimpleHighlightLines([])
    setBulletsHighlightLines([])
    setChartHighlightLines([])
    setTableHighlightLines([])
    setIsDone(false)
    isDoneRef.current = false
  }, [])

  // Function to set query text
  const handleSetQuery = useCallback((text: string) => {
    setCurrentQuery(text)
  }, [])

  // Expose functions to parent component
  useEffect(() => {
    if (onFunctionsReady) {
      onFunctionsReady({
        addTextAndRemoveHighlight: handleAddTextAndRemoveHighlight,
        search: handleRetrieve,
        highlight: handleHighlight,
        reset: handleReset,
        setQuery: handleSetQuery,
      })
    }
  }, [onFunctionsReady, handleAddTextAndRemoveHighlight, handleRetrieve, handleHighlight, handleReset, handleSetQuery])

  // Update action buttons when state changes
  useEffect(() => {
    if (onActionButtonsRef.current) {
      const buttons = (
        <div className="flex flex-row gap-2 flex-wrap justify-center">
          <Button onClick={() => handleAddTextAndRemoveHighlight()} size="sm">
            Add Text & Remove Highlight
          </Button>
          <Button onClick={() => handleRetrieve()} size="sm">
            Retrieve
          </Button>
          <Button onClick={() => handleHighlight()} size="sm">
            Highlight
          </Button>
          <Button onClick={handleReset} size="sm" variant="outline">
            Reset
          </Button>
        </div>
      )
      onActionButtonsRef.current(buttons)
    }
  }, [handleAddTextAndRemoveHighlight, handleRetrieve, handleHighlight, handleReset])
  
  return (
    
    <div className="flex flex-col items-center gap-[var(--padding)]" style={{ width: width, opacity: isActive ? 1 : "var(--inactive)" }}>

    <DatabaseSearchCard 
      darkMode={darkMode} 
      filled={filled} 
      onFunctionsReady={handleFunctionsReady}
      message={currentQuery}
    />
    
      <div 
        ref={containerRef}
        className="flex flex-row items-start justify-center flex-wrap relative"
      >
          <div
            key={`simple-${resetKey}`}
            ref={firstDocumentRef}
            className="relative"
            style={{ 
              opacity: simpleVisible ? 1 : 0,
              transform: simpleVisible ? 'translateY(0)' : 'translateY(-40px)',
              transition: `opacity ${RETRIEVED_SEARCH_TIMINGS.DOCUMENT_TRANSITION_MS}ms ease-out, transform ${RETRIEVED_SEARCH_TIMINGS.DOCUMENT_TRANSITION_MS}ms ease-out`,
              zIndex: 1
            }}
          >
            <DocumentVariants 
              title="simple" 
              variant="simple" 
              externalHighlight={internalHighlightDocuments || highlightDocuments}
              highlightLines={simpleHighlightLines}
            />
          </div>
          <div
            key={`bullets-${resetKey}`}
            className="relative"
            style={{ 
              opacity: bulletsVisible ? 1 : 0,
              transform: bulletsVisible ? 'translateY(0)' : 'translateY(-40px)',
              transition: `opacity ${RETRIEVED_SEARCH_TIMINGS.DOCUMENT_TRANSITION_MS}ms ease-out, transform ${RETRIEVED_SEARCH_TIMINGS.DOCUMENT_TRANSITION_MS}ms ease-out`,
              marginLeft: `${calculatedMargin}px`,
              zIndex: 2
            }}
          >
            <DocumentVariants 
              title="bullets" 
              variant="bullets" 
              externalHighlight={internalHighlightDocuments || highlightDocuments}
              highlightLines={bulletsHighlightLines}
            />
          </div>
          <div
            key={`chart-${resetKey}`}
            className="relative"
            style={{ 
              opacity: chartVisible ? 1 : 0,
              transform: chartVisible ? 'translateY(0)' : 'translateY(-40px)',
              transition: `opacity ${RETRIEVED_SEARCH_TIMINGS.DOCUMENT_TRANSITION_MS}ms ease-out, transform ${RETRIEVED_SEARCH_TIMINGS.DOCUMENT_TRANSITION_MS}ms ease-out`,
              marginLeft: `${calculatedMargin}px`,
              zIndex: 3
            }}
          >
            <DocumentVariants 
              title="chart" 
              variant="chart" 
              externalHighlight={internalHighlightDocuments || highlightDocuments}
              highlightLines={chartHighlightLines}
            />
          </div>
          <div
            key={`table-${resetKey}`}
            className="relative"
            style={{ 
              opacity: tableVisible ? 1 : 0,
              transform: tableVisible ? 'translateY(0)' : 'translateY(-40px)',
              transition: `opacity ${RETRIEVED_SEARCH_TIMINGS.DOCUMENT_TRANSITION_MS}ms ease-out, transform ${RETRIEVED_SEARCH_TIMINGS.DOCUMENT_TRANSITION_MS}ms ease-out`,
              marginLeft: `${calculatedMargin}px`,
              zIndex: 4
            }}
          >
            <DocumentVariants 
              title="table" 
              variant="table" 
              externalHighlight={internalHighlightDocuments || highlightDocuments}
              highlightLines={tableHighlightLines}
            />
          </div>
    </div>
    </div>
  )
}

