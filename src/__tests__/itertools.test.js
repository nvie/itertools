// @flow

import {
    all,
    any,
    chunked,
    compactObject,
    contains,
    cycle,
    enumerate,
    first,
    flatmap,
    flatten,
    icompact,
    imap,
    iter,
    max,
    min,
    pairwise,
    partition,
    range,
    sorted,
    sum,
    take,
    takewhile,
    uniqueEverseen,
    uniqueJustseen,
    zip,
    zip3,
    zipAll,
    zipLongest,
} from '../itertools';

const isEven = x => x % 2 === 0;
const isPositive = x => x >= 0;

describe('any', () => {
    it('any of empty list is false', () => {
        expect(any([])).toBe(false);
    });

    it('any is true if any elements are truthy', () => {
        expect(any([1, 2, 3])).toBe(true);
        expect(any([0, 1])).toBe(true);
        expect(any([1, 0])).toBe(true);
        expect(any([0, undefined, NaN, 1])).toBe(true);
    });

    it('any is false if no elements are truthy', () => {
        expect(any([0, null, NaN, undefined])).toBe(false);
    });
});

describe('all', () => {
    it('all of empty list is true', () => {
        expect(all([])).toBe(true);
    });

    it('all is true if all elements are truthy', () => {
        expect(all([1])).toBe(true);
        expect(all([1, 2, 3])).toBe(true);
    });

    it('all is false if any elements are not truthy', () => {
        expect(all([0, 1])).toBe(false);
        expect(all([1, 2, undefined, 3, 4])).toBe(false);
    });
});

describe('contains', () => {
    it('contains of empty list is false', () => {
        expect(contains([], 0)).toBe(false);
        expect(contains([], 1)).toBe(false);
        expect(contains([], null)).toBe(false);
        expect(contains([], undefined)).toBe(false);
    });

    it('contains is true iff iterable contains the given exact value', () => {
        expect(contains([1], 1)).toBe(true);
        expect(contains([1], 2)).toBe(false);
        expect(contains([1, 2, 3], 1)).toBe(true);
        expect(contains([1, 2, 3], 2)).toBe(true);
        expect(contains([1, 2, 3], 3)).toBe(true);
        expect(contains([1, 2, 3], 4)).toBe(false);
    });

    it('contains does not work for elements with identity equality', () => {
        expect(contains([{}], {})).toBe(false);
        expect(contains([{ x: 123 }], { x: 123 })).toBe(false);
        expect(contains([[1, 2, 3]], [1, 2, 3])).toBe(false);
    });
});

describe('cycle', () => {
    it('cycle with empty list', () => {
        expect([...cycle([])]).toEqual([]);
    });

    it('cycles', () => {
        // We'll have to wrap it in a take() call to avoid infinite-length arrays :)
        expect(take(3, cycle(['x']))).toEqual(['x', 'x', 'x']);
        expect(take(5, cycle(['even', 'odd']))).toEqual(['even', 'odd', 'even', 'odd', 'even']);
    });
});

describe('enumerate', () => {
    it('enumerate empty list', () => {
        expect([...enumerate([])]).toEqual([]);
    });

    it('enumerate attaches indexes', () => {
        // We'll have to wrap it in a take() call to avoid infinite-length arrays :)
        expect([...enumerate(['x'])]).toEqual([[0, 'x']]);
        expect([...enumerate(['even', 'odd'])]).toEqual([[0, 'even'], [1, 'odd']]);
    });

    it('enumerate from 3 up', () => {
        expect([...enumerate('abc', 3)]).toEqual([[3, 'a'], [4, 'b'], [5, 'c']]);
    });
});

describe('ifilter', () => {});

describe('iter', () => {
    it('iter makes any iterable a one-time iterable', () => {
        expect([...iter(new Map([[1, 'x'], [2, 'y'], [3, 'z']]))]).toEqual([[1, 'x'], [2, 'y'], [3, 'z']]);
        expect([...iter([1, 2, 3])]).toEqual([1, 2, 3]);
        expect([...iter(new Set([1, 2, 3]))]).toEqual([1, 2, 3]);
    });

    it('iter results can be consumed only once', () => {
        const it = iter([1, 2, 3]);
        expect(it.next()).toEqual({ value: 1, done: false });
        expect(it.next()).toEqual({ value: 2, done: false });
        expect(it.next()).toEqual({ value: 3, done: false });
        expect(it.next()).toEqual({ value: undefined, done: true });

        // Keeps returning "done" when exhausted...
        expect(it.next()).toEqual({ value: undefined, done: true });
        expect(it.next()).toEqual({ value: undefined, done: true });
        // ...
    });

    it('iter results can be consumed in pieces', () => {
        const it = iter([1, 2, 3, 4, 5]);
        expect(first(it)).toBe(1);
        expect(first(it)).toBe(2);
        expect(first(it)).toBe(3);
        expect([...it]).toEqual([4, 5]);

        // Keeps returning "[]" when exhausted...
        expect([...it]).toEqual([]);
        expect([...it]).toEqual([]);
        // ...
    });

    it("wrapping iter()s has no effect on the iterator's state", () => {
        const originalIter = iter([1, 2, 3, 4, 5]);
        expect(first(originalIter)).toBe(1);

        const wrappedIter = iter(iter(iter(originalIter)));
        expect(first(wrappedIter)).toBe(2);
        expect(first(iter(wrappedIter))).toBe(3);
        expect([...iter(originalIter)]).toEqual([4, 5]);

        // Keeps returning "[]" when exhausted...
        expect([...originalIter]).toEqual([]);
        expect([...wrappedIter]).toEqual([]);
        // ...
    });
});

