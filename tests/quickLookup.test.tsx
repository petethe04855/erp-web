import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QuickLookup, type QuickLookupOption } from "@/components/common/QuickLookup";

function makeOptions(q: string): QuickLookupOption[] {
  return [{ id: q, title: `Result for ${q}` }];
}

function renderLookup(onSearch: (q: string) => Promise<QuickLookupOption[]>) {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <QuickLookup onSearch={onSearch} onChange={() => {}} />
    </QueryClientProvider>,
  );
}

describe("QuickLookup race protection", () => {
  it("renders the latest query's results, not an earlier slow response", async () => {
    const user = userEvent.setup();
    let resolveSlow: (v: QuickLookupOption[]) => void = () => {};

    const onSearch = vi.fn((q: string) => {
      if (q === "slow") {
        return new Promise<QuickLookupOption[]>((resolve) => {
          resolveSlow = resolve;
        });
      }
      return Promise.resolve(makeOptions(q));
    });

    renderLookup(onSearch);
    const input = screen.getByPlaceholderText("พิมพ์เพื่อค้นหา...");
    input.focus();

    // Type the slow query first (debounce = 300ms)
    await user.type(input, "slow");
    await waitFor(() => expect(onSearch).toHaveBeenCalledWith("slow"));

    // Replace with a fast query that resolves immediately
    await user.clear(input);
    await user.type(input, "fast");
    await waitFor(() => expect(onSearch).toHaveBeenCalledWith("fast"));
    await waitFor(() =>
      expect(screen.getByText("Result for fast")).toBeInTheDocument(),
    );

    // The stale "slow" response arrives late — it must be discarded and
    // the "fast" results must remain rendered.
    await React.act(async () => {
      resolveSlow(makeOptions("slow"));
    });
    await waitFor(() => {
      expect(screen.queryByText("Result for slow")).toBeNull();
      expect(screen.getByText("Result for fast")).toBeInTheDocument();
    });
  });
});
