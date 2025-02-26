import { iter, map } from "./builtins";
import { izip, repeat } from "./itertools";
import type { Predicate, Primitive } from "./types";
import { primitiveIdentity } from "./utils";

/**
 * Break iterable into lists of length `size`:
 *
 *     [...chunked([1, 2, 3, 4, 5, 6], 3)]
 *     // [[1, 2, 3], [4, 5, 6]]
 *
 * If the length of iterable is not evenly divisible by `size`, the last returned
 * list will be shorter:
 *
 *     [...chunked([1, 2, 3, 4, 5, 6, 7, 8], 3)]
 *     // [[1, 2, 3], [4, 5, 6], [7, 8]]
 */
export function* chunked<T>(iterable: Iterable<T>, size: number): IterableIterator<T[]> {
  if (size < 1) {
    throw new Error(`Invalid chunk size: ${size}`);
  }

  const it = iter(iterable);
  for (;;) {
    const chunk = take(size, it);
    if (chunk.length > 0) {
      yield chunk;
    }
    if (chunk.length < size) {
      return;
    }
  }
}

/**
 * Return an iterator flattening one level of nesting in a list of lists:
 *
 *     [...flatten([[0, 1], [2, 3]])]
 *     // [0, 1, 2, 3]
 *
 */
export function* flatten<T>(iterableOfIterables: Iterable<Iterable<T>>): IterableIterator<T> {
  for (const iterable of iterableOfIterables) {
    for (const item of iterable) {
      yield item;
    }
  }
}

/**
 * Intersperse filler element `value` among the items in `iterable`.
 *
 *     >>> [...intersperse(-1, range(1, 5))]
 *     [1, -1, 2, -1, 3, -1, 4]
 *
 */
export function intersperse<T, V>(value: V, iterable: Iterable<T>): IterableIterator<T | V> {
  const stream = flatten<T | V>(izip(repeat(value), iterable));
  stream.next(); // eat away and discard the first value from the output
  return stream;
}

/**
 * Returns an iterable containing only the first `n` elements of the given
 * iterable.
 */
export function* itake<T>(n: number, iterable: Iterable<T>): IterableIterator<T> {
  const it = iter(iterable);
  let count = n;
  while (count-- > 0) {
    const s = it.next();
    if (!s.done) {
      yield s.value;
    } else {
      // Iterable exhausted, quit early
      return;
    }
  }
}

/**
 * Returns an iterator of paired items, overlapping, from the original.  When
 * the input iterable has a finite number of items `n`, the outputted iterable
 * will have `n - 1` items.
 *
 *     >>> pairwise([8, 2, 0, 7])
 *     [(8, 2), (2, 0), (0, 7)]
 *
 */
export function* pairwise<T>(iterable: Iterable<T>): IterableIterator<[T, T]> {
  const it = iter(iterable);
  const first = it.next();
  if (first.done) {
    return;
  }

  let r1: T = first.value;
  for (const r2 of it) {
    yield [r1, r2];
    r1 = r2;
  }
}

/**
 * Returns a 2-tuple of arrays.  Splits the elements in the input iterable into
 * either of the two arrays.  Will fully exhaust the input iterable.  The first
 * array contains all items that match the predicate, the second the rest:
 *
 *     >>> const isOdd = x => x % 2 !== 0;
 *     >>> const iterable = range(10);
 *     >>> const [odds, evens] = partition(iterable, isOdd);
 *     >>> odds
 *     [1, 3, 5, 7, 9]
 *     >>> evens
 *     [0, 2, 4, 6, 8]
 *
 */
export function partition<T, N extends T>(
  iterable: Iterable<T>,
  predicate: (item: T, index: number) => item is N,
): [N[], Exclude<T, N>[]];
export function partition<T>(iterable: Iterable<T>, predicate: Predicate<T>): [T[], T[]];
export function partition<T>(iterable: Iterable<T>, predicate: Predicate<T>): [T[], T[]] {
  const good = [];
  const bad = [];

  let index = 0;
  for (const item of iterable) {
    if (predicate(item, index++)) {
      good.push(item);
    } else {
      bad.push(item);
    }
  }

  return [good, bad];
}

/**
 * Yields the next item from each iterable in turn, alternating between them.
 * Continues until all items are exhausted.
 *
 *     >>> [...roundrobin([1, 2, 3], [4], [5, 6, 7, 8])]
 *     [1, 4, 5, 2, 6, 3, 7, 8]
 */