describe('first', () => {
    it('returns nothing for an empty array', () => {
        expect(first([])).toBeUndefined();
        expect(first([undefined, undefined])).toBeUndefined();
    });

    it('returns the first value in the array', () => {
        expect(first([3, 'ohai'])).toBe(3);
        expect(first([undefined, 3, 'ohai'])).toBe(3);
        expect(first(['ohai', 3])).toBe('ohai');
    });

    it('first may returns falsey values too', () => {
        expect(first([0, 1, 2])).toBe(0);
        expect(first([false, true])).toBe(false);
    });

    it('first uses a predicate if provided', () => {
        expect(first([0, 1, 2, 3, 4], n => !!n)).toBe(1);
        expect(first([0, 1, 2, 3, 4], n => n > 1)).toBe(2);
        expect(first([0, 1, 2, 3, 4], n => n < 0)).toBeUndefined();
        expect(first([false, true], x => x)).toBe(true);
    });
});

describe('imap', () => {
    it('imap on empty iterable', () => {
        expect([...imap([], x => x)]).toEqual([]);
    });

    it('imap works like Array.map, but lazy', () => {
        expect([...imap([1, 2, 3], x => x)]).toEqual([1, 2, 3]);
        expect([...imap([1, 2, 3], x => 2 * x)]).toEqual([2, 4, 6]);
        expect([...imap([1, 2, 3], x => x.toString())]).toEqual(['1', '2', '3']);

        // imap can handle infinite inputs
        expect(take(3, imap(range(9999), x => -x))).toEqual([-0, -1, -2]);
    });
});

describe('zip', () => {
    it('zip with empty iterable', () => {
        expect(zip([], [])).toEqual([]);
        expect(zip('abc', [])).toEqual([]);
    });

    it('izip with two iterables', () => {
        expect(zip('abc', 'ABC')).toEqual([['a', 'A'], ['b', 'B'], ['c', 'C']]);
    });

    it('izip with three iterables', () => {
        expect(zip3('abc', 'ABC', [5, 4, 3])).toEqual([['a', 'A', 5], ['b', 'B', 4], ['c', 'C', 3]]);
    });

    it('izip different input lengths', () => {
        // Shortest lengthed input determines result length
        expect(zip('a', 'ABC')).toEqual([['a', 'A']]);
        expect(zip3('', 'ABCD', 'PQR')).toEqual([]);
    });
});

describe('zipAll', () => {
    it('zipAll with empty iterable', () => {
        expect(zipAll([])).toEqual([]);
        expect(zipAll([], [])).toEqual([]);
    });

    it('zipAll takes any number of (homogenous) iterables', () => {
        expect(zipAll('abc', 'ABC')).toEqual([['a', 'A'], ['b', 'B'], ['c', 'C']]);
        expect(zipAll('abc', 'ABC', 'pqrs', 'xyz')).toEqual([
            ['a', 'A', 'p', 'x'],
            ['b', 'B', 'q', 'y'],
            ['c', 'C', 'r', 'z'],
        ]);
    });
});

describe('zipLongest', () => {
    it('zip with empty iterable', () => {
        expect(zipLongest([], [])).toEqual([]);
        expect(zipLongest('abc', '')).toEqual([['a', undefined], ['b', undefined], ['c', undefined]]);
        expect(zipLongest('x', 'abc')).toEqual([['x', 'a'], [undefined, 'b'], [undefined, 'c']]);
        expect(zipLongest('x', 'abc', /* filler */ 0)).toEqual([['x', 'a'], [0, 'b'], [0, 'c']]);
    });
});

