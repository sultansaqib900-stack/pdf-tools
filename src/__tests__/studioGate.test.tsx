import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StudioPage from "@/app/studio/page";
import StudioGate, { useStudioAccess } from "@/components/StudioGate";
import { STUDIO_TRIAL_CTA, STUDIO_TRIAL_DURATION_MS } from "@/lib/studioTrial";
import { isPremium, setPremium } from "@/lib/premium";

vi.mock("@/components/AuthProvider", () => ({ useAuth: () => ({ user: null, loading: false }) }));
const fetchMock = vi.fn();
function Workspace() {
  return <div>Studio workspace {useStudioAccess() ? "unlocked" : "locked"}</div>;
}
function respond(status: string, remainingMs = 0) {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ok: true, status, remainingMs, expiresAt: remainingMs ? Date.now() + remainingMs : null }) });
}
async function openGate() {
  await act(async () => { render(<StudioGate><Workspace /></StudioGate>); });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  localStorage.clear();
  setPremium(false);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("Studio gate and activation UI", () => {
  it("offers a Studio-only trial without automatically starting it or mounting the workspace", async () => {
    respond("not_started");
    await openGate();
    expect(screen.getByRole("heading", { name: STUDIO_TRIAL_CTA })).toBeTruthy();
    expect(screen.getByText(/not a site-wide Premium trial/)).toBeTruthy();
    expect(screen.queryByText(/Studio workspace/)).toBeNull();
    expect(fetchMock.mock.calls.every(([, options]) => options.method === "GET")).toBe(true);
  });

  it("activates only on the explicit CTA and never grants site-wide Premium", async () => {
    respond("not_started");
    await openGate();
    respond("active", STUDIO_TRIAL_DURATION_MS);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: STUDIO_TRIAL_CTA })); });
    expect(fetchMock).toHaveBeenLastCalledWith("/api/studio/trial", expect.objectContaining({ method: "POST" }));
    expect(screen.getByText("Studio workspace unlocked")).toBeTruthy();
    expect(screen.getByText(/other Premium tools are not included/)).toBeTruthy();
    expect(isPremium()).toBe(false);
  });

  it("restores active access on a return visit and expires an open workspace without waiting for polling", async () => {
    respond("active", 1000);
    await openGate();
    expect(screen.getByText("Studio workspace unlocked")).toBeTruthy();
    await act(async () => { vi.advanceTimersByTime(1001); });
    expect(screen.queryByText(/Studio workspace/)).toBeNull();
    expect(screen.getByRole("heading", { name: /free trial has ended/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: STUDIO_TRIAL_CTA })).toBeNull();
    expect(screen.getByRole("link", { name: "Continue with Premium" }).getAttribute("href")).toBe("/premium");
  });

  it("does not allow moving the browser wall clock back to extend access", async () => {
    respond("active", 1000);
    await openGate();
    vi.setSystemTime(new Date("2020-01-01"));
    await act(async () => { vi.advanceTimersByTime(1001); });
    expect(screen.getByRole("heading", { name: /free trial has ended/ })).toBeTruthy();
  });

  it("mounts the real Studio workspace for a free trial without requiring global Premium", async () => {
    respond("active", STUDIO_TRIAL_DURATION_MS);
    await act(async () => { render(<StudioPage />); });
    expect(screen.getByRole("heading", { name: "PDF Studio Pipeline" })).toBeTruthy();
    expect(isPremium()).toBe(false);
  });

  it("rejects an invalid active duration instead of opening the workspace", async () => {
    respond("active", STUDIO_TRIAL_DURATION_MS + 1);
    await openGate();
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.queryByText(/Studio workspace/)).toBeNull();
  });

  it("ignores an older response that arrives after expiry", async () => {
    respond("active", 1000);
    await openGate();
    let resolveResponse: (response: unknown) => void = () => {};
    fetchMock.mockReturnValue(new Promise((resolve) => { resolveResponse = resolve; }));
    await act(async () => { window.dispatchEvent(new Event("focus")); });
    await act(async () => { vi.advanceTimersByTime(1001); });
    await act(async () => {
      resolveResponse({ ok: true, json: async () => ({ ok: true, status: "active", remainingMs: 5000, expiresAt: Date.now() + 5000 }) });
    });
    expect(screen.getByRole("heading", { name: /free trial has ended/ })).toBeTruthy();
    expect(screen.queryByText(/Studio workspace/)).toBeNull();
  });

  it("does not show a trial banner to paid members", async () => {
    respond("premium");
    await openGate();
    expect(screen.getByText("Studio workspace unlocked")).toBeTruthy();
    expect(screen.queryByText("PDF Studio free trial")).toBeNull();
  });

  it("fails closed with a retry on network errors instead of granting local access", async () => {
    fetchMock.mockRejectedValue(new Error("Access service unavailable"));
    await openGate();
    expect(screen.getByRole("alert").textContent).toContain("Access service unavailable");
    expect(screen.queryByText(/Studio workspace/)).toBeNull();
    respond("not_started");
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Retry access check" })); });
    expect(fetchMock.mock.lastCall?.[1].method).toBe("GET");
    expect(screen.getByRole("button", { name: STUDIO_TRIAL_CTA })).toBeTruthy();
  });

  it("rechecks on focus so another tab's activation is picked up", async () => {
    respond("not_started");
    await openGate();
    respond("active", 5000);
    await act(async () => { window.dispatchEvent(new Event("focus")); });
    expect(screen.getByText("Studio workspace unlocked")).toBeTruthy();
  });

  it("keeps access hidden until verification completes", async () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    await openGate();
    expect(screen.getByRole("status").textContent).toBe("Checking PDF Studio access…");
    expect(screen.queryByText(/Studio workspace/)).toBeNull();
  });
});
