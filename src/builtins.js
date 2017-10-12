// @flow

import { ifilter, imap, izip, izip3 } from './itertools';
import { first } from './more-itertools';
import type { Maybe, Predicate, Primitive } from './types';
import { identityPredicate, keyToCmp, numberIdentity, primitiveIdentity } from './utils';

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
export function all<T>(iterable: Iterable<T>, keyFn: Predicate<T> = identityPredicate): boolean {
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
 *     any([])                           // => false
 *     any([0])                          // => false
 *     any([0, 1, null, undefined])      // => true
 *
 * Examples with using a key function:
 *
 *     any([1, 4, 5], n => n % 2 === 0)  // => true
 *     any([{name: 'Bob'}, {name: 'Alice'}], person => person.name.startsWith('C'))  // => false
 *
 */
export function any<T>(iterable: Iterable<T>, keyFn: Predicate<T> = identityPredicate): boolean {
    for (let item of iterable) {
        if (keyFn(item)) {
            return true;
        }
    }

    return false;
}

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
    return any(haystack, x => x === needle);
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
export function* enumerate<T>(iterable: Iterable<T>, start: number = 0): Iterable<[number, T]> {
    let index: number = start;
    for (let value of iterable) {
        yield [index++, value];
    }
}

/**
 * Non-lazy version of ifilter().
 */
export function filter<T>(iterable: Iterable<T>, predicate: Predicate<T>): Array<T> {
    return [...ifilter(iterable, predicate)];
}

/**
 * Returns an iterator object for the given iterable.  This can be used to
 * manually get an iterator for any iterable datastructure.  The purpose and
 * main use case of this function is to get a single iterator (a thing with
 * state, think of it as a "cursor") which can only be consumed once.
 */
export function iter<T>(iterable: Iterable<T>): Iterator<T> {
    // TODO: Not sure why Flow choked on this expression below, but at least we lock down the
    // type transformation in the function signature this way.
    // $FlowFixMe
    return iterable[Symbol.iterator]();
}

/**
 * Non-lazy version of imap().
 */
export function map<T, V>(iterable: Iterable<T>, mapper: T => V): Array<V> {
    return [...imap(iterable, mapper)];
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
export function max<T>(iterable: Iterable<T>, keyFn: T => number = numberIdentity): Maybe<T> {
    return reduce_(iterable, (x, y) => (keyFn(x) > keyFn(y) ? x : y));
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
export function min<T>(iterable: Iterable<T>, keyFn: T => number = numberIdentity): Maybe<T> {
    return reduce_(iterable, (x, y) => (keyFn(x) < keyFn(y) ? x : y));
}

/**
 * TODO
 */
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
export function reduce<T, O>(iterable: Iterable<T>, reducer: (O, T, number) => O, start: O): O {
    iterable = iter(iterable);
    let output = start;
    for (const [index, item] of enumerate(iterable)) {
        output = reducer(output, item, index);
    }
    return output;
}

/**
 * See reduce().
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

/**
 * TODO
 */
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

/**
 * TODO
 */
export function sum(iterable: Iterable<number>): number {
    return reduce(iterable, (x, y) => x + y, 0);
}

/**
 * TODO
 */
export function zip<T1, T2>(xs: Iterable<T1>, ys: Iterable<T2>): Array<[T1, T2]> {
    return [...izip(xs, ys)];
}

/**
 * TODO
 */
export function zip3<T1, T2, T3>(xs: Iterable<T1>, ys: Iterable<T2>, zs: Iterable<T3>): Array<[T1, T2, T3]> {
    return [...izip3(xs, ys, zs)];
}
