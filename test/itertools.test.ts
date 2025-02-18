import { describe, it, expect } from "vitest";
import {
  all,
  chain,
  compress,
  count,
  cycle,
  dropwhile,
  groupby,
  ifilter,
  imap,
  islice,
  permutations,
  range,
  repeat,
  take,
  takewhile,
  zipLongest,
  zipLongest3,
  zipMany,
} from "~";

const isEven = (x: number) => x % 2 === 0;
const isEvenIndex = (_: unknown, index: number) => index % 2 === 0;
const isPositive = (x: number) => x >= 0;

function isNum(value: unknown): value is number {
  return typeof value === "number";
}

function* gen<T>(values: T[]): Iterable<T> {
  for (const value of values) {
    yield value;
  }
}

describe("chain", () => {
  it("chains empty iterables", () => {
    expect(Array.from(chain([], []))).toEqual([]);
  });

  it("chains iterables together", () => {
    expect(Array.from(chain(["foo"], []))).toEqual(["foo"]);
    expect(Array.from(chain([], ["bar"]))).toEqual(["bar"]);
    expect(Array.from(chain([], ["bar"], ["qux"]))).toEqual(["bar", "qux"]);
    expect(Array.from(chain(["foo", "bar"], ["qux"]))).toEqual(["foo", "bar", "qux"]);
  });
});

describe("compress", () => {
  it("compress on empty list", () => {
    expect(compress([], [])).toEqual([]);
  });

  it("compress removes selected items", () => {
    expect(compress("abc", [])).toEqual([]);
    expect(compress("abc", [true])).toEqual(["a"]);
    expect(compress("abc", [false, false, false])).toEqual([]);
    expect(compress("abc", [true, false, true])).toEqual(["a", "c"]);
  });
});

