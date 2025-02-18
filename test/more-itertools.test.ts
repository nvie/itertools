import { describe, it, expect } from "vitest";
import { iter, find, range } from "~/builtins";
import {
  chunked,
  dupes,
  first,
  flatten,
  heads,
  intersperse,
  pairwise,
  partition,
  roundrobin,
  take,
  uniqueEverseen,
  uniqueJustseen,
} from "~";
import * as fc from "fast-check";

const isEven = (x: number) => x % 2 === 0;
const isEvenIndex = (_, index: number) => index % 2 === 0;
const isPositive = (x: number) => x >= 0;

function isNum(value: unknown): value is number {
  return typeof value === "number";
}

function* gen<T>(values: T[]): Iterable<T> {
  for (const value of values) {
    yield value;
  }
}

describe("chunked", () => {
  it("empty", () => {
    expect(Array.from(chunked([], 3))).toEqual([]);
    expect(Array.from(chunked([], 1337))).toEqual([]);
  });

  it("fails with invalid chunk size", () => {
    expect(() => Array.from(chunked([3, 2, 1], 0))).toThrow();
    expect(() => Array.from(chunked([3, 2, 1], -3))).toThrow();
  });

  it("works with chunk size of 1", () => {
    expect(Array.from(chunked([5, 4, 3, 2, 1], 1))).toEqual([[5], [4], [3], [2], [1]]);
  });

  it("works with array smaller than chunk size", () => {
    expect(Array.from(chunked([1], 3))).toEqual([[1]]);
  });

  it("works with array of values", () => {
    expect(Array.from(chunked([1, 2, 3, 4, 5], 3))).toEqual([
      [1, 2, 3],
      [4, 5],
    ]);
  });

  it("works with exactly chunkable list", () => {
    expect(Array.from(chunked([1, 2, 3, 4, 5, 6], 3))).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  it("works with chunkable list with remainder", () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    expect(Array.from(chunked(numbers, 3))).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);
    expect(Array.from(chunked(numbers, 5))).toEqual([
      [1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10],
    ]);
    expect(Array.from(chunked(numbers, 9999))).toEqual([numbers]);
  });

  it("chunked on lazy iterable", () => {
    const lazy = gen([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(Array.from(chunked(lazy, 3))).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);
    expect(Array.from(chunked(lazy, 5))).toEqual([]); // lazy input all consumed
  });

  it("no chunk will be larger than the chunk size", () => {
    fc.assert(
      fc.property(
        fc.array(fc.anything()),
        fc.integer({ min: 1 }),

        (input, chunkSize) => {
          const output = Array.from(chunked(input, chunkSize));
          fc.pre(output.length > 0);

          const lastChunk = output.pop()!;
          expect(lastChunk.length).toBeGreaterThan(0);
          expect(lastChunk.length).toBeLessThanOrEqual(chunkSize);

          // The remaining chunks are all exactly the chunk size
          for (const chunk of output) {
            expect(chunk.length).toEqual(chunkSize);
          }
        },
      ),
    );
  });

  it("chunks contain all elements, in the same order as the input", () => {
    fc.assert(
      fc.property(
        fc.array(fc.anything()),
        fc.integer({ min: 1 }),

        (input, chunkSize) => {
          const output = Array.from(chunked(input, chunkSize));

          // Exact same elements as input array
          expect(output.flatMap((x) => x)).toEqual(input);
        },
      ),
    );
  });
});

describe("find", () => {
  it("returns nothing for an empty array", () => {
    expect(find([])).toBeUndefined();
    expect(find([undefined, undefined])).toBeUndefined();
  });

  it("returns the first value in the array", () => {
    expect(find([3, "ohai"])).toBe(3);
    expect(find(["ohai", 3])).toBe("ohai");
  });

  it("find may returns falsey values too", () => {
    expect(find([0, 1, 2])).toBe(0);
    expect(find([false, true])).toBe(false);
    expect(find([null, false, true])).toBe(null);
    expect(find([undefined, 3, "ohai"])).toBe(undefined);
    expect(find([NaN, 3, "ohai"])).toBe(NaN);
  });

  it("find uses a predicate if provided", () => {
    expect(find([0, 1, 2, 3, 4], (n) => !!n)).toBe(1);
    expect(find([0, 1, 2, 3, 4], (n) => n > 1)).toBe(2);
    expect(find([0, 1, 2, 3, 4], (n) => n < 0)).toBeUndefined();
    expect(find([false, true], (x) => x)).toBe(true);
  });

  it("find on lazy iterable", () => {
    const lazy = gen([1, 2, 3]);
    expect(find(lazy)).toBe(1);
    expect(find(lazy)).toBe(2);
    expect(find(lazy)).toBe(3);
    expect(find(lazy)).toBe(undefined);
  });
});

describe("first", () => {
  it("returns nothing for an empty array", () => {
    expect(first([])).toBeUndefined();
    expect(first([undefined, undefined])).toBeUndefined();
  });

  it("returns the first value in the array", () => {
    expect(first([3, "ohai"])).toBe(3);
    expect(first(["ohai", 3])).toBe("ohai");
    expect(first([undefined, 3, "ohai"])).toBe(3);
  });

  it("find may returns falsey values too", () => {
    expect(first([0, 1, 2])).toBe(0);
    expect(first([false, true])).toBe(false);
    expect(first([null, false, true])).toBe(null);
    expect(first([NaN, 3, "ohai"])).toBe(NaN);
  });

  it("find uses a predicate if provided", () => {
    expect(first([0, 1, 2, 3, 4], (n) => !!n)).toBe(1);
    expect(first([0, 1, 2, 3, 4], (n) => n > 1)).toBe(2);
    expect(first([0, 1, 2, 3, 4], (n) => n < 0)).toBeUndefined();
    expect(first([false, true], (x) => x)).toBe(true);
  });
});

describe("flatten", () => {
  it("flatten w/ empty list", () => {
    expect(Array.from(flatten([]))).toEqual([]);
    expect(Array.from(flatten([[], [], [], [], []]))).toEqual([]);
  });

  it("flatten works", () => {
    expect(
      Array.from(
        flatten([
          [1, 2],
          [3, 4, 5],
        ]),
      ),
    ).toEqual([1, 2, 3, 4, 5]);
    expect(Array.from(flatten(["hi", "ha"]))).toEqual(["h", "i", "h", "a"]);
  });
});

describe("intersperse", () => {
  it("intersperse on empty sequence", () => {
    expect(Array.from(intersperse(0, []))).toEqual([]);
  });

  it("intersperse", () => {
    expect(Array.from(intersperse(-1, [13]))).toEqual([13]);
    expect(Array.from(intersperse(null, [13, 14]))).toEqual([13, null, 14]);
    expect(Array.from(intersperse("foo", [1, 2, 3, 4]))).toEqual([1, "foo", 2, "foo", 3, "foo", 4]);
  });

  it("intersperse (lazy)", () => {
    const lazy = gen([1, 2, 3, 4]);
    expect(Array.from(intersperse("foo", lazy))).toEqual([1, "foo", 2, "foo", 3, "foo", 4]);
  });
});

describe("itake", () => {
  it("itake is tested through take() tests", () => {
    // This is okay
  });
});

describe("pairwise", () => {
  it("does nothing for empty array", () => {
    expect(Array.from(pairwise([]))).toEqual([]);
    expect(Array.from(pairwise([1]))).toEqual([]);
  });

  it("it returns pairs of input", () => {
    expect(Array.from(pairwise([0, 1, 2]))).toEqual([
      [0, 1],
      [1, 2],
    ]);
    expect(Array.from(pairwise([1, 2]))).toEqual([[1, 2]]);
    expect(Array.from(pairwise([1, 2, 3, 4]))).toEqual([
      [1, 2],
      [2, 3],
      [3, 4],
    ]);
  });
});

describe("partition", () => {
  it("partition empty list", () => {
    expect(partition([], isEven)).toEqual([[], []]);
    expect(partition([], isEvenIndex)).toEqual([[], []]);
  });

  it("partition splits input list into two lists", () => {
    const values = [1, -2, 3, 4, 5, 6, 8, 8, 0, -2, -3];
    expect(partition(values, isEven)).toEqual([
      [-2, 4, 6, 8, 8, 0, -2],
      [1, 3, 5, -3],
    ]);
    expect(partition(values, isEvenIndex)).toEqual([
      [1, 3, 5, 8, 0, -3],
      [-2, 4, 6, 8, -2],
    ]);
    expect(partition(values, isPositive)).toEqual([
      [1, 3, 4, 5, 6, 8, 8, 0],
      [-2, -2, -3],
    ]);
  });

  it("partition retains rich type info", () => {
    const values = ["hi", 3, null, "foo", -7];
    const [good, bad] = partition(values, isNum);
    expect(good).toEqual([3, -7]);
    //     ^^^^ number[]
    expect(bad).toEqual(["hi", null, "foo"]);
    //     ^^^ (string | null)[]
  });
});

describe("roundrobin", () => {
  it("roundrobin on empty list", () => {
    expect(Array.from(roundrobin())).toEqual([]);
    expect(Array.from(roundrobin([]))).toEqual([]);
    expect(Array.from(roundrobin([], []))).toEqual([]);
    expect(Array.from(roundrobin([], [], []))).toEqual([]);
    expect(Array.from(roundrobin([], [], [], []))).toEqual([]);
  });

  it("roundrobin on equally sized lists", () => {
    expect(Array.from(roundrobin([1], [2], [3]))).toEqual([1, 2, 3]);
    expect(Array.from(roundrobin([1, 2], [3, 4]))).toEqual([1, 3, 2, 4]);
    expect(Array.from(roundrobin("foo", "bar")).join("")).toEqual("fboaor");
  });

  it("roundrobin on unequally sized lists", () => {
    expect(Array.from(roundrobin([1], [], [2, 3, 4]))).toEqual([1, 2, 3, 4]);
    expect(Array.from(roundrobin([1, 2, 3, 4, 5], [6, 7]))).toEqual([1, 6, 2, 7, 3, 4, 5]);
    expect(Array.from(roundrobin([1, 2, 3], [4], [5, 6, 7, 8]))).toEqual([1, 4, 5, 2, 6, 3, 7, 8]);
  });
});

describe("heads", () => {
  it("heads on empty list", () => {
    expect(Array.from(heads())).toEqual([]);
    expect(Array.from(heads([]))).toEqual([]);
    expect(Array.from(heads([], []))).toEqual([]);
    expect(Array.from(heads([], [], []))).toEqual([]);
    expect(Array.from(heads([], [], [], []))).toEqual([]);
  });

  it("heads on equally sized lists", () => {
    expect(Array.from(heads([1], [2], [3]))).toEqual([[1, 2, 3]]);
    expect(Array.from(heads([1, 2], [3, 4]))).toEqual([
      [1, 3],
      [2, 4],
    ]);
    expect(Array.from(heads("foo", "bar")).map((s) => s.join(""))).toEqual(["fb", "oa", "or"]);
  });

  it("heads on unequally sized lists", () => {
    expect(Array.from(heads([1], [], [2, 3, 4]))).toEqual([[1, 2], [3], [4]]);
    expect(Array.from(heads([1, 2, 3, 4, 5], [6, 7]))).toEqual([[1, 6], [2, 7], [3], [4], [5]]);
    expect(Array.from(heads([1, 2, 3], [4], [5, 6, 7, 8]))).toEqual([[1, 4, 5], [2, 6], [3, 7], [8]]);
  });
});

describe("take", () => {
  it("take on empty array", () => {
    expect(take(0, [])).toEqual([]);
    expect(take(1, [])).toEqual([]);
    expect(take(99, [])).toEqual([]);
  });

  it("take on infinite input", () => {
    expect(take(5, Math.PI.toString())).toEqual(["3", ".", "1", "4", "1"]);
  });

  it("take on infinite input", () => {
    expect(take(0, range(999)).length).toEqual(0);
    expect(take(1, range(999)).length).toEqual(1);
    expect(take(99, range(999)).length).toEqual(99);
  });

  it("take multiple times from collection will create new iterators every time", () => {
    const coll = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(take(0, coll)).toEqual([]);
    expect(take(3, coll)).toEqual([0, 1, 2]);
    expect(take(3, coll)).toEqual([0, 1, 2]);
    expect(take(3, coll)).toEqual([0, 1, 2]);
    expect(take(5, coll)).toEqual([0, 1, 2, 3, 4]);
  });

  it("take multiple times from an iterator", () => {
    const it = iter([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(take(0, it)).toEqual([]);
    expect(take(3, it)).toEqual([0, 1, 2]);
    expect(take(3, it)).toEqual([3, 4, 5]);
    expect(take(5, it)).toEqual([6, 7, 8, 9]);
  });

  it("take multiple times from lazy", () => {
    const lazy = gen([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(take(0, lazy)).toEqual([]);
    expect(take(3, lazy)).toEqual([0, 1, 2]);
    expect(take(3, lazy)).toEqual([3, 4, 5]);
    expect(take(5, lazy)).toEqual([6, 7, 8, 9]);
  });
});

describe("uniqueJustseen", () => {
  it("uniqueJustseen w/ empty list", () => {
    expect(Array.from(uniqueJustseen([]))).toEqual([]);
  });

  it("uniqueJustseen", () => {
    expect(Array.from(uniqueJustseen([1, 2, 3, 4, 5]))).toEqual([1, 2, 3, 4, 5]);
    expect(Array.from(uniqueJustseen([1, 1, 1, 2, 2]))).toEqual([1, 2]);
    expect(Array.from(uniqueJustseen([1, 1, 1, 2, 2, 1, 1, 1, 1]))).toEqual([1, 2, 1]);
  });

  it("uniqueEverseen with key function", () => {
    expect(Array.from(uniqueJustseen("AaABbBCcaABBb", (s) => s.toLowerCase()))).toEqual(["A", "B", "C", "a", "B"]);
  });
});

describe("uniqueEverseen", () => {
  it("uniqueEverseen w/ empty list", () => {
    expect(Array.from(uniqueEverseen([]))).toEqual([]);
  });

  it("uniqueEverseen never emits dupes, but keeps input ordering", () => {
    expect(Array.from(uniqueEverseen([1, 2, 3, 4, 5]))).toEqual([1, 2, 3, 4, 5]);
    expect(Array.from(uniqueEverseen([1, 1, 1, 2, 2, 3, 1, 3, 0, 4]))).toEqual([1, 2, 3, 0, 4]);
    expect(Array.from(uniqueEverseen([1, 1, 1, 2, 2, 1, 1, 1, 1]))).toEqual([1, 2]);
  });

  it("uniqueEverseen with key function", () => {
    expect(Array.from(uniqueEverseen("AAAABBBCCDAABBB"))).toEqual(["A", "B", "C", "D"]);
    expect(Array.from(uniqueEverseen("ABCcAb", (s) => s.toLowerCase()))).toEqual(["A", "B", "C"]);
    expect(Array.from(uniqueEverseen("AbCBBcAb", (s) => s.toLowerCase()))).toEqual(["A", "b", "C"]);
  });
});

describe("dupes", () => {
  it("dupes w/ empty list", () => {
    expect(Array.from(dupes([]))).toEqual([]);
  });

  it("dupes on a list without dupes", () => {
    expect(Array.from(dupes([1, 2, 3, 4, 5]))).toEqual([]);
  });

  it("dupes on a list with dupes", () => {
    expect(Array.from(dupes(Array.from("Hello")))).toEqual([["l", "l"]]);
    expect(Array.from(dupes(Array.from("AAAABCDEEEFABG")))).toEqual([
      ["A", "A", "A", "A", "A"],
      ["E", "E", "E"],
      ["B", "B"],
    ]);
  });

  it("dupes with a key function", () => {
    expect(Array.from(dupes(Array.from("AbBCcABdE"), (s) => s.toLowerCase()))).toEqual([
      ["b", "B", "B"],
      ["C", "c"],
      ["A", "A"],
    ]);
  });

  it("dupes with complex objects and a key function", () => {
    expect(
      Array.from(
        dupes(
          [
            { name: "Charlie", surname: "X" },
            { name: "Alice", surname: "Rubrik" },
            { name: "Alice", surname: "Doe" },
            { name: "Bob" },
          ],
          (p) => p.name,
        ),
      ),
    ).toEqual([
      [
        { name: "Alice", surname: "Rubrik" },
        { name: "Alice", surname: "Doe" },
      ],
    ]);

    expect(
      Array.from(
        dupes(
          [{ name: "Bob" }, { name: "Alice", surname: "Rubrik" }, { name: "Alice", surname: "Doe" }, { name: "Bob" }],
          (p) => p.name,
        ),
      ),
    ).toEqual([
      [
        { name: "Alice", surname: "Rubrik" },
        { name: "Alice", surname: "Doe" },
      ],
      [{ name: "Bob" }, { name: "Bob" }],
    ]);
  });
});
