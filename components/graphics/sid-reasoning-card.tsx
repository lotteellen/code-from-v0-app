export function SIDReasoningCard() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      <div
        style={{
          position: "relative",
          aspectRatio: "3/5",
          borderRadius: "32px",
          border: "1px solid #E5E7EB",
          background: "white",
          padding: "48px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          overflow: "auto",
        }}
      >
        <h2 style={{ marginBottom: "24px", fontSize: "24px", fontWeight: "400", color: "#6B7280" }}>SID</h2>

        <div style={{ marginBottom: "24px", borderBottom: "1px solid #E5E7EB", paddingBottom: "24px" }}>
          <h3 style={{ marginBottom: "12px", fontSize: "24px", fontWeight: "600", color: "#111827" }}>Thinking</h3>
          <div style={{ borderRadius: "8px", background: "#F3F4F6", padding: "12px" }}>
            <div style={{ height: "10px", width: "33%", borderRadius: "999px", background: "#D1D5DB" }} />
          </div>
        </div>

        <h3 style={{ marginBottom: "20px", fontSize: "24px", fontWeight: "600", color: "#374151" }}>Plan</h3>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "999px",
                background: "#10B981",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M 3 9 L 7 13 L 15 5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span style={{ fontSize: "16px", color: "#374151" }}>Seercliov calls there</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "999px",
                background: "#10B981",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M 3 9 L 7 13 L 15 5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span style={{ fontSize: "16px", color: "#374151" }}>Searcheryalls there</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "999px",
                background: "#10B981",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M 3 9 L 7 13 L 15 5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span style={{ fontSize: "16px", color: "#374151" }}>Answer there</span>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: "24px" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "24px", fontWeight: "600", color: "#374151" }}>Answer</h3>
          <div style={{ marginBottom: "12px", borderRadius: "8px", background: "#F3F4F6", padding: "12px" }}>
            <div style={{ height: "10px", width: "100%", borderRadius: "999px", background: "#D1D5DB" }} />
          </div>
          <div style={{ borderRadius: "8px", background: "#F3F4F6", padding: "12px" }}>
            <div style={{ height: "10px", width: "66%", borderRadius: "999px", background: "#D1D5DB" }} />
          </div>
        </div>
      </div>
    </div>
  )
}

