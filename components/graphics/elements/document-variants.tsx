import { useState, useEffect, useCallback, useRef } from "react"
import { MailIcon } from "lucide-react"
import {DummyLine, DummyParagraph, isLineHighlighted, getHighlightClass,
} from "../helpers/dummy-helpers"
import { Document } from "../helpers/document"
import "../helpers/globals.css"

export const AVAILABLE_DOCUMENT_VARIANTS = [
  "simple",
  "bullets",
  "bullets2",
  "chart",
  "chart2",
  "table",
  "table2",
  "image",
  "image2",
  "spreadsheet",
  "spreadsheet2",
  "email",
  "email2",
  "email3",
] as const

export type DocumentVariant = (typeof AVAILABLE_DOCUMENT_VARIANTS)[number]

export type DocumentVariantFunctions = {
  animateHighlight: (lineIndex: number | number[]) => void
  setFinal: (highlighted: boolean) => void
  reset: () => void
}

export type DocumentItem = {
  id: string
  title?: string
  variant: DocumentVariant
  highlightLines?: number[]
}

// Highest highlightable key number for each variant (0-based indexing)
export const VARIANT_MAX_KEYS: Record<DocumentVariant, number> = {
  simple: 6,
  bullets: 5,
  bullets2: 6,
  chart: 2,
  chart2: 2,
  table: 10,
  table2: 12,
  image: 5,
  image2: 7,
  spreadsheet: 54, // 11 rows × 5 columns (0-54)
  spreadsheet2: 35, // 9 rows × 4 columns (0-35)
  email: 4,
  email2: 6,
  email3: 4,
} as const

function BulletPoint() {
  return (
    <div
      style={{
        width: "var(--circle-size)",
        height: "var(--circle-size)",
        borderRadius: "999px",
        background: "var(--medium-grey)",
        flexShrink: 0,
      }}
    />
  )
}

function BulletItem({
  lineKey,
  lineWidth,
  highlightLines,
  showFinal,
}: {
  lineKey: number
  lineWidth: string
  highlightLines?: number[]
  showFinal?: boolean
}) {
  const highlight = isLineHighlighted(lineKey, highlightLines)
  const className = getHighlightClass(highlight, showFinal || false)
  return (
    <DummyParagraph
      items={[
        <BulletPoint key={`bullet-${lineKey}`} />,
        <DummyLine
          key={lineKey}
          width={lineWidth}
          height="var(--line-height)"
          highlightClassName={className}
        />,
      ]}
      direction="row"
      gap="var(--gap)"
      style={{ alignItems: "center" }}
    />
  )
}

