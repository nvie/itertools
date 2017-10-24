// @flow

import { iter, map } from './builtins';
import type { Predicate, Primitive } from './types';
import { primitiveIdentity } from './utils';

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

/**
 * Returns an iterator of paired items, overlapping, from the original.  When
 * the input iterable has a finite number of items `n`, the outputted iterable
 * will have `n - 1` items.
 *
 *     >>> pairwise([8, 2, 0, 7])
 *     [(8, 2), (2, 0), (0, 7)]
 *
 */
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
export function partition<T>(iterable: Iterable<T>, predicate: Predicate<T>): [Array<T>, Array<T>] {
    let good = [];
    let bad = [];

    for (let item of iterable) {
        if (predicate(item)) {
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
export function* roundrobin<T>(...iters: Array<Iterable<T>>): Iterable<T> {
    // We'll only keep lazy versions of the input iterables in here that we'll
    // slowly going to exhaust.  Once an iterable is exhausted, it will be
    // removed from this list.  Once the entire list is empty, this algorithm
    // ends.
    let iterables: Array<Iterator<T>> = map(iters, iter);

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
 * Non-lazy version of itake().
 */
export function take<T>(n: number, iterable: Iterable<T>): Array<T> {
    return [...itake(n, iterable)];
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

/**
 * Yields elements in order, ignoring serial duplicates.
 *
 *     >>> [...uniqueJustseen('AAAABBBCCDAABBB')]
 *     ['A', 'B', 'C', 'D', 'A', 'B']
 *     >>> [...uniqueJustseen('AbBCcAB', s => s.toLowerCase())]
 *     ['A', 'b', 'C', 'A', 'B']
 *
 */
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
