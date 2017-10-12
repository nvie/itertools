// @flow

import { iter } from './builtins';
import type { Maybe, Predicate, Primitive } from './types';
import { primitiveIdentity } from './utils';

function isDefined<T>(x: T): boolean {
    return x !== undefined;
}

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
export function* chunked<T>(iterable: Iterable<T>, size: number): Iterable<Array<T>> {
    iterable = iter(iterable);
    let r1 = iterable.next();
    if (r1.done) {
        return;
    }

    let chunk = [r1.value];

    for (const item of iterable) {
        chunk.push(item);

        if (chunk.length === size) {
            yield chunk;
            chunk = [];
        }
    }

    yield chunk;
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
 * Return an iterator flattening one level of nesting in a list of lists:
 *
 *     [...flatten([[0, 1], [2, 3]])]
 *     // [0, 1, 2, 3]
 *
 */
export function* flatten<T>(iterableOfIterables: Iterable<Iterable<T>>): Iterable<T> {
    for (let iterable of iterableOfIterables) {
        for (let item of iterable) {
            yield item;
        }
    }
}

/**
 * Returns an iterable containing only the first `n` elements of the given
 * iterable.
 */
export function* itake<T>(n: number, iterable: Iterable<T>): Iterable<T> {
    iterable = iter(iterable);
    while (n-- > 0) {
        let s = iterable.next();
        if (!s.done) {
            yield s.value;
        } else {
            // Iterable exhausted, quit early
            return;
        }
    }
}

export function* pairwise<T>(iterable: Iterable<T>): Iterable<[T, T]> {
    iterable = iter(iterable);
    let r1 = iterable.next();
    if (r1.done) {
        return;
    }

    r1 = r1.value;
    for (const r2 of iterable) {
        yield [r1, r2];
        r1 = r2;
    }
}

export function partition<T>(iterable: Iterable<T>, predicate: Predicate<T>): [Array<T>, Array<T>] {
    let gold = [];
    let dust = [];

    for (let item of iterable) {
        if (predicate(item)) {
            gold.push(item);
        } else {
            dust.push(item);
        }
    }

    return [gold, dust];
}

/**
 * Non-lazy version of itake().
 */
export function take<T>(n: number, iterable: Iterable<T>): Array<T> {
    return [...itake(n, iterable)];
}

export function* uniqueEverseen<T>(iterable: Iterable<T>, keyFn: T => Primitive = primitiveIdentity): Iterable<T> {
    let seen = new Set();
    for (let item of iterable) {
        let key = keyFn(item);
        if (!seen.has(key)) {
            seen.add(key);
            yield item;
        }
    }
}

export function* uniqueJustseen<T>(iterable: Iterable<T>, keyFn: T => Primitive = primitiveIdentity): Iterable<T> {
    let last = undefined;
    for (let item of iterable) {
        let key = keyFn(item);
        if (key !== last) {
            yield item;
            last = key;
        }
    }
}
