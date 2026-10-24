import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import ToolSearch from "@/components/ToolSearch";
import ToolGrid from "@/components/ToolGrid";
import ToolInfo from "@/components/ToolInfo";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
}));

describe("UI Redesign Component Tests", () => {
  afterEach(() => {
    cleanup();
  });

  describe("ToolSearch Component", () => {
    it("renders quick filter chips for common workflows", () => {
      render(<ToolSearch />);
      expect(screen.getByText("Compress")).toBeTruthy();
      expect(screen.getByText("Merge")).toBeTruthy();
      expect(screen.getByText("Edit")).toBeTruthy();
      expect(screen.getByText("Sign")).toBeTruthy();
      expect(screen.getByText("Convert to Word")).toBeTruthy();
    });

    it("matches tools using task-based synonyms like 'shrink'", () => {
      render(<ToolSearch />);
      const input = screen.getByPlaceholderText(/Search PDF tools/i);
      fireEvent.change(input, { target: { value: "shrink" } });
      expect(screen.getByText(/Compress PDF/i)).toBeTruthy();
    });

    it("matches tools using synonyms like 'combine' for merge", () => {
      render(<ToolSearch />);
      const input = screen.getByPlaceholderText(/Search PDF tools/i);
      fireEvent.change(input, { target: { value: "combine" } });
      expect(screen.getByText(/Merge PDF/i)).toBeTruthy();
    });

    it("matches legal tools using 'bates'", () => {
      render(<ToolSearch />);
      const input = screen.getByPlaceholderText(/Search PDF tools/i);
      fireEvent.change(input, { target: { value: "bates" } });
      expect(screen.getByText(/Bates Numbering/i)).toBeTruthy();
    });

    it("displays no-results message and clear button for unknown queries", () => {
      render(<ToolSearch />);
      const input = screen.getByPlaceholderText(/Search PDF tools/i);
      fireEvent.change(input, { target: { value: "xyznonexistent123" } });
      expect(screen.getByText(/No tools matched/i)).toBeTruthy();
      expect(screen.getByText(/Clear Search/i)).toBeTruthy();
    });
  });

  describe("ToolGrid Component", () => {
    it("renders the 8 supported categories", () => {
      render(<ToolGrid />);
      expect(screen.getByRole("tab", { name: /All Tools/i })).toBeTruthy();
      expect(screen.getByRole("tab", { name: /Most Popular/i })).toBeTruthy();
      expect(screen.getByRole("tab", { name: /Convert/i })).toBeTruthy();
      expect(screen.getByRole("tab", { name: /Edit & Markup/i })).toBeTruthy();
      expect(screen.getByRole("tab", { name: /Organize/i })).toBeTruthy();
      expect(screen.getByRole("tab", { name: /Protect & Sign/i })).toBeTruthy();
      expect(screen.getByRole("tab", { name: /OCR & AI/i })).toBeTruthy();
      expect(screen.getByRole("tab", { name: /Professional/i })).toBeTruthy();
    });

    it("filters tools when clicking a category tab", () => {
      render(<ToolGrid />);
      const protectTab = screen.getByRole("tab", { name: /Protect & Sign/i });
      fireEvent.click(protectTab);
      expect(screen.getByText("Password Protect")).toBeTruthy();
      expect(screen.getByText("e-Sign PDF")).toBeTruthy();
    });
  });

  describe("ToolInfo Component", () => {
    it("displays local browser processing badge and verified limits for core tools", () => {
      render(
        <ToolInfo
          name="Compress PDF"
          description="Reduce file size directly in your browser."
        />
      );
      expect(screen.getByText(/Local Browser Processing/i)).toBeTruthy();
      expect(screen.getByText(/Limits: 10MB Free · 100MB Premium/i)).toBeTruthy();
      expect(screen.getByText(/PDF \(\.pdf\)/i)).toBeTruthy();
      expect(screen.getByText(/Zero server file uploads/i)).toBeTruthy();
    });

    it("displays AI notice for AI tools like Chat with PDF", () => {
      render(
        <ToolInfo
          name="Chat with PDF"
          description="Ask questions about your PDF document."
          isAiTool={true}
        />
      );
      expect(screen.getByText(/AI Analysis Notice/i)).toBeTruthy();
      expect(screen.getByText(/Uses Google Gemini AI/i)).toBeTruthy();
    });
  });
});

