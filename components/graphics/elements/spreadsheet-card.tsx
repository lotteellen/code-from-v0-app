import { Document } from "../helpers/document"
import "../helpers/globals.css"

export function SpreadsheetCard() {
  const rows = [
    { firstCellBg: "bg-[var(--light-grey)]", rowBg: "" },
    { firstCellBg: "bg-[var(--light-grey)]", rowBg: "" },
    { firstCellBg: "bg-[var(--light-grey)]", rowBg: "" },
    { firstCellBg: "bg-[var(--spreadsheet-green-medium)]", rowBg: "bg-[var(--spreadsheet-green-light)]" },
    { firstCellBg: "bg-[var(--light-grey)]", rowBg: "" },
  ]

  const content = (
    <div className="h-[40px] w-full grid grid-cols-4 border-t border-r border-l border-[var(--medium-light-grey)]">
      {rows.map((row, idx) => (
        <div
          key={idx}
          className={`flex flex-row h-2 border-b border-[var(--medium-light-grey)] ${row.rowBg}`}
        >
          <div className={`w-[20%] ${row.firstCellBg}`}></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-[20%] border-l border-[var(--medium-light-grey)]"></div>
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <Document title="Sheet1" content={content} verticalPadding={false} aspectRatio="no-aspect-ratio" />
  )
}


