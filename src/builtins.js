// @flow

import { imap, izip, izip3 } from './itertools';
import { first } from './more-itertools';
import type { Maybe, Predicate, Primitive } from './types';
import { primitiveIdentity } from './utils';

type CmpFn<T> = (T, T) => number;

function identityPredicate<T>(x: T): boolean {
    return !!x;
}

function numberIdentity<T>(x: T): number {
    if (typeof x !== 'number') {
        // eslint-disable-next-line no-console
        console.error('Inputs must be numbers, got', x);
        throw new Error('Inputs must be numbers');
    }
    return x;
}

function keyToCmp<T>(keyFn: T => Primitive): CmpFn<T> {
    return (a: T, b: T) => {
        let ka = keyFn(a);
        let kb = keyFn(b);
        if (typeof ka === 'boolean' && typeof kb === 'boolean') {
            return ka === kb ? 0 : !ka && kb ? -1 : 1;
        } else if (typeof ka === 'number' && typeof kb === 'number') {
            return ka - kb;
        } else if (typeof ka === 'string' && typeof kb === 'string') {
            return ka === kb ? 0 : ka < kb ? -1 : 1;
        } else {
            return -1;
        }
    };
}

/**
 * Returns true when all of the items in iterable are truthy.  An optional key
 * function can be used to define what truthiness means for this specific
 * collection.
 *
 * Examples:
 *
 *     all([])                          // => true
 *     all([0])                         // => false
 *     all([0, 1, 2])                   // => false
 *     all([1, 2, 3])                   // => true
 *
 * Examples with using a key function:
 *
 *     all([2, 4, 6], n => n % 2 == 0)  // => true
 *
 */
export function all<T>(iterable: Iterable<T>, keyFn?: Predicate<T>): boolean {
    keyFn = keyFn || identityPredicate;
    for (let item of iterable) {
        if (!keyFn(item)) {
            return false;
        }
    }

    return true;
}

/**
 * Returns true when any of the items in iterable are truthy.  An optional key
 * function can be used to define what truthiness means for this specific
 * collection.
 *
 * Examples:
 *
 *     any([])                          // => false
 *     any([0])                         // => false
 *     any([0, 1, null, undefined])     // => true
 *
 * Examples with using a key function:
 *
 *     any([1, 4, 5], n => n % 2 == 0)  // => true
 *     any([{name: 'Bob'}, {name: 'Alice'}], person => person.name.startsWith('C'))  // => false
 *
 */
export function any<T>(iterable: Iterable<T>, keyFn?: Predicate<T>): boolean {
    keyFn = keyFn || identityPredicate;
    for (let item of iterable) {
        if (keyFn(item)) {
            return true;
        }
    }

    return false;
}

export function* enumerate<T>(iterable: Iterable<T>, start: number = 0): Iterable<[number, T]> {
    let index: number = start;
    for (let value of iterable) {
        yield [index++, value];
    }
}

/**
 * Make the passed in iterable an actual iterable.  Note that any iterable is fine: a lazy iterable, or an
 * iterable data structure like an Array.  The result will only be iterable once, which is the main use
 * case for this function.
 */
export function iter<T>(iterable: Iterable<T>): Iterator<T> {
    // TODO: Not sure why Flow choked on this expression below, but at least we lock down the
    // type transformation in the function signature this way.
    // $FlowFixMe
    return iterable[Symbol.iterator]();
}

export function map<T, V>(iterable: Iterable<T>, mapper: T => V): Array<V> {
    return [...imap(iterable, mapper)];
}

export function max<T>(iterable: Iterable<T>, keyFn?: T => number): Maybe<T> {
    const key = keyFn || numberIdentity;
    return reduce_(iterable, (x, y) => (key(x) > key(y) ? x : y));
}

export function min<T>(iterable: Iterable<T>, keyFn?: T => number): Maybe<T> {
    const key = keyFn || numberIdentity;
    return reduce_(iterable, (x, y) => (key(x) < key(y) ? x : y));
}

export function* range(a: number, b?: number, step?: number): Iterable<number> {
    let start: number, stop: number;
    step = step || 1;
    (step: number);

    // range(a) means range(0, a)
    if (typeof b === 'undefined' || b === null) {
        [start, stop] = [0, a];
    } else {
        [start, stop] = [a, b];
    }

    let pred: Predicate<number>;
    if (step >= 0) {
        pred = curr => curr < stop;
    } else {
        pred = curr => curr > stop; // with negative step
    }

    let curr: number = start;
    while (pred(curr)) {
        yield curr;
        curr += step;
    }
}

/**
 * Reducer function with a start value.
 */
export function reduce<T, O>(iterable: Iterable<T>, reducer: (O, T, number) => O, start: O): O {
    iterable = iter(iterable);
    let output = start;
    for (const [index, item] of enumerate(iterable)) {
        output = reducer(output, item, index);
    }
    return output;
}

/**
 * Reducer function without a start value.  The start value will be the first item in
 * the input iterable.  For this reason, the function may not necessarily return anything
 * (i.e. if the input is empty), and the inputs and the outputs must be of homogeneous types.
 */
export function reduce_<T>(iterable: Iterable<T>, reducer: (T, T, number) => T): Maybe<T> {
    iterable = iter(iterable);
    const start = first(iterable);
    if (start === undefined) {
        return undefined;
    } else {
        return reduce(iterable, reducer, start);
    }
}

export function sorted<T>(
    iterable: Iterable<T>,
    keyFn: T => Primitive = primitiveIdentity,
    reverse: boolean = false
): Array<T> {
    const result = [...iterable];
    result.sort(keyToCmp(keyFn)); // sort in-place

    if (reverse) {
        result.reverse(); // reverse in-place
    }

    return result;
}

export function sum(iterable: Iterable<number>): number {
    return reduce(iterable, (x, y) => x + y, 0);
}

export function zip<T1, T2>(xs: Iterable<T1>, ys: Iterable<T2>): Array<[T1, T2]> {
    return [...izip(xs, ys)];
}

export function zip3<T1, T2, T3>(xs: Iterable<T1>, ys: Iterable<T2>, zs: Iterable<T3>): Array<[T1, T2, T3]> {
    return [...izip3(xs, ys, zs)];
}
