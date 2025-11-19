import React from "react"
import "./globals.css"

export function BrowserWindow({
  title,
  content,
  menu = true,
  fitContent = false,
  pulsate = false,
}: {
  title?: string
  content?: React.ReactNode
  menu?: boolean
  fitContent?: boolean
  pulsate?: boolean
}) {
  return (
    <div
      className={`document-outer ${fitContent ? "h-fit" : "h-[150px]"} ${pulsate ? "browser-window-pulsate" : ""}`}
    >
      <div className="styling-outer document">
        <div className="h-full overflow-hidden flex flex-col">
          <div className="w-full h-auto relative">
            {menu && (
              <div className="absolute top-0 left-0 h-[7px] flex flex-row gap-0.5 items-center justify-start">
                <div className="w-[var(--traffic-light-size)] h-[var(--traffic-light-size)] rounded-full bg-[var(--traffic-light-red)]" />
                <div className="w-[var(--traffic-light-size)] h-[var(--traffic-light-size)] rounded-full bg-[var(--traffic-light-yellow)]" />
                <div className="w-[var(--traffic-light-size)] h-[var(--traffic-light-size)] rounded-full bg-[var(--traffic-light-green)]" />
              </div>
            )}
            {title && (
              <div className="w-fit mx-auto styling-title !pb-[var(--padding)]">{title}</div>
            )}
          </div>
          {content && (
            <div className="document-content flex flex-col grow overflow-hidden" style={{ minHeight: 0 }}>
              {content}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
