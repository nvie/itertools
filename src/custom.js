// @flow

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
    return [...icompact(iterable)];
}

/**
 * Removes all undefined values from the given object.  Returns a new object.
 *
 *     >>> compactObject({ a: 1, b: undefined, c: 0 })
 *     { a: 1, c: 0 }
 *
 */
export function compactObject<O: { [key: string]: any }>(obj: O): $ObjMap<O, <T>(Maybe<T>) => T> {
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
    keyFn = keyFn || isDefined;
    for (let value of iterable) {
        if (keyFn(value)) {
            return value;
        }
    }
    return undefined;
}

/**
 * Returns 0 or more values for every value in the given iterable
 *
 * Examples:
 *
 *      Get Ids for an Author and its aliases
 *      flatmap(author => [author.id, ...author.aliases.map(a => a.id)], authors)
 *
 */
export function flatmap<T, S>(iterable: Iterable<T>, mapper: T => Iterable<S>): Iterable<S> {
    return flatten(imap(iterable, mapper));
}