describe('range', () => {
    it('range with end', () => {
        expect([...range(0)]).toEqual([]);
        expect([...range(1)]).toEqual([0]);
        expect([...range(2)]).toEqual([0, 1]);
        expect([...range(5)]).toEqual([0, 1, 2, 3, 4]);
    });

    it('range with start and end', () => {
        expect([...range(3, 5)]).toEqual([3, 4]);
        expect([...range(4, 7)]).toEqual([4, 5, 6]);

        // If end < start, then range is empty
        expect([...range(5, 1)]).toEqual([]);
    });

    it('range with start, end, and step', () => {
        expect([...range(3, 9, 3)]).toEqual([3, 6]);
        expect([...range(3, 10, 3)]).toEqual([3, 6, 9]);
        expect([...range(5, 1, -1)]).toEqual([5, 4, 3, 2]);
    });
});

describe('takewhile', () => {
    it('takewhile on empty list', () => {
        expect([...takewhile([], isEven)]).toEqual([]);
        expect([...takewhile([], isPositive)]).toEqual([]);
    });

    it('takewhile on list', () => {
        expect([...takewhile([1], isEven)]).toEqual([]);
        expect([...takewhile([1], isPositive)]).toEqual([1]);

        expect([...takewhile([-1, 0, 1], isEven)]).toEqual([]);
        expect([...takewhile([-1, 0, 1], isPositive)]).toEqual([]);

        expect([...takewhile([0, 2, 4, 6, 7, 8, 10], isEven)]).toEqual([0, 2, 4, 6]);
        expect([...takewhile([0, 1, 2, -2, 3, 4, 5, 6, 7], isPositive)]).toEqual([0, 1, 2]);
    });
});

describe('partition', () => {
    it('partition empty list', () => {
        expect(partition([], isEven)).toEqual([[], []]);
    });

    it('partition splits input list into two lists', () => {
        const values = [1, -2, 3, 4, 5, 6, 8, 8, 0, -2, -3];
        expect(partition(values, isEven)).toEqual([[-2, 4, 6, 8, 8, 0, -2], [1, 3, 5, -3]]);
        expect(partition(values, isPositive)).toEqual([[1, 3, 4, 5, 6, 8, 8, 0], [-2, -2, -3]]);
    });
});

describe('max', () => {
    it("can't take max of empty list", () => {
        expect(max([])).toBeUndefined();
    });

    it('max of single-item array', () => {
        expect(max([1])).toEqual(1);
        expect(max([2])).toEqual(2);
        expect(max([5])).toEqual(5);
    });

    it('max of multi-item array', () => {
        expect(max([1, 2, 3])).toEqual(3);
        expect(max([2, 2, 2, 2])).toEqual(2);
        expect(max([5, 4, 3, 2, 1])).toEqual(5);
        expect(max([-3, -2, -1])).toEqual(-1);
    });

    it('max of multi-item array with key function', () => {
        expect(max([{ n: 2 }, { n: 3 }, { n: 1 }], o => o.n)).toEqual({ n: 3 });
    });
});

describe('min', () => {
    it("can't take min of empty list", () => {
        expect(min([])).toBeUndefined();
    });

    it('min of single-item array', () => {
        expect(min([1])).toEqual(1);
        expect(min([2])).toEqual(2);
        expect(min([5])).toEqual(5);
    });

    it('min of multi-item array', () => {
        expect(min([1, 2, 3])).toEqual(1);
        expect(min([2, 2, 2, 2])).toEqual(2);
        expect(min([5, 4, 3, 2, 1])).toEqual(1);
        expect(min([-3, -2, -1])).toEqual(-3);
    });

    it('min of multi-item array with key function', () => {
        expect(min([{ n: 2 }, { n: 3 }, { n: 1 }], o => o.n)).toEqual({ n: 1 });
    });
});

