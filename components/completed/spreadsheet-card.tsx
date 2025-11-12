import { Document } from "../graphics/helpers/document"
import "../graphics/helpers/globals.css"

export function SpreadsheetCard() {
  const rows = [
    { firstCellBg: "bg-[var(--very-light-grey)]", rowBg: "" },
    { firstCellBg: "bg-[var(--very-light-grey)]", rowBg: "" },
    { firstCellBg: "bg-[var(--very-light-grey)]", rowBg: "" },
    { firstCellBg: "bg-green-300", rowBg: "bg-green-200" },
    { firstCellBg: "bg-[var(--very-light-grey)]", rowBg: "" },
  ]

  const content = (
    <div className="h-[40px] w-full grid grid-cols-4 border-t border-r border-l border-[var(--light-grey)]">
      {rows.map((row, idx) => (
        <div
          key={idx}
          className={`flex flex-row h-2 border-b border-[var(--light-grey)] ${row.rowBg}`}
        >
          <div className={`w-[20%] ${row.firstCellBg}`}></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-[20%] border-l border-[var(--light-grey)]"></div>
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <Document title="Sheet1" content={content} verticalPadding={false} aspectRatio="no-aspect-ratio" />
  )
}