export function DocumentVariants({
  variant,
  title,
  onFunctionsReady,
}: {
  variant: string
  title?: string
  onFunctionsReady?: (functions: DocumentVariantFunctions) => void
}) {
  const [internalHighlightLines, setInternalHighlightLines] = useState<number[]>([])
  const [internalShowFinal, setInternalShowFinal] = useState(false)
  const onFunctionsReadyRef = useRef(onFunctionsReady)

  // Update ref when prop changes
  useEffect(() => {
    onFunctionsReadyRef.current = onFunctionsReady
  }, [onFunctionsReady])

  // Reset on variant change
  useEffect(() => {
    setInternalHighlightLines([])
    setInternalShowFinal(false)
  }, [variant])

  // Helper function to validate and filter line indices
  const validateAndFilterIndices = useCallback((indices: number[], maxKey: number, existingIndices: number[]): number[] => {
    return indices.filter(idx => {
      // Validate index
      if (idx < 0 || idx > maxKey) {
        return false // Invalid line index, ignore
      }
      // Only add if not already highlighted
      return !existingIndices.includes(idx)
    })
  }, [])

  // Handle animateHighlight function - highlights a single line index or array of line indices
  const handleAnimateHighlight = useCallback((lineIndex: number | number[]) => {
    const maxKey = VARIANT_MAX_KEYS[variant as DocumentVariant]
    const indices = Array.isArray(lineIndex) ? lineIndex : [lineIndex]
    
    setInternalHighlightLines((prev) => {
      const newIndices = validateAndFilterIndices(indices, maxKey, prev)
      
      if (newIndices.length === 0) {
        return prev // No new valid indices
      }
      
      return [...prev, ...newIndices].sort((a, b) => a - b)
    })
  }, [variant, validateAndFilterIndices])

  // Handle setFinal function
  const handleSetFinal = useCallback((highlighted: boolean) => {
    setInternalShowFinal(highlighted)
  }, [])

  // Handle reset function
  const handleReset = useCallback(() => {
    setInternalHighlightLines([])
    setInternalShowFinal(false)
  }, [])

  // Expose functions via onFunctionsReady
  useEffect(() => {
    if (onFunctionsReadyRef.current) {
      onFunctionsReadyRef.current({
        animateHighlight: handleAnimateHighlight,
        setFinal: handleSetFinal,
        reset: handleReset,
      })
    }
  }, [handleAnimateHighlight, handleSetFinal, handleReset])

  const getContent = (): React.ReactNode => {
    const linesToHighlight = internalHighlightLines.length > 0 ? internalHighlightLines : undefined
    const contentProps = { highlightLines: linesToHighlight, showFinal: internalShowFinal }

    const variantMap: Record<string, React.ReactNode> = {
      table: <TableContent {...contentProps} />,
      table2: <TableContent2 {...contentProps} />,
      chart: <ChartContent1 {...contentProps} />,
      chart2: <ChartContent2 {...contentProps} />,
      bullets: <BulletsContent {...contentProps} />,
      bullets2: <BulletsContent2 {...contentProps} />,
      image: <ImageContent {...contentProps} />,
      image2: <ImageContent2 {...contentProps} />,
      simple: <SimpleContent {...contentProps} />,
      spreadsheet: <SpreadsheetContent {...contentProps} />,
      spreadsheet2: <SpreadsheetContent2 {...contentProps} />,
      email: <EmailContent {...contentProps} />,
      email2: <EmailContent2 {...contentProps} />,
      email3: <EmailContent3 {...contentProps} />,
    }

    return variantMap[variant]
  }

  return (
    <div style={{ width: "80px" }}>
      <Document
        title={title || `${variant}.pdf`}
        content={getContent()}
      />
    </div>
  )
}

function SimpleContent({
  highlightLines,
  showFinal = false,
}: {
  highlightLines?: number[]
  showFinal?: boolean
}) {
  return (
    <div>
      <DummyParagraph
        items={[
          <DummyLine
            key={0}
            width="91%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(0, highlightLines), showFinal)}
          />,
          <DummyLine
            key={1}
            width="100%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(1, highlightLines), showFinal)}
          />,
          <DummyLine
            key={2}
            width="75%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(2, highlightLines), showFinal)}
          />,
        ]}
        gap="var(--gap)"
      />
      <DummyParagraph
        items={[
          <DummyLine
            key={3}
            width="82%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(3, highlightLines), showFinal)}
          />,
          <DummyLine
            key={4}
            width="100%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(4, highlightLines), showFinal)}
          />,
          <DummyLine
            key={5}
            width="86%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(5, highlightLines), showFinal)}
          />,
          <DummyLine
            key={6}
            width="74%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(6, highlightLines), showFinal)}
          />,
        ]}
        gap="var(--gap)"
      />
    </div>
  )
}

function BulletsContent({
  highlightLines,
  showFinal = false,
}: {
  highlightLines?: number[]
  showFinal?: boolean
}) {
  return (
    <div>
      <DummyParagraph
        items={[
          <DummyLine
            key={0}
            width="65%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(0, highlightLines), showFinal)}
          />,
          <DummyLine
            key={1}
            width="100%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(1, highlightLines), showFinal)}
          />,
          <DummyLine
            key={2}
            width="94%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(2, highlightLines), showFinal)}
          />,
        ]}
        gap="var(--gap)"
      />
      <DummyParagraph
        items={[
          <DummyLine
            key={3}
            width="66%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(3, highlightLines), showFinal)}
          />,
          <BulletItem
            key={4}
            lineKey={4}
            lineWidth="100%"
            highlightLines={highlightLines}
            showFinal={showFinal}
          />,
          <BulletItem
            key={5}
            lineKey={5}
            lineWidth="83%"
            highlightLines={highlightLines}
            showFinal={showFinal}
          />,
        ]}
        gap="var(--gap)"
      />
    </div>
  )
}

