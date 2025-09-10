import { every, iter, range } from "./builtins";
import { flatten } from "./more-itertools";
import type { Predicate, Primitive } from "./types";
import { primitiveIdentity } from "./utils";

const SENTINEL = Symbol();

/**
 * Returns an iterator that returns elements from the first iterable until it
 * is exhausted, then proceeds to the next iterable, until all of the iterables
 * are exhausted.  Used for treating consecutive sequences as a single
 * sequence.
 */
export function chain<T>(...iterables: Iterable<T>[]): IterableIterator<T> {
  return flatten(iterables);
}

/**
 * Returns an iterator that counts up values starting with number `start`
 * (default 0), incrementing by `step`.  To decrement, use a negative step
 * number.
 */
export function* count(start = 0, step = 1): IterableIterator<number> {
  let n = start;
  for (;;) {
    yield n;
    n += step;
  }
}

/**
 * Non-lazy version of icompress().
 */
export function compress<T>(data: Iterable<T>, selectors: Iterable<boolean>): T[] {
  return Array.from(icompress(data, selectors));
}

/**
 * Returns an iterator producing elements from the iterable and saving a copy
 * of each.  When the iterable is exhausted, return elements from the saved
 * copy.  Repeats indefinitely.
 */
export function* cycle<T>(iterable: Iterable<T>): IterableIterator<T> {
  const saved = [];
  for (const element of iterable) {
    yield element;
    saved.push(element);
  }

  while (saved.length > 0) {
    for (const element of saved) {
      yield element;
    }
  }
}

/**
 * Returns an iterator that drops elements from the iterable as long as the
 * predicate is true; afterwards, returns every remaining element.  Note, the
 * iterator does not produce any output until the predicate first becomes
 * false.
 */
export function* dropwhile<T>(iterable: Iterable<T>, predicate: Predicate<T>): IterableIterator<T> {
  let index = 0;
  const it = iter(iterable);
  let res: IteratorResult<T>;
  while (!(res = it.next()).done) {
    const value = res.value;
    if (!predicate(value, index++)) {
      yield value;
      break; // we break, so we cannot use a for..of loop!
    }
  }

  for (const value of it) {
    yield value;
  }
}

/** @deprecated Please rename to `igroupby`, or use the new eager version `groupBy`. */
export const groupby = igroupby;

export function* igroupby<T, K extends Primitive>(
  iterable: Iterable<T>,
  keyFn: (item: T) => K = primitiveIdentity,
): Generator<[K, Generator<T, undefined>], undefined> {
  const it = iter(iterable);

  let currentValue: T;
  let currentKey: K = SENTINEL as unknown as K;
  //                           ^^^^^^^^^^^^^^^ Hack!
  let targetKey: K = currentKey;

  const grouper = function* grouper(tgtKey: K): Generator<T, undefined> {
    while (currentKey === tgtKey) {
      yield currentValue;

      const nextVal = it.next();
      if (nextVal.done) return;
      currentValue = nextVal.value;
      currentKey = keyFn(currentValue);
    }
  };

  for (;;) {
    while (currentKey === targetKey) {
      const nextVal = it.next();
      if (nextVal.done) {
        currentKey = SENTINEL as unknown as K;
        //                    ^^^^^^^^^^^^^^^ Hack!
        return;
      }
      currentValue = nextVal.value;
      currentKey = keyFn(currentValue);
    }

    targetKey = currentKey;
    yield [currentKey, grouper(targetKey)];
  }
}

export function groupBy<T, K extends string | number>(iterable: Iterable<T>, keyFn: (item: T) => K): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of iterable) {
    const key = keyFn(item);
    if (!Object.hasOwn(result, key)) {
      result[key] = [];
    }
    result[key].push(item);
  }
  return result;
}

export function indexBy<T, K extends string | number>(iterable: Iterable<T>, keyFn: (item: T) => K): Record<K, T> {
  const result = {} as Record<K, T>;
  for (const item of iterable) {
    const key = keyFn(item);
    result[key] = item;
  }
  return result;
}

/**
 * Returns an iterator that filters elements from data returning only those
 * that have a corresponding element in selectors that evaluates to `true`.
 * Stops when either the data or selectors iterables has been exhausted.
 */
export function* icompress<T>(data: Iterable<T>, selectors: Iterable<boolean>): IterableIterator<T> {
  for (const [d, s] of izip(data, selectors)) {
    if (s) {
      yield d;
    }
  }
}

/**
 * Returns an iterator that filters elements from iterable returning only those
 * for which the predicate is true.
 */
