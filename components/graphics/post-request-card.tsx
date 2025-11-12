import { BrowserWindow } from "./helpers/browser-window"

export function PostRequestCard() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      <div
        style={{
          position: "relative",
          aspectRatio: "3/4",
          borderRadius: "32px",
          border: "1px solid #E5E7EB",
          background: "white",
          padding: "48px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ marginBottom: "32px", display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: "112px",
              height: "112px",
              borderRadius: "999px",
              background: "#E5E7EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "36px", fontWeight: "bold", color: "#6B7280" }}>AI</span>
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <BrowserWindow title="POST request">
            <div style={{ marginBottom: "16px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <span style={{ fontSize: "16px", color: "#4B5563" }}>fetch</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: "10px",
                    width: "100%",
                    borderRadius: "999px",
                    background: "#BFDBFE",
                    marginBottom: "8px",
                  }}
                />
                <div
                  style={{
                    height: "10px",
                    width: "75%",
                    borderRadius: "999px",
                    background: "#BFDBFE",
                    marginBottom: "8px",
                  }}
                />
                <div
                  style={{
                    height: "10px",
                    width: "50%",
                    borderRadius: "999px",
                    background: "#BFDBFE",
                    marginBottom: "8px",
                  }}
                />
                <div style={{ height: "10px", width: "33%", borderRadius: "999px", background: "#BFDBFE" }} />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="16" stroke="#D1D5DB" strokeWidth="2" strokeDasharray="12 6">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 20 20"
                    to="360 20 20"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </div>
          </BrowserWindow>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <div
            style={{
              flex: 1,
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              background: "white",
              padding: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#4B5563" }}>
              pricing.pdf
            </div>
            <div
              style={{
                height: "6px",
                width: "100%",
                borderRadius: "999px",
                background: "#E5E7EB",
                marginBottom: "6px",
              }}
            />
            <div
              style={{ height: "6px", width: "75%", borderRadius: "999px", background: "#E5E7EB", marginBottom: "6px" }}
            />
            <div style={{ height: "6px", width: "66%", borderRadius: "999px", background: "#E5E7EB" }} />
          </div>
          <div
            style={{
              flex: 1,
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              background: "white",
              padding: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#9CA3AF" }}>pac...</div>
            <div
              style={{
                height: "6px",
                width: "100%",
                borderRadius: "999px",
                background: "#E5E7EB",
                marginBottom: "6px",
              }}
            />
            <div
              style={{ height: "6px", width: "75%", borderRadius: "999px", background: "#E5E7EB", marginBottom: "6px" }}
            />
            <div style={{ height: "6px", width: "50%", borderRadius: "999px", background: "#E5E7EB" }} />
          </div>
        </div>
      </div>
    </div>
  )
}

