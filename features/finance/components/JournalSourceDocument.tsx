"use client";

import React from "react";
import { FileQuestion } from "lucide-react";
import type { JournalEntry } from "../types/finance";
import { isExpenseSource, sourceTypeLabel } from "../utils/journalSource";
import { JournalExpenseSource } from "./JournalExpenseSource";
import { JournalOrderSource } from "./JournalOrderSource";
import { JournalReturnSource } from "./JournalReturnSource";

/**
 * Resolves and renders the source document of a journal entry. Every entry is
 * posted from a business event, so the document can be shown automatically from
 * (source_type, source_ref) without asking the user to attach anything.
 */
export function JournalSourceDocument({ entry }: { entry: JournalEntry }) {
  if (isExpenseSource(entry.source_type)) {
    return <JournalExpenseSource code={entry.source_ref} />;
  }

  switch (entry.source_type) {
    case "sales_delivery":
    case "order_delivery":
      return <JournalOrderSource entry={entry} />;
    case "sales_return":
    case "sales_return_stock":
      return <JournalReturnSource entry={entry} />;
    default:
      return (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-200 bg-neutral-50/50 p-3 text-xs text-neutral-500">
          <FileQuestion size={14} className="flex-shrink-0" />
          <span>
            เอกสารต้นทาง: <span className="font-medium text-neutral-700">{sourceTypeLabel(entry.source_type)}</span>
            {entry.source_ref ? (
              <>
                {" "}
                (<span className="font-mono">{entry.source_ref}</span>)
              </>
            ) : null}
          </span>
        </div>
      );
  }
}