describe("count", () => {
  it("default counter", () => {
    expect(take(6, count())).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("counter from different start value", () => {
    expect(take(6, count(1))).toEqual([1, 2, 3, 4, 5, 6]);
    expect(take(6, count(-3))).toEqual([-3, -2, -1, 0, 1, 2]);
  });

  it("counter backwards", () => {
    expect(take(6, count(4, -1))).toEqual([4, 3, 2, 1, 0, -1]);
    expect(take(5, count(-3, -2))).toEqual([-3, -5, -7, -9, -11]);
  });
});

describe("cycle", () => {
  it("cycle with empty list", () => {
    expect(Array.from(cycle([]))).toEqual([]);
  });

  it("cycles", () => {
    // We'll have to wrap it in a take() call to avoid infinite-length arrays :)
    expect(take(3, cycle(["x"]))).toEqual(["x", "x", "x"]);
    expect(take(5, cycle(["even", "odd"]))).toEqual(["even", "odd", "even", "odd", "even"]);
  });

  it("cycles with infinite iterable", () => {
    // Function `cycle` should properly work with infinite iterators (`repeat('x')` in this case)
    expect(take(3, cycle(repeat("x")))).toEqual(["x", "x", "x"]);
  });
});

describe("dropwhile", () => {
  it("dropwhile on empty list", () => {
    expect(Array.from(dropwhile([], isEven))).toEqual([]);
    expect(Array.from(dropwhile([], isEvenIndex))).toEqual([]);
    expect(Array.from(dropwhile([], isPositive))).toEqual([]);
  });

  it("dropwhile on list", () => {
    expect(Array.from(dropwhile([1], isEven))).toEqual([1]);
    expect(Array.from(dropwhile([1], isEvenIndex))).toEqual([]);
    expect(Array.from(dropwhile([1], isPositive))).toEqual([]);

    expect(Array.from(dropwhile([-1, 0, 1], isEven))).toEqual([-1, 0, 1]);
    expect(Array.from(dropwhile([4, -1, 0, 1], isEven))).toEqual([-1, 0, 1]);
    expect(Array.from(dropwhile([-1, 0, 1], isEvenIndex))).toEqual([0, 1]);
    expect(Array.from(dropwhile([4, -1, 0, 1], isEvenIndex))).toEqual([-1, 0, 1]);
    expect(Array.from(dropwhile([-1, 0, 1], isPositive))).toEqual([-1, 0, 1]);
    expect(Array.from(dropwhile([7, -1, 0, 1], isPositive))).toEqual([-1, 0, 1]);

    expect(Array.from(dropwhile([0, 2, 4, 6, 7, 8, 10], isEven))).toEqual([7, 8, 10]);
    expect(Array.from(dropwhile([0, 2, 4, 6, 7, 8, 10], isEvenIndex))).toEqual([2, 4, 6, 7, 8, 10]);
    expect(Array.from(dropwhile([0, 1, 2, -2, 3, 4, 5, 6, 7], isPositive))).toEqual([-2, 3, 4, 5, 6, 7]);
  });

  it("dropwhile on lazy iterable", () => {
    const lazy = dropwhile(gen([0, 1, 2, -2, 3, 4, 5, 6, 7]), isPositive);
    expect(Array.from(lazy)).toEqual([-2, 3, 4, 5, 6, 7]);
  });
});

describe("groupby", () => {
  const countValues = <K, V>(grouped: Iterable<[K, Iterable<V>]>) =>
    Array.from(imap(grouped, ([k, v]) => [k, Array.from(v).length]));

  it("groupby with empty list", () => {
    expect(Array.from(groupby([]))).toEqual([]);
  });

  it("groups elements", () => {
    expect(countValues(groupby("aaabbbbcddddaa"))).toEqual([
      ["a", 3],
      ["b", 4],
      ["c", 1],
      ["d", 4],
      ["a", 2],
    ]);
  });

  it("groups element with key function", () => {
    expect(countValues(groupby("aaaAbb"))).toEqual([
      ["a", 3],
      ["A", 1],
      ["b", 2],
    ]);
    expect(countValues(groupby("aaaAbb", (val) => val.toUpperCase()))).toEqual([
      ["A", 4],
      ["B", 2],
    ]);
  });

  it("handles not using the inner iterator", () => {
    expect(Array.from(imap(groupby("aaabbbbcddddaa"), ([k]) => k))).toEqual(["a", "b", "c", "d", "a"]);
  });

  it("handles using the inner iterator after the iteration has advanced", () => {
    expect(Array.from(groupby("aaabb")).map(([, v]) => Array.from(v))).toEqual([[], []]);
    const it = groupby("aaabbccc");
    // Flow does not like that I use next on an iterable (it is actually
    // a generator but the Generator type is awful.

    const [, v1] = it.next().value!;
    const [, v2] = it.next().value!;
    const [, v3] = it.next().value!;

    expect([...v1]).toEqual([]);
    expect([...v2]).toEqual([]);
    expect(v3.next().value!).toEqual("c");
    Array.from(it); // exhaust the groupby iterator
    expect([...v3]).toEqual([]);
  });
});

describe("icompress", () => {
  it("icompress is tested through compress() tests", () => {
    // This is okay
  });
});

describe("ifilter", () => {
  it("ifilter is tested through filter() tests (see builtins)", () => {
    // This is okay
  });

  it("ifilter can handle infinite inputs", () => {
    expect(take(5, ifilter(range(9999), isEven))).toEqual([0, 2, 4, 6, 8]);
    expect(take(5, ifilter(range(9999), isEvenIndex))).toEqual([0, 2, 4, 6, 8]);
  });

  it("ifilter retains rich type info", () => {
    const filtered = take(5, ifilter([3, "hi", null, -7], isNum));
    expect(filtered).toEqual([3, -7]);
    //     ^^^^^^^^ number[]
  });
});

describe("imap", () => {
  it("imap is tested through map() tests (see builtins)", () => {
    // This is okay
  });

  it("...but imap can handle infinite inputs", () => {
    expect(
      take(
        3,
        imap(range(9999), (x) => -x),
      ),
    ).toEqual([-0, -1, -2]);
  });
});

describe("islice", () => {
  it("islice an empty iterable", () => {
    expect(Array.from(islice([], 2))).toEqual([]);
  });

  it("islice with arguments", () => {
    expect(Array.from(islice("ABCDEFG", /*stop*/ 2))).toEqual(["A", "B"]);
    expect(Array.from(islice("ABCDEFG", 2, 4))).toEqual(["C", "D"]);
    expect(Array.from(islice("ABCDEFG", /*start*/ 2, /*stop*/ undefined))).toEqual(["A", "B"]);
    expect(Array.from(islice("ABCDEFG", /*start*/ 2, /*stop*/ null))).toEqual(["C", "D", "E", "F", "G"]);
    expect(Array.from(islice("ABCDEFG", /*start*/ 0, /*stop*/ null, /*step*/ 2))).toEqual(["A", "C", "E", "G"]);
    expect(Array.from(islice("ABCDEFG", /*start*/ 1, /*stop*/ null, /*step*/ 2))).toEqual(["B", "D", "F"]);
  });

  it("islice with infinite inputs", () => {
    expect(Array.from(islice(count(1), 0))).toEqual([]);
    expect(Array.from(islice(count(1), 0, 0))).toEqual([]);
    expect(Array.from(islice(count(1), 3, 2))).toEqual([]);
    expect(Array.from(islice(count(1), 5))).toEqual([1, 2, 3, 4, 5]);
    expect(Array.from(islice(count(1), 3, 7))).toEqual([4, 5, 6, 7]);
    expect(Array.from(islice(count(1), 4, 32, 5))).toEqual([5, 10, 15, 20, 25, 30]);
    expect(Array.from(islice(count(69), 18, 391, 81))).toEqual([87, 168, 249, 330, 411]);
  });

  it("islice invalid stop argument", () => {
    expect(() => Array.from(islice("ABCDEFG", /*stop*/ -2))).toThrow();
    expect(() => Array.from(islice("ABCDEFG", -2, -3))).toThrow();
    expect(() => Array.from(islice("ABCDEFG", 0, 3, 0))).toThrow();
    expect(() => Array.from(islice("ABCDEFG", 0, 3, -1))).toThrow();
  });

  it("continuation after islice", () => {
    const lazy = gen(take(10, count(1)));
    expect(Array.from(islice(lazy, 2, 5))).toEqual([3, 4, 5]);
    expect(Array.from(lazy)).toEqual([6, 7, 8, 9, 10]);
  });
});

describe("izip", () => {
  it("izip is tested through zip() tests (see builtins)", () => {
    // This is okay
  });
});

describe("izip3", () => {
  it("izip3 is tested through zip3() tests (see builtins)", () => {
    // This is okay
  });
});

describe("izipMany", () => {
  it("izipMany is tested through zipMany() tests", () => {
    // This is okay
  });
});

describe("izipLongest", () => {
  it("izipLongest is tested through zipLongest() tests", () => {
    // This is okay
  });
});

describe("izipLongest3", () => {
  it("izipLongest3 is tested through zipLongest3() tests", () => {
    // This is okay
  });
});

describe("permutations", () => {
  it("permutations of empty list", () => {
    expect(Array.from(permutations([]))).toEqual([[]]);
  });

  it("permutations of unique values", () => {
    expect(Array.from(permutations([1, 2]))).toEqual([
      [1, 2],
      [2, 1],
    ]);

    expect(Array.from(permutations([1, 2, 3]))).toEqual([
      [1, 2, 3],
      [1, 3, 2],
      [2, 1, 3],
      [2, 3, 1],
      [3, 1, 2],
      [3, 2, 1],
    ]);

    // Duplicates have no effect on the results
    expect(Array.from(permutations([2, 2, 3]))).toEqual([
      [2, 2, 3],
      [2, 3, 2],
      [2, 2, 3],
      [2, 3, 2],
      [3, 2, 2],
      [3, 2, 2],
    ]);
  });

  it("permutations with r param", () => {
    // r too big
    expect(Array.from(permutations([1, 2], 5))).toEqual([]);

    // prettier-ignore
    expect(Array.from(permutations(range(4), 2))).toEqual([
            [0, 1], [0, 2], [0, 3], [1, 0], [1, 2], [1, 3],
            [2, 0], [2, 1], [2, 3], [3, 0], [3, 1], [3, 2],
        ]);
  });
});

describe("repeat", () => {
  it("repeat indefinitely #1", () => {
    // practically limit it to something (in this case 99)
    const items = take(99, repeat(123));
    expect(all(items, (n) => n === 123)).toEqual(true);
  });

  it("repeat indefinitely #2", () => {
    const items = take(99, repeat("foo"));
    expect(all(items, (n) => n === "foo")).toEqual(true);
  });

  it("repeat a fixed number of times", () => {
    const items = repeat("foo", 100);
    expect(all(items, (n) => n === "foo")).toEqual(true);
  });
});

describe("takewhile", () => {
  it("takewhile on empty list", () => {
    expect(Array.from(takewhile([], isEven))).toEqual([]);
    expect(Array.from(takewhile([], isEvenIndex))).toEqual([]);
    expect(Array.from(takewhile([], isPositive))).toEqual([]);
  });

  it("takewhile on list", () => {
    expect(Array.from(takewhile([1], isEven))).toEqual([]);
    expect(Array.from(takewhile([1], isEvenIndex))).toEqual([1]);
    expect(Array.from(takewhile([1], isPositive))).toEqual([1]);

    expect(Array.from(takewhile([-1, 0, 1], isEven))).toEqual([]);
    expect(Array.from(takewhile([-1, 0, 1], isEvenIndex))).toEqual([-1]);
    expect(Array.from(takewhile([-1, 0, 1], isPositive))).toEqual([]);

    expect(Array.from(takewhile([0, 2, 4, 6, 7, 8, 10], isEven))).toEqual([0, 2, 4, 6]);
    expect(Array.from(takewhile([0, 2, 4, 6, 7, 8, 10], isEvenIndex))).toEqual([0]);
    expect(Array.from(takewhile([0, 1, 2, -2, 3, 4, 5, 6, 7], isPositive))).toEqual([0, 1, 2]);
  });

  it("takewhile on lazy iterable", () => {
    const lazy = gen([0, 1, 2, -2, 4, 6, 8, 7]);
    const lazy1 = takewhile(lazy, isPositive);
    const lazy2 = takewhile(lazy, isEvenIndex);
    const lazy3 = takewhile(lazy, isEven);

    expect(Array.from(lazy1)).toEqual([0, 1, 2]);

    // By now, the -2 from the original input has been consumed, but we should
    // be able to continue pulling more values from the same input
    expect(Array.from(lazy2)).toEqual([4]);

    // By now, the 6 from the original input has been consumed, but we should
    // be able to continue pulling more values from the same input
    expect(Array.from(lazy3)).toEqual([8]);
  });
});

describe("zipMany", () => {
  it("zipMany with empty iterable", () => {
    expect(zipMany([])).toEqual([]);
    expect(zipMany([], [])).toEqual([]);
  });

  it("zipMany takes any number of (homogenous) iterables", () => {
    expect(zipMany("abc", "ABC")).toEqual([
      ["a", "A"],
      ["b", "B"],
      ["c", "C"],
    ]);
    expect(zipMany("abc", "ABC", "pqrs", "xyz")).toEqual([
      ["a", "A", "p", "x"],
      ["b", "B", "q", "y"],
      ["c", "C", "r", "z"],
    ]);
  });
});

describe("zipLongest", () => {
  it("zipLongest with empty iterable", () => {
    expect(zipLongest([], [])).toEqual([]);
  });

  it("zipLongest with two iterables", () => {
    expect(zipLongest("abc", "")).toEqual([
      ["a", undefined],
      ["b", undefined],
      ["c", undefined],
    ]);
    expect(zipLongest("x", "abc")).toEqual([
      ["x", "a"],
      [undefined, "b"],
      [undefined, "c"],
    ]);
    expect(zipLongest("x", "abc", /* filler */ 0)).toEqual([
      ["x", "a"],
      [0, "b"],
      [0, "c"],
    ]);
  });
});

describe("zipLongest3", () => {
  it("zipLongest3 with empty iterable", () => {
    expect(zipLongest3([], [], [])).toEqual([]);
  });

  it("zipLongest3 with two iterables", () => {
    expect(zipLongest3("abc", "", [1, 2, 3])).toEqual([
      ["a", undefined, 1],
      ["b", undefined, 2],
      ["c", undefined, 3],
    ]);
    expect(zipLongest3("x", "abc", [1, 2, 3])).toEqual([
      ["x", "a", 1],
      [undefined, "b", 2],
      [undefined, "c", 3],
    ]);
    expect(zipLongest3("x", "abc", [1, 2], /* filler */ 0)).toEqual([
      ["x", "a", 1],
      [0, "b", 2],
      [0, "c", 0],
    ]);
  });
});
