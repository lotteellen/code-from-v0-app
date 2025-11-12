import { ChevronRightIcon } from "lucide-react";
import { BrowserWindow } from "../graphics/helpers/browser-window"
import { DummyLine, DummyParagraph } from "../graphics/helpers/dummy-helpers"
import "../graphics/helpers/globals.css"

export function ChatGPTCard({ title = "AI Chat", answer = "$499 / month / seat" }: { title?: string; answer?: string } = {}) {
  const content = (

    <div className="w-full flex justify-between" style={{ paddingTop: "var(--gap)" }}>
        <div className="flex justify-end w-full">
          <div
            style={{
              background: "var(--light-blue)",
              borderRadius: "var(--border-radius) var(--border-radius) 0px var(--border-radius)",
              padding: "4px 6px",
              maxWidth: "57%",
              position: "relative",
              display: "inline-flex",
            }}
          >
            <div className="styling-text" style={{ whiteSpace: "normal" }}>
              What was our enterprise pricing before we pivoted to SMB?
            </div>
          </div>
      </div>
      
      <div className="w-full px-10">
        <DummyParagraph items={[
          <DummyLine width="100%" height="5.5px" />,
          <DummyLine width="85%" height="5.5px" />,
          <span className="styling-text line-height-1 font-bold">{answer}</span>,
          <DummyLine width="100%" height="5.5px" />,
        ]} gap="6px" />
      </div>

      {/* Input field at bottom */}
      <div className="mx-10 p-[1px] border-[1px] border-[var(--very-light-grey)] rounded-[var(--border-radius)] flex justify-end items-center">
      <ChevronRightIcon className="w-[6px] h-[6px] text-[var(--light-grey)]" />
      </div>
      
    </div>
  );

  return (
    <BrowserWindow title={title} content={content} />
  );
}
