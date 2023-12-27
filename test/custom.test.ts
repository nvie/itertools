import { describe, it, expect } from "vitest";
import { compact, compactObject, flatmap } from "~/custom.js";
import { repeat } from "~/itertools.js";

describe("compact", () => {
  it("compact w/ empty list", () => {
    expect(compact([])).toEqual([]);
  });

  it("icompact removes nullish values", () => {
    expect(compact("abc")).toEqual(["a", "b", "c"]);
    expect(compact(["x", undefined])).toEqual(["x"]);
    expect(compact([0, null, undefined, NaN, Infinity])).toEqual([0, NaN, Infinity]);
  });
});

describe("compactObject", () => {
  it("compactObject w/ empty object", () => {
    expect(compactObject({})).toEqual({});
  });

  it("compactObject removes nullish values", () => {
    expect(compactObject({ a: 1, b: "foo", c: 0, d: null })).toEqual({ a: 1, b: "foo", c: 0 });
    expect(compactObject({ a: undefined, b: false, c: 0, d: null })).toEqual({ b: false, c: 0 });
  });
});

describe("flatmap", () => {
  it("flatmap w/ empty list", () => {
    expect(Array.from(flatmap([], (x) => [x]))).toEqual([]);
  });

  it("flatmap works", () => {
    const dupeEvens = (x: number) => (x % 2 === 0 ? [x, x] : [x]);
    const triple = <T>(x: T) => [x, x, x];
    const nothin = () => [];
    expect(Array.from(flatmap([1, 2, 3, 4, 5], dupeEvens))).toEqual([1, 2, 2, 3, 4, 4, 5]);
    expect(Array.from(flatmap(["hi", "ha"], triple))).toEqual(["hi", "hi", "hi", "ha", "ha", "ha"]);
    expect(Array.from(flatmap(["hi", "ha"], nothin))).toEqual([]);
  });

  it("flatmap example", () => {
    const repeatN = (n: number) => repeat(n, n);
    expect(Array.from(flatmap([0, 1, 2, 3, 4], repeatN))).toEqual([1, 2, 2, 3, 3, 3, 4, 4, 4, 4]);
  });
});
