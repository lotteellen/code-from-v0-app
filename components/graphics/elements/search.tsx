"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { DocumentVariants, type DocumentItem } from "@/components/graphics/elements/document-variants"
import { RETRIEVED_SEARCH_TIMINGS, DATABASE_SEARCH_TIMINGS, DOCUMENT_VARIANTS_TIMINGS } from "../helpers/animation-timings"
import "../helpers/globals.css"
import { Database, type DatabaseFunctions } from "@/components/graphics/elements/database"
import { STACK_POSITIONS } from "@/components/graphics/helpers/document-stack"

type DocumentRows = Array<Array<{ id: string }>>

function useDocumentMargins(
  containerRef: React.RefObject<HTMLDivElement | null>,
  documentRows: DocumentRows,
  calculateDocumentArrangement: () => { margins: Record<number, number>; rowOverlap: number }
) {
  const [calculatedMargins, setCalculatedMargins] = useState<Record<number, number>>({})
  const [calculatedRowOverlap, setCalculatedRowOverlap] = useState<number>(0)
  const isCalculatingMarginsRef = useRef(false)
  const lastCalculatedMarginsRef = useRef<Record<number, number>>({})
  const lastCalculatedRowOverlapRef = useRef<number>(0)
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const calculateMargins = () => {
      if (isCalculatingMarginsRef.current) {
        return
      }
      isCalculatingMarginsRef.current = true
      
      const { margins, rowOverlap } = calculateDocumentArrangement()
      
      isCalculatingMarginsRef.current = false

      const marginsKeys = Object.keys(margins).map(Number).sort()
      const lastKeys = Object.keys(lastCalculatedMarginsRef.current).map(Number).sort()

      const marginsChanged =
        marginsKeys.length !== lastKeys.length ||
        marginsKeys.some((key) => {
          const current = margins[key]
          const last = lastCalculatedMarginsRef.current[key]
          return Math.abs((current || 0) - (last || 0)) > 0.01
        })

      const rowOverlapChanged = Math.abs(lastCalculatedRowOverlapRef.current - rowOverlap) > 0.01

      if (marginsChanged) {
        lastCalculatedMarginsRef.current = { ...margins }
        setCalculatedMargins(margins)
      }

      if (rowOverlapChanged) {
        lastCalculatedRowOverlapRef.current = rowOverlap
        setCalculatedRowOverlap(rowOverlap)
      }
    }

    const timeout = setTimeout(() => {
      calculateMargins()
    }, 0)

    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
      resizeTimeoutRef.current = setTimeout(() => {
        requestAnimationFrame(() => {
          calculateMargins()
        })
      }, 100)
    })

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
  }, [containerRef, documentRows, calculateDocumentArrangement])

  return { calculatedMargins, calculatedRowOverlap }
}

export type SearchFunctions = {
  addText: (text: string) => Promise<void>
  search: (text: string, isQuick?: boolean, skipAddText?: boolean) => Promise<void>
  setFinal: (highlighted: boolean) => void
  reset: () => void
  shuffle: () => void
  unshuffle: () => void
}