function BulletsContent2({
  highlightLines,
  showFinal = false,
}: {
  highlightLines?: number[]
  showFinal?: boolean
}) {
  return (
    <div>
      <DummyParagraph
        items={[
          <DummyLine
            key={0}
            width="72%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(0, highlightLines), showFinal)}
          />,
          <BulletItem
            key={1}
            lineKey={1}
            lineWidth="100%"
            highlightLines={highlightLines}
            showFinal={showFinal}
          />,
          <BulletItem
            key={2}
            lineKey={2}
            lineWidth="91%"
            highlightLines={highlightLines}
            showFinal={showFinal}
          />,
          <BulletItem
            key={3}
            lineKey={3}
            lineWidth="78%"
            highlightLines={highlightLines}
            showFinal={showFinal}
          />,
          <BulletItem
            key={4}
            lineKey={4}
            lineWidth="85%"
            highlightLines={highlightLines}
            showFinal={showFinal}
          />,
        ]}
        gap="var(--gap)"
      />
      <DummyParagraph
        items={[
          <DummyLine
            key={5}
            width="72%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(5, highlightLines), showFinal)}
          />,
          <DummyLine
            key={6}
            width="88%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(6, highlightLines), showFinal)}
          />,
        ]}
        gap="var(--gap)"
      />
    </div>
  )
}

function ImageContent({
  highlightLines,
  showFinal = false,
}: {
  highlightLines?: number[]
  showFinal?: boolean
}) {
  return (
    <div>
      <DummyParagraph
        items={[
          <DummyLine
            key={0}
            width="100%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(0, highlightLines), showFinal)}
          />,
          <DummyLine
            key={1}
            width="91%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(1, highlightLines), showFinal)}
          />,
          <DummyLine
            key={2}
            width="91%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(2, highlightLines), showFinal)}
          />,
          <DummyLine
            key={3}
            width="100%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(3, highlightLines), showFinal)}
          />,
        ]}
        gap="var(--gap)"
      />
      <DummyParagraph
        items={[
          <div
            key="image"
            style={{
              width: "40%",
              height: "18px",
              borderRadius: "var(--image-radius)",
              background: "var(--medium-light-grey)",
              flexShrink: 0,
            }}
          />,
          <DummyLine
            key={4}
            width="40%"
            height="var(--line-height-small)"
            highlightClassName={getHighlightClass(isLineHighlighted(4, highlightLines), showFinal)}
          />,
          <DummyLine
            key={5}
            width="40%"
            height="var(--line-height-small)"
            highlightClassName={getHighlightClass(isLineHighlighted(5, highlightLines), showFinal)}
          />,
        ]}
        gap="var(--gap-small)"
        style={{ alignItems: "center" }}
      />
    </div>
  )
}

function ImageContent2({
  highlightLines,
  showFinal = false,
}: {
  highlightLines?: number[]
  showFinal?: boolean
}) {
  return (
    <div>
      <DummyParagraph
        items={[
          <DummyParagraph
            items={[
              <DummyLine
                key={0}
                width="100%"
                height="var(--line-height)"
                highlightClassName={getHighlightClass(isLineHighlighted(0, highlightLines), showFinal)}
              />,
              <DummyLine
                key={1}
                width="87%"
                height="var(--line-height)"
                highlightClassName={getHighlightClass(isLineHighlighted(1, highlightLines), showFinal)}
              />,
            ]}
            gap="var(--gap)"
          />,
          <DummyParagraph
            items={[
              <div
                key="image"
                style={{
                  width: "42%",
                  borderRadius: "var(--image-radius)",
                  background: "var(--medium-light-grey)",
                  flexShrink: 0,
                  alignSelf: "stretch",
                }}
              />,
              <DummyParagraph
                key="text"
                items={[
                  <DummyLine
                    key={2}
                    width="100%"
                    height="var(--line-height)"
                    highlightClassName={getHighlightClass(isLineHighlighted(2, highlightLines), showFinal)}
                  />,
                  <DummyLine
                    key={3}
                    width="88%"
                    height="var(--line-height)"
                    highlightClassName={getHighlightClass(isLineHighlighted(3, highlightLines), showFinal)}
                  />,
                  <DummyLine
                    key={4}
                    width="83%"
                    height="var(--line-height)"
                    highlightClassName={getHighlightClass(isLineHighlighted(4, highlightLines), showFinal)}
                  />,
                ]}
                gap="var(--gap)"
                direction="column"
                style={{ flex: 1 }}
              />,
            ]}
            gap="var(--gap-small)"
            direction="row"
            style={{ alignItems: "stretch" }}
          />,
          <DummyParagraph
            items={[
              <DummyLine
                key={5}
                width="100%"
                height="var(--line-height)"
                highlightClassName={getHighlightClass(isLineHighlighted(5, highlightLines), showFinal)}
              />,
              <DummyLine
                key={6}
                width="98%"
                height="var(--line-height)"
                highlightClassName={getHighlightClass(isLineHighlighted(6, highlightLines), showFinal)}
              />,
              <DummyLine
                key={7}
                width="82%"
                height="var(--line-height)"
                highlightClassName={getHighlightClass(isLineHighlighted(7, highlightLines), showFinal)}
              />,
            ]}
            gap="var(--gap)"
          />,
        ]}
        gap="var(--gap)"
      />
    </div>
  )
}

