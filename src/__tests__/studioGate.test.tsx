import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StudioGate, { useStudioAccess } from "@/components/StudioGate";
import { setPremium, markPremiumChecking } from "@/lib/premium";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

function Workspace() {
  return <div>Studio workspace {useStudioAccess() ? "unlocked" : "locked"}</div>;
}

beforeEach(() => {
  localStorage.clear();
  setPremium(false);
});
afterEach(() => {
  cleanup();
});

describe("Studio gate (Premium-only)", () => {
  it("shows the Premium upgrade page and never mounts the workspace for free users", async () => {
    await act(async () => {
      setPremium(false);
      render(<StudioGate><Workspace /></StudioGate>);
    });
    expect(screen.getByRole("heading", { name: /included with Premium/i })).toBeTruthy();
    expect(screen.queryByText(/Studio workspace/)).toBeNull();
    // No trial language or trial API anywhere in the gate.
    expect(screen.queryByText(/three days|trial/i)).toBeNull();
  });

  it("mounts the workspace for Premium members", async () => {
    await act(async () => {
      setPremium(true);
      render(<StudioGate><Workspace /></StudioGate>);
    });
    expect(screen.getByText("Studio workspace unlocked")).toBeTruthy();
  });

  it("keeps the workspace mounted when Premium state arrives after the check", async () => {
    markPremiumChecking();
    await act(async () => {
      render(<StudioGate><Workspace /></StudioGate>);
    });
    expect(screen.getByText(/Checking your Premium status/)).toBeTruthy();
    await act(async () => {
      setPremium(true);
    });
    expect(screen.getByText("Studio workspace unlocked")).toBeTruthy();
  });
});