export function ifilter<T, N extends T>(iterable: Iterable<T>, predicate: (item: T) => item is N): IterableIterator<N>;
export function ifilter<T>(iterable: Iterable<T>, predicate: Predicate<T>): IterableIterator<T>;
export function* ifilter<T>(iterable: Iterable<T>, predicate: Predicate<T>): IterableIterator<T> {
  let index = 0;
  for (const value of iterable) {
    if (predicate(value, index++)) {
      yield value;
    }
  }
}

/**
 * Returns an iterator that computes the given mapper function using arguments
 * from each of the iterables.
 */
export function* imap<T, V>(iterable: Iterable<T>, mapper: (item: T) => V): IterableIterator<V> {
  for (const value of iterable) {
    yield mapper(value);
  }
}

/**
 * Returns an iterator that returns selected elements from the iterable.  If
 * `start` is non-zero, then elements from the iterable are skipped until start
 * is reached.  Then, elements are returned by making steps of `step` (defaults
 * to 1).  If set to higher than 1, items will be skipped.  If `stop` is
 * provided, then iteration continues until the iterator reached that index,
 * otherwise, the iterable will be fully exhausted.  `islice()` does not
 * support negative values for `start`, `stop`, or `step`.
 */
export function islice<T>(iterable: Iterable<T>, stop: number): IterableIterator<T>;
export function islice<T>(
  iterable: Iterable<T>,
  start: number,
  stop?: number | null,
  step?: number,
): IterableIterator<T>;
export function* islice<T>(
  iterable: Iterable<T>,
  stopOrStart: number,
  possiblyStop?: number | null,
  step = 1,
): IterableIterator<T> {
  let start, stop;
  if (possiblyStop !== undefined) {
    // islice(iterable, start, stop[, step])
    start = stopOrStart;
    stop = possiblyStop;
  } else {
    // islice(iterable, stop)
    start = 0;
    stop = stopOrStart;
  }

  if (start < 0) throw new Error("start cannot be negative");
  if (stop !== null && stop < 0) throw new Error("stop cannot be negative");
  if (step <= 0) throw new Error("step cannot be negative");

  let i = -1;
  const it = iter(iterable);
  let res: IteratorResult<T>;
  while (true) {
    i++;
    if (stop !== null && i >= stop) return; // early returns, so we cannot use a for..of loop!

    res = it.next();
    if (res.done) return;

    if (i < start) continue;
    if ((i - start) % step === 0) {
      yield res.value;
    }
  }
}

/**
 * Returns an iterator that aggregates elements from each of the iterables.
 * Used for lock-step iteration over several iterables at a time.  When
 * iterating over two iterables, use `izip2`.  When iterating over three
 * iterables, use `izip3`, etc.  `izip` is an alias for `izip2`.
 */
export function* izip<T1, T2>(xs: Iterable<T1>, ys: Iterable<T2>): IterableIterator<[T1, T2]> {
  const ixs = iter(xs);
  const iys = iter(ys);
  for (;;) {
    const x = ixs.next();
    const y = iys.next();
    if (!x.done && !y.done) {
      yield [x.value, y.value];
    } else {
      // One of the iterables exhausted
      return;
    }
  }
}

/**
 * Like izip2, but for three input iterables.
 */
export function* izip3<T1, T2, T3>(
  xs: Iterable<T1>,
  ys: Iterable<T2>,
  zs: Iterable<T3>,
): IterableIterator<[T1, T2, T3]> {
  const ixs = iter(xs);
  const iys = iter(ys);
  const izs = iter(zs);
  for (;;) {
    const x = ixs.next();
    const y = iys.next();
    const z = izs.next();
    if (!x.done && !y.done && !z.done) {
      yield [x.value, y.value, z.value];
    } else {
      // One of the iterables exhausted
      return;
    }
  }
}

export const izip2 = izip;

/**
 * Returns an iterator that aggregates elements from each of the iterables.  If
 * the iterables are of uneven length, missing values are filled-in with
 * fillvalue.  Iteration continues until the longest iterable is exhausted.
 */
export function* izipLongest2<T1, T2, D>(
  xs: Iterable<T1>,
  ys: Iterable<T2>,
  filler?: D,
): IterableIterator<[T1 | D, T2 | D]> {
  const filler_ = filler as D;
  const ixs = iter(xs);
  const iys = iter(ys);
  for (;;) {
    const x = ixs.next();
    const y = iys.next();
    if (x.done && y.done) {
      // All iterables exhausted
      return;
    } else {
      yield [!x.done ? x.value : filler_, !y.done ? y.value : filler_];
    }
  }
}

/**
 * See izipLongest2, but for three.
 */
