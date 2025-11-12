import React from "react"
import { BrowserWindow } from "./helpers/browser-window"

export function ThinkingPlanCard() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      <BrowserWindow
        title="Thinking..."
        menu={false}
        content={
          <>
            <h3 style={{ marginBottom: "32px", fontSize: "24px", fontWeight: "600", color: "#374151" }}>Plan</h3>

            <div>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "8px",
                      border: "2px solid #D1D5DB",
                      background: "white",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M 4 10 L 8 14 L 16 6"
                        stroke="#9CA3AF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div style={{ height: "10px", flex: 1, borderRadius: "999px", background: "#E5E7EB" }} />
                </div>
              ))}
            </div>
          </>
        }
      />
    </div>
  )
}

