"use client"

import { useState, useRef, useEffect } from "react"
import { RAGPipelineCard } from "@/components/graphics/rag-card"
import { SIDPipelineCard } from "@/components/graphics/sid-pipeline-card"

export function PipelineComparison({
  onActionButtons,
  query,
}: {
  onActionButtons?: (buttons: React.ReactNode) => void;
  query?: string;
}) {
  const [ragButtons, setRagButtons] = useState<React.ReactNode>(null)
  const [sidButtons, setSidButtons] = useState<React.ReactNode>(null)
  const onActionButtonsRef = useRef(onActionButtons)

  // Keep ref in sync with prop
  useEffect(() => {
    onActionButtonsRef.current = onActionButtons
  }, [onActionButtons])

  // Combine buttons from both components and stack vertically
  useEffect(() => {
    if (onActionButtonsRef.current) {
      if (ragButtons || sidButtons) {
        const combinedButtons = (
          <>
            {ragButtons && (
              <>
                <div className="text-xs text-gray-600 mb-1 font-medium">RAG Pipeline</div>
                {ragButtons}
              </>
            )}
            {sidButtons && (
              <>
                <div className="text-xs text-gray-600 mb-1 mt-4 font-medium">SID Pipeline</div>
                {sidButtons}
              </>
            )}
          </>
        )
        onActionButtonsRef.current(combinedButtons)
      } else {
        onActionButtonsRef.current(null)
      }
    }
  }, [ragButtons, sidButtons])

  return (
    <div className="flex flex-col gap-8 items-center w-full">
      <div className="w-full">
        <div className="text-sm font-medium mb-4 text-center text-gray-700">RAG Pipeline</div>
        <RAGPipelineCard query={query} onActionButtons={setRagButtons} />
      </div>
      <div className="w-full">
        <div className="text-sm font-medium mb-4 text-center text-gray-700">SID Pipeline</div>
        <SIDPipelineCard query={query} onActionButtons={setSidButtons} />
      </div>
    </div>
  )
}
