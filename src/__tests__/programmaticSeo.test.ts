import { describe, expect, it } from "vitest";
import { existsSync } from "fs";
import { join } from "path";
import { audiences, getAllSeoPages, seoPages, toolProfiles } from "@/lib/programmatic-seo";

const APP = join(process.cwd(), "src", "app");

describe("Audience use-case matrix", () => {
  it("covers every audience × tool combination", () => {
    const tools = Object.keys(toolProfiles);
    expect(seoPages).toHaveLength(tools.length * audiences.length);
    expect(getAllSeoPages()).toHaveLength(seoPages.length);
  });

  it("has unique slugs", () => {
    const slugs = seoPages.map((page) => page.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("links every page to an existing tool route", () => {
    const broken = seoPages.filter(
      (page) => page.toolSlug && !existsSync(join(APP, page.toolSlug, "page.tsx")),
    );
    expect(broken.map((page) => `${page.slug} -> ${page.toolSlug}`)).toEqual([]);
  });

  it("gives every page unique title, description, pain point and workflow", () => {
    for (const key of ["title", "description", "painPoint", "workflow"] as const) {
      const values = seoPages.map((page) => page[key]);
      expect(new Set(values).size, `${key} is duplicated across pages`).toBe(values.length);
    }
  });

  it("gives every page unique tips and three-plus FAQs", () => {
    expect(new Set(seoPages.map((page) => page.tips.join("|"))).size).toBe(seoPages.length);
    for (const page of seoPages) {
      expect(page.tips.length, `${page.slug} tips`).toBeGreaterThanOrEqual(3);
      expect(page.faqs.length, `${page.slug} faqs`).toBeGreaterThanOrEqual(3);
      expect(page.examples.length, `${page.slug} examples`).toBeGreaterThanOrEqual(3);
      expect(page.steps.length, `${page.slug} steps`).toBeGreaterThanOrEqual(3);
      expect(page.caveat.length, `${page.slug} caveat`).toBeGreaterThan(30);
    }
  });

  it("reads differently for the same tool across professions", () => {
    const compress = seoPages.filter((page) => page.toolSlug === "compress");
    expect(new Set(compress.map((page) => page.workflow)).size).toBe(compress.length);
    expect(new Set(compress.map((page) => page.faqs[0].question)).size).toBeGreaterThan(1);
  });

  it("reads differently for the same profession across tools", () => {
    const lawyerPages = seoPages.filter((page) => page.audience === "for Lawyers");
    expect(new Set(lawyerPages.map((page) => page.painPoint)).size).toBe(lawyerPages.length);
    expect(new Set(lawyerPages.map((page) => page.faqs[0].answer)).size).toBe(1); // profession FAQ is shared by design
    expect(new Set(lawyerPages.map((page) => page.faqs[2].answer)).size).toBe(lawyerPages.length);
  });

  it("never ships thin, name-swapped copy", () => {
    const thin = seoPages.filter(
      (page) =>
        page.painPoint.length < 150 ||
        page.description.length < 120 ||
        page.workflow.length < 150,
    );
    expect(thin.map((page) => page.slug)).toEqual([]);
  });

  it("documents the nine requested audiences", () => {
    const required = [
      "college-students",
      "lawyers",
      "teachers",
      "office-workers",
      "freelancers",
      "small-business-owners",
      "job-seekers",
      "recruiters",
      "remote-workers",
    ];
    const present = new Set(audiences.map((audience) => audience.slug));
    for (const slug of required) {
      expect(present.has(slug), `${slug} audience profile missing`).toBe(true);
    }
  });

  it("provides profession-specific documents, workflow, caveat and tips", () => {
    for (const audience of audiences) {
      expect(audience.documents).toHaveLength(3);
      expect(new Set(audience.documents).size).toBe(3);
      expect(audience.workflow.length).toBeGreaterThan(80);
      expect(audience.caveat.length).toBeGreaterThan(60);
      expect(audience.tips).toHaveLength(2);
      expect(audience.faqs).toHaveLength(2);
    }
  });
});
