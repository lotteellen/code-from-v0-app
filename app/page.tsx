"use client"

import { useState } from "react"
import { DocumentVariants } from "@/components/completed/document-variants"
import { DatabaseSearchCard } from "@/components/graphics/database-search-card"
import { ChatGPTCard } from "@/components/completed/chatgpt-card"
import { SpreadsheetCard } from "@/components/completed/spreadsheet-card"
import { EmailCard } from "@/components/completed/email-card"
import { DatabaseSearch3DCard } from "@/components/graphics/database-search-3d-card"
import { ReasoningModelCard } from "@/components/graphics/reasoning-model-card"
import { PostRequestCard } from "@/components/graphics/post-request-card"
import { ThinkingPlanCard } from "@/components/graphics/thinking-plan-card"
import { SIDReasoningCard } from "@/components/graphics/sid-reasoning-card"
import { Button } from "@/components/ui/button"

const completedSVGFiles = [
  "pricing-document-bullets.svg",
  "pricing-document-chart.svg",
  "pricing-document-image.svg",
  "pricing-document-simple.svg",
  "pricing-document-table.svg",
  "sheet-spreadsheet.svg",
  "subject-email.svg",
  "chatgpt-interface.svg",
]

const incompleteSVGFiles = [
  "post-request.svg",
  "database-search-3d.svg",
  "database-search.svg",
  "reasoning-model.svg",
  "sid-reasoning.svg",
  "thinking-plan-simple.svg",
]

function getComponentForSvg(file: string): { component: React.ReactNode; width: string } | null {
  const name = file.replace('.svg', '')
  
  if (name === 'post-request') { 
    return { component: <PostRequestCard />, width: "200px" }
  }
  if (name === 'chatgpt-interface') {
    return { component: <ChatGPTCard />, width: "200px" }
  }
  if (name === 'database-search-3d') return { component: <DatabaseSearch3DCard />, width: "200px" }
  if (name === 'database-search') return { component: <DatabaseSearchCard />, width: "200px" }
  if (name === 'reasoning-model') return { component: <ReasoningModelCard />, width: "200px" }

  if (name === 'sid-reasoning') return { component: <SIDReasoningCard />, width: "200px" }
  if (name === 'thinking-plan-simple') return { component: <ThinkingPlanCard />, width: "200px" }
  
  // Document variants

  if (name === 'sheet-spreadsheet') {
    return { component: <SpreadsheetCard />, width: "103px" }
  }

  if (name === 'subject-email') return { component: <EmailCard />, width: "80px" }


  if (name.startsWith('pricing-document-')) {
    const variant = name.replace('pricing-document-', '')
    return { component: <DocumentVariants title={variant} variant={variant} />, width: "80px" }
  }
  
  return null
}

export default function Home() {
  const [selectedSvg, setSelectedSvg] = useState<string | null>(null)
  

  return (
    <main style={{ minHeight: "100vh", background: "white", padding: "32px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        
       {/* Buttons */}
       <div className="flex flex-row gap-2 pb-2">
        {completedSVGFiles.map((file: string) => (
          <Button className="w-[120px] overflow-hidden" key={file} onClick={() => setSelectedSvg(file)}>
            {file}
          </Button>
        ))}
       </div>

       <div className="flex flex-row gap-2">
        {incompleteSVGFiles.map((file: string) => (
          <Button className="w-[120px] overflow-hidden" key={file} onClick={() => setSelectedSvg(file)}>
            {file}
            </Button>
          ))}
       </div>

       <div className="flex flex-row gap-4 mt-8 items-center justify-center">
        {/* the image */}
        
      
       
       {/* the svg  */}
        <div className="h-[130px]">
          {selectedSvg && (
            <img 
              src={`/svg/${selectedSvg}`} 
              alt={selectedSvg} 
              style={{ width: "auto", height: "100%" }}
            />
            
          )}


        </div>
        <div className="h-[130px]">
          {selectedSvg && (
            <>
              <img 
                src={`/pictures/${selectedSvg.replace('.svg', '.png')}`} 
                alt={selectedSvg || "no image"} 
                style={{ width: "auto", height: "100%" }} 
              />
              {/* if table or chatgpt then show second image */}
              {selectedSvg.includes("table") || selectedSvg.includes("chatgpt") && (
                <div className="flex flex-row gap-4 mt-4">
                  <div className="h-[110px]">
                    <img 
                      src={`/pictures/${selectedSvg.replace('.svg', '2.png')}`} 
                      alt={selectedSvg || "no image"} 
                      style={{ width: "auto", height: "100%" }} 
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {selectedSvg && (() => {
          const result = getComponentForSvg(selectedSvg)
          if (!result) return null
          return (
            <div className="flex flex-col gap-4 items-center justify-center">
              <div style={{ width: result.width }}>
                {result.component}
              </div>
              {/* if chart then do chart 1 and chart 2 */}
              {selectedSvg.includes("chart") && (
                <div style={{ width: "80px" }}>
                  <DocumentVariants title="chart" variant="chart2" />
                </div>
              )}
              {/* if search then show also document and chatgpt */}
              {selectedSvg.includes("search") && (
                <>
                  <div style={{ width: "80px" }}>
                    <DocumentVariants title="pricing.pdf" variant="bullets" />
                  </div>
                  <div style={{ width: "200px" }}>
                    <ChatGPTCard />
                  </div>
                </>
              )}
            </div>
          )
        })()}
      </div>
      </div>
    </main>
  )
}

