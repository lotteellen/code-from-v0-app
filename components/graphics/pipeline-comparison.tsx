"use client"

import { RAGPipelineCard } from "@/components/graphics/rag-card"
import { SIDPipelineCard } from "@/components/graphics/sid-pipeline-card"

export function PipelineComparison({
  query,
}: {
  query?: string
}) {
  return (
    <div className="flex flex-col gap-8 items-center w-full">
      <div className="w-full">
        <RAGPipelineCard query={query} />
      </div>
      <div className="w-full">
        <SIDPipelineCard query={query} />
      </div>
    </div>
  )
}
