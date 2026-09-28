import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PremiumStateCta from "@/components/PremiumStateCta";
import PremiumUpgradeBox from "@/components/PremiumUpgradeBox";
import { setPremium } from "@/lib/premium";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

beforeEach(() => {
  localStorage.clear();
  setPremium(false);
});
afterEach(() => {
  cleanup();
});

describe("PremiumStateCta (shared upgrade CTA slot)", () => {
  it("shows the upgrade CTA for free users", async () => {
    await act(async () => {
      setPremium(false);
      render(<PremiumStateCta upgradeLabel="⭐ Upgrade to Premium" />);
    });
    const cta = screen.getByText("⭐ Upgrade to Premium");
    expect(cta.closest("a")?.getAttribute("href")).toBe("/premium");
    expect(screen.queryByText(/Premium Active/)).toBeNull();
  });

  it("uses a custom upgrade label and href", async () => {
    await act(async () => {
      setPremium(false);
      render(<PremiumStateCta upgradeLabel="Get Premium" upgradeHref="#pricing" />);
    });
    expect(screen.getByText("Get Premium").closest("a")?.getAttribute("href")).toBe("#pricing");
  });

  it("flips to the active Premium state once premium is verified", async () => {
    await act(async () => {
      setPremium(false);
      render(<PremiumStateCta upgradeLabel="⭐ Upgrade to Premium" />);
    });
    expect(screen.getByText("⭐ Upgrade to Premium")).toBeTruthy();

    await act(async () => {
      setPremium(true);
    });
    const active = screen.getByText("✓ Premium Active");
    expect(active.closest("a")?.getAttribute("href")).toBe("/dashboard");
    expect(screen.queryByText("⭐ Upgrade to Premium")).toBeNull();
  });

  it("honours custom active label and href", async () => {
    await act(async () => {
      setPremium(true);
      render(
        <PremiumStateCta
          upgradeLabel="Go Premium"
          activeLabel="✓ Premium Active — Open Dashboard →"
          activeHref="/tools"
        />
      );
    });
    const active = screen.getByText("✓ Premium Active — Open Dashboard →");
    expect(active.closest("a")?.getAttribute("href")).toBe("/tools");
    expect(screen.queryByText("Go Premium")).toBeNull();
  });
});

describe("PremiumUpgradeBox (blog upgrade boxes)", () => {
  const props = {
    desc: "Bulk PDF renaming is a premium tool. Upgrade to rename hundreds of PDFs at once.",
    toolHref: "/bulk-rename",
    toolName: "Bulk Rename",
  };

  it("shows the Premium Feature upgrade box for free users", async () => {
    await act(async () => {
      setPremium(false);
      render(<PremiumUpgradeBox {...props} />);
    });
    expect(screen.getByText("Premium Feature")).toBeTruthy();
    expect(screen.getByText(/Bulk PDF renaming is a premium tool/)).toBeTruthy();
    const cta = screen.getByText("Upgrade to Premium →");
    expect(cta.closest("a")?.getAttribute("href")).toBe("/premium");
  });

  it("flips to an active box linking straight to the unlocked tool", async () => {
    await act(async () => {
      setPremium(false);
      render(<PremiumUpgradeBox {...props} />);
    });
    await act(async () => {
      setPremium(true);
    });
    expect(screen.getByText("✓ Premium Active")).toBeTruthy();
    expect(screen.queryByText(/Upgrade to rename hundreds/)).toBeNull();
    const open = screen.getByText("Open Bulk Rename →");
    expect(open.closest("a")?.getAttribute("href")).toBe("/bulk-rename");
    expect(screen.queryByText("Upgrade to Premium →")).toBeNull();
  });
});
