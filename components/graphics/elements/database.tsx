"use client"

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react"
import { DATABASE_SEARCH_TIMINGS, RAG_HIGHLIGHT_TIMINGS } from "../helpers/animation-timings"
import "../helpers/globals.css"

const SearchIcon = ({ isSearching }: { isSearching?: boolean }) => (
  <svg
    viewBox="2 2 21 21"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-[6px] h-[6px] text-[var(--dark-grey)] flex-shrink-0 mb-[0.5px] ml-[1px] transition-opacity ${isSearching ? "opacity-40" : "opacity-100"}`}
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m16 16 6 6" strokeWidth="2.5" />
  </svg>
)

const ChevronRightIcon = ({ isSearching }: { isSearching?: boolean }) => (
  <svg
    viewBox="8 5 8 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`h-[4px] w-auto text-[var(--dark-grey)] flex-shrink-0 transition-opacity ${isSearching ? "opacity-40" : "opacity-100"}`}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
)

const VectorDB = ({
  fill,
  stroke,
  isSearching,
}: {
  fill: string
  stroke: string
  isSearching?: boolean
}) => {
  const isWhite = fill === "var(--white)" || fill === "white"
  const pulseClass = isSearching ? (isWhite ? "database-pulse-white" : "database-pulse") : ""

  return (
    <svg
      width="252"
      height="277"
      viewBox="0 0 252 277"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute top-0 inset-x-0 mx-auto w-[60%] h-[90px] z-0 ${pulseClass}`}
      style={{ filter: "var(--shadow)" }}
    >
      <path
        d="M126 71C56.9644 71 1 95.6243 1 126V196C1 165.624 56.9644 141 126 141C195.036 141 251 165.624 251 196V126C251 95.6243 195.036 71 126 71Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
      />
      <path
        d="M126 1C56.9644 1 1 25.6243 1 56V126C1 95.6243 56.9644 71 126 71C195.036 71 251 95.6243 251 126V56C251 25.6243 195.036 1 126 1Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
      />
      <path
        d="M126 269C195.036 269 251 288.376 251 258C251 227.624 195.036 203 126 203C56.9644 203 1 227.624 1 258C1 288.376 56.9644 269 126 269Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
      />
      <path
        d="M1 196V258C1 227.624 56.9644 203 126 203C195.036 203 251 227.624 251 258V196C251 165.624 195.036 141 126 141C56.9644 141 1 165.624 1 196Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
      />
      <path
        d="M1 258V188M1 258C1 288.376 56.9644 269 126 269C195.036 269 251 288.376 251 258M1 258C1 227.624 56.9644 203 126 203C195.036 203 251 227.624 251 258M1 258V196M251 126V56C251 25.6243 195.036 1 126 1C56.9644 1 1 25.6243 1 56V126M251 126C251 95.6243 195.036 71 126 71C56.9644 71 1 95.6243 1 126M251 126V196M1 126V196M251 196C251 165.624 195.036 141 126 141C56.9644 141 1 165.624 1 196M251 196V258M251 258V188"
        stroke={stroke}
        strokeWidth="2"
      />
    </svg>
  )
}

