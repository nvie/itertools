// @flow

import {
    all,
    any,
    contains,
    enumerate,
    filter,
    iter,
    map,
    max,
    min,
    range,
    reduce,
    sorted,
    sum,
    zip,
    zip3,
} from '../builtins';
import { first } from '../more-itertools';

const isEven = n => n % 2 === 0;

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

describe('filter', () => {
    it('filters empty list', () => {
        expect(filter([], isEven)).toEqual([]);
    });

    it('keeps values based on predicate', () => {
        expect(filter([0, 1, 2, 3], isEven)).toEqual([0, 2]);
    });
});

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

describe('map', () => {
    const firstLetter = s => s[0].toUpperCase();

    it('map empty list', () => {
        expect(map([], firstLetter)).toEqual([]);
    });

    it('map values based on transformation function', () => {
        expect(map(['hello', 'world'], firstLetter)).toEqual(['H', 'W']);
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

describe('reduce', () => {
    const adder = (x: number, y: number) => x + y;

    it('reduce on empty list returns start value', () => {
        expect(reduce([], adder, 0)).toEqual(0);
        expect(reduce([], adder, 13)).toEqual(13);
    });

    it('reduce on list with only one item', () => {
        expect(reduce([5], adder, 0)).toEqual(5);
        expect(reduce([5], adder, 13)).toEqual(18);
    });

    it('reduce on list with multiple items', () => {
        expect(reduce([1, 2, 3, 4], adder, 0)).toEqual(10);
        expect(reduce([1, 2, 3, 4, 5], adder, 13)).toEqual(28);
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
        expect(sorted(['4', '44', '100', '80', '44', '9'])).toEqual(['100', '4', '44', '44', '80', '9']);
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

    it('sorted has undefined behaviour with non-homogeneous primitive types', () => {
        expect(sorted([1, true, 'one'])).toEqual([1, true, 'one']);
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
