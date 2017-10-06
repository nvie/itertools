// @flow

import { iter } from './builtins';
import { imap } from './itertools';
import { flatten } from './more-itertools';
import type { Maybe, Predicate, Primitive } from './types';
import { identity, primitiveIdentity } from './utils';

export function* icompact<T>(iterable: Iterable<T>): Iterable<$NonMaybeType<T>> {
    for (let item of iterable) {
        if (typeof item !== 'undefined') {
            yield item;
        }
    }
}

export function compact<T>(iterable: Iterable<T>): Array<$NonMaybeType<T>> {
    return [...icompact(iterable)];
}

/**
 * Removes all undefined values from the given object. Returns a new object.
 *
 * Examples:
 *   compactObject({ a: 1, b: undefined, c: 0 })
 *       // ==> { a: 1, c: 0 }
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
