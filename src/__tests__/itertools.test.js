// @flow

import { range } from '../builtins';
import { cycle, ifilter, imap, takewhile, zipAll, zipLongest } from '../itertools';
import { take } from '../more-itertools';

const isEven = x => x % 2 === 0;
const isPositive = x => x >= 0;

describe('TODO: chain', () => {
    it('...', () => {});
});

describe('TODO: compress', () => {
    it('...', () => {});
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

describe('TODO: izip', () => {
    it('...', () => {});
});

describe('TODO: izip3', () => {
    it('...', () => {});
});

describe('TODO: izipAll', () => {
    it('...', () => {});
});

describe('TODO: izipLongest', () => {
    it('...', () => {});
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
