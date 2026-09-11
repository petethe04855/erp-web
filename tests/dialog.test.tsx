"use client";

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/axios", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import { Dialog } from "@/components/ui/dialog";

function renderDialog(open: boolean, onOpenChange = vi.fn()) {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <div>
          <button type="button">First button</button>
          <input aria-label="name" />
          <button type="button">Last button</button>
        </div>
      </Dialog>
    </QueryClientProvider>,
  );
}

describe("Dialog focus management", () => {
  it("moves initial focus into the dialog content", async () => {
    renderDialog(true);
    // First focusable element inside the content should be focused.
    await vi.waitFor(() => {
      expect(screen.getByText("First button")).toHaveFocus();
    });
  });

  it("traps Tab cycling inside the content", async () => {
    const user = userEvent.setup();
    renderDialog(true);

    const first = screen.getByText("First button");
    const last = screen.getByText("Last button");

    // Let the initial-focus effect settle before asserting the trap.
    await vi.waitFor(() => expect(first).toHaveFocus());

    last.focus();
    await user.tab();
    expect(first).toHaveFocus();

    first.focus();
    await user.tab({ shift: true });
    expect(last).toHaveFocus();
  });

  it("restores focus to the trigger after closing", async () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = renderDialog(true);
    unmount();

    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
