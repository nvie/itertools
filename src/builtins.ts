import { count, ifilter, imap, izip, izip3, takewhile } from "./itertools";
import type { Predicate, Primitive } from "./types";
import { identityPredicate, keyToCmp, numberIdentity, primitiveIdentity } from "./utils";

/**
 * Returns the first item in the iterable for which the predicate holds, if
 * any. If no predicate is given, it will return the first value returned by
 * the iterable.
 */
export function find<T>(iterable: Iterable<T>, predicate?: Predicate<T>): T | undefined {
  const it = iter(iterable);
  if (predicate === undefined) {
    const value = it.next();
    return value.done ? value.value : value.value;
  } else {
    let res: IteratorResult<T>;
    let i = 0;
    while (!(res = it.next()).done) {
      const value = res.value;
      if (predicate(value, i++)) {
        return value;
      }
    }
    return undefined;
  }
}

/**
 * Returns true when all of the items in iterable are truthy.  An optional key
 * function can be used to define what truthiness means for this specific
 * collection.
 *
 * Examples:
 *
 *     all([])                           // => true
 *     all([0])                          // => false
 *     all([0, 1, 2])                    // => false
 *     all([1, 2, 3])                    // => true
 *
 * Examples with using a key function:
 *
 *     all([2, 4, 6], n => n % 2 === 0)  // => true
 *     all([2, 4, 5], n => n % 2 === 0)  // => false
 *
 */
export function every<T>(iterable: Iterable<T>, predicate: Predicate<T> = identityPredicate): boolean {
  let index = 0;
  for (const item of iterable) {
    if (!predicate(item, index++)) {
      return false;
    }
  }
  return true;
}

/**
 * Returns true when some of the items in iterable are truthy.  An optional key
 * function can be used to define what truthiness means for this specific
 * collection.
 *
 * Examples:
 *
 *     some([])                           // => false
 *     some([0])                          // => false
 *     some([0, 1, null, undefined])      // => true
 *
 * Examples with using a key function:
 *
 *     some([1, 4, 5], n => n % 2 === 0)  // => true
 *     some([{name: 'Bob'}, {name: 'Alice'}], person => person.name.startsWith('C'))  // => false
 *
 */
export function some<T>(iterable: Iterable<T>, predicate: Predicate<T> = identityPredicate): boolean {
  let index = 0;
  for (const item of iterable) {
    if (predicate(item, index++)) {
      return true;
    }
  }
  return false;
}

/**
 * Alias of `every()`.
 */
export const all = every;

/**
 * Alias of `some()`.
 */
export const any = some;

/**
 * Returns true when any of the items in the iterable are equal to the target object.
 *
 * Examples:
 *
 *     contains([], 'whatever')         // => false
 *     contains([3], 42)                // => false
 *     contains([3], 3)                 // => true
 *     contains([0, 1, 2], 2)           // => true
 *
 */
export function contains<T>(haystack: Iterable<T>, needle: T): boolean {
  return some(haystack, (x) => x === needle);
}

/**
 * Returns an iterable of enumeration pairs.  Iterable must be a sequence, an
 * iterator, or some other object which supports iteration.  The elements
 * produced by returns a tuple containing a counter value (starting from 0 by
 * default) and the values obtained from iterating over given iterable.
 *
 * Example:
 *
 *     import { enumerate } from 'itertools';
 *
 *     console.log([...enumerate(['hello', 'world'])]);
 *     // [0, 'hello'], [1, 'world']]
 */
export function* enumerate<T>(iterable: Iterable<T>, start = 0): IterableIterator<[number, T]> {
  let index: number = start;
  for (const value of iterable) {
    yield [index++, value];
  }
}

/**
 * Non-lazy version of ifilter().
 */
export function filter<T, N extends T>(iterable: Iterable<T>, predicate: (item: T, index: number) => item is N): N[];
export function filter<T>(iterable: Iterable<T>, predicate: Predicate<T>): T[];
export function filter<T>(iterable: Iterable<T>, predicate: Predicate<T>): T[] {
  return Array.from(ifilter(iterable, predicate));
}

/**
 * Returns an iterator object for the given iterable.  This can be used to
 * manually get an iterator for any iterable datastructure.  The purpose and
 * main use case of this function is to get a single iterator (a thing with
 * state, think of it as a "cursor") which can only be consumed once.
 */
export function iter<T>(iterable: Iterable<T>): IterableIterator<T> {
  return iterable[Symbol.iterator]() as IterableIterator<T>;
  //                                 ^^^^^^^^^^^^^^^^^^^^^^ Not safe!
}

/**
 * Non-lazy version of imap().
 */
export function map<T, V>(iterable: Iterable<T>, mapper: (item: T) => V): V[] {
  return Array.from(imap(iterable, mapper));
}

/**
 * Return the largest item in an iterable.  Only works for numbers, as ordering
 * is pretty poorly defined on any other data type in JS.  The optional `keyFn`
 * argument specifies a one-argument ordering function like that used for
 * sorted().
 *
 * If the iterable is empty, `undefined` is returned.
 *
 * If multiple items are maximal, the function returns either one of them, but
 * which one is not defined.
 */
export function max<T>(iterable: Iterable<T>, keyFn: (item: T) => number = numberIdentity): T | undefined {
  return reduce2(iterable, (x, y) => (keyFn(x) > keyFn(y) ? x : y));
}

/**
 * Return the smallest item in an iterable.  Only works for numbers, as
 * ordering is pretty poorly defined on any other data type in JS.  The
 * optional `keyFn` argument specifies a one-argument ordering function like
 * that used for sorted().
 *
 * If the iterable is empty, `undefined` is returned.
 *
 * If multiple items are minimal, the function returns either one of them, but
 * which one is not defined.
 */
