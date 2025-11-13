import { useState, useEffect } from "react"
import { DummyLine, DummyParagraph } from "./helpers/dummy-helpers"
import { Document } from "./helpers/document"
import { Button } from "@/components/ui/button"
import "../graphics/helpers/globals.css"



export function DocumentVariants({title = "Document", variant, highlightDummy , baby = false}: { title?: string; variant: string; highlightDummy?: boolean; baby?: boolean}) {
  const [internalHighlightDummyKey, setInternalHighlightDummyKey] = useState(0)
  const [internalShouldHighlight, setInternalShouldHighlight] = useState(false)

  // Reset highlight when variant changes
  useEffect(() => {
    setInternalShouldHighlight(false)
    setInternalHighlightDummyKey(0)
  }, [variant])

  const handleHighlightClick = () => {
    if (variant === "simple") {
      setInternalShouldHighlight(false) // Reset first
      setInternalHighlightDummyKey(prev => prev + 1) // Increment key to force re-render
      // Then trigger highlight after a brief delay to ensure re-render happens first
      setTimeout(() => {
        setInternalShouldHighlight(true)
      }, 10)
    }
  }
  
    const getContent = (): React.ReactNode => {
      if (variant === "table") return <TableContent />
      if (variant === "chart") return <ChartContent1 />
      if (variant === "chart2") return <ChartContent2 />
      if (variant === "bullets") return <BulletsContent />
      if (variant === "image") return <ImageContent />
      if (variant === "simple") return <SimpleContent key={`simple-${internalHighlightDummyKey}`} highlightDummy={internalShouldHighlight} />
    }
    
    const documentContent = (
        <Document title={baby ? "baby.pdf" : variant+".pdf"} content={getContent()} />
    )
    
    // Apply baby scaling to any variant if baby is true
    if (baby) {
      return (
        <div className="flex flex-col gap-2 items-center justify-center">
          <div style={{ transform: "scale(0.75)", transformOrigin: "center" }}>
          {documentContent}
          </div>
        </div>
      )
    }
    
    return documentContent
}




function SimpleContent({ highlightDummy }: { highlightDummy?: boolean }) {
  return (
    <div>
      <DummyParagraph
        items={[
          <DummyLine width="91%" height="var(--line-height)"/>,
          <DummyLine width="100%" height="var(--line-height)" highlight={highlightDummy}/>,
          <DummyLine width="75%" height="var(--line-height)"/>,
        ]}
        gap="var(--gap)"
      />
        <DummyParagraph
          items={[
            <DummyLine width="82%" height="var(--line-height)"/>,
            <DummyLine width="100%" height="var(--line-height)"/>,
            <DummyLine width="86%" height="var(--line-height)"/>,
            <DummyLine width="74%" height="var(--line-height)"/>,
          ]}
          gap="var(--gap)"
        />
      </div>
  )
}

function BulletsContent() {
  return (
    <div>
       <DummyParagraph
          items={[
            <DummyLine width="65%" height="var(--line-height)"/>,
            <DummyLine width="100%" height="var(--line-height)"/>,
            <DummyLine width="94%" height="var(--line-height)"/>,
          ]}
          gap="var(--gap)"
        />
      <DummyParagraph
        items={[
          <DummyLine width="66%" height="var(--line-height)" />,
          <DummyParagraph
            items={[
              <div style={{ width: "var(--circle-size)", height: "var(--circle-size)", borderRadius: "999px", background: "var(--medium-grey)", flexShrink: 0 }} />,
              <DummyLine width="100%" height="var(--line-height)" />,
            ]}
            direction="row"
            alignItems="center"
            gap="var(--gap)"
          />,
          <DummyParagraph
            items={[
              <div style={{ width: "var(--circle-size)", height: "var(--circle-size)", borderRadius: "999px", background: "var(--medium-grey)", flexShrink: 0 }} />,
              <DummyLine width="83%" height="var(--line-height)" />,
            ]}
            direction="row"
            alignItems="center"
            gap="var(--gap)"
          />
        ]}
        gap="var(--gap)"
      />
    </div>
  )
}

function ImageContent() {
  return (
    <div>
      <DummyParagraph
        items={[
          <DummyLine width="100%" height="var(--line-height)" />,
          <DummyLine width="91%" height="var(--line-height)" />,
          <DummyLine width="91%" height="var(--line-height)" />,
          <DummyLine width="100%" height="var(--line-height)" />
        ]}
        gap="var(--gap)"
      />
      <DummyParagraph
        items={[
          <div style={{ width: "40%", height: "18px", borderRadius: "var(--image-radius)", background: "var(--medium-light-grey)", flexShrink: 0 }} />,
          <DummyLine width="40%" height="var(--line-height-small)" />,

        ]}
        gap="var(--gap-small)"
        alignItems="center"
      />
       
    </div>
  )
}

function ChartContent1() {
  return (
    <div>
      <DummyParagraph
        items={[
          <DummyLine width="83%" height="var(--line-height)" />,
          <DummyLine width="100%" height="var(--line-height)" />
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
        <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 400 200" preserveAspectRatio="none">
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
      <DummyLine width="100%" height="var(--line-height)" />
    </div>
  )
}

function ChartContent2() {
  return (
    <div>
      <DummyParagraph
        items={[
          <DummyLine width="91%" height="var(--line-height)" />,
          <DummyLine width="100%" height="var(--line-height)" />,
          <DummyLine width="75%" height="var(--line-height)" />,
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
        <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 400 200" preserveAspectRatio="none">
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


function TableContent() {
  return (
    <div>
      <DummyParagraph
        items={[
          <DummyLine width="100%" height="var(--line-height)" />,
          <DummyLine width="85%" height="var(--line-height)" />,
          <DummyLine width="91%" height="var(--line-height)" />,
        ]}
        gap="var(--gap)"
      />
      <div className="flex flex-col gap-0" style={{ width: "100%", borderRadius: "var(--image-radius)", border: "1px solid var(--light-grey)", flexShrink: 0 }}>
        <div className="h-full" style={{ width: "100%", height: "4px", background: "var(--light-grey)", flexShrink: 0 }} />
        <div className="flex flex-row gap-0" style={{ height: "fit-content"}}>
          <div className="h-full w-3/4 flex flex-col justify-center p-1" style={{ borderRight: "1px solid var(--light-grey)"}}>
            <DummyParagraph
              items={[
                <DummyLine width="100%" height="var(--line-height-small)" />,
                <DummyLine width="93%" height="var(--line-height-small)" />,
                <DummyLine width="81%" height="var(--line-height-small)" />,
                <DummyLine width="100%" height="var(--line-height-small)" />,

              ]}
              gap="var(--gap-small)"
            />
          </div>
          <div className="h-full w-1/3 flex flex-col justify-center p-1">
            <DummyParagraph
              items={[
                <DummyLine width="100%" height="var(--line-height-small)" />,
                <DummyLine width="65%" height="var(--line-height-small)" />,
                <DummyLine width="100%" height="var(--line-height-small)" />,
                <DummyLine width="80%" height="var(--line-height-small)" />,
              ]}
              gap="var(--gap-small)"
            />
          </div>
        </div>  
      </div>
    </div>
  )}
