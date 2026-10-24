import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import Header from "@/components/Header";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
}));

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("@/hooks/usePremiumStatus", () => ({
  usePremiumStatus: () => ({ premium: false }),
}));

describe("Header Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders logo brand and key links", () => {
    render(<Header />);
    expect(screen.getByLabelText(/All About PDF Editing Home/i)).toBeTruthy();
    expect(screen.getByText("⚡ PDF Studio")).toBeTruthy();
    expect(screen.getByText("⭐ Premium")).toBeTruthy();
  });

  it("opens Tools mega-menu on click", () => {
    render(<Header />);
    const toolsBtn = screen.getByRole("button", { name: /^Tools/i });
    expect(toolsBtn.getAttribute("aria-expanded")).toBe("false");
    
    fireEvent.click(toolsBtn);
    expect(toolsBtn.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Comprehensive PDF Tool Suite")).toBeTruthy();
    expect(screen.getByText("Convert & Compress")).toBeTruthy();
    expect(screen.getByText("Edit & Organize")).toBeTruthy();
  });

  it("opens Premium dropdown menu on click", () => {
    render(<Header />);
    const premiumBtn = screen.getByRole("button", { name: /⭐ Premium/i });
    expect(premiumBtn.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(premiumBtn);
    expect(premiumBtn.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("13 Premium Tools")).toBeTruthy();
    expect(screen.getByText("Compare Plans →")).toBeTruthy();
  });

  it("toggles mobile menu drawer when mobile button is clicked", () => {
    render(<Header />);
    const mobileBtn = screen.getByLabelText(/Toggle navigation menu/i);
    expect(screen.queryByText("Popular Tools")).toBeNull();

    fireEvent.click(mobileBtn);
    expect(screen.getByText("Popular Tools")).toBeTruthy();
    expect(screen.getByText("⚡ PDF Studio Workspace")).toBeTruthy();
  });
});