export function min<T>(iterable: Iterable<T>, keyFn: (item: T) => number = numberIdentity): T | undefined {
  return reduce2(iterable, (x, y) => (keyFn(x) < keyFn(y) ? x : y));
}

/**
 * Internal helper for the range function
 */
function range_(start: number, stop: number, step: number): IterableIterator<number> {
  const counter = count(start, step);
  const pred = step >= 0 ? (n: number) => n < stop : (n: number) => n > stop;
  return takewhile(counter, pred);
}

/**
 * Returns an iterator producing all the numbers in the given range one by one,
 * starting from `start` (default 0), as long as `i < stop`, in increments of
 * `step` (default 1).
 *
 * `range(a)` is a convenient shorthand for `range(0, a)`.
 *
 * Various valid invocations:
 *
 *     range(5)           // [0, 1, 2, 3, 4]
 *     range(2, 5)        // [2, 3, 4]
 *     range(0, 5, 2)     // [0, 2, 4]
 *     range(5, 0, -1)    // [5, 4, 3, 2, 1]
 *     range(-3)          // []
 *
 * For a positive `step`, the iterator will keep producing values `n` as long
 * as the stop condition `n < stop` is satisfied.
 *
 * For a negative `step`, the iterator will keep producing values `n` as long
 * as the stop condition `n > stop` is satisfied.
 *
 * The produced range will be empty if the first value to produce already does
 * not meet the value constraint.
 */

export function range(stop: number): IterableIterator<number>;
export function range(start: number, stop: number, step?: number): IterableIterator<number>;
export function range(startOrStop: number, definitelyStop?: number, step = 1): IterableIterator<number> {
  if (definitelyStop !== undefined) {
    return range_(startOrStop /* as start */, definitelyStop, step);
  } else {
    return range_(0, startOrStop /* as stop */, step);
  }
}

/**
 * Apply function of two arguments cumulatively to the items of sequence, from
 * left to right, so as to reduce the sequence to a single value.  For example:
 *
 *     reduce([1, 2, 3, 4, 5], (x, y) => x + y, 0)
 *
 * calculates
 *
 *     (((((0+1)+2)+3)+4)+5)
 *
 * The left argument, `x`, is the accumulated value and the right argument,
 * `y`, is the update value from the sequence.
 *
 * **Difference between `reduce()` and `reduce\_()`**:  `reduce()` requires an
 * explicit initializer, whereas `reduce_()` will automatically use the first
 * item in the given iterable as the initializer.  When using `reduce()`, the
 * initializer value is placed before the items of the sequence in the
 * calculation, and serves as a default when the sequence is empty.  When using
 * `reduce_()`, and the given iterable is empty, then no default value can be
 * derived and `undefined` will be returned.
 */
export function reduce<T>(iterable: Iterable<T>, reducer: (agg: T, item: T, index: number) => T): T | undefined;
export function reduce<T, O>(iterable: Iterable<T>, reducer: (agg: O, item: T, index: number) => O, start: O): O;
export function reduce<T, O>(
  iterable: Iterable<T>,
  reducer: ((agg: T, item: T, index: number) => T) | ((agg: O, item: T, index: number) => O),
  start?: O,
): O | (T | undefined) {
  if (start === undefined) {
    return reduce2(iterable, reducer as (agg: T, item: T, index: number) => T);
  } else {
    return reduce3(iterable, reducer as (agg: O, item: T, index: number) => O, start);
  }
}

function reduce3<T, O>(iterable: Iterable<T>, reducer: (agg: O, item: T, index: number) => O, start: O): O {
  let output = start;
  let index = 0;
  for (const item of iterable) {
    output = reducer(output, item, index++);
  }
  return output;
}

function reduce2<T>(iterable: Iterable<T>, reducer: (agg: T, item: T, index: number) => T): T | undefined {
  const it = iter(iterable);
  const start = find(it);
  if (start === undefined) {
    return undefined;
  } else {
    return reduce3(it, reducer, start);
  }
}

/**
 * Return a new sorted list from the items in iterable.
 *
 * Has two optional arguments:
 *
 * * `keyFn` specifies a function of one argument providing a primitive
 *   identity for each element in the iterable.  that will be used to compare.
 *   The default value is to use a default identity function that is only
 *   defined for primitive types.
 *
 * * `reverse` is a boolean value.  If `true`, then the list elements are
 *   sorted as if each comparison were reversed.
 */
export function sorted<T>(
  iterable: Iterable<T>,
  keyFn: (item: T) => Primitive = primitiveIdentity,
  reverse = false,
): T[] {
  const result = Array.from(iterable);
  result.sort(keyToCmp(keyFn)); // sort in-place

  if (reverse) {
    result.reverse(); // reverse in-place
  }

  return result;
}

/**
 * Sums the items of an iterable from left to right and returns the total.  The
 * sum will defaults to 0 if the iterable is empty.
 */
export function sum(iterable: Iterable<number>): number {
  return reduce(iterable, (x, y) => x + y, 0);
}

/**
 * See izip.
 */
export function zip<T1, T2>(xs: Iterable<T1>, ys: Iterable<T2>): Array<[T1, T2]> {
  return Array.from(izip(xs, ys));
}

/**
 * See izip3.
 */
export function zip3<T1, T2, T3>(xs: Iterable<T1>, ys: Iterable<T2>, zs: Iterable<T3>): Array<[T1, T2, T3]> {
  return Array.from(izip3(xs, ys, zs));
}
