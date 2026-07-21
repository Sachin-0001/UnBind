import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { readStorage, writeStorage } from "@/lib/storage";

// Minimal localStorage stand-in — the vitest env is "node", so there is no
// real window/localStorage; we inject one to exercise the read/write paths.
function makeFakeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
  };
}

describe("storage", () => {
  beforeEach(() => {
    (globalThis as unknown as { window: unknown }).window = {
      localStorage: makeFakeStorage(),
    };
  });

  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it("round-trips an object through write then read", () => {
    writeStorage("k", { a: 1, b: ["x", "y"] });
    expect(readStorage<{ a: number; b: string[] }>("k")).toEqual({
      a: 1,
      b: ["x", "y"],
    });
  });

  it("returns null for a missing key", () => {
    expect(readStorage("nope")).toBeNull();
  });

  it("returns null for corrupt JSON instead of throwing", () => {
    (window.localStorage as ReturnType<typeof makeFakeStorage>).setItem(
      "bad",
      "{not json",
    );
    expect(readStorage("bad")).toBeNull();
  });

  it("removes the key when writing null", () => {
    writeStorage("k", { a: 1 });
    writeStorage("k", null);
    expect(readStorage("k")).toBeNull();
  });

  it("no-ops on the server (no window) without throwing", () => {
    delete (globalThis as unknown as { window?: unknown }).window;
    expect(() => writeStorage("k", { a: 1 })).not.toThrow();
    expect(readStorage("k")).toBeNull();
  });
});
