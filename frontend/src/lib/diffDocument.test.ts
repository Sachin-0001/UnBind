import { describe, expect, it } from "vitest";

import { diffWords } from "@/lib/diffDocument";

describe("diffWords", () => {
  it("marks everything equal when the texts are identical", () => {
    const tokens = diffWords("the quick brown fox", "the quick brown fox");
    expect(tokens.every((t) => t.op === "equal")).toBe(true);
    expect(tokens.map((t) => t.text).join("")).toBe("the quick brown fox");
  });

  it("reconstructs the old text from equal + delete tokens", () => {
    const oldText = "the quick fox";
    const newText = "the slow fox";
    const tokens = diffWords(oldText, newText);
    const rebuiltOld = tokens
      .filter((t) => t.op !== "insert")
      .map((t) => t.text)
      .join("");
    expect(rebuiltOld).toBe(oldText);
  });

  it("reconstructs the new text from equal + insert tokens", () => {
    const oldText = "the quick fox";
    const newText = "the slow fox";
    const tokens = diffWords(oldText, newText);
    const rebuiltNew = tokens
      .filter((t) => t.op !== "delete")
      .map((t) => t.text)
      .join("");
    expect(rebuiltNew).toBe(newText);
  });

  it("emits an insert when text is only added", () => {
    const tokens = diffWords("hello", "hello world");
    expect(tokens.some((t) => t.op === "insert")).toBe(true);
    expect(tokens.some((t) => t.op === "delete")).toBe(false);
  });
});