export function Search({
  onFunctionsReady,
  query,
  isActive = true,
  documents,
}: {
  onFunctionsReady?: (functions: SearchFunctions) => void
  query: string
  isActive?: boolean
  documents: DocumentItem[]
}) {
  const [hasText, setHasText] = useState(false)
  const [documentVisibility, setDocumentVisibility] = useState<Record<string, boolean>>({})
  const [documentHighlightLines, setDocumentHighlightLines] = useState<Record<string, number[]>>({})
  const [resetKey, setResetKey] = useState(0)
  const [currentQuery, setCurrentQuery] = useState<string>(query)
  const [finalState, setFinalState] = useState<'none' | 'highlighted' | 'unhighlighted'>('none')
  const [isResetting, setIsResetting] = useState(false)
  const [isQuickSearch, setIsQuickSearch] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [shuffledPositions, setShuffledPositions] = useState<Record<string, { bottom: number; left: number; rotate: string }>>({})

  const onFunctionsReadyRef = useRef(onFunctionsReady)

  const databaseFunctionsRef = useRef<DatabaseFunctions | null>(null)
  const timeoutRefsRef = useRef<NodeJS.Timeout[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const firstDocumentRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const documentElementRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const documentVariantRefs = useRef<Map<string, {
    animateHighlight: (lineIndex: number | number[]) => void
    setFinal: (highlighted: boolean) => void
    reset: () => void
  }>>(new Map())

  useEffect(() => {
    onFunctionsReadyRef.current = onFunctionsReady
  }, [onFunctionsReady])

  const isInFinalState = finalState !== 'none'

  const MAX_DOCUMENTS_PER_ROW = 5
  
  const CONTAINER_WIDTH = 250
  const CONTAINER_HEIGHT = 108
  
  const DOCUMENT_WIDTH = 64
  const DOCUMENT_HEIGHT = 83

  const documentRows = useMemo(() => {
    const rows: DocumentItem[][] = []
    for (let i = 0; i < documents.length; i += MAX_DOCUMENTS_PER_ROW) {
      rows.push(documents.slice(i, i + MAX_DOCUMENTS_PER_ROW))
    }
    return rows
  }, [documents])

  const calculateHorizontalOverlap = useCallback((
    documentWidth: number,
    numberOfDocuments: number,
    parentWidth: number
  ): number => {
    if (documentWidth <= 0 || parentWidth <= 0 || numberOfDocuments <= 0) {
      return 0
    }

    const totalWidthWithoutOverlap = documentWidth * numberOfDocuments

    const baseBuffer = Math.max(50, documentWidth * 0.5)
    const buffer = baseBuffer * (1 + (numberOfDocuments - 1) * 0.5)

    const targetMaxWidth = parentWidth - buffer

    let overlap =
      totalWidthWithoutOverlap > targetMaxWidth && numberOfDocuments > 1
        ? (totalWidthWithoutOverlap - targetMaxWidth) / (numberOfDocuments - 1)
        : 0

    const calculatedTotalWidth =
      documentWidth + (numberOfDocuments - 1) * (documentWidth - overlap)
    if (calculatedTotalWidth > parentWidth - 5) {
      overlap =
        (totalWidthWithoutOverlap - (parentWidth - buffer)) /
        (numberOfDocuments - 1)
    }

    return overlap
  }, [])

  const calculateDocumentArrangement = useCallback(() => {
    if (!containerRef.current) {
      return {
        margins: {},
        rowOverlap: 0,
      }
    }

    const margins: Record<number, number> = {}
    let firstRowOverlap: number | null = null

    documentRows.forEach((row, rowIndex) => {
      const numberOfDocuments = row.length

      let overlap = calculateHorizontalOverlap(DOCUMENT_WIDTH, numberOfDocuments, CONTAINER_WIDTH)

      if (rowIndex === 0) {
        firstRowOverlap = overlap
      } else if (firstRowOverlap !== null) {
        overlap = firstRowOverlap
      }

      margins[rowIndex] = -overlap
    })

    const rowOverlap = DOCUMENT_HEIGHT

    return { margins, rowOverlap }
  }, [documentRows, calculateHorizontalOverlap])

  const { calculatedMargins, calculatedRowOverlap } = useDocumentMargins(
    containerRef,
    documentRows,
    calculateDocumentArrangement
  )


  useEffect(() => {
    setCurrentQuery(query)
  }, [query])

  useEffect(() => {
    return () => {
      timeoutRefsRef.current.forEach((timeout) => clearTimeout(timeout))
      timeoutRefsRef.current = []
    }
  }, [])

  const handleFunctionsReady = useCallback((functions: DatabaseFunctions) => {
    databaseFunctionsRef.current = functions
  }, [])

  const addText = useCallback(async (text: string): Promise<void> => {
    const functions = databaseFunctionsRef.current
    if (!functions) {
      return
    }
    await functions.addText(text)
    setHasText(true)
    setCurrentQuery(text)
  }, [])

  const search = useCallback(async (text: string, isQuick: boolean = true, skipAddText: boolean = false): Promise<void> => {
    if (finalState !== 'none') {
      setFinalState('none')
    }

    const functions = databaseFunctionsRef.current
    if (!functions) {
      return
    }

    timeoutRefsRef.current.forEach((timeout) => clearTimeout(timeout))
    timeoutRefsRef.current = []

    setResetKey((prev) => prev + 1)
    setIsQuickSearch(isQuick)

    const visibility: Record<string, boolean> = {}
    documents.forEach((doc) => {
      visibility[doc.id] = false
    })
    setDocumentVisibility(visibility)
    setDocumentHighlightLines({})

    setCurrentQuery(text)

    if (!skipAddText) {
      await functions.addText(text)
      setHasText(true)

      await new Promise((resolve) => setTimeout(resolve, DATABASE_SEARCH_TIMINGS.BREAK_BEFORE_SEARCH_ANIMATION_MS))
    }

    const searchPromise = functions.search(isQuick)
    
    const baseSearchDuration = DATABASE_SEARCH_TIMINGS.SEARCH_ANIMATION_DURATION_MS
    const searchDuration = isQuick 
      ? baseSearchDuration * 0.5
      : baseSearchDuration
    
    const documentTransitionDuration = isQuick
      ? RETRIEVED_SEARCH_TIMINGS.DOCUMENT_TRANSITION_MS * 0.5
      : RETRIEVED_SEARCH_TIMINGS.DOCUMENT_TRANSITION_MS
    
    const totalTimeWindow = searchDuration - documentTransitionDuration

    documents.forEach((doc, index) => {
      if (documents.length === 1) {
        const timeout = setTimeout(() => {
          setDocumentVisibility((prev) => ({ ...prev, [doc.id]: true }))
        }, 0)
        timeoutRefsRef.current.push(timeout)
      } else {
        const delay = (index / (documents.length - 1)) * totalTimeWindow
        const timeout = setTimeout(() => {
          setDocumentVisibility((prev) => ({ ...prev, [doc.id]: true }))
        }, delay)
        timeoutRefsRef.current.push(timeout)
      }
    })

    if (!isQuick) {
      await searchPromise
      
      await new Promise((resolve) => setTimeout(resolve, DOCUMENT_VARIANTS_TIMINGS.HIGHLIGHT_DELAY_MS))

      const highlightLines: Record<string, number[]> = {}
      documents.forEach((doc) => {
        if (doc.highlightLines) {
          highlightLines[doc.id] = [...doc.highlightLines]
        }
      })
      setDocumentHighlightLines(highlightLines)

      documents.forEach((doc) => {
        const docFuncs = documentVariantRefs.current.get(doc.id)
        if (docFuncs && doc.highlightLines) {
          doc.highlightLines.forEach((lineIndex) => {
            docFuncs.animateHighlight(lineIndex)
          })
        }
      })

      functions.highlightKeywords()
    } else {
      await searchPromise
      
      const allVisible: Record<string, boolean> = {}
      documents.forEach((doc) => {
        allVisible[doc.id] = true
      })
      setDocumentVisibility(allVisible)
    }
  }, [documents, finalState])

  const reset = useCallback(() => {
    timeoutRefsRef.current.forEach((timeout) => clearTimeout(timeout))
    timeoutRefsRef.current = []

    setFinalState('none')
    setHasText(false)
    setIsQuickSearch(false)
    setIsShuffled(false)
    setShuffledPositions({})

    const visibility: Record<string, boolean> = {}
    documents.forEach((doc) => {
      visibility[doc.id] = false
    })
    setDocumentVisibility(visibility)
    setDocumentHighlightLines({})

    documentVariantRefs.current.forEach((funcs) => {
      funcs.reset()
    })
    documentVariantRefs.current.clear()

    const functions = databaseFunctionsRef.current
    if (functions) {
      functions.reset()
    }

    setResetKey((prev) => prev + 1)
    setIsResetting(true)
    setTimeout(() => {
      setIsResetting(false)
    }, 0)
  }, [documents, finalState])

  const shuffle = useCallback((): void => {
    if (documents.length === 0) {
      return
    }

    setIsShuffled(true)
    
    // Set positions from STACK_POSITIONS sequentially
    const positions: Record<string, { bottom: number; left: number; rotate: string }> = {}
    documents.forEach((doc, index) => {
      const stackPos = STACK_POSITIONS[index]
      if (stackPos) {
        positions[doc.id] = {
          bottom: stackPos.bottom,
          left: stackPos.left,
          rotate: stackPos.rotate,
        }
      }
    })
    
    setShuffledPositions(positions)
    
    // Ensure all documents are visible
    const visibility: Record<string, boolean> = {}
    documents.forEach((doc) => {
      visibility[doc.id] = true
    })
    setDocumentVisibility(visibility)
  }, [documents])

  const unshuffle = useCallback((): void => {
    setIsShuffled(false)
    setShuffledPositions({})
  }, [])

  const setFinal = useCallback((highlighted: boolean) => {
    timeoutRefsRef.current.forEach((timeout) => clearTimeout(timeout))
    timeoutRefsRef.current = []

    if (highlighted) {
      setFinalState('highlighted')

      const visibility: Record<string, boolean> = {}
      const highlightLines: Record<string, number[]> = {}
      documents.forEach((doc) => {
        visibility[doc.id] = true
        if (doc.highlightLines) {
          highlightLines[doc.id] = [...doc.highlightLines]
        }
      })
      setDocumentVisibility(visibility)
      setDocumentHighlightLines(highlightLines)

      documents.forEach((doc) => {
        const docFuncs = documentVariantRefs.current.get(doc.id)
        if (docFuncs) {
          docFuncs.setFinal(true)
          const linesToHighlight = highlightLines[doc.id] || []
          linesToHighlight.forEach((lineIndex) => {
            docFuncs.animateHighlight(lineIndex)
          })
        }
      })

      const functions = databaseFunctionsRef.current
      if (functions) {
        functions.setFinal(true)
      }

    } else {
      setFinalState('unhighlighted')

      const visibility: Record<string, boolean> = {}
      documents.forEach((doc) => {
        visibility[doc.id] = true
      })
      setDocumentVisibility(visibility)
      setDocumentHighlightLines({})

      documents.forEach((doc) => {
        const docFuncs = documentVariantRefs.current.get(doc.id)
        if (docFuncs) {
          docFuncs.reset()
          docFuncs.setFinal(false)
        }
      })

      const functions = databaseFunctionsRef.current
      if (functions) {
        functions.setFinal(false)
      }
    }
  }, [documents, currentQuery, finalState])

  const isDocumentVisible = useCallback((
    docId: string,
    documentVisibility: Record<string, boolean>,
    isInFinalState: boolean,
    _isUnshuffling: boolean,
    isShuffled: boolean
  ): boolean => {
    return isInFinalState || documentVisibility[docId] || isShuffled || false
  }, [])

  const getDocumentAnimationStyles = useCallback((
    isVisible: boolean,
    margin: number,
    zIndex: number,
    shuffledPosition: { bottom: number; left: number; rotate: string } | undefined
  ): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      opacity: isVisible ? 1 : 0,
      transformOrigin: "top center",
      marginLeft: `${margin}px`,
      marginTop: 0,
      zIndex,
    }

    // If shuffled, apply stack positions
    if (isShuffled && shuffledPosition) {
      baseStyle.bottom = `${shuffledPosition.bottom}px`
      baseStyle.left = `${shuffledPosition.left}px`
      baseStyle.transform = `scale(0.8) rotate(${shuffledPosition.rotate})`
      baseStyle.position = "absolute"
      baseStyle.marginLeft = 0
      baseStyle.transition = "none"
      baseStyle.opacity = 1
      return baseStyle
    }

    // Normal grid positioning
    if (isVisible) {
      baseStyle.transform = "scale(0.8) translateY(0)"
    } else {
      baseStyle.transform = "scale(0.8) translateY(-40px)"
    }

    if (isInFinalState || isResetting) {
      baseStyle.transition = "none"
    } else {
      const transitionDuration = isQuickSearch 
        ? RETRIEVED_SEARCH_TIMINGS.DOCUMENT_TRANSITION_MS * 0.5 
        : RETRIEVED_SEARCH_TIMINGS.DOCUMENT_TRANSITION_MS
      baseStyle.transition = `opacity ${transitionDuration}ms ease-out, transform ${transitionDuration}ms ease-out`
    }

    return baseStyle
  }, [isInFinalState, isResetting, isQuickSearch, isShuffled])

  useEffect(() => {
    if (onFunctionsReadyRef.current) {
      onFunctionsReadyRef.current({
        search,
        addText,
        setFinal,
        reset,
        shuffle,
        unshuffle,
      })
    }
  }, [search, addText, setFinal, reset, shuffle, unshuffle])


  return (
    <div
      className="flex flex-col items-center gap-[var(--padding)] opacity-transition"
      style={{ 
        opacity: isActive ? 1 : "var(--inactive)",
      }}
    >
      <Database
        key={`database-${documents.map((d) => d.id).join("-")}`}
        mode="dark"
        onFunctionsReady={handleFunctionsReady}
        message={currentQuery}
      />

      <div
        ref={containerRef}
        className="flex flex-col items-center justify-start relative"
        style={{ 
          width: `${CONTAINER_WIDTH}px`, 
          height: `${CONTAINER_HEIGHT}px`,
          overflow: "visible",
          margin: "0 auto",
          paddingTop: 0,
          paddingBottom: 0,
        }}
      >
        {isShuffled ? (
          // When shuffled, render documents directly in container for absolute positioning
          documents.map((doc, index) => {
            const isVisible = isDocumentVisible(doc.id, documentVisibility, isInFinalState, false, isShuffled)
            const shuffledPosition = shuffledPositions[doc.id]
            
            return (
              <div
                key={`${doc.id}-${resetKey}`}
                ref={(el) => {
                  documentElementRefs.current[doc.id] = el
                }}
                className="absolute"
                style={getDocumentAnimationStyles(
                  isVisible,
                  0,
                  index + 1,
                  shuffledPosition
                )}
              >
                <DocumentVariants
                  variant={doc.variant}
                  onFunctionsReady={(funcs) => {
                    documentVariantRefs.current.set(doc.id, funcs)
                    
                    funcs.setFinal(finalState === 'highlighted')
                    
                    let lines: number[] = []
                    if (finalState === 'unhighlighted') {
                      lines = []
                    } else if (finalState === 'highlighted') {
                      lines = documentHighlightLines[doc.id] || doc.highlightLines || []
                    } else {
                      lines = documentHighlightLines[doc.id] || []
                    }
                    
                    lines.forEach((lineIndex) => {
                      funcs.animateHighlight(lineIndex)
                    })
                  }}
                />
              </div>
            )
          })
        ) : (
          // Normal grid layout in rows
          documentRows.map((row, rowIndex) => (
            <div
              key={`row-${rowIndex}-${resetKey}`}
              ref={(el) => {
                rowRefs.current[rowIndex] = el
              }}
              className="flex flex-row items-start justify-center relative"
              style={{
                width: "fit-content",
                maxWidth: "100%",
                marginTop: rowIndex === 0 
                  ? 0 
                  : rowIndex === 1 
                    ? `-${calculatedRowOverlap * 0.95}px`
                    : `-${calculatedRowOverlap}px`,
                marginBottom: 0,
                marginLeft: "auto",
                marginRight: "auto",
                paddingTop: 0,
                zIndex: rowIndex + 1,
                overflow: "visible",
                position: "relative",
              }}
            >
              {row.map((doc, docIndex) => {
                const isVisible = isDocumentVisible(doc.id, documentVisibility, isInFinalState, false, isShuffled)
                const isFirstInRow = docIndex === 0
                const margin = isFirstInRow ? 0 : calculatedMargins[rowIndex] || 0

                return (
                  <div
                    key={`${doc.id}-${resetKey}`}
                    ref={(el) => {
                      documentElementRefs.current[doc.id] = el
                      if (isFirstInRow) {
                        firstDocumentRefs.current[doc.id] = el
                      }
                    }}
                    className="relative"
                    style={getDocumentAnimationStyles(
                      isVisible,
                      margin,
                      (rowIndex * MAX_DOCUMENTS_PER_ROW + docIndex) + 1,
                      undefined
                    )}
                  >
                    <DocumentVariants
                      variant={doc.variant}
                      onFunctionsReady={(funcs) => {
                        documentVariantRefs.current.set(doc.id, funcs)
                        
                        funcs.setFinal(finalState === 'highlighted')
                        
                        let lines: number[] = []
                        if (finalState === 'unhighlighted') {
                          lines = []
                        } else if (finalState === 'highlighted') {
                          lines = documentHighlightLines[doc.id] || doc.highlightLines || []
                        } else {
                          lines = documentHighlightLines[doc.id] || []
                        }
                        
                        lines.forEach((lineIndex) => {
                          funcs.animateHighlight(lineIndex)
                        })
                      }}
                    />
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