function ChartContent1({
  highlightLines,
  showFinal = false,
}: {
  highlightLines?: number[]
  showFinal?: boolean
}) {
  return (
    <div>
      <DummyParagraph
        items={[
          <DummyLine
            key={0}
            width="83%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(0, highlightLines), showFinal)}
          />,
          <DummyLine
            key={1}
            width="100%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(1, highlightLines), showFinal)}
          />,
        ]}
        gap="var(--gap)"
      />

      <div
        style={{
          position: "relative",
          height: "32px",
          width: "65%",
          margin: "0 auto",
          borderRadius: "var(--image-radius)",
          background: "var(--very-light-grey)",
        }}
      >
        <svg
          style={{ width: "100%", height: "100%" }}
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
        >
          <path
            d="M 30 160 Q 40 157.5, 50 155 T 70 145 T 90 140 T 110 120 T 130 105 T 150 95 T 170 92 T 190 98 T 210 92 T 230 82 T 250 75 T 270 82 T 290 88 T 310 90 T 330 88 T 350 85 T 370 82"
            fill="none"
            stroke="var(--chart-color-1)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 30 170 Q 40 169, 50 168 T 70 162 T 90 158 T 110 140 T 130 130 T 150 120 T 170 115 T 190 110 T 210 100 T 230 92 T 250 88 T 270 80 T 290 70 T 310 58 T 330 45 T 350 32 T 370 25"
            fill="none"
            stroke="var(--chart-color-2)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 30 180 Q 40 179, 50 178 T 70 175 T 90 172 T 110 160 T 130 155 T 150 152 T 170 148 T 190 145 T 210 140 T 230 135 T 250 130 T 270 120 T 290 105 T 310 85 T 330 65 T 350 50 T 370 40"
            fill="none"
            stroke="var(--chart-color-3)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <DummyLine
        key={2}
        width="100%"
        height="var(--line-height)"
        highlightClassName={getHighlightClass(isLineHighlighted(2, highlightLines), showFinal)}
      />
    </div>
  )
}