export function* izipLongest3<T1, T2, T3, D = undefined>(
  xs: Iterable<T1>,
  ys: Iterable<T2>,
  zs: Iterable<T3>,
  filler?: D,
): IterableIterator<[T1 | D, T2 | D, T3 | D]> {
  const filler_ = filler as D;
  const ixs = iter(xs);
  const iys = iter(ys);
  const izs = iter(zs);
  for (;;) {
    const x = ixs.next();
    const y = iys.next();
    const z = izs.next();
    if (x.done && y.done && z.done) {
      // All iterables exhausted
      return;
    } else {
      yield [!x.done ? x.value : filler_, !y.done ? y.value : filler_, !z.done ? z.value : filler_];
    }
  }
}

/**
 * Like the other izips (`izip`, `izip3`, etc), but generalized to take an
 * unlimited amount of input iterables.  Think `izip(*iterables)` in Python.
 *
 * **Note:** Due to Flow type system limitations, you can only "generially" zip
 * iterables with homogeneous types, so you cannot mix types like <A, B> like
 * you can with izip2().
 */
export function* izipMany<T>(...iters: Iterable<T>[]): IterableIterator<T[]> {
  // Make them all iterables
  const iterables = iters.map(iter);

  for (;;) {
    const heads: IteratorResult<T, undefined>[] = iterables.map((xs) => xs.next());
    if (every(heads, (h) => !h.done)) {
      yield heads.map((h) => h.value as T);
    } else {
      // One of the iterables exhausted
      return;
    }
  }
}

/**
 * Return successive `r`-length permutations of elements in the iterable.
 *
 * If `r` is not specified, then `r` defaults to the length of the iterable and
 * all possible full-length permutations are generated.
 *
 * Permutations are emitted in lexicographic sort order.  So, if the input
 * iterable is sorted, the permutation tuples will be produced in sorted order.
 *
 * Elements are treated as unique based on their position, not on their value.
 * So if the input elements are unique, there will be no repeat values in each
 * permutation.
 */
export function* permutations<T>(iterable: Iterable<T>, r?: number): IterableIterator<T[]> {
  const pool = Array.from(iterable);
  const n = pool.length;
  const x = r ?? n;

  if (x > n) {
    return;
  }

  let indices: number[] = Array.from(range(n));
  const cycles: number[] = Array.from(range(n, n - x, -1));
  const poolgetter = (i: number) => pool[i];

  yield indices.slice(0, x).map(poolgetter);

  while (n > 0) {
    let cleanExit = true;
    for (const i of range(x - 1, -1, -1)) {
      cycles[i] -= 1;
      if (cycles[i] === 0) {
        indices = indices
          .slice(0, i)
          .concat(indices.slice(i + 1))
          .concat(indices.slice(i, i + 1));
        cycles[i] = n - i;
      } else {
        const j: number = cycles[i];

        const [p, q] = [indices[indices.length - j], indices[i]];
        indices[i] = p;
        indices[indices.length - j] = q;
        yield indices.slice(0, x).map(poolgetter);
        cleanExit = false;
        break;
      }
    }

    if (cleanExit) {
      return;
    }
  }
}

/**
 * Returns an iterator that produces values over and over again.  Runs
 * indefinitely unless the times argument is specified.
 */
export function* repeat<T>(thing: T, times?: number): IterableIterator<T> {
  if (times === undefined) {
    for (;;) {
      yield thing;
    }
  } else {
    for (const _ of range(times)) {
      yield thing;
    }
  }
}

/**
 * Returns an iterator that produces elements from the iterable as long as the
 * predicate is true.
 */
export function* takewhile<T>(iterable: Iterable<T>, predicate: Predicate<T>): IterableIterator<T> {
  let index = 0;
  const it = iter(iterable);
  let res: IteratorResult<T>;
  while (!(res = it.next()).done) {
    const value = res.value;
    if (!predicate(value, index++)) return; // early return, so we cannot use for..of loop!
    yield value;
  }
}

export function zipLongest2<T1, T2, D>(xs: Iterable<T1>, ys: Iterable<T2>, filler?: D): [T1 | D, T2 | D][] {
  return Array.from(izipLongest2(xs, ys, filler));
}

export function zipLongest3<T1, T2, T3, D>(
  xs: Iterable<T1>,
  ys: Iterable<T2>,
  zs: Iterable<T3>,
  filler?: D,
): [T1 | D, T2 | D, T3 | D][] {
  return Array.from(izipLongest3(xs, ys, zs, filler));
}

export const izipLongest = izipLongest2;
export const zipLongest = zipLongest2;

export function zipMany<T>(...iters: Iterable<T>[]): T[][] {
  return Array.from(izipMany(...iters));
}
