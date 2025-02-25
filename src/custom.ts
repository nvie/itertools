import { find } from "./builtins";
import { ifilter, imap } from "./itertools";
import { flatten } from "./more-itertools";
import type { Predicate } from "./types";

function isNullish<T>(x: T): x is NonNullable<T> {
  return x != null;
}

function isDefined(x: unknown): boolean {
  return x !== undefined;
}

/**
 * Returns an iterable, filtering out any "nullish" values from the iterable.
 *
 *     >>> compact([1, 2, undefined, 3, null])
 *     [1, 2, 3]
 *
 * For an eager version, @see compact().
 */
export function icompact<T>(iterable: Iterable<T | null | undefined>): IterableIterator<T> {
  return ifilter(iterable, isNullish);
}

/**
 * Returns an array, filtering out any "nullish" values from the iterable.
 *
 *     >>> compact([1, 2, undefined, 3, null])
 *     [1, 2, 3]
 *
 * For a lazy version, @see icompact().
 */
export function compact<T>(iterable: Iterable<T | null | undefined>): T[] {
  return Array.from(icompact(iterable));
}

/**
 * Removes all "nullish" values from the given object. Returns a new object.
 *
 *     >>> compactObject({ a: 1, b: undefined, c: 0, d: null })
 *     { a: 1, c: 0 }
 *
 */
export function compactObject<K extends string, V>(obj: Record<K, V | null | undefined>): Record<K, V> {
  const result = {} as Record<K, V>;
  for (const [key, value_] of Object.entries(obj)) {
    const value = value_ as V | null | undefined;
    if (value != null) {
      result[key as K] = value;
    }
  }
  return result;
}

/**
 * Almost an alias of find(). There only is a difference if no key fn is
 * provided. In that case, `find()` will return the first item in the iterable,
 * whereas `first()` will return the first non-`undefined` value in the
 * iterable.
 */
export function first<T>(iterable: Iterable<T>, keyFn?: Predicate<T>): T | undefined {
  return find(iterable, keyFn ?? isDefined);
}

/**
 * Returns 0 or more values for every value in the given iterable.
 * Technically, it's just calling map(), followed by flatten(), but it's a very
 * useful operation if you want to map over a structure, but not have a 1:1
 * input-output mapping.  Instead, if you want to potentially return 0 or more
 * values per input element, use flatmap():
 *
 * For example, to return all numbers `n` in the input iterable `n` times:
 *
 *     >>> const repeatN = n => repeat(n, n);
 *     >>> [...flatmap([0, 1, 2, 3, 4], repeatN)]
 *     [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]  // note: no 0
 *
 */
export function flatmap<T, S>(iterable: Iterable<T>, mapper: (item: T) => Iterable<S>): IterableIterator<S> {
  return flatten(imap(iterable, mapper));
}
