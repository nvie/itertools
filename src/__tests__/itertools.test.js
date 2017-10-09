// @flow

import {
    chunked,
    compactObject,
    contains,
    cycle,
    first,
    flatmap,
    flatten,
    icompact,
    imap,
    pairwise,
    partition,
    range,
    take,
    takewhile,
    uniqueEverseen,
    uniqueJustseen,
    zipAll,
    zipLongest,
} from '../index';

const isEven = x => x % 2 === 0;
const isPositive = x => x >= 0;

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

describe('ifilter', () => {});

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
