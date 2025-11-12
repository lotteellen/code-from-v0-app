import React from "react"
import { BrowserWindow } from "./helpers/browser-window"

export function ReasoningModelCard() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      <BrowserWindow
        title="Reasoning Model"
        menu={false}
        content={
          <>
            <div style={{ marginBottom: "24px", borderBottom: "1px solid #E5E7EB", paddingBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <h3 style={{ fontSize: "30px", fontWeight: "600", color: "#111827" }}>Thinking...</h3>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "2px solid #3B82F6",
                    borderTopColor: "transparent",
                    borderRadius: "999px",
                    animation: "spin 1s linear infinite",
                  }}
                />
              </div>
            </div>

            <h3 style={{ marginBottom: "24px", fontSize: "24px", fontWeight: "600", color: "#374151" }}>Plan</h3>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "16px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "999px",
                    background: "#10B981",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path
                      d="M 4 11 L 9 16 L 18 7"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div style={{ flex: 1, paddingTop: "8px" }}>
                  <div
                    style={{
                      height: "10px",
                      width: "100%",
                      borderRadius: "999px",
                      background: "#E5E7EB",
                      marginBottom: "8px",
                    }}
                  />
                  <div style={{ height: "10px", width: "91%", borderRadius: "999px", background: "#E5E7EB" }} />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "16px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "999px",
                    background: "#10B981",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path
                      d="M 4 11 L 9 16 L 18 7"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div style={{ flex: 1, paddingTop: "8px" }}>
                  <div
                    style={{
                      height: "10px",
                      width: "100%",
                      borderRadius: "999px",
                      background: "#E5E7EB",
                      marginBottom: "8px",
                    }}
                  />
                  <div style={{ height: "10px", width: "100%", borderRadius: "999px", background: "#E5E7EB" }} />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "4px", marginBottom: "12px" }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <ellipse cx="18" cy="10" rx="10" ry="4" fill="#D1D5DB" />
                  <path
                    d="M 8 10 L 8 22 Q 8 26 18 26 Q 28 26 28 22 L 28 10"
                    fill="#E5E7EB"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                  />
                  <ellipse cx="18" cy="16" rx="10" ry="1" fill="none" stroke="#9CA3AF" strokeWidth="1.5" />
                </svg>
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <path d="M 4 4 L 18 4 L 22 8 L 22 22 L 4 22 Z" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1.5" />
                  <path d="M 18 4 L 18 8 L 22 8" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
                </svg>
                <span style={{ fontSize: "16px", color: "#9CA3AF" }}>Retrieval call</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "4px" }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <ellipse cx="18" cy="10" rx="10" ry="4" fill="#D1D5DB" />
                  <path
                    d="M 8 10 L 8 22 Q 8 26 18 26 Q 28 26 28 22 L 28 10"
                    fill="#E5E7EB"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                  />
                  <ellipse cx="18" cy="16" rx="10" ry="1" fill="none" stroke="#9CA3AF" strokeWidth="1.5" />
                </svg>
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <path d="M 4 4 L 18 4 L 22 8 L 22 22 L 4 22 Z" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1.5" />
                  <path d="M 18 4 L 18 8 L 22 8" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
                </svg>
                <span style={{ fontSize: "16px", color: "#9CA3AF" }}>Retrieval call</span>
              </div>
            </div>

            <div
              style={{
                marginTop: "32px",
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                background: "white",
                padding: "16px",
              }}
            >
              <div style={{ height: "48px", width: "100%", borderRadius: "8px", background: "#F9FAFB" }} />
            </div>
          </>
        }
      />
    </div>
  )
}

