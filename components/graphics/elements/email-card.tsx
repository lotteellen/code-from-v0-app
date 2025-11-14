import { MailIcon } from "lucide-react"
import { Document } from "../helpers/document"
import { DummyLine, DummyParagraph } from "../helpers/dummy-helpers"
import "../helpers/globals.css"

export function EmailCard() {
  const emailContent = (
    <div className="flex flex-col !h-fit">
      <div className="flex flex-row items-center gap-[var(--gap-small)] border-b-[0.5px] border-[var(--light-grey)] pb-[var(--padding)]">
        <MailIcon className="h-3 w-fit text-[var(--dark-grey)]"  />
        <DummyParagraph
          items={[
            <DummyLine key="line-1" width="55%" height="var(--line-height-small)" borderRadius="999px" />,
            <DummyParagraph
                items={[
                    <DummyLine key="line-1" width="18%" height="var(--line-height-small)" borderRadius="999px" />,
                    <DummyLine key="line-2" width="18%" height="var(--line-height-small)" borderRadius="999px"/>,
                ]}
          gap="var(--gap-small)"
          direction="row"
        />
          ]}
          gap="var(--gap-small)"
          style={{ flex: 1 }}
        />
      </div>

      <DummyParagraph
        items={[
          <DummyLine key="line-3" width="14%" height="var(--line-height)" borderRadius="999px" />,
          <DummyLine key="line-4" width="75%" height="var(--line-height)" borderRadius="999px" />,
          <DummyLine key="line-5" width="100%" height="var(--line-height)" borderRadius="999px" />,
          <DummyLine key="line-6" width="91%" height="var(--line-height)" borderRadius="999px" />,
          <DummyLine key="line-6" width="19%" height="var(--line-height)" borderRadius="999px" />,
        ]}
        gap="var(--gap)"
        style={{ marginTop: "var(--padding)" }}
      />
    </div>
  )

  return (
    <Document content={emailContent} aspectRatio="" verticalPadding={false} />
  )
}

