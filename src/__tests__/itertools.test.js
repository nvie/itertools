// @flow

import { range } from '../builtins';
import {
    chain,
    compress,
    count,
    cycle,
    dropwhile,
    ifilter,
    imap,
    islice,
    permutations,
    takewhile,
    zipAll,
    zipLongest,
} from '../itertools';
import { take } from '../more-itertools';

const isEven = x => x % 2 === 0;
const isPositive = x => x >= 0;

describe('chain', () => {
    it('chains empty iterables', () => {
        expect([...chain([], [])]).toEqual([]);
    });

    it('chains iterables together', () => {
        expect([...chain(['foo'], [])]).toEqual(['foo']);
        expect([...chain([], ['bar'])]).toEqual(['bar']);
        expect([...chain([], ['bar'], ['qux'])]).toEqual(['bar', 'qux']);
        expect([...chain(['foo', 'bar'], ['qux'])]).toEqual(['foo', 'bar', 'qux']);
    });
});

describe('compress', () => {
    it('compress on empty list', () => {
        expect(compress([], [])).toEqual([]);
    });

    it('compress removes selected items', () => {
        expect(compress('abc', [])).toEqual([]);
        expect(compress('abc', [true])).toEqual(['a']);
        expect(compress('abc', [false, false, false])).toEqual([]);
        expect(compress('abc', [true, false, true])).toEqual(['a', 'c']);
    });
});

describe('count', () => {
    it('default counter', () => {
        expect(take(6, count())).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('counter from different start value', () => {
        expect(take(6, count(1))).toEqual([1, 2, 3, 4, 5, 6]);
        expect(take(6, count(-3))).toEqual([-3, -2, -1, 0, 1, 2]);
    });

    it('counter backwards', () => {
        expect(take(6, count(4, -1))).toEqual([4, 3, 2, 1, 0, -1]);
        expect(take(5, count(-3, -2))).toEqual([-3, -5, -7, -9, -11]);
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

describe('dropwhile', () => {
    it('dropwhile on empty list', () => {
        expect([...dropwhile([], isEven)]).toEqual([]);
        expect([...dropwhile([], isPositive)]).toEqual([]);
    });

    it('dropwhile on list', () => {
        expect([...dropwhile([1], isEven)]).toEqual([1]);
        expect([...dropwhile([1], isPositive)]).toEqual([]);

        expect([...dropwhile([-1, 0, 1], isEven)]).toEqual([-1, 0, 1]);
        expect([...dropwhile([4, -1, 0, 1], isEven)]).toEqual([-1, 0, 1]);
        expect([...dropwhile([-1, 0, 1], isPositive)]).toEqual([-1, 0, 1]);
        expect([...dropwhile([7, -1, 0, 1], isPositive)]).toEqual([-1, 0, 1]);

        expect([...dropwhile([0, 2, 4, 6, 7, 8, 10], isEven)]).toEqual([7, 8, 10]);
        expect([...dropwhile([0, 1, 2, -2, 3, 4, 5, 6, 7], isPositive)]).toEqual([-2, 3, 4, 5, 6, 7]);
    });
});
describe('icompress', () => {
    it('icompress is tested through compress() tests', () => {
        // This is okay
    });
});

describe('ifilter', () => {
    it('ifilter is tested through filter() tests (see builtins)', () => {
        // This is okay
    });

    it('ifilter can handle infinite inputs', () => {
        expect(take(5, ifilter(range(9999), isEven))).toEqual([0, 2, 4, 6, 8]);
    });
});

describe('imap', () => {
    it('imap is tested through map() tests (see builtins)', () => {
        // This is okay
    });

    it('...but imap can handle infinite inputs', () => {
        expect(take(3, imap(range(9999), x => -x))).toEqual([-0, -1, -2]);
    });
});

describe('islice', () => {
    it('islice an empty iterable', () => {
        expect([...islice([], 2)]).toEqual([]);
    });

    it('islice with arguments', () => {
        expect([...islice('ABCDEFG', /*stop*/ 2)]).toEqual(['A', 'B']);
        expect([...islice('ABCDEFG', 2, 4)]).toEqual(['C', 'D']);
        expect([...islice('ABCDEFG', /*start*/ 2, /*stop*/ null)]).toEqual(['C', 'D', 'E', 'F', 'G']);
        expect([...islice('ABCDEFG', /*start*/ 0, /*stop*/ null, /*step*/ 2)]).toEqual(['A', 'C', 'E', 'G']);
        expect([...islice('ABCDEFG', /*start*/ 1, /*stop*/ null, /*step*/ 2)]).toEqual(['B', 'D', 'F']);
    });
});

describe('izip', () => {
    it('izip is tested through zip() tests (see builtins)', () => {
        // This is okay
    });
});

describe('izip3', () => {
    it('izip3 is tested through zip3() tests (see builtins)', () => {
        // This is okay
    });
});

describe('izipAll', () => {
    it('izipAll is tested through zipAll() tests', () => {
        // This is okay
    });
});

describe('izipLongest', () => {
    it('izipLongest is tested through zipLongest() tests', () => {
        // This is okay
    });
});

describe('permutations', () => {
    it('permutations of empty list', () => {
        expect([...permutations([])]).toEqual([[]]);
    });

    it('permutations of unique values', () => {
        expect([...permutations([1, 2])]).toEqual([[1, 2], [2, 1]]);

        expect([...permutations([1, 2, 3])]).toEqual([
            [1, 2, 3],
            [1, 3, 2],
            [2, 1, 3],
            [2, 3, 1],
            [3, 1, 2],
            [3, 2, 1],
        ]);

        // Duplicates have no effect on the results
        expect([...permutations([2, 2, 3])]).toEqual([
            [2, 2, 3],
            [2, 3, 2],
            [2, 2, 3],
            [2, 3, 2],
            [3, 2, 2],
            [3, 2, 2],
        ]);
    });

    it('permutations with r param', () => {
        // r too big
        expect([...permutations([1, 2], 5)]).toEqual([]);

        // prettier-ignore
        expect([...permutations(range(4), 2)]).toEqual([
            [0, 1], [0, 2], [0, 3], [1, 0], [1, 2], [1, 3],
            [2, 0], [2, 1], [2, 3], [3, 0], [3, 1], [3, 2],
        ]);
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
