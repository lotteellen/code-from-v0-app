import React from "react"
import "./globals.css"

// overwrite vertial padding to padding

export function BrowserWindow({ title, content, menu = true, fitContent = false, pulsate = false}: { title?: string; content?: React.ReactNode; menu?: boolean; fitContent?: boolean; pulsate?: boolean }) {
  const heightClass = fitContent ? "h-fit" : "h-[150px]"
  return (
    <div className={`document-outer ${heightClass} ${pulsate ? 'browser-window-pulsate' : ''}`}>
        <div className="styling-outer document">
          <div className="h-full overflow-hidden flex flex-col">
          
          <div className="w-full h-auto relative">
            {menu && (
              <div className="absolute top-0 left-0">
            <div className="h-[7px] flex flex-row gap-0.5 items-center justify-start">
              <div className="w-[var(--traffic-light-size)] h-[var(--traffic-light-size)] rounded-full bg-[var(--traffic-light-red)]" />
              <div className="w-[var(--traffic-light-size)] h-[var(--traffic-light-size)] rounded-full bg-[var(--traffic-light-yellow)]" />
              <div className="w-[var(--traffic-light-size)] h-[var(--traffic-light-size)] rounded-full bg-[var(--traffic-light-green)]" />
            </div>
            </div>
            )}
            <div className="w-fit mx-auto styling-title !p-bottom-[var(--padding)]">{title}</div>
            </div>
        

            {content && (
              <div 
                className="document-content flex flex-col grow overflow-hidden]"
                style={{ minHeight: 0 }}
              >
                {content}
              </div>
            )}
          </div>
        </div>
      </div>
  )
}


// import React from "react"
// import {LIGHT_GREY, BACKGROUND_WHITE, SHADOW, BORDER_RADIUS } from "./document"

// const TRAFFIC_LIGHT_SIZE = "3px"

// interface BrowserWindowProps {
//   title?: React.ReactNode
//   children?: React.ReactNode
// }


// export function BrowserWindow({ title, children }: BrowserWindowProps) {
//   return (
//     <div
//       style={{
//         borderRadius: BORDER_RADIUS,
//         border: `1px solid ${LIGHT_GREY}`,
//         background: BACKGROUND_WHITE,
//         padding: "24px",
//         boxShadow: SHADOW,
//       }}
//     >
//       <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
//        
//         {title}
//       </div>
//       {children}
//     </div>
//   )
// }


