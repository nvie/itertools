import * as fc from "fast-check";
import { describe, expect, it, test } from "vitest";

import { chunkedByCost, compact, compactObject, flatmap, repeat } from "~";

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

function consume<T>(stream: Iterable<T[]>): T[][] {
  return Array.from(stream);
}

describe("chunkedByCost", () => {
  test("empty input yields no chunks", () => {
    expect(consume(chunkedByCost<number>([], (n) => n, 100, 10))).toEqual([]);
    expect(consume(chunkedByCost<number>([0, 0], (n) => n, 100, 10))).toEqual([[0, 0]]);
  });

  test("single item under minCost yields one chunk", () => {
    expect(consume(chunkedByCost([3], (n) => n, 100, 10))).toEqual([[3]]);
  });

  test("items accumulate until minCost is exceeded, then flush", () => {
    // minCost=10: chunks flush as soon as cost > 10
    // 3+4=7 (<= 10, no flush), 7+5=12 (> 10, flush)
    expect(consume(chunkedByCost([3, 4, 5, 2, 0, 9, 1], (n) => n, 100, 10))).toEqual([[3, 4, 5], [2, 0, 9], [1]]);
  });

  test("hitting minCost exactly does flush (strict >=)", () => {
    expect(consume(chunkedByCost([4, 5, 1], (n) => n, 100, 10))).toEqual([[4, 5, 1]]);
    // 4+6=10, >= 10, so flush; next item adds to a new chunk
    expect(consume(chunkedByCost([4, 6, 1], (n) => n, 100, 10))).toEqual([[4, 6], [1]]);
  });

  test("would-be overflow flushes first, then starts fresh with the item", () => {
    // running 3+4=7. next item is 95: 7+95=102 >= 100 maxCost.
    // Flush [3,4], start new buf=[95], 95 > 10 (minCost) → flush.
    expect(consume(chunkedByCost([3, 4, 95, 2], (n) => n, 100, 10))).toEqual([[3, 4], [95], [2]]);

    // ...but without minCost, 95 and 2 accumulate together
    expect(consume(chunkedByCost([3, 4, 95, 2], (n) => n, 100))).toEqual([
      [3, 4],
      [95, 2],
    ]);
  });

  test("single item ≥ maxCost is emitted alone", () => {
    expect(consume(chunkedByCost([150, 1], (n) => n, 100, 10))).toEqual([[150], [1]]);
  });

  test("all items together stay under minCost → one chunk at the end", () => {
    expect(consume(chunkedByCost([1, 1, 1], (n) => n, 1000, 100))).toEqual([[1, 1, 1]]);
  });

  test("position-dependent cost (first item is expensive)", () => {
    // costOf returns 50 for index 0, 1 for the rest. minCost=10, maxCost=100.
    // Index 0: cost 50 → buf=[A], bufsize=50 > 10 → flush.
    // Then index 1..: each cost 1, accumulating B..L. After 11 items bs=11 > 10
    // → flush. So chunk is [B..L] (11 items).
    const chunks = consume(
      chunkedByCost(
        ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"],
        (_item, i) => (i <= 2 ? 25 : 1),
        100,
        50,
      ),
    );
    expect(chunks).toEqual([
      ["A", "B"],
      ["C", "D", "E", "F", "G", "H", "I", "J", "K", "L"],
    ]);
  });

  test("every chunk respects the cap; all but the last reach minCost", () => {
    // Stream of uniform-cost items. Verify invariants in aggregate.
    const items = Array.from({ length: 100 }, () => 1);
    const chunks = consume(chunkedByCost(items, () => 7, 100, 50));
    for (const chunk of chunks) {
      const cost = chunk.length * 7;
      expect(cost).toBeLessThan(100); // maxCost
    }
    // All chunks except possibly the last should exceed minCost
    for (let i = 0; i < chunks.length - 1; i++) {
      expect(chunks[i].length * 7).toBeGreaterThan(50);
    }
    // Sum of all chunked items = 100
    expect(chunks.reduce((a, c) => a + c.length, 0)).toBe(100);
  });

  test("minCost omitted: chunks grow until maxCost would be exceeded", () => {
    // No soft target. The only flush trigger is the maxCost fence.
    // 1+1+1+1+1+1+1+1+1=10 (<=10 cap), then next 1 makes 10 (>=10) → flush.
    // So with maxCost=10 we accumulate 10 items per chunk.
    const items = Array.from({ length: 25 }, () => 1);
    const chunks = consume(chunkedByCost(items, () => 1, 10));
    expect(chunks.map((c) => c.length)).toEqual([10, 10, 5]);
  });

  test("[property] flattening the chunks yields the input verbatim (no loss, dupe, or reorder)", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 1_000_000 })),
        fc.integer({ min: 1, max: 1_000_000 }),
        fc.option(fc.integer({ min: 0, max: 1_000_000 }), { nil: undefined }),
        (items, maxCost, minCost) => {
          const flat = consume(chunkedByCost(items, (n) => n, maxCost, minCost)).flat();
          expect(flat).toEqual(items);
        },
      ),
    );
  });

  test("minCost > maxCost: minCost is effectively unreachable, behaves like no soft target", () => {
    // Nonsensical configuration but should not blow up. maxCost is the
    // binding constraint, so bufcost can never reach minCost — the soft
    // flush is never triggered. Should match the behavior of omitting
    // minCost entirely.
    const items = [3, 4, 5, 2];
    const tight = consume(chunkedByCost(items, (n) => n, 10, 100));
    const noMin = consume(chunkedByCost(items, (n) => n, 10));
    expect(tight).toEqual(noMin);
    expect(tight).toEqual([
      [3, 4],
      [5, 2],
    ]);
  });

  test("tolerates negative costs (bufcost can shrink)", () => {
    // Generic helper, so it doesn't reject negatives — they just subtract
    // from the running total. Document the natural behavior here.

    // All-negative: bufcost goes negative, never crosses minCost,
    // everything ends up in one chunk at end-of-stream.
    expect(consume(chunkedByCost([-1, -2, -3], (n) => n, 100, 10))).toEqual([[-1, -2, -3]]);

    // Mixed: a negative pulls bufcost back under minCost, delaying the flush.
    // 5: bc=5. 12: 5+12=17, 17>=10 → flush [5,12], bc=0.
    // ...wait recompute.
    //
    // 5: 0+5<=100 → buf=[5], bc=5. 5>=10? No.
    // 12: 5+12<=100 → buf=[5,12], bc=17. 17>=10? Yes → flush [5,12], bc=0.
    // -5: 0+-5<=100 → buf=[-5], bc=-5. -5>=10? No.
    // 3: -5+3<=100 → buf=[-5,3], bc=-2. -2>=10? No.
    // 8: -2+8<=100 → buf=[-5,3,8], bc=6. 6>=10? No.
    // 4: 6+4<=100 → buf=[-5,3,8,4], bc=10. 10>=10? Yes → flush, bc=0.
    expect(consume(chunkedByCost([5, 12, -5, 3, 8, 4], (n) => n, 100, 10))).toEqual([
      [5, 12],
      [-5, 3, 8, 4],
    ]);

    // Pathological: a very negative item dropped after a near-cap chunk —
    // the negative belongs to a new chunk (because the algorithm sees the
    // running sum as "would exceed maxCost" only if (bufcost + c) > maxCost;
    // for negatives that's impossible). So negatives always append to the
    // CURRENT buf, never trigger the else branch.
    // 95: 0+95<=100 → buf=[95], bc=95. 95>=10? Yes → flush [95], bc=0.
    // -50: 0+-50<=100 → buf=[-50], bc=-50.
    // End → yield [-50].
    expect(consume(chunkedByCost([95, -50], (n) => n, 100, 10))).toEqual([[95], [-50]]);
  });

  test("[property] flattening holds under an arbitrary (seeded) stream of costs", () => {
    // fc.infiniteStream gives us a lazy, seeded sequence of integers — each
    // .next() yields a fresh random value, but the whole sequence is
    // reproducible and shrinkable on failure. Drives costOf via a counter.
    fc.assert(
      fc.property(
        fc.array(fc.anything()),
        fc.integer({ min: 1, max: 1_000_000 }),
        fc.option(fc.integer({ min: -1_000_000, max: 1_000_000 }), {
          nil: undefined,
        }),
        fc.infiniteStream(fc.integer({ min: -10_000, max: 10_000 })),
        (items, maxCost, minCost, costStream) => {
          const iter = costStream[Symbol.iterator]();
          const flat = consume(
            chunkedByCost(
              items,
              () => iter.next().value as number, // "Random" cost for every invocation, but deterministic and reproducible
              maxCost,
              minCost,
            ),
          ).flat();
          expect(flat).toEqual(items);
        },
      ),
    );
  });
});