export function* roundrobin<T>(...iters: Iterable<T>[]): IterableIterator<T> {
  // We'll only keep lazy versions of the input iterables in here that we'll
  // slowly going to exhaust.  Once an iterable is exhausted, it will be
  // removed from this list.  Once the entire list is empty, this algorithm
  // ends.
  const iterables: Iterator<T>[] = map(iters, iter);

  while (iterables.length > 0) {
    let index = 0;
    while (index < iterables.length) {
      const it = iterables[index];
      const result = it.next();

      if (!result.done) {
        yield result.value;
        index++;
      } else {
        // This iterable is exhausted, make sure to remove it from the
        // list of iterables.  We'll splice the array from under our
        // feet, and NOT advancing the index counter.
        iterables.splice(index, 1); // intentional side-effect!
      }
    }
  }
}

/**
 * Yields the heads of all of the given iterables.  This is almost like
 * `roundrobin()`, except that the yielded outputs are grouped in to the
 * "rounds":
 *
 *     >>> [...heads([1, 2, 3], [4], [5, 6, 7, 8])]
 *     [[1, 4, 5], [2, 6], [3, 7], [8]]
 *
 * This is also different from `zipLongest()`, since the number of items in
 * each round can decrease over time, rather than being filled with a filler.
 */
export function* heads<T>(...iters: Iterable<T>[]): IterableIterator<T[]> {
  // We'll only keep lazy versions of the input iterables in here that we'll
  // slowly going to exhaust.  Once an iterable is exhausted, it will be
  // removed from this list.  Once the entire list is empty, this algorithm
  // ends.
  const iterables: Iterator<T>[] = map(iters, iter);

  while (iterables.length > 0) {
    let index = 0;
    const round = [];
    while (index < iterables.length) {
      const it = iterables[index];
      const result = it.next();

      if (!result.done) {
        round.push(result.value);
        index++;
      } else {
        // This iterable is exhausted, make sure to remove it from the
        // list of iterables.  We'll splice the array from under our
        // feet, and NOT advancing the index counter.
        iterables.splice(index, 1); // intentional side-effect!
      }
    }
    if (round.length > 0) {
      yield round;
    }
  }
}

/**
 * Non-lazy version of itake().
 */
export function take<T>(n: number, iterable: Iterable<T>): T[] {
  return Array.from(itake(n, iterable));
}

/**
 * Yield unique elements, preserving order.
 *
 *     >>> [...uniqueEverseen('AAAABBBCCDAABBB')]
 *     ['A', 'B', 'C', 'D']
 *     >>> [...uniqueEverseen('AbBCcAB', s => s.toLowerCase())]
 *     ['A', 'b', 'C']
 *
 */
export function* uniqueEverseen<T>(
  iterable: Iterable<T>,
  keyFn: (item: T) => Primitive = primitiveIdentity,
): IterableIterator<T> {
  const seen = new Set();
  for (const item of iterable) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      yield item;
    }
  }
}

/**
 * Yield only elements from the input that occur more than once. Needs to
 * consume the entire input before being able to produce the first result.
 *
 *     >>> [...dupes('AAAABCDEEEFABG')]
 *     [['A', 'A', 'A', 'A', 'A'], ['E', 'E', 'E'], ['B', 'B']]
 *     >>> [...dupes('AbBCcAB', s => s.toLowerCase())]
 *     [['b', 'B', 'B'], ['C', 'c'], ['A', 'A']]
 *
 */
export function dupes<T>(
  iterable: Iterable<T>,
  keyFn: (item: T) => Primitive = primitiveIdentity,
): IterableIterator<T[]> {
  const multiples = new Map<Primitive, T[]>();

  {
    const singles = new Map<Primitive, T>();
    for (const item of iterable) {
      const key = keyFn(item);
      if (multiples.has(key)) {
        multiples.get(key)!.push(item);
      } else if (singles.has(key)) {
        multiples.set(key, [singles.get(key)!, item]);
        singles.delete(key);
      } else {
        singles.set(key, item);
      }
    }
  }

  return multiples.values();
}

/**
 * Yields elements in order, ignoring serial duplicates.
 *
 *     >>> [...uniqueJustseen('AAAABBBCCDAABBB')]
 *     ['A', 'B', 'C', 'D', 'A', 'B']
 *     >>> [...uniqueJustseen('AbBCcAB', s => s.toLowerCase())]
 *     ['A', 'b', 'C', 'A', 'B']
 *
 */
export function* uniqueJustseen<T>(
  iterable: Iterable<T>,
  keyFn: (item: T) => Primitive = primitiveIdentity,
): IterableIterator<T> {
  let last = undefined;
  for (const item of iterable) {
    const key = keyFn(item);
    if (key !== last) {
      yield item;
      last = key;
    }
  }
}
