"use client"

import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { DocumentVariants } from "@/components/graphics/elements/document-variants"
import { RETRIEVED_SEARCH_TIMINGS, RAG_HIGHLIGHT_TIMINGS } from "../helpers/animation-timings"
import "../helpers/globals.css"
import { DatabaseSearchCard } from "@/components/graphics/elements/database-search-card"

const DEFAULT_QUERY = "What was our enterprise pricing before we pivoted to SMB?"

type DatabaseFunctions = {
  addText: (text?: string) => void;
  removeHighlight: () => void;
  search: () => void; // Backward compatibility
  quickSearch: () => void;
  slowSearch: () => void;
  highlightEnterprise: () => void;
  highlightPricing: () => void;
  highlightSMB: () => void;
  reset: () => void;
}

export type DocumentItem = {
  id: string;
  title?: string;
  variant: string;
  highlightLines?: number[];
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
  showFinal,
  onToggleFinal,
  documents = [
    { id: "simple", title: "simple", variant: "simple", highlightLines: [...RAG_HIGHLIGHT_TIMINGS.DOCUMENT_HIGHLIGHT_LINES.SIMPLE] },
    { id: "bullets", title: "bullets", variant: "bullets", highlightLines: [...RAG_HIGHLIGHT_TIMINGS.DOCUMENT_HIGHLIGHT_LINES.BULLETS] },
    { id: "chart", title: "chart", variant: "chart", highlightLines: [...RAG_HIGHLIGHT_TIMINGS.DOCUMENT_HIGHLIGHT_LINES.CHART] },
    { id: "table", title: "table", variant: "table", highlightLines: [...RAG_HIGHLIGHT_TIMINGS.DOCUMENT_HIGHLIGHT_LINES.TABLE] },
  ],
}: { 
  filled?: boolean;
  darkMode?: boolean; 
  onActionButtons?: (buttons: React.ReactNode) => void;
  highlightDocuments?: boolean;
  onFunctionsReady?: (functions: {
    addTextAndRemoveHighlight: (text?: string) => Promise<void>;
    quickSearch: () => Promise<void>;
    slowSearchAndHighlight: () => Promise<void>;
    reset: () => void;
    setQuery: (text: string) => void;
  }) => void;
  width?: string;
  highlightDatabase?: boolean;
  query?: string;
  isActive?: boolean;
  showFinal?: boolean;
  onToggleFinal?: () => void;
  documents?: DocumentItem[];
}) {
  const [documentVisibility, setDocumentVisibility] = useState<Record<string, boolean>>({})
  const [internalHighlightDocuments, setInternalHighlightDocuments] = useState(false)
  const [documentHighlightLines, setDocumentHighlightLines] = useState<Record<string, number[]>>({})
  const [resetKey, setResetKey] = useState(0)
  const isDoneRef = useRef(false)
  const databaseFunctionsRef = useRef<DatabaseFunctions | null>(null)
  const onActionButtonsRef = useRef(onActionButtons)
  const timeoutRefsRef = useRef<NodeJS.Timeout[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const firstDocumentRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [calculatedMargins, setCalculatedMargins] = useState<Record<number, number>>({})
  const [calculatedRowOverlap, setCalculatedRowOverlap] = useState<number>(0)
  const [currentQuery, setCurrentQuery] = useState<string>(query || "")
  const currentQueryRef = useRef<string>(query || "")
  const [internalShowFinal, setInternalShowFinal] = useState(false)
  const [finalStateType, setFinalStateType] = useState<"highlighted" | "unhighlighted" | null>(null)
  const finalStateProcessedRef = useRef(false)
  const isCalculatingMarginsRef = useRef(false)
  const lastCalculatedMarginsRef = useRef<Record<number, number>>({})
  const lastCalculatedRowOverlapRef = useRef<number>(0)
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Keep ref in sync with state
  useEffect(() => {
    currentQueryRef.current = currentQuery
  }, [currentQuery])
  
  // Use prop if provided, otherwise use internal state
  const effectiveShowFinal = showFinal !== undefined ? showFinal : internalShowFinal
  // Determine if we're in final state and which type
  const isInFinalState = effectiveShowFinal || finalStateType !== null
  const isFinalHighlighted = effectiveShowFinal || finalStateType === "highlighted"
  const isFinalUnhighlighted = finalStateType === "unhighlighted"
  
  const MAX_DOCUMENTS_PER_ROW = 5

  // Group documents into rows (max 5 per row) - memoized to prevent infinite loops
  const documentRows = useMemo(() => {
    const rows: DocumentItem[][] = []
    for (let i = 0; i < documents.length; i += MAX_DOCUMENTS_PER_ROW) {
      rows.push(documents.slice(i, i + MAX_DOCUMENTS_PER_ROW))
    }
    return rows
  }, [documents])

  // Helper function to reset to initial state
  const resetToInitial = useCallback(() => {
    // Clear any pending timeouts
    timeoutRefsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutRefsRef.current = []
    
    // Reset document visibility using hook
    resetDocumentAnimation()
    setInternalHighlightDocuments(false)
    setDocumentHighlightLines({})
    
    // Reset database
    const functions = databaseFunctionsRef.current
    if (functions) {
      functions.reset()
    }
    
    // Reset processed ref
    finalStateProcessedRef.current = false
    setFinalStateType(null)
  }, [resetDocumentAnimation])

  // Set final state - consolidated logic for both highlighted and unhighlighted
  useLayoutEffect(() => {
    const shouldShowHighlighted = isFinalHighlighted && !finalStateProcessedRef.current
    const shouldShowUnhighlighted = isFinalUnhighlighted && !finalStateProcessedRef.current
    const shouldReset = !isInFinalState && finalStateProcessedRef.current

    if (shouldShowHighlighted || shouldShowUnhighlighted) {
      // Show all documents immediately
      const highlightLines: Record<string, number[]> = {}
      
      documents.forEach(doc => {
        if (shouldShowHighlighted && doc.highlightLines) {
          highlightLines[doc.id] = [...doc.highlightLines]
        }
      })
      
      setAllDocumentsVisible()
      setDocumentHighlightLines(shouldShowHighlighted ? highlightLines : {})
      setInternalHighlightDocuments(shouldShowHighlighted)
      
      // Add text to database
      const functions = databaseFunctionsRef.current
      if (functions) {
        functions.addText(currentQuery)
        functions.removeHighlight()
        // Highlight database only if highlighted final and enabled
        if (shouldShowHighlighted && highlightDatabase) {
          functions.highlightEnterprise()
          functions.highlightPricing()
          functions.highlightSMB()
        }
      }
      
      finalStateProcessedRef.current = true
    } else if (shouldReset) {
      // Reset to initial state
      finalStateProcessedRef.current = false
      resetToInitial()
    }
  }, [isFinalHighlighted, isFinalUnhighlighted, isInFinalState, currentQuery, highlightDatabase, documents, resetToInitial, setAllDocumentsVisible])

  // Keep ref in sync with prop
  useEffect(() => {
    onActionButtonsRef.current = onActionButtons
  }, [onActionButtons])

  // Update currentQuery when query prop changes
  useEffect(() => {
    if (query !== undefined) {
      setCurrentQuery(query)
      currentQueryRef.current = query
    }
  }, [query])

  // Calculate margin to fit documents within parent width for each row, and vertical overlap between rows
  useEffect(() => {
    const calculateMargins = () => {
      // Prevent infinite loops by checking if calculation is already in progress
      if (isCalculatingMarginsRef.current) return
      
      // Early return if container isn't ready
      if (!containerRef.current) {
        return
      }
      
      isCalculatingMarginsRef.current = true

      const margins: Record<number, number> = {}
      let rowOverlap = 0

      documentRows.forEach((row, rowIndex) => {
        const rowContainer = rowRefs.current[rowIndex]
        const firstDocId = row[0]?.id
        if (!rowContainer || !firstDocId || !firstDocumentRefs.current[firstDocId]) return

        // Use container width as parent width (not row width, since rows should fit container)
        const parentWidth = containerRef.current?.offsetWidth || rowContainer.offsetWidth
        const firstDocElement = firstDocumentRefs.current[firstDocId]!
        
        // Get the actual rendered width accounting for scale(0.8) transform
        // Documents are scaled to 0.8, so actual rendered size is 80% of offsetWidth
        // Documents are typically 80px wide, scaled to 64px (80 * 0.8 = 64)
        const documentRect = firstDocElement.getBoundingClientRect()
        // getBoundingClientRect should account for transforms, but use it with fallback
        // If getBoundingClientRect returns 0 or invalid, calculate from offsetWidth * scale
        const SCALE_FACTOR = 0.8
        const documentWidth = documentRect.width > 10 
          ? documentRect.width 
          : (firstDocElement.offsetWidth * SCALE_FACTOR)
        const numberOfDocuments = row.length
        
        // Ensure we have valid measurements
        if (documentWidth <= 0 || parentWidth <= 0) {
          isCalculatingMarginsRef.current = false
          return
        }

        // Calculate overlap needed to ensure documents fit within parent width
        // With overlaps, the total width used is: documentWidth + (numberOfDocuments - 1) * (documentWidth - overlap)
        // We want this to be <= parentWidth
        // Solving: documentWidth + (n-1) * (documentWidth - overlap) <= parentWidth
        // documentWidth + (n-1) * documentWidth - (n-1) * overlap <= parentWidth
        // n * documentWidth - (n-1) * overlap <= parentWidth
        // (n-1) * overlap >= n * documentWidth - parentWidth
        // overlap >= (n * documentWidth - parentWidth) / (n-1)
        const totalWidthWithoutOverlap = documentWidth * numberOfDocuments
        
        // Calculate minimum overlap needed to fit within parent width
        // Add a buffer to ensure no overflow (more aggressive overlap)
        // The buffer accounts for rounding errors and ensures documents stay well within bounds
        const buffer = Math.max(4, documentWidth * 0.05) // At least 4px or 5% of document width
        const overlap = totalWidthWithoutOverlap > parentWidth && numberOfDocuments > 1
          ? (totalWidthWithoutOverlap - parentWidth + buffer) / (numberOfDocuments - 1)
          : 0

        margins[rowIndex] = -overlap

        // Calculate vertical overlap between rows (use first row's document height as reference)
        if (rowIndex === 0) {
          const documentHeight = documentRect.height
          // Overlap rows by about 60% of document height to create a stacked effect
          rowOverlap = documentHeight * 0.6
        }
      })

      // Compare with last calculated values using refs to prevent unnecessary state updates
      // Use a more robust comparison that handles edge cases
      const marginsKeys = Object.keys(margins).map(Number).sort()
      const lastKeys = Object.keys(lastCalculatedMarginsRef.current).map(Number).sort()
      
      const marginsChanged = marginsKeys.length !== lastKeys.length ||
        marginsKeys.some(key => {
          const current = margins[key]
          const last = lastCalculatedMarginsRef.current[key]
          // Use a small epsilon for floating point comparison
          return Math.abs((current || 0) - (last || 0)) > 0.01
        })
      
      const rowOverlapChanged = Math.abs(lastCalculatedRowOverlapRef.current - rowOverlap) > 0.01
      
      // Only update state if values actually changed to prevent infinite loops
      if (marginsChanged) {
        lastCalculatedMarginsRef.current = { ...margins }
        setCalculatedMargins(margins)
      }
      
      if (rowOverlapChanged) {
        lastCalculatedRowOverlapRef.current = rowOverlap
        setCalculatedRowOverlap(rowOverlap)
      }
      
      isCalculatingMarginsRef.current = false
    }

    // Small delay to ensure DOM is rendered
    const timeout = setTimeout(() => {
      calculateMargins()
    }, 0)

    // Recalculate on window resize with debouncing
    // Only observe the container, not rows/documents that change when margins are applied
    const resizeObserver = new ResizeObserver(() => {
      // Clear any pending resize timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
      // Debounce resize events to prevent infinite loops
      resizeTimeoutRef.current = setTimeout(() => {
        requestAnimationFrame(() => {
          calculateMargins()
        })
      }, 100) // Increased debounce to prevent rapid-fire updates
    })

    // Only observe the container, not rows/documents that will change when margins are applied
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      clearTimeout(timeout)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
        resizeTimeoutRef.current = null
      }
      resizeObserver.disconnect()
      isCalculatingMarginsRef.current = false
    }
  }, [width, documentRows])

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
        console.warn("Database functions not ready yet")
        resolve()
        return
      }

      // Determine the text to use - use ref to get current value without dependency
      // If no text provided and currentQuery is empty, use default query
      let textToUse = text !== undefined ? text : (currentQueryRef.current || DEFAULT_QUERY)
      
      // Ensure we always have a non-empty string
      if (!textToUse || textToUse.trim() === "") {
        textToUse = DEFAULT_QUERY
      }
      
      // Update query if text is provided
      if (text !== undefined) {
        setCurrentQuery(text)
        currentQueryRef.current = text
      } else if (!currentQueryRef.current) {
        // If no text provided and currentQuery is empty, set it to default
        setCurrentQuery(DEFAULT_QUERY)
        currentQueryRef.current = DEFAULT_QUERY
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
  }, [])

  // Shared search function that can be fast or slow
  const performSearch = useCallback((isQuick: boolean = false): Promise<void> => {
    return new Promise((resolve) => {
      const functions = databaseFunctionsRef.current
      if (!functions) {
        resolve()
        return
      }

      // Clear any existing timeouts (for non-document timeouts)
      timeoutRefsRef.current.forEach(timeout => clearTimeout(timeout))
      timeoutRefsRef.current = []

      // Force remount of documents by incrementing reset key
      setResetKey(prev => prev + 1)

      // Reset highlight states
      setInternalHighlightDocuments(false)
      setDocumentHighlightLines({})

      // Start search animation and render all documents in the DOM (hidden)
      // Documents appear sequentially from left to right
      // Use slowSearch for slow mode (two pulses), quickSearch for quick mode (one pulse)
      if (isQuick) {
        functions.quickSearch()
      } else {
        functions.slowSearch()
      }
      
      // Trigger document appear animation using the hook
      triggerDocumentAnimation(isQuick).then(() => {
        resolve()
      })
    })
  }, [documents, triggerDocumentAnimation])

  // Button 2: Quick search (faster search animation, no highlights)
  const handleQuickSearch = useCallback((): Promise<void> => {
    return performSearch(true)
  }, [performSearch])

  // Button 3: Slow search + highlight (slow search, short break, then highlights)
  const handleSlowSearchAndHighlight = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      // First, do slow search
      performSearch(false).then(() => {
        // Short break after search completes
        const breakTimeout = setTimeout(() => {
          // Then trigger highlights for both database and documents
          const functions = databaseFunctionsRef.current
          if (!functions) {
            resolve()
            return
          }

          setInternalHighlightDocuments(true)
          
          // Set highlight lines for each document
          const highlightLines: Record<string, number[]> = {}
          documents.forEach(doc => {
            if (doc.highlightLines) {
              highlightLines[doc.id] = [...doc.highlightLines]
            }
          })
          setDocumentHighlightLines(highlightLines)
          
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
        }, 300) // Short break: 300ms
        timeoutRefsRef.current.push(breakTimeout)
      })
    })
  }, [performSearch, highlightDatabase, documents])


  const handleReset = useCallback(() => {
    // Clear any pending timeouts
    timeoutRefsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutRefsRef.current = []

    const functions = databaseFunctionsRef.current
    if (functions) {
      functions.reset()
    }
    
    // Reset query to initial value or empty
    const initialQuery = query || ""
    setCurrentQuery(initialQuery)
    currentQueryRef.current = initialQuery
    
    // Force remount of documents by incrementing reset key
    setResetKey(prev => prev + 1)
    
    // Reset document visibility using hook
    resetDocumentAnimation()
    setInternalHighlightDocuments(false)
    setDocumentHighlightLines({})
    finalStateProcessedRef.current = false
    setFinalStateType(null)
    
    // Reset final state - always reset it when resetting
    if (onToggleFinal && effectiveShowFinal) {
      // If parent controls it and final is currently true, toggle it to reset
      onToggleFinal()
    } else if (!onToggleFinal && internalShowFinal) {
      // If we control it internally and it's true, reset it
      setInternalShowFinal(false)
    }
  }, [documents, onToggleFinal, effectiveShowFinal, query, internalShowFinal, resetDocumentAnimation])
  
  // Toggle final state with highlights
  const handleToggleFinal = useCallback(() => {
    // Turn off unhighlighted final if active
    if (isFinalUnhighlighted) {
      setFinalStateType(null)
    }
    
    if (onToggleFinal) {
      onToggleFinal()
    } else {
      setInternalShowFinal(prev => {
        if (prev) {
          setFinalStateType(null)
          return false
        } else {
          setFinalStateType("highlighted")
          return true
        }
      })
    }
  }, [onToggleFinal, isFinalUnhighlighted])

  // Toggle final state without highlights
  const handleToggleFinalUnhighlighted = useCallback(() => {
    // Turn off highlighted final if active
    if (isFinalHighlighted) {
      if (onToggleFinal) {
        onToggleFinal()
      } else {
        setInternalShowFinal(false)
      }
    }
    
    setFinalStateType(prev => prev === "unhighlighted" ? null : "unhighlighted")
  }, [isFinalHighlighted, onToggleFinal])

  // Function to set query text
  const handleSetQuery = useCallback((text: string) => {
    setCurrentQuery(text)
  }, [])

  // Expose functions to parent component
  useEffect(() => {
    if (onFunctionsReady) {
      onFunctionsReady({
        addTextAndRemoveHighlight: handleAddTextAndRemoveHighlight,
        quickSearch: handleQuickSearch,
        slowSearchAndHighlight: handleSlowSearchAndHighlight,
        reset: handleReset,
        setQuery: handleSetQuery,
      })
    }
  }, [onFunctionsReady, handleAddTextAndRemoveHighlight, handleQuickSearch, handleSlowSearchAndHighlight, handleReset, handleSetQuery])

  // Memoize buttons to prevent unnecessary re-renders
  const actionButtons = useMemo(() => {
    return (
      <div className="flex flex-row gap-2 flex-wrap justify-center">
        <Button onClick={() => handleAddTextAndRemoveHighlight()} size="sm">
          Add Text & Remove Highlight
        </Button>
        <Button onClick={() => handleQuickSearch()} size="sm">
          Quick Search
        </Button>
        <Button onClick={() => handleSlowSearchAndHighlight()} size="sm">
          Slow Search + Highlight
        </Button>
        <Button onClick={handleToggleFinal} size="sm" variant={isFinalHighlighted ? "default" : "outline"}>
          {isFinalHighlighted ? "Initial" : "Final (Highlighted)"}
        </Button>
        <Button onClick={handleToggleFinalUnhighlighted} size="sm" variant={isFinalUnhighlighted ? "default" : "outline"}>
          {isFinalUnhighlighted ? "Initial" : "Final (Unhighlighted)"}
        </Button>
      </div>
    )
  }, [handleAddTextAndRemoveHighlight, handleQuickSearch, handleSlowSearchAndHighlight, handleToggleFinal, handleToggleFinalUnhighlighted, isFinalHighlighted, isFinalUnhighlighted])

  // Update action buttons when effectiveShowFinal changes or when callback becomes available
  // Use refs to prevent infinite loops by tracking what we've already notified
  const lastEffectiveShowFinalRef = useRef<boolean | undefined>(effectiveShowFinal)
  const callbackNotifiedRef = useRef(false)
  
  useEffect(() => {
    if (onActionButtonsRef.current) {
      const showFinalChanged = lastEffectiveShowFinalRef.current !== effectiveShowFinal
      
      // Only call the callback if effectiveShowFinal changed or we haven't notified the callback yet
      if (showFinalChanged || !callbackNotifiedRef.current) {
        lastEffectiveShowFinalRef.current = effectiveShowFinal
        callbackNotifiedRef.current = true
        onActionButtonsRef.current(actionButtons)
      }
    } else {
      // Reset notification flag if callback is not available
      callbackNotifiedRef.current = false
    }
  }, [actionButtons, effectiveShowFinal])
  
  return (
    
    <div className="flex flex-col items-center gap-[var(--padding)]" style={{ width: width, opacity: isActive ? 1 : "var(--inactive)" }}>

    <DatabaseSearchCard 
      darkMode={darkMode} 
      filled={filled} 
      onFunctionsReady={handleFunctionsReady}
      message={currentQuery}
      showFinal={effectiveShowFinal}
    />
    
      <div 
        ref={containerRef}
        className="flex flex-col items-center justify-center relative"
        style={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}
      >
        {documentRows.map((row, rowIndex) => (
          <div
            key={`row-${rowIndex}-${resetKey}`}
            ref={(el) => {
              rowRefs.current[rowIndex] = el
            }}
            className="flex flex-row items-start justify-center relative"
            style={{ 
              width: "100%",
              maxWidth: "100%",
              marginTop: rowIndex === 0 ? 0 : `-${calculatedRowOverlap}px`,
              zIndex: rowIndex + 1, // Later rows have higher z-index (second row in front of first)
              overflow: "hidden" // Prevent any overflow within the row
            }}
          >
            {row.map((doc, docIndex) => {
              const isVisible = isInFinalState || documentVisibility[doc.id] || false
              const isFirstInRow = docIndex === 0
              const margin = isFirstInRow ? 0 : (calculatedMargins[rowIndex] || 0)
              
              return (
                <div
                  key={`${doc.id}-${resetKey}`}
                  ref={(el) => {
                    if (isFirstInRow) {
                      firstDocumentRefs.current[doc.id] = el
                    }
                  }}
                  className="relative"
                  style={{ 
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'scale(0.8) translateY(0)' : 'scale(0.8) translateY(-40px)',
                    transition: isInFinalState ? 'none' : `opacity ${RETRIEVED_SEARCH_TIMINGS.DOCUMENT_TRANSITION_MS}ms ease-out, transform ${RETRIEVED_SEARCH_TIMINGS.DOCUMENT_TRANSITION_MS}ms ease-out`,
                    marginLeft: `${margin}px`,
                    zIndex: (rowIndex * MAX_DOCUMENTS_PER_ROW) + docIndex + 1
                  }}
                >
                  <DocumentVariants 
                    variant={doc.variant} 
                    externalHighlight={isFinalUnhighlighted ? false : (internalHighlightDocuments || highlightDocuments)}
                    highlightLines={documentHighlightLines[doc.id]}
                    showFinal={isFinalHighlighted}
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

