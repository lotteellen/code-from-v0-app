import { DummyLine, DummyParagraph } from "./helpers/dummy-helpers";

export function DatabaseSearch3DCard() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      <div
        style={{
          position: "relative",
          aspectRatio: "4/5",
          borderRadius: "32px",
          border: "1px solid #E5E7EB",
          background: "white",
          padding: "64px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ marginBottom: "40px", display: "flex", justifyContent: "center" }}>
          <svg width="100" height="140" viewBox="0 0 100 140" fill="none">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="100%" stopColor="#F3F4F6" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F3F4F6" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#FAFAFA" stopOpacity="0" />
                <stop offset="100%" stopColor="#E5E7EB" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            {/* Top ellipse */}
            <ellipse cx="50" cy="38.3" rx="15.6" ry="9.6" fill="white" stroke="#D1D5DB" strokeWidth="2" />
            <ellipse cx="50" cy="38.3" rx="15.6" ry="9.6" fill="url(#grad1)" />
            {/* Cylinder body */}
            <rect x="34.7" y="38.3" width="30.6" height="38.7" fill="white" stroke="#D1D5DB" strokeWidth="2" />
            <rect x="34.7" y="38.3" width="30.6" height="38.7" fill="url(#grad2)" />
            {/* Horizontal dividers */}
            <ellipse cx="50" cy="47.9" rx="15.6" ry="9.6" fill="none" stroke="#E5E7EB" strokeWidth="2" />
            <ellipse cx="50" cy="57.6" rx="15.6" ry="9.6" fill="none" stroke="#E5E7EB" strokeWidth="2" />
            {/* Bottom ellipse */}
            <ellipse cx="50" cy="67.2" rx="15.6" ry="9.6" fill="white" stroke="#D1D5DB" strokeWidth="2" />
            <ellipse cx="50" cy="67.2" rx="15.6" ry="9.6" fill="url(#grad1)" />
          </svg>
        </div>

        <div
          style={{
            borderRadius: "999px",
            border: "1px solid #E5E7EB",
            background: "white",
            padding: "20px 24px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="12" cy="12" r="8" stroke="#9CA3AF" strokeWidth="2.5" fill="none" />
              <line x1="18" y1="18" x2="24" y2="24" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: "24px", color: "#9CA3AF" }}>Search</span>
          </div>
        </div>

        <DummyParagraph
          items={[
            <DummyLine width="100%" height="var(--line-height)" />,
            <DummyLine width="100%" height="var(--line-height)" />,
          ]}
          gap="var(--gap)"
        />
      </div>
    </div>
  )
}