const VectorDB_3D = ({ isSearching }: { isSearching?: boolean }) => {
  const DB_OPACITIES = [1, 0.7, 0.45, 0.3, 0.1]
  const DB_BASE_COLOR = "var(--medium-grey)"

  return (
    <svg
      width="275"
      height="390"
      viewBox="0 0 275 390"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[38%] h-auto z-0 ${isSearching ? "database-pulse" : ""}`}
      style={{ filter: "var(--shadow)" }}
    >
      <path
        d="M275 265C275 295.376 213.439 320 137.5 320C61.5608 320 0 295.376 0 265V335C0 365.376 61.5608 390 137.5 390C213.439 390 275 365.376 275 335V265Z"
        fill={DB_BASE_COLOR}
        fillOpacity={DB_OPACITIES[0]}
        stroke="none"
      />
      <path
        d="M275 195C275 225.376 213.439 250 137.5 250C61.5608 250 0 225.376 0 195V265C0 295.376 61.5608 320 137.5 320C213.439 320 275 295.376 275 265V195Z"
        fill={DB_BASE_COLOR}
        fillOpacity={DB_OPACITIES[1]}
        stroke="none"
      />
      <path
        d="M275 125C275 155.376 213.439 180 137.5 180C61.5608 180 0 155.376 0 125V195C0 225.376 61.5608 250 137.5 250C213.439 250 275 225.376 275 195V125Z"
        fill={DB_BASE_COLOR}
        fillOpacity={DB_OPACITIES[2]}
        stroke="none"
      />
      <path
        d="M275 55C275 85.3757 213.439 110 137.5 110C61.5608 110 0 85.3757 0 55V125C0 155.376 61.5608 180 137.5 180C213.439 180 275 155.376 275 125V55Z"
        fill={DB_BASE_COLOR}
        fillOpacity={DB_OPACITIES[3]}
        stroke="none"
      />
      <path
        d="M137.5 110C213.439 110 275 85.3757 275 55C275 24.6243 213.439 0 137.5 0C61.5608 0 0 24.6243 0 55C0 85.3757 61.5608 110 137.5 110Z"
        fill={DB_BASE_COLOR}
        fillOpacity={DB_OPACITIES[4]}
        stroke="none"
      />
    </svg>
  )
}

export type DatabaseFunctions = {
  addText: (text?: string) => Promise<void>
  search: (isQuick?: boolean) => Promise<void>
  highlightKeywords: () => void
  setFinal: (highlighted: boolean) => void
  reset: () => void
}

export function Database({
  mode = "light",
  message,
  onFunctionsReady,
}: {
  mode?: "light" | "dark" | "filled"
  message: string
  onFunctionsReady?: (functions: DatabaseFunctions) => void
}) {
  const [displayedText, setDisplayedText] = useState("")
  const [highlightEnterprise, setHighlightEnterprise] = useState(false)
  const [highlightPricing, setHighlightPricing] = useState(false)
  const [highlightSMB, setHighlightSMB] = useState(false)
  const [enterpriseKey, setEnterpriseKey] = useState(0)
  const [pricingKey, setPricingKey] = useState(0)
  const [smbKey, setSmbKey] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [isFinal, setIsFinal] = useState<boolean | "unhighlighted">(false)
  const displayedTextRef = useRef("")
  const searchTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  const addTextTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const clearHighlights = useCallback(() => {
    setHighlightEnterprise(false)
    setHighlightPricing(false)
    setHighlightSMB(false)
  }, [])

  const handleHighlightWord = useCallback(
    (wordType: "enterprise" | "pricing" | "smb") => {
      if (wordType === "enterprise") {
        setEnterpriseKey((prev) => prev + 1)
        setHighlightEnterprise(true)
      } else if (wordType === "pricing") {
        setPricingKey((prev) => prev + 1)
        setHighlightPricing(true)
      } else if (wordType === "smb") {
        setSmbKey((prev) => prev + 1)
        setHighlightSMB(true)
      }
    },
    []
  )

  const handleSearch = useCallback(
    (speed: "slow" | "quick" = "quick", text: string): Promise<void> => {
      return new Promise((resolve) => {
        // Clear any existing search timeouts first
        searchTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
        searchTimeoutsRef.current = []

        // Clear highlighting states
        clearHighlights()

        // Set text
        setDisplayedText(text)
        displayedTextRef.current = text

        const baseSearchDuration = DATABASE_SEARCH_TIMINGS.SEARCH_ANIMATION_DURATION_MS
        const quickDuration = baseSearchDuration * 0.5

        // Immediately perform the search animation
        setIsSearching(true)
        
        if (speed === "slow") {
          // Slow search: pulse twice
          const timeout1 = setTimeout(() => {
            setIsSearching(false)
            setIsSearching(true)
            const timeout2 = setTimeout(() => {
              setIsSearching(false)
              resolve()
            }, quickDuration)
            searchTimeoutsRef.current.push(timeout2)
          }, quickDuration)
          searchTimeoutsRef.current.push(timeout1)
        } else {
          // Quick search: pulse once
          const timeout = setTimeout(() => {
            setIsSearching(false)
            resolve()
          }, quickDuration)
          searchTimeoutsRef.current.push(timeout)
        }
      })
    },
    [clearHighlights]
  )

  const handleSetFinal = useCallback((highlighted: boolean) => {
    // Clear any ongoing search animations to prevent interference
    searchTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    searchTimeoutsRef.current = []
    setIsSearching(false)

    setDisplayedText(message)
    displayedTextRef.current = message

    if (highlighted) {
      setIsFinal(true)
      if (message) {
        setEnterpriseKey((prev) => prev + 1)
        setPricingKey((prev) => prev + 1)
        setSmbKey((prev) => prev + 1)
        setHighlightEnterprise(true)
        setHighlightPricing(true)
        setHighlightSMB(true)
      }
    } else {
      setIsFinal("unhighlighted")
      clearHighlights()
    }
  }, [message, clearHighlights])

  const handleAddText = useCallback((text: string = ""): Promise<void> => {
    return new Promise((resolve) => {
      // Clear any existing addText timeout
      if (addTextTimeoutRef.current) {
        clearTimeout(addTextTimeoutRef.current)
      }

      // Clear any existing search timeouts
      searchTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      searchTimeoutsRef.current = []

      // Add text and clear highlights
      setDisplayedText(text)
      displayedTextRef.current = text
      clearHighlights()

      // Resolve after a short delay to allow state to update
      addTextTimeoutRef.current = setTimeout(() => {
        addTextTimeoutRef.current = null
        resolve()
      }, 100)
    })
  }, [clearHighlights])

  const handleReset = useCallback(() => {
    setIsFinal(false)
    searchTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    searchTimeoutsRef.current = []

    if (addTextTimeoutRef.current) {
      clearTimeout(addTextTimeoutRef.current)
      addTextTimeoutRef.current = null
    }

    setDisplayedText("")
    displayedTextRef.current = ""
    clearHighlights()
    setEnterpriseKey(0)
    setPricingKey(0)
    setSmbKey(0)
    setIsSearching(false)
  }, [clearHighlights])

  useEffect(() => {
    if (onFunctionsReady) {
      onFunctionsReady({
        addText: handleAddText,
        search: async (isQuick: boolean = true) => {
          // For quick search, automatically add text if search bar is empty
          if (isQuick) {
            const currentText = displayedTextRef.current || displayedText || ""
            if (!currentText && message) {
              await handleAddText(message)
            }
          }
          // Use the current text from the search bar
          const currentText = displayedTextRef.current || displayedText || message || ""
          const speed = isQuick ? "quick" : "slow"
          return handleSearch(speed, currentText)
        },
        highlightKeywords: () => {
          // Only highlight if there's text in the search bar
          // Check multiple sources: ref, state, and message prop as fallbacks
          const textToCheck = displayedTextRef.current || displayedText || message || ""
          if (!textToCheck) {
            return
          }
          // Reset isFinal to false so highlights can be shown
          setIsFinal(false)
          handleHighlightWord("enterprise")
          handleHighlightWord("pricing")
          handleHighlightWord("smb")
        },
        setFinal: handleSetFinal,
        reset: handleReset,
      })
    }
  }, [
    onFunctionsReady,
    handleAddText,
    handleSearch,
    handleSetFinal,
    handleReset,
    handleHighlightWord,
    displayedText,
    message,
  ])

  let fill = "var(--white)"
  let stroke = "var(--medium-dark-grey)"
  if (mode === "dark") {
    fill = "var(--medium-grey)"
    stroke = "var(--medium-dark-grey)"
  }

  let vectorDB = null

  if (mode === "filled") {
    vectorDB = <VectorDB_3D isSearching={isSearching} />
  } else {
    vectorDB = <VectorDB fill={fill} stroke={stroke} isSearching={isSearching} />
  }

  const containerClass = mode === "filled"
    ? `w-full mx-auto flex items-center justify-center relative`
    : "h-fit pt-[74px] pb-0 flex items-center justify-center relative"

  const containerStyle = mode === "filled"
    ? {
        maxWidth: "200px",
        aspectRatio: "200 / 108",
        minHeight: "0",
      }
    : {
        width: "200px",
      }

  const searchBarContent = (
    <div className={containerClass} style={containerStyle}>
      {vectorDB}
      <div
        className={`${mode === "filled" ? "absolute inset-0" : "relative"} z-10 flex items-center justify-center`}
      >
        <div className="relative">
          {mode !== "filled" && (
            <div
              className="absolute inset-0 bg-[var(--white)] rounded-[var(--border-radius-small)]"
              style={{
                boxShadow:
                  "0 -8px 25px 15px rgba(255, 255, 255, 0.6), 0 -12px 40px 25px rgba(255, 255, 255, 0.4), 0 -18px 55px 35px rgba(255, 255, 255, 0.25)",
                clipPath: "inset(-100px 0 0 0)",
                zIndex: 5,
              }}
            />
          )}
          <div
            className={`bg-[var(--white)] rounded-[var(--border-radius-small)] p-[6px] gap-[6px] flex items-center relative z-10`}
            style={{
              filter: "var(--shadow)",
              width: "196px",
              minWidth: "196px",
              height: "21px",
            }}
          >
            <SearchIcon isSearching={isSearching} />
            <span
              className={`styling-text overflow-hidden whitespace-nowrap text-ellipsis ${isSearching ? "text-pulse" : ""}`}
              style={{
                position: "relative",
                display: "inline-block",
                marginRight: "8px",
                lineHeight: "inherit",
              }}
            >
              {(highlightEnterprise || highlightPricing || highlightSMB) && displayedText ? (
                <span style={{ position: "relative", zIndex: 1 }}>
                  {displayedText.split(/(enterprise|pricing|SMB)/i).map((part, index) => {
                    const isEnterprise = /^enterprise$/i.test(part)
                    const isPricing = /^pricing$/i.test(part)
                    const isSMB = /^SMB$/i.test(part)
                    const shouldHighlight =
                      (isEnterprise && highlightEnterprise) ||
                      (isPricing && highlightPricing) ||
                      (isSMB && highlightSMB)
                    let highlightKey = `text-${index}`
                    if (isEnterprise) highlightKey = `enterprise-${enterpriseKey}-${index}`
                    else if (isPricing) highlightKey = `pricing-${pricingKey}-${index}`
                    else if (isSMB) highlightKey = `smb-${smbKey}-${index}`

                    return shouldHighlight ? (
                      <span
                        key={highlightKey}
                        className={
                          isFinal === true
                            ? "highlight-final highlight-yellow"
                            : isFinal === "unhighlighted"
                            ? ""
                            : "highlight-active highlight-yellow"
                        }
                        style={{
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        {part}
                      </span>
                    ) : (
                      <span key={highlightKey}>{part}</span>
                    )
                  })}
                </span>
              ) : (
                <span style={{ position: "relative", zIndex: 1 }}>{displayedText}</span>
              )}
            </span>
            <div className="absolute right-[6px] top-1/2 -translate-y-1/2">
              <ChevronRightIcon isSearching={isSearching} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  useEffect(() => {
    return () => {
      searchTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      searchTimeoutsRef.current = []
      if (addTextTimeoutRef.current) {
        clearTimeout(addTextTimeoutRef.current)
        addTextTimeoutRef.current = null
      }
    }
  }, [])

  return searchBarContent
}
