import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  contains,
  enumerate,
  every,
  filter,
  iter,
  map,
  max,
  min,
  range,
  reduce,
  some,
  sorted,
  sum,
  zip,
  zip3,
} from "~/builtins";
import { first } from "~/custom";

const isEven = (n: number) => n % 2 === 0;

function isNum(value: unknown): value is number {
  return typeof value === "number";
}

function predicate(): fc.Arbitrary<(a: unknown) => boolean> {
  return fc.oneof(
    fc.constant(() => true),
    fc.constant(() => false),
    fc.constant((a: unknown) => (JSON.stringify(a) ?? "").length > 10),
    fc.constant((a: unknown) => (JSON.stringify(a) ?? "").length !== 0),
    fc.constant((a: unknown) => typeof a === "number"),
    fc.constant((a: unknown) => typeof a === "string"),
    fc.constant((a: unknown) => typeof a === "object"),
    fc.constant((a: unknown) => typeof a === "function"),
    fc.constant((a: unknown) => Array.isArray(a)),
  );
}

describe("every", () => {
  it("every of empty list is true", () => {
    expect(every([])).toBe(true);
  });

  it("every is true if every elements are truthy", () => {
    expect(every([1])).toBe(true);
    expect(every([1, 2, 3])).toBe(true);
  });

  it("every is false if some elements are not truthy", () => {
    expect(every([0, 1])).toBe(false);
    expect(every([1, 2, undefined, 3, 4])).toBe(false);
  });
});

describe("some", () => {
  it("some of empty list is false", () => {
    expect(some([])).toBe(false);
  });

  it("some is true if some elements are truthy", () => {
    expect(some([1, 2, 3])).toBe(true);
    expect(some([0, 1])).toBe(true);
    expect(some([1, 0])).toBe(true);
    expect(some([0, undefined, NaN, 1])).toBe(true);
  });

  it("some is false if no elements are truthy", () => {
    expect(some([0, null, NaN, undefined])).toBe(false);
  });
});

describe("every vs some", () => {
  it("every is always true with empty list", () => {
    fc.assert(
      fc.property(
        predicate(),

        (pred) => {
          expect(every([], pred)).toBe(true);
        },
      ),
    );
  });

  it("some is always false with empty list", () => {
    fc.assert(
      fc.property(
        predicate(),

        (pred) => {
          expect(some([], pred)).toBe(false);
        },
      ),
    );
  });

  it("every and some complete each other", () => {
    fc.assert(
      fc.property(
        fc.array(fc.anything()),
        predicate(),

        (arr, pred) => {
          const inverse = (x: unknown) => !pred(x);
          expect(every(arr, pred)).toEqual(!some(arr, inverse));
          expect(some(arr, pred)).toEqual(!every(arr, inverse));
        },
      ),
    );
  });
});

describe("contains", () => {
  it("contains of empty list is false", () => {
    expect(contains([], 0)).toBe(false);
    expect(contains([], 1)).toBe(false);
    expect(contains([], null)).toBe(false);
    expect(contains([], undefined)).toBe(false);
  });

  it("contains is true iff iterable contains the given exact value", () => {
    expect(contains([1], 1)).toBe(true);
    expect(contains([1], 2)).toBe(false);
    expect(contains([1, 2, 3], 1)).toBe(true);
    expect(contains([1, 2, 3], 2)).toBe(true);
    expect(contains([1, 2, 3], 3)).toBe(true);
    expect(contains([1, 2, 3], 4)).toBe(false);
  });

  it("contains does not work for elements with identity equality", () => {
    expect(contains([{}], {})).toBe(false);
    expect(contains([{ x: 123 }], { x: 123 })).toBe(false);
    expect(contains([[1, 2, 3]], [1, 2, 3])).toBe(false);
  });
});

describe("enumerate", () => {
  it("enumerate empty list", () => {
    expect(Array.from(enumerate([]))).toEqual([]);
  });

  it("enumerate attaches indexes", () => {
    // We'll have to wrap it in a take() call to avoid infinite-length arrays :)
    expect(Array.from(enumerate(["x"]))).toEqual([[0, "x"]]);
    expect(Array.from(enumerate(["even", "odd"]))).toEqual([
      [0, "even"],
      [1, "odd"],
    ]);
  });

  it("enumerate from 3 up", () => {
    expect(Array.from(enumerate("abc", 3))).toEqual([
      [3, "a"],
      [4, "b"],
      [5, "c"],
    ]);
  });
});