describe('sorted', () => {
    it('sorted w/ empty list', () => {
        expect(sorted([])).toEqual([]);
    });

    it('sorted values', () => {
        expect(sorted([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
        expect(sorted([2, 1, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
        expect(sorted([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);

        // Explicitly test numeral ordering... in plain JS the following is true:
        // [4, 44, 100, 80, 9].sort()  ~~>  [100, 4, 44, 80, 9]
        expect(sorted([4, 44, 100, 80, 9])).toEqual([4, 9, 44, 80, 100]);
        expect(sorted(['4', '44', '100', '80', '9'])).toEqual(['100', '4', '44', '80', '9']);
        expect(sorted([false, true, true, false])).toEqual([false, false, true, true]);
    });

    it('sorted does not modify input', () => {
        let values = [4, 0, -3, 7, 1];
        expect(sorted(values)).toEqual([-3, 0, 1, 4, 7]);
        expect(values).toEqual([4, 0, -3, 7, 1]);
    });

    it('sorted in reverse', () => {
        expect(sorted([2, 1, 3, 4, 5], undefined, true)).toEqual([5, 4, 3, 2, 1]);
    });
});

describe('uniqueJustseen', () => {
    it('uniqueJustseen w/ empty list', () => {
        expect([...uniqueJustseen([])]).toEqual([]);
    });

    it('uniqueJustseen', () => {
        expect([...uniqueJustseen([1, 2, 3, 4, 5])]).toEqual([1, 2, 3, 4, 5]);
        expect([...uniqueJustseen([1, 1, 1, 2, 2])]).toEqual([1, 2]);
        expect([...uniqueJustseen([1, 1, 1, 2, 2, 1, 1, 1, 1])]).toEqual([1, 2, 1]);
    });
});

describe('uniqueEverseen', () => {
    it('uniqueEverseen w/ empty list', () => {
        expect([...uniqueEverseen([])]).toEqual([]);
    });

    it('uniqueEverseen never emits dupes, but keeps input ordering', () => {
        expect([...uniqueEverseen([1, 2, 3, 4, 5])]).toEqual([1, 2, 3, 4, 5]);
        expect([...uniqueEverseen([1, 1, 1, 2, 2, 3, 1, 3, 0, 4])]).toEqual([1, 2, 3, 0, 4]);
        expect([...uniqueEverseen([1, 1, 1, 2, 2, 1, 1, 1, 1])]).toEqual([1, 2]);
    });
});

describe('icompact', () => {
    it('icompact w/ empty list', () => {
        expect([...icompact([])]).toEqual([]);
    });

    it('icompact removes undefined values', () => {
        expect([...icompact('abc')]).toEqual(['a', 'b', 'c']);
        expect([...icompact(['x', undefined])]).toEqual(['x']);
        expect([...icompact([0, undefined, NaN, Infinity])]).toEqual([0, NaN, Infinity]);
    });
});

describe('compactObject', () => {
    it('compactObject w/ empty object', () => {
        expect(compactObject({})).toEqual({});
    });

    it('compactObject removes undefined values', () => {
        expect(compactObject({ a: 1, b: 'foo', c: 0 })).toEqual({ a: 1, b: 'foo', c: 0 });
        expect(compactObject({ a: undefined, b: false, c: 0 })).toEqual({ b: false, c: 0 });
    });
});

describe('flatten', () => {
    it('flatten w/ empty list', () => {
        expect([...flatten([])]).toEqual([]);
        expect([...flatten([[], [], [], [], []])]).toEqual([]);
    });

    it('flatten works', () => {
        expect([...flatten([[1, 2], [3, 4, 5]])]).toEqual([1, 2, 3, 4, 5]);
        expect([...flatten(['hi', 'ha'])]).toEqual(['h', 'i', 'h', 'a']);
    });
});

describe('flatmap', () => {
    it('flatmap w/ empty list', () => {
        expect([...flatmap([], x => [x])]).toEqual([]);
    });

    it('flatmap works', () => {
        const dupeEvens = x => (x % 2 === 0 ? [x, x] : [x]);
        const triple = x => [x, x, x];
        const nothin = () => [];
        expect([...flatmap([1, 2, 3, 4, 5], dupeEvens)]).toEqual([1, 2, 2, 3, 4, 4, 5]);
        expect([...flatmap(['hi', 'ha'], triple)]).toEqual(['hi', 'hi', 'hi', 'ha', 'ha', 'ha']);
        expect([...flatmap(['hi', 'ha'], nothin)]).toEqual([]);
    });
});

describe('sum', () => {
    it('sum w/ empty iterable', () => {
        expect(sum([])).toEqual(0);
    });

    it('sum works', () => {
        expect(sum([1, 2, 3, 4, 5, 6])).toEqual(21);
        expect(sum([-3, -2, -1, 0, 1, 2, 3])).toEqual(0);
        expect(sum([0.1, 0.2, 0.3])).toBeCloseTo(0.6);
    });
});

describe('pairwise', () => {
    it('does nothing for empty array', () => {
        expect([...pairwise([])]).toEqual([]);
        expect([...pairwise([1])]).toEqual([]);
    });

    it('it returns pairs of input', () => {
        expect([...pairwise([0, 1, 2])]).toEqual([[0, 1], [1, 2]]);
        expect([...pairwise([1, 2])]).toEqual([[1, 2]]);
        expect([...pairwise([1, 2, 3, 4])]).toEqual([[1, 2], [2, 3], [3, 4]]);
    });
});

describe('chunked', () => {
    it('does nothing for empty array', () => {
        expect([...chunked([], 3)]).toEqual([]);
    });

    it('works with array smaller than chunk size', () => {
        expect([...chunked([1], 3)]).toEqual([[1]]);
    });

    it('works with array of values', () => {
        expect([...chunked([1, 2, 3, 4, 5], 3)]).toEqual([[1, 2, 3], [4, 5]]);
    });
});