function ChartContent2({
  highlightLines,
  showFinal = false,
}: {
  highlightLines?: number[]
  showFinal?: boolean
}) {
  return (
    <div>
      <DummyParagraph
        items={[
          <DummyLine
            key={0}
            width="91%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(0, highlightLines), showFinal)}
          />,
          <DummyLine
            key={1}
            width="100%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(1, highlightLines), showFinal)}
          />,
          <DummyLine
            key={2}
            width="75%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(2, highlightLines), showFinal)}
          />,
        ]}
        gap="var(--gap)"
      />

      <div
        style={{
          position: "relative",
          height: "32px",
          borderRadius: "var(--image-radius)",
          background: "var(--very-light-grey)",
        }}
      >
        <svg
          style={{ width: "100%", height: "100%" }}
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
        >
          <path
            d="M 40 20 L 80 20 L 120 20 Q 130 20, 140 20 T 150 25 T 160 40 T 170 80 T 180 120 T 190 150 T 200 170 T 220 180 T 240 180 T 260 180 T 280 180 T 300 180 T 320 180 T 340 180 T 360 180"
            fill="none"
            stroke="var(--chart-color-4)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 40 20 L 80 20 L 120 20 L 160 20 L 200 20 Q 210 20, 220 20 T 240 25 T 250 40 T 260 70 T 270 110 T 280 140 T 290 160 T 300 170 T 310 175 T 320 178 T 340 180 T 360 180"
            fill="none"
            stroke="var(--chart-color-5)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 40 20 L 80 20 L 120 20 L 160 20 L 200 20 L 240 20 L 280 20 Q 290 20, 300 20 T 310 25 T 320 40 T 330 70 T 340 110 T 350 150 T 355 170 T 360 178 T 365 180"
            fill="none"
            stroke="var(--chart-color-6)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

function TableContent({
  highlightLines,
  showFinal = false,
}: {
  highlightLines?: number[]
  showFinal?: boolean
}) {
  return (
    <div>
      <DummyParagraph
        items={[
          <DummyLine
            key={0}
            width="100%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(0, highlightLines), showFinal)}
          />,
          <DummyLine
            key={1}
            width="85%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(1, highlightLines), showFinal)}
          />,
          <DummyLine
            key={2}
            width="91%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(2, highlightLines), showFinal)}
          />,
        ]}
        gap="var(--gap)"
      />
      <div
        className="flex flex-col gap-0"
        style={{
          width: "100%",
          borderRadius: "var(--image-radius)",
          border: "1px solid var(--light-grey)",
          flexShrink: 0,
        }}
      >
        <div
          className="h-full"
          style={{ width: "100%", height: "4px", background: "var(--light-grey)", flexShrink: 0 }}
        />
        <div className="flex flex-row gap-0" style={{ height: "fit-content" }}>
          <div
            className="h-full w-3/4 flex flex-col justify-center p-1"
            style={{ borderRight: "1px solid var(--light-grey)" }}
          >
            <DummyParagraph
              items={[
                <DummyLine
                  key={3}
                  width="100%"
                  height="var(--line-height-small)"
                  highlightClassName={getHighlightClass(isLineHighlighted(3, highlightLines), showFinal)}
                />,
                <DummyLine
                  key={4}
                  width="93%"
                  height="var(--line-height-small)"
                  highlightClassName={getHighlightClass(isLineHighlighted(4, highlightLines), showFinal)}
                />,
                <DummyLine
                  key={5}
                  width="81%"
                  height="var(--line-height-small)"
                  highlightClassName={getHighlightClass(isLineHighlighted(5, highlightLines), showFinal)}
                />,
                <DummyLine
                  key={6}
                  width="100%"
                  height="var(--line-height-small)"
                  highlightClassName={getHighlightClass(isLineHighlighted(6, highlightLines), showFinal)}
                />,
              ]}
              gap="var(--gap-small)"
            />
          </div>
          <div className="h-full w-1/3 flex flex-col justify-center p-1">
            <DummyParagraph
              items={[
                <DummyLine
                  key={7}
                  width="100%"
                  height="var(--line-height-small)"
                  highlightClassName={getHighlightClass(isLineHighlighted(7, highlightLines), showFinal)}
                />,
                <DummyLine
                  key={8}
                  width="65%"
                  height="var(--line-height-small)"
                  highlightClassName={getHighlightClass(isLineHighlighted(8, highlightLines), showFinal)}
                />,
                <DummyLine
                  key={9}
                  width="100%"
                  height="var(--line-height-small)"
                  highlightClassName={getHighlightClass(isLineHighlighted(9, highlightLines), showFinal)}
                />,
                <DummyLine
                  key={10}
                  width="80%"
                  height="var(--line-height-small)"
                  highlightClassName={getHighlightClass(isLineHighlighted(10, highlightLines), showFinal)}
                />,
              ]}
              gap="var(--gap-small)"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function TableContent2({
  highlightLines,
  showFinal = false,
}: {
  highlightLines?: number[]
  showFinal?: boolean
}) {
  return (
    <div>
      <DummyParagraph
        items={[
          <DummyLine
            key={0}
            width="95%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(0, highlightLines), showFinal)}
          />,
          <DummyLine
            key={1}
            width="78%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(1, highlightLines), showFinal)}
          />,
        ]}
        gap="var(--gap)"
      />
      <div
        className="flex flex-col gap-0"
        style={{
          width: "100%",
          borderRadius: "var(--image-radius)",
          border: "1px solid var(--light-grey)",
          flexShrink: 0,
        }}
      >
        <div
          className="h-full"
          style={{ width: "100%", height: "4px", background: "var(--light-grey)", flexShrink: 0 }}
        />
        <div className="flex flex-row gap-0" style={{ height: "fit-content" }}>
          <div
            className="h-full w-1/3 flex flex-col justify-center p-1"
            style={{ borderRight: "1px solid var(--light-grey)" }}
          >
            <DummyParagraph
              items={[
                <DummyLine
                  key={2}
                  width="100%"
                  height="var(--line-height-small)"
                  highlightClassName={getHighlightClass(isLineHighlighted(2, highlightLines), showFinal)}
                />,
                <DummyLine
                  key={3}
                  width="72%"
                  height="var(--line-height-small)"
                  highlightClassName={getHighlightClass(isLineHighlighted(3, highlightLines), showFinal)}
                />,
                <DummyLine
                  key={4}
                  width="88%"
                  height="var(--line-height-small)"
                  highlightClassName={getHighlightClass(isLineHighlighted(4, highlightLines), showFinal)}
                />,
              ]}
              gap="var(--gap-small)"
            />
          </div>
          <div
            className="h-full w-1/3 flex flex-col justify-center p-1"
            style={{ borderRight: "1px solid var(--light-grey)" }}
          >
            <DummyParagraph
              items={[
                <DummyLine
                  key={5}
                  width="100%"
                  height="var(--line-height-small)"
                  highlightClassName={getHighlightClass(isLineHighlighted(5, highlightLines), showFinal)}
                />,
                <DummyLine
                  key={6}
                  width="85%"
                  height="var(--line-height-small)"
                  highlightClassName={getHighlightClass(isLineHighlighted(6, highlightLines), showFinal)}
                />,
                <DummyLine
                  key={7}
                  width="92%"
                  height="var(--line-height-small)"
                  highlightClassName={getHighlightClass(isLineHighlighted(7, highlightLines), showFinal)}
                />,
              ]}
              gap="var(--gap-small)"
            />
          </div>
          <div className="h-full w-1/3 flex flex-col justify-center p-1">
            <DummyParagraph
              items={[
                <DummyLine
                  key={8}
                  width="100%"
                  height="var(--line-height-small)"
                  highlightClassName={getHighlightClass(isLineHighlighted(8, highlightLines), showFinal)}
                />,
                <DummyLine
                  key={9}
                  width="68%"
                  height="var(--line-height-small)"
                  highlightClassName={getHighlightClass(isLineHighlighted(9, highlightLines), showFinal)}
                />,
                <DummyLine
                  key={10}
                  width="95%"
                  height="var(--line-height-small)"
                  highlightClassName={getHighlightClass(isLineHighlighted(10, highlightLines), showFinal)}
                />,
              ]}
              gap="var(--gap-small)"
            />
          </div>
        </div>
      </div>
      <DummyParagraph
        items={[
          <DummyLine
            key={11}
            width="100%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(11, highlightLines), showFinal)}
          />,
          <DummyLine
            key={12}
            width="83%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(12, highlightLines), showFinal)}
          />,
        ]}
        gap="var(--gap)"
      />
    </div>
  )
}

function SpreadsheetContent({
  highlightLines,
  showFinal = false,
}: {
  highlightLines?: number[]
  showFinal?: boolean
}) {
  const rows = [
    { firstCellBg: "bg-[var(--light-grey)]", rowBg: "" },
    { firstCellBg: "bg-[var(--light-grey)]", rowBg: "" },
    { firstCellBg: "bg-[var(--light-grey)]", rowBg: "" },
    {
      firstCellBg: "bg-[var(--spreadsheet-green-medium)]",
      rowBg: "bg-[var(--spreadsheet-green-light)]",
    },
    { firstCellBg: "bg-[var(--light-grey)]", rowBg: "" },
    { firstCellBg: "bg-[var(--light-grey)]", rowBg: "" },
    { firstCellBg: "bg-[var(--light-grey)]", rowBg: "" },
    { firstCellBg: "bg-[var(--light-grey)]", rowBg: "" },
    { firstCellBg: "bg-[var(--light-grey)]", rowBg: "" },

    { firstCellBg: "bg-[var(--light-grey)]", rowBg: "" },
    { firstCellBg: "bg-[var(--light-grey)]", rowBg: "" },
  ]

  const numCols = 5 // 1 first cell + 4 regular cells
  const getCellKey = (rowIdx: number, colIdx: number) => rowIdx * numCols + colIdx

  return (
    <div className="h-[40px] w-full grid grid-cols-4 border-t border-r border-l border-[var(--medium-light-grey)]">
      {rows.map((row, rowIdx) => {
        const firstCellKey = getCellKey(rowIdx, 0)
        const isFirstCellHighlighted = isLineHighlighted(firstCellKey, highlightLines)
        const highlightClass = getHighlightClass(isFirstCellHighlighted, showFinal)

        return (
          <div
            key={rowIdx}
            className={`flex flex-row h-2 border-b border-[var(--medium-light-grey)] ${row.rowBg}`}
          >
            <div className={`w-[20%] ${row.firstCellBg} ${highlightClass}`}></div>
            {[...Array(4)].map((_, colIdx) => {
              const cellKey = getCellKey(rowIdx, colIdx + 1)
              const isHighlighted = isLineHighlighted(cellKey, highlightLines)
              const cellHighlightClass = getHighlightClass(isHighlighted, showFinal)

              return (
                <div
                  key={colIdx}
                  className={`w-[20%] border-l border-[var(--medium-light-grey)] ${cellHighlightClass}`}
                ></div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function SpreadsheetContent2({
  highlightLines,
  showFinal = false,
}: {
  highlightLines?: number[]
  showFinal?: boolean
}) {
  const numRows = 9
  const numCols = 4 // 1 first cell + 3 regular cells
  const borderColor = "#E5E7EB" // Explicit color value instead of CSS variable to ensure consistency

  const getCellKey = (rowIdx: number, colIdx: number) => rowIdx * numCols + colIdx

  return (
    <div
      className="h-[36px] w-full grid grid-cols-4"
      style={{
        borderTop: `1px solid ${borderColor}`,
        borderRight: `1px solid ${borderColor}`,
        borderLeft: `1px solid ${borderColor}`,
      }}
    >
      {[...Array(numRows)].map((_, rowIdx) => {
        const firstCellKey = getCellKey(rowIdx, 0)
        const isFirstCellHighlighted = isLineHighlighted(firstCellKey, highlightLines)
        const firstCellHighlightClass = getHighlightClass(isFirstCellHighlighted, showFinal)

        return (
          <div
            key={rowIdx}
            className="flex flex-row h-2"
            style={{
              borderBottom: `1px solid ${borderColor}`,
              ...(rowIdx === 0 ? { background: "var(--light-blue)", opacity: 0.7 } : {}),
            }}
          >
            <div
              className={`w-[25%] ${firstCellHighlightClass}`}
              style={{
                borderRight: `1px solid ${borderColor}`,
                ...(rowIdx === 0
                  ? { background: "var(--light-blue)", opacity: 0.7 }
                  : { background: "var(--chart-color-1)", opacity: 0.6 }),
              }}
            ></div>
            {[...Array(numCols - 1)].map((_, colIdx) => {
              const cellKey = getCellKey(rowIdx, colIdx + 1)
              const isHighlighted = isLineHighlighted(cellKey, highlightLines)
              const cellHighlightClass = getHighlightClass(isHighlighted, showFinal)

              return (
                <div
                  key={colIdx}
                  className={`w-[25%] ${cellHighlightClass}`}
                  style={{
                    ...(colIdx > 0 ? { borderLeft: `1px solid ${borderColor}` } : {}),
                    ...(rowIdx === 0 ? { background: "var(--light-blue)", opacity: 0.7 } : {}),
                  }}
                ></div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function EmailHeader() {
  return (
    <div className="flex flex-row items-center gap-[var(--gap-small)] border-b-[0.5px] border-[var(--light-grey)] pb-[var(--padding)]">
      <MailIcon className="h-3 w-fit text-[var(--dark-grey)]" />
      <DummyParagraph
        items={[
          <DummyLine
            key="line-1"
            width="55%"
            height="var(--line-height-small)"
          />,
          <DummyParagraph
            key="line-2"
            items={[
              <DummyLine
                key="line-2a"
                width="18%"
                height="var(--line-height-small)"
              />,
              <DummyLine
                key="line-2b"
                width="18%"
                height="var(--line-height-small)"
              />,
            ]}
            gap="var(--gap-small)"
            direction="row"
          />,
        ]}
        gap="var(--gap-small)"
        style={{ flex: 1 }}
      />
    </div>
  )
}

function EmailContent({
  highlightLines,
  showFinal = false,
}: {
  highlightLines?: number[]
  showFinal?: boolean
}) {
  return (
    <div className="flex flex-col !h-fit">
      <EmailHeader />

      <DummyParagraph
        items={[
          <DummyLine
            key={0}
            width="14%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(0, highlightLines), showFinal)}
          />,
          <DummyLine
            key={1}
            width="75%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(1, highlightLines), showFinal)}
          />,
          <DummyLine
            key={2}
            width="100%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(2, highlightLines), showFinal)}
          />,
          <DummyLine
            key={3}
            width="91%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(3, highlightLines), showFinal)}
          />,
          <DummyLine
            key={4}
            width="19%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(4, highlightLines), showFinal)}
          />,
        ]}
        gap="var(--gap)"
        style={{ marginTop: "var(--padding)" }}
      />
    </div>
  )
}

function EmailContent2({
  highlightLines,
  showFinal = false,
}: {
  highlightLines?: number[]
  showFinal?: boolean
}) {
  return (
    <div className="flex flex-col !h-fit">
      <EmailHeader />

      <DummyParagraph
        items={[
          <DummyLine
            key={0}
            width="18%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(0, highlightLines), showFinal)}
          />,
          <DummyLine
            key={1}
            width="88%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(1, highlightLines), showFinal)}
          />,
          <DummyLine
            key={2}
            width="100%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(2, highlightLines), showFinal)}
          />,
          <DummyLine
            key={3}
            width="95%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(3, highlightLines), showFinal)}
          />,
          <DummyLine
            key={4}
            width="67%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(4, highlightLines), showFinal)}
          />,
          <DummyLine
            key={5}
            width="23%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(5, highlightLines), showFinal)}
          />,
          <DummyLine
            key={6}
            width="13%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(6, highlightLines), showFinal)}
          />,
        ]}
        gap="var(--gap)"
        style={{ marginTop: "var(--padding)" }}
      />
    </div>
  )
}

function EmailContent3({
  highlightLines,
  showFinal = false,
}: {
  highlightLines?: number[]
  showFinal?: boolean
}) {
  return (
    <div className="flex flex-col !h-fit">
      <EmailHeader />

      <DummyParagraph
        items={[
          <DummyLine
            key={0}
            width="16%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(0, highlightLines), showFinal)}
          />,
          <DummyLine
            key={1}
            width="100%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(1, highlightLines), showFinal)}
          />,
        ]}
        gap="var(--gap)"
        style={{ marginTop: "var(--padding)" }}
      />

      <DummyParagraph
        items={[
          <BulletItem
            key={2}
            lineKey={2}
            lineWidth="65%"
            highlightLines={highlightLines}
            showFinal={showFinal}
          />,
          <BulletItem
            key={3}
            lineKey={3}
            lineWidth="52%"
            highlightLines={highlightLines}
            showFinal={showFinal}
          />,
        ]}
        gap="var(--gap)"
        style={{ marginTop: "var(--gap)" }}
      />
      <DummyParagraph
        items={[
          <DummyLine
            key={4}
            width="16%"
            height="var(--line-height)"
            highlightClassName={getHighlightClass(isLineHighlighted(4, highlightLines), showFinal)}
          />,
        ]}
        gap="var(--gap)"
        style={{ marginTop: "var(--padding)" }}
      />
    </div>
  )
}