describe("filter", () => {
  it("filters empty list", () => {
    expect(filter([], isEven)).toEqual([]);
  });

  it("ifilter works like Array.filter, but lazy", () => {
    expect(filter([0, 1, 2, 3], isEven)).toEqual([0, 2]);
  });

  it("filter retains rich type info", () => {
    const filtered = filter([3, "hi", null, -7], isNum);
    expect(filtered).toEqual([3, -7]);
    //     ^^^^^^^^ number[]
  });
});

describe("iter", () => {
  it("iter makes some iterable a one-time iterable", () => {
    expect(
      Array.from(
        iter(
          new Map([
            [1, "x"],
            [2, "y"],
            [3, "z"],
          ]),
        ),
      ),
    ).toEqual([
      [1, "x"],
      [2, "y"],
      [3, "z"],
    ]);
    expect(Array.from(iter([1, 2, 3]))).toEqual([1, 2, 3]);
    expect(Array.from(iter(new Set([1, 2, 3])))).toEqual([1, 2, 3]);
  });

  it("iter results can be consumed only once", () => {
    const it = iter([1, 2, 3]);
    expect(it.next()).toEqual({ value: 1, done: false });
    expect(it.next()).toEqual({ value: 2, done: false });
    expect(it.next()).toEqual({ value: 3, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });

    // Keeps returning "done" when exhausted...
    expect(it.next()).toEqual({ value: undefined, done: true });
    expect(it.next()).toEqual({ value: undefined, done: true });
    // ...
  });

  it("iter results can be consumed in pieces", () => {
    const it = iter([1, 2, 3, 4, 5]);
    expect(first(it)).toBe(1);
    expect(first(it)).toBe(2);
    expect(first(it)).toBe(3);
    expect(Array.from(it)).toEqual([4, 5]);

    // Keeps returning "[]" when exhausted...
    expect(Array.from(it)).toEqual([]);
    expect(Array.from(it)).toEqual([]);
    // ...
  });

  it("wrapping iter()s has no effect on the iterator's state", () => {
    const originalIter = iter([1, 2, 3, 4, 5]);
    expect(first(originalIter)).toBe(1);

    const wrappedIter = iter(iter(iter(originalIter)));
    expect(first(wrappedIter)).toBe(2);
    expect(first(iter(wrappedIter))).toBe(3);
    expect(Array.from(iter(originalIter))).toEqual([4, 5]);

    // Keeps returning "[]" when exhausted...
    expect(Array.from(originalIter)).toEqual([]);
    expect(Array.from(wrappedIter)).toEqual([]);
    // ...
  });
});

describe("map", () => {
  it("map on empty iterable", () => {
    expect(map([], (x) => x)).toEqual([]);
  });

  it("imap works like Array.map, but lazy", () => {
    expect(map([1, 2, 3], (x) => x)).toEqual([1, 2, 3]);
    expect(map([1, 2, 3], (x) => 2 * x)).toEqual([2, 4, 6]);
    expect(map([1, 2, 3], (x) => x.toString())).toEqual(["1", "2", "3"]);
  });
});

describe("max", () => {
  it("can't take max of empty list", () => {
    expect(max([])).toBeUndefined();
  });

  it("max of single-item array", () => {
    expect(max([1])).toEqual(1);
    expect(max([2])).toEqual(2);
    expect(max([5])).toEqual(5);
  });

  it("max of multi-item array", () => {
    expect(max([1, 2, 3])).toEqual(3);
    expect(max([2, 2, 2, 2])).toEqual(2);
    expect(max([5, 4, 3, 2, 1])).toEqual(5);
    expect(max([-3, -2, -1])).toEqual(-1);
  });

  it("max of multi-item array with key function", () => {
    expect(max([{ n: 2 }, { n: 3 }, { n: 1 }], (o) => o.n)).toEqual({ n: 3 });
  });
});

describe("min", () => {
  it("can't take min of empty list", () => {
    expect(min([])).toBeUndefined();
  });

  it("min of single-item array", () => {
    expect(min([1])).toEqual(1);
    expect(min([2])).toEqual(2);
    expect(min([5])).toEqual(5);
  });

  it("min of multi-item array", () => {
    expect(min([1, 2, 3])).toEqual(1);
    expect(min([2, 2, 2, 2])).toEqual(2);
    expect(min([5, 4, 3, 2, 1])).toEqual(1);
    expect(min([-3, -2, -1])).toEqual(-3);
  });

  it("min of multi-item array with key function", () => {
    expect(min([{ n: 2 }, { n: 3 }, { n: 1 }], (o) => o.n)).toEqual({ n: 1 });
  });
});

