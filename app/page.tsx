"use client"

import { useState, useEffect } from "react"
import { DocumentVariants } from "@/components/graphics/document-variants"
import { DatabaseSearchCard } from "@/components/graphics/database-search-card"
import { ChatGPTCard } from "@/components/graphics/chatgpt-card"
import { SpreadsheetCard } from "@/components/graphics/spreadsheet-card"
import { EmailCard } from "@/components/graphics/email-card"
import { ReasoningModelCard } from "@/components/graphics/reasoning-model-card"
import { PostRequestCard } from "@/components/graphics/post-request-card"
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
  "database-search.svg",
]

const incompleteSVGFiles = [
  "post-request.svg",
  "reasoning-model.svg",
]

export default function Home() {
  const [selectedSvg, setSelectedSvg] = useState<string | null>(null)
  const [highlightDummyKey, setHighlightDummyKey] = useState(0)
  const [shouldHighlight, setShouldHighlight] = useState(false)

  const getComponentForSvg = (file: string): { component: React.ReactNode; width: string } | null => {
    const name = file.replace('.svg', '')
    
    if (name === 'sheet-spreadsheet') return { component: <SpreadsheetCard />, width: "103px" }
    if (name === 'subject-email') return { component: <EmailCard />, width: "80px" }
    if (name.startsWith('pricing-document-')) {
      const variant = name.replace('pricing-document-', '')
      return { component: <DocumentVariants key={variant === "simple" ? `simple-${highlightDummyKey}` : undefined} title={variant} variant={variant} highlightDummy={variant === "simple" && shouldHighlight} />, width: "80px" }
    }
    
    if (name === 'chatgpt-interface') return { component: <ChatGPTCard />, width: "200px" }
    if (name === 'database-search') return { component: <DatabaseSearchCard />, width: "200px" }


    if (name === 'reasoning-model') return { component: <ReasoningModelCard />, width: "200px" }
    if (name === 'post-request') return { component: <PostRequestCard />, width: "200px" }


    return null
  }
  
  // Syntax highlighting colors (same as post-request-card)
  const keywordColor = "#C586C0" // Purple - const, await
  const variableColor = "#24292e" // Dark gray/black - completion, AI, context, message
  const functionColor = "#DCDCAA" // Yellow - create
  const propertyColor = "#9CDCFE" // Light blue - chat, completions, model, messages, role, content
  const stringColor = "#CE9178" // Orange/green - 'model', 'user', template literal backticks
  const punctuationColor = "#808080" // Gray - {}, [], :, ,, .
  
  // Reset highlight when SVG selection changes
  useEffect(() => {
    setShouldHighlight(false)
    setHighlightDummyKey(0)
  }, [selectedSvg])

  const handleHighlightClick = () => {
    // Only trigger if simple document is selected
    if (selectedSvg?.includes("pricing-document-simple")) {
      setShouldHighlight(false) // Reset first
      setHighlightDummyKey(prev => prev + 1) // Increment key to force re-render
      // Then trigger highlight after a brief delay to ensure re-render happens first
      setTimeout(() => {
        setShouldHighlight(true)
      }, 10)
    }
  }

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

       {/* Highlight animation button */}
       <div className="flex flex-row gap-2 mt-2">
         <Button onClick={handleHighlightClick}>
           Highlight Dummy
         </Button>
        
       </div> 

       <div className="flex flex-row gap-4 mt-8 items-center justify-center">
        {/* the image */}
        
      
       
       {/* the svg  */}
        <div className={selectedSvg === "reasoning-model.svg" ? "flex flex-col gap-4" : "flex flex-col gap-4 h-[130px]"}>
          {selectedSvg && (
            <img 
              src={`/svg/${selectedSvg}`} 
              alt={selectedSvg} 
              style={{ 
                width: "auto", 
                height: selectedSvg === "reasoning-model.svg" ? "auto" : "100%",
                maxWidth: selectedSvg === "reasoning-model.svg" ? "150px" : "none"
              }}
            />
          )}
          {/* if reasoning model then show the reasoning model card 2 and 3 */}
          {selectedSvg === "reasoning-model.svg" && (
            <div className="flex flex-col gap-4">
              <img 
                src={`/svg/reasoning-model2.svg`} 
                alt="reasoning-model2" 
                style={{ width: "auto", height: "auto", maxWidth: "150px" }}
              />
              <img 
                src={`/svg/reasoning-model3.svg`} 
                alt="reasoning-model3" 
                style={{ width: "auto", height: "auto", maxWidth: "150px" }}
              />
            </div>
          )}  


        </div>
        <div className={selectedSvg && (selectedSvg.includes("reasoning") || selectedSvg.includes("post-request")) ? "flex flex-col gap-4" : "flex flex-col gap-4 h-[130px]"}>
          {selectedSvg && (
            <>
              <img 
                src={`/pictures/${selectedSvg.replace('.svg', '.png')}`} 
                alt={selectedSvg || "no image"} 
                style={{ 
                  width: "auto", 
                  height: (selectedSvg.includes("reasoning") || selectedSvg.includes("post-request")) ? "auto" : "100%",
                  maxWidth: (selectedSvg.includes("reasoning") || selectedSvg.includes("post-request")) ? "150px" : "none"
                }} 
              />
              {/* if table then show second image */}
              {selectedSvg.includes("table") && (
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
              {/* if reasoning model then show images 2, 3, and 4 */}
              {selectedSvg.includes("reasoning") && (
                <div className="flex flex-col gap-4">
                  <img 
                    src={`/pictures/reasoning-model2.png`} 
                    alt="reasoning-model2" 
                    style={{ width: "auto", height: "auto", maxWidth: "150px" }} 
                  />
                  <img 
                    src={`/pictures/reasoning-model3.png`} 
                    alt="reasoning-model3" 
                    style={{ width: "auto", height: "auto", maxWidth: "150px" }} 
                  />
                  <img 
                    src={`/pictures/reasoning-model4.png`} 
                    alt="reasoning-model4" 
                    style={{ width: "auto", height: "auto", maxWidth: "150px" }} 
                  />
                </div>
              )}
              {/* if post request then show api request image */}
              {selectedSvg.includes("post-request") && (
                <div className="flex flex-col gap-4">
                  <img 
                    src={`/pictures/api request.png`} 
                    alt="api request" 
                    style={{ width: "auto", height: "auto", maxWidth: "150px" }} 
                  />
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
              {/* If database then also dark mode and light mode */}
              {selectedSvg.includes("database") && (
                <>
                  <div style={{ width: "200px" }}>
                    <DatabaseSearchCard darkMode={true} />
                  </div>
               
                 <div style={{ width: "200px" }}>
                   <DatabaseSearchCard filled={true} middle={true} />
                 </div>
               </>
              )}
              {/* if search then show also document and chatgpt */}
              {selectedSvg.includes("search") && (
                <>
                  <div style={{ width: "80px" }}>
                    <DocumentVariants title="pricing.pdf" variant="bullets" />
                  </div>
                  
                </>
              )}
              {selectedSvg.includes("reasoning") && (
                <>
                  <div style={{ width: "200px" }}>
                    <ChatGPTCard />
                  </div>
                  
                </>
              )}
              {/* if post request then show code */}
              {selectedSvg.includes("post-request") && (
                <>
                  <div style={{ width: "200px" }}>
                    <PostRequestCard showContext={true} />
                  </div>
                  <div
                    style={{
                      fontFamily: "'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace",
                      fontSize: "12px",
                      lineHeight: "1.6",
                      padding: "16px",
                      borderRadius: "8px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #e1e4e8",
                      maxWidth: "500px",
                      overflow: "auto",
                      color: "#24292e",
                    }}
                  >
                    <pre style={{ margin: 0, whiteSpace: "pre", wordBreak: "normal" }}>
                      <code>
                        <span style={{ color: keywordColor }}>const</span>{" "}
                        <span style={{ color: variableColor }}>completion</span>{" "}
                        <span style={{ color: punctuationColor }}>=</span>{" "}
                        <span style={{ color: keywordColor }}>await</span>{" "}
                        <span style={{ color: variableColor }}>AI</span>
                        <span style={{ color: punctuationColor }}>.</span>
                        <span style={{ color: propertyColor }}>chat</span>
                        <span style={{ color: punctuationColor }}>.</span>
                        <span style={{ color: propertyColor }}>completions</span>
                        <span style={{ color: punctuationColor }}>.</span>
                        <span style={{ color: functionColor }}>create</span>
                        <span style={{ color: punctuationColor }}>(</span>
                        <span style={{ color: punctuationColor }}>{"{"}</span>
                        {"\n  "}
                        <span style={{ color: propertyColor }}>model</span>
                        <span style={{ color: punctuationColor }}>: </span>
                        <span style={{ color: stringColor }}>'model'</span>
                        <span style={{ color: punctuationColor }}>,</span>
                        {"\n  "}
                        <span style={{ color: propertyColor }}>messages</span>
                        <span style={{ color: punctuationColor }}>: [</span>
                        {"\n    "}
                        <span style={{ color: punctuationColor }}>{"{"}</span>
                        {"\n      "}
                        <span style={{ color: propertyColor }}>role</span>
                        <span style={{ color: punctuationColor }}>: </span>
                        <span style={{ color: stringColor }}>'user'</span>
                        <span style={{ color: punctuationColor }}>,</span>
                        {"\n      "}
                        <span style={{ color: propertyColor }}>content</span>
                        <span style={{ color: punctuationColor }}>: </span>
                        <span style={{ color: stringColor }}>{"`"}</span>
                        <span style={{ color: stringColor }}>{"${"}</span>
                        <span style={{ color: variableColor }}>context</span>
                        <span style={{ color: stringColor }}>{"}"}</span>
                        <span style={{ color: stringColor }}>{"\\n\\n"}</span>
                        <span style={{ color: stringColor }}>{"${"}</span>
                        <span style={{ color: variableColor }}>message</span>
                        <span style={{ color: stringColor }}>{"}"}</span>
                        <span style={{ color: stringColor }}>{"`"}</span>
                        {"\n    "}
                        <span style={{ color: punctuationColor }}>{"}"}</span>
                        {"\n  "}
                        <span style={{ color: punctuationColor }}>]</span>
                        {"\n"}
                        <span style={{ color: punctuationColor }}>{"}"}</span>
                        <span style={{ color: punctuationColor }}>);</span>
                      </code>
                    </pre>
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

