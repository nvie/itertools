// @flow

import { iter } from './builtins';
import type { Maybe, Predicate, Primitive } from './types';
import { primitiveIdentity } from './utils';

function isDefined<T>(x: T): boolean {
    return x !== undefined;
}

export function* chunked<T>(iterable: Iterable<T>, chunkSize: number): Iterable<Array<T>> {
    iterable = iter(iterable);
    let r1 = iterable.next();
    if (r1.done) {
        return;
    }

    let chunk = [r1.value];

    for (const item of iterable) {
        chunk.push(item);

        if (chunk.length === chunkSize) {
            yield chunk;
            chunk = [];
        }
    }

    yield chunk;
}

export function first<T>(iterable: Iterable<T>, keyFn?: Predicate<T>): Maybe<T> {
    keyFn = keyFn || isDefined;
    for (let value of iterable) {
        if (keyFn(value)) {
            return value;
        }
    }
    return undefined;
}

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
