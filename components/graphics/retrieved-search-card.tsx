"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { DocumentVariants } from "@/components/graphics/document-variants"
import "../graphics/helpers/globals.css"
import { DatabaseSearchCard } from "@/components/graphics/database-search-card"

type DatabaseFunctions = {
  addText: () => void;
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
}: { 
  filled?: boolean;
  darkMode?: boolean; 
  onActionButtons?: (buttons: React.ReactNode) => void;
  highlightDocuments?: boolean;
  onFunctionsReady?: (functions: {
    addTextAndRemoveHighlight: () => Promise<void>;
    search: () => Promise<void>;
    highlight: () => Promise<void>;
    reset: () => void;
  }) => void;
}) {
  const [simpleVisible, setSimpleVisible] = useState(false)
  const [bulletsVisible, setBulletsVisible] = useState(false)
  const [chartVisible, setChartVisible] = useState(false)
  const [tableVisible, setTableVisible] = useState(false)
  const [internalHighlightDocuments, setInternalHighlightDocuments] = useState(false)
  const databaseFunctionsRef = useRef<DatabaseFunctions | null>(null)
  const onActionButtonsRef = useRef(onActionButtons)
  const timeoutRefsRef = useRef<NodeJS.Timeout[]>([])

  // Keep ref in sync with prop
  useEffect(() => {
    onActionButtonsRef.current = onActionButtons
  }, [onActionButtons])

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
  const handleAddTextAndRemoveHighlight = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const functions = databaseFunctionsRef.current
      if (!functions) {
        resolve()
        return
      }

      // Add text immediately
      functions.addText()
      
      // Remove highlight after 300ms, then resolve
      const timeout = setTimeout(() => {
        functions.removeHighlight()
        resolve()
      }, 300)
      timeoutRefsRef.current.push(timeout)
    })
  }, [])

  // Button 2: Perform retrieval (search animation and render documents)
  const handleRetrieve = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const functions = databaseFunctionsRef.current
      if (!functions) {
        resolve()
        return
      }

      // Clear any existing timeouts
      timeoutRefsRef.current.forEach(timeout => clearTimeout(timeout))
      timeoutRefsRef.current = []

      // Reset document visibility
      setSimpleVisible(false)
      setBulletsVisible(false)
      setChartVisible(false)
      setTableVisible(false)
      setInternalHighlightDocuments(false)

      // Start search animation and render all documents in the DOM (hidden)
      // Documents appear sequentially from left to right
      functions.search()
      
      // Documents appear from left to right in order
      // Space them out evenly over 1700ms
      const documents = [
        { setter: setSimpleVisible, name: 'simple' },
        { setter: setBulletsVisible, name: 'bullets' },
        { setter: setChartVisible, name: 'chart' },
        { setter: setTableVisible, name: 'table' },
      ]

      // Calculate delays: first document at 0ms, last at 1700ms, evenly spaced
      const totalTimeWindow = 1700
      const delayBetweenDocuments = totalTimeWindow / (documents.length - 1)

      documents.forEach((doc, index) => {
        const delay = index * delayBetweenDocuments
        const timeout = setTimeout(() => {
          doc.setter(true)
        }, delay)
        timeoutRefsRef.current.push(timeout)
      })

      // Resolve after search animation completes (2000ms)
      const maxDelay = 2000
      const resolveTimeout = setTimeout(() => {
        // Force all documents visible as backup
        setSimpleVisible(true)
        setBulletsVisible(true)
        setChartVisible(true)
        setTableVisible(true)
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
      functions.highlightEnterprise()
      functions.highlightPricing()
      functions.highlightSMB()
      
      // Resolve immediately as highlighting is instant
      setTimeout(() => resolve(), 0)
    })
  }, [])

  const handleReset = useCallback(() => {
    // Clear any pending timeouts
    timeoutRefsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutRefsRef.current = []

    const functions = databaseFunctionsRef.current
    if (functions) {
      functions.reset()
    }
    setSimpleVisible(false)
    setBulletsVisible(false)
    setChartVisible(false)
    setTableVisible(false)
    setInternalHighlightDocuments(false)
  }, [])

  // Expose functions to parent component
  useEffect(() => {
    if (onFunctionsReady) {
      onFunctionsReady({
        addTextAndRemoveHighlight: handleAddTextAndRemoveHighlight,
        search: handleRetrieve,
        highlight: handleHighlight,
        reset: handleReset,
      })
    }
  }, [onFunctionsReady, handleAddTextAndRemoveHighlight, handleRetrieve, handleHighlight, handleReset])

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
    <div className="flex flex-col items-center gap-6 w-full">

    <DatabaseSearchCard 
      darkMode={darkMode} 
      filled={filled} 
      width="200px"
      onFunctionsReady={handleFunctionsReady}
    />
    
      <div className="flex flex-row items-start justify-center flex-wrap relative">
          <div
            className="relative"
            style={{ 
              opacity: simpleVisible ? 1 : 0,
              transform: simpleVisible ? 'translateY(0)' : 'translateY(-40px)',
              transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
              zIndex: 1
            }}
          >
            <DocumentVariants 
              title="simple" 
              variant="simple" 
              externalHighlight={internalHighlightDocuments || highlightDocuments} 
            />
          </div>
          <div
            className="relative"
            style={{ 
              opacity: bulletsVisible ? 1 : 0,
              transform: bulletsVisible ? 'translateY(0)' : 'translateY(-40px)',
              transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
              marginLeft: '-20px',
              zIndex: 2
            }}
          >
            <DocumentVariants 
              title="bullets" 
              variant="bullets" 
              externalHighlight={internalHighlightDocuments || highlightDocuments} 
            />
          </div>
          <div
            className="relative"
            style={{ 
              opacity: chartVisible ? 1 : 0,
              transform: chartVisible ? 'translateY(0)' : 'translateY(-40px)',
              transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
              marginLeft: '-20px',
              zIndex: 3
            }}
          >
            <DocumentVariants 
              title="chart" 
              variant="chart" 
              externalHighlight={internalHighlightDocuments || highlightDocuments} 
            />
          </div>
          <div
            className="relative"
            style={{ 
              opacity: tableVisible ? 1 : 0,
              transform: tableVisible ? 'translateY(0)' : 'translateY(-40px)',
              transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
              marginLeft: '-20px',
              zIndex: 4
            }}
          >
            <DocumentVariants 
              title="table" 
              variant="table" 
              externalHighlight={internalHighlightDocuments || highlightDocuments} 
            />
          </div>
    </div>
    </div>
  )
}