describe("range", () => {
  it("range with end", () => {
    expect(Array.from(range(0))).toEqual([]);
    expect(Array.from(range(1))).toEqual([0]);
    expect(Array.from(range(2))).toEqual([0, 1]);
    expect(Array.from(range(5))).toEqual([0, 1, 2, 3, 4]);
    expect(Array.from(range(-1))).toEqual([]);
  });

  it("range with start and end", () => {
    expect(Array.from(range(3, 5))).toEqual([3, 4]);
    expect(Array.from(range(4, 7))).toEqual([4, 5, 6]);

    // If end < start, then range is empty
    expect(Array.from(range(5, 1))).toEqual([]);
  });

  it("range with start, end, and step", () => {
    expect(Array.from(range(3, 9, 3))).toEqual([3, 6]);
    expect(Array.from(range(3, 10, 3))).toEqual([3, 6, 9]);
    expect(Array.from(range(5, 1, -1))).toEqual([5, 4, 3, 2]);
    expect(Array.from(range(5, -3, -2))).toEqual([5, 3, 1, -1]);
  });
});

describe("reduce", () => {
  const adder = (x: number, y: number) => x + y;
  const firstOne = (x: unknown) => x;

  it("reduce without initializer", () => {
    expect(reduce([], adder)).toBeUndefined();
    expect(reduce([1], adder)).toEqual(1);
    expect(reduce([1, 2], adder)).toEqual(3);
  });

  it("reduce on empty list returns start value", () => {
    expect(reduce([], adder, 0)).toEqual(0);
    expect(reduce([], adder, 13)).toEqual(13);
  });

  it("reduce on list with only one item", () => {
    expect(reduce([5], adder, 0)).toEqual(5);
    expect(reduce([5], adder, 13)).toEqual(18);
  });

  it("reduce on list with multiple items", () => {
    expect(reduce([1, 2, 3, 4], adder, 0)).toEqual(10);
    expect(reduce([1, 2, 3, 4, 5], adder, 13)).toEqual(28);
  });

  it("reduce on list with multiple items (no initializer)", () => {
    expect(reduce([13, 2, 3, 4], firstOne)).toEqual(13);
    expect(reduce([undefined, null, 1, 2, 3, 4], firstOne)).toEqual(undefined);
  });
  it("reduce on iterable (lazily-evaluated)", () => {
    function* myLazyList() {
      yield 1;
      yield 2;
      yield 3;
    }
    expect(reduce(myLazyList(), adder)).toEqual(6);
  });
});

describe("sorted", () => {
  it("sorted w/ empty list", () => {
    expect(sorted([])).toEqual([]);
  });

  it("sorted values", () => {
    expect(sorted([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    expect(sorted([2, 1, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    expect(sorted([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);

    // Explicitly test numeral ordering... in plain JS the following is true:
    // [4, 44, 100, 80, 9].sort()  ~~>  [100, 4, 44, 80, 9]
    expect(sorted([4, 44, 100, 80, 9])).toEqual([4, 9, 44, 80, 100]);
    expect(sorted(["4", "44", "100", "80", "44", "9"])).toEqual(["100", "4", "44", "44", "80", "9"]);
    expect(sorted([false, true, true, false])).toEqual([false, false, true, true]);
  });

  it("sorted does not modify input", () => {
    const values = [4, 0, -3, 7, 1];
    expect(sorted(values)).toEqual([-3, 0, 1, 4, 7]);
    expect(values).toEqual([4, 0, -3, 7, 1]);
  });

  it("sorted in reverse", () => {
    expect(sorted([2, 1, 3, 4, 5], undefined, true)).toEqual([5, 4, 3, 2, 1]);
  });
});

describe("sum", () => {
  it("sum w/ empty iterable", () => {
    expect(sum([])).toEqual(0);
  });

  it("sum works", () => {
    expect(sum([1, 2, 3, 4, 5, 6])).toEqual(21);
    expect(sum([-3, -2, -1, 0, 1, 2, 3])).toEqual(0);
    expect(sum([0.1, 0.2, 0.3])).toBeCloseTo(0.6);
  });
});

describe("zip", () => {
  it("zip with empty iterable", () => {
    expect(zip([], [])).toEqual([]);
    expect(zip("abc", [])).toEqual([]);
  });

  it("izip with two iterables", () => {
    expect(zip("abc", "ABC")).toEqual([
      ["a", "A"],
      ["b", "B"],
      ["c", "C"],
    ]);
  });

  it("izip with three iterables", () => {
    expect(zip3("abc", "ABC", [5, 4, 3])).toEqual([
      ["a", "A", 5],
      ["b", "B", 4],
      ["c", "C", 3],
    ]);
  });

  it("izip different input lengths", () => {
    // Shortest lengthed input determines result length
    expect(zip("a", "ABC")).toEqual([["a", "A"]]);
    expect(zip3("", "ABCD", "PQR")).toEqual([]);
  });
});
