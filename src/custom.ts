// @flow strict

import { imap } from './itertools';
import { flatten } from './more-itertools';
import type { Maybe, Predicate } from './types';

function isDefined<T>(x: T): boolean {
    return x !== undefined;
}

/**
 * Returns an iterable, filtering out any `undefined` values from the input
 * iterable.  This function is useful to convert a list of `Maybe<T>`'s to
 * a list of `T`'s, discarding all the undefined values:
 *
 *     >>> compact([1, 2, undefined, 3])
 *     [1, 2, 3]
 */
export function* icompact<T>(iterable: Iterable<T>): Iterable<$NonMaybeType<T>> {
    for (let item of iterable) {
        if (typeof item !== 'undefined') {
            yield item;
        }
    }
}

/**
 * See icompact().
 */
export function compact<T>(iterable: Iterable<T>): Array<$NonMaybeType<T>> {
    return Array.from(icompact(iterable));
}

/**
 * Removes all undefined values from the given object.  Returns a new object.
 *
 *     >>> compactObject({ a: 1, b: undefined, c: 0 })
 *     { a: 1, c: 0 }
 *
 */
export function compactObject<O: { +[key: string]: mixed }>(obj: O): $ObjMap<O, <T>(T) => $NonMaybeType<T>> {
    let result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value !== 'undefined') {
            result[key] = value;
        }
    }
    return result;
}

/**
 * Returns the first item in the iterable for which the predicate holds, if
 * any.  If no such item exists, `undefined` is returned.  The default
 * predicate is any defined value.
 */
export function first<T>(iterable: Iterable<T>, keyFn?: Predicate<T>): Maybe<T> {
    const fn = keyFn || isDefined;
    for (let value of iterable) {
        if (fn(value)) {
            return value;
        }
    }
    return undefined;
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
export function flatmap<T, S>(iterable: Iterable<T>, mapper: (T) => Iterable<S>): Iterable<S> {
    return flatten(imap(iterable, mapper));
}
