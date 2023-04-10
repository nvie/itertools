import { describe, it, expect } from 'vitest';
import { range } from '../builtins';
import { find, first } from '../custom';
import {
    chunked,
    flatten,
    heads,
    intersperse,
    pairwise,
    partition,
    roundrobin,
    take,
    uniqueEverseen,
    uniqueJustseen,
} from '../more-itertools';
import * as fc from 'fast-check';

const isEven = (x: number) => x % 2 === 0;
const isPositive = (x: number) => x >= 0;

function isNum(value: unknown): value is number {
    return typeof value === 'number';
}

describe('chunked', () => {
    it('does nothing for empty array', () => {
        expect(Array.from(chunked([], 3))).toEqual([]);
    });

    it('works with array smaller than chunk size', () => {
        expect(Array.from(chunked([1], 3))).toEqual([[1]]);
    });

    it('works with array of values', () => {
        expect(Array.from(chunked([1, 2, 3, 4, 5], 3))).toEqual([
            [1, 2, 3],
            [4, 5],
        ]);
    });

    it('works with exactly chunkable list', () => {
        expect(Array.from(chunked([1, 2, 3, 4, 5, 6], 3))).toEqual([
            [1, 2, 3],
            [4, 5, 6],
        ]);
    });

    it('works with chunkable list with remainder', () => {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        expect(Array.from(chunked(numbers, 3))).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);
        expect(Array.from(chunked(numbers, 5))).toEqual([
            [1, 2, 3, 4, 5],
            [6, 7, 8, 9, 10],
        ]);
        expect(Array.from(chunked(numbers, 9999))).toEqual([numbers]);
    });

    it('no chunk will be larger than the chunk size', () => {
        fc.assert(
            fc.property(
                fc.array(fc.anything()),
                fc.integer({ min: 1 }),

                (input, chunkSize) => {
                    const output = Array.from(chunked(input, chunkSize));
                    fc.pre(output.length > 0);

                    const lastChunk = output.pop()!;
                    expect(lastChunk.length).toBeGreaterThan(0);
                    expect(lastChunk.length).toBeLessThanOrEqual(chunkSize);

                    // The remaining chunks are all exactly the chunk size
                    for (const chunk of output) {
                        expect(chunk.length).toEqual(chunkSize);
                    }
                }
            )
        );
    });

    it('chunks contain all elements, in the same order as the input', () => {
        fc.assert(
            fc.property(
                fc.array(fc.anything()),
                fc.integer({ min: 1 }),

                (input, chunkSize) => {
                    const output = Array.from(chunked(input, chunkSize));

                    // Exact same elements as input array
                    expect(output.flatMap((x) => x)).toEqual(input);
                }
            )
        );
    });
});

describe('find', () => {
    it('returns nothing for an empty array', () => {
        expect(find([])).toBeUndefined();
        expect(find([undefined, undefined])).toBeUndefined();
    });

    it('returns the first value in the array', () => {
        expect(find([3, 'ohai'])).toBe(3);
        expect(find(['ohai', 3])).toBe('ohai');
    });

    it('find may returns falsey values too', () => {
        expect(find([0, 1, 2])).toBe(0);
        expect(find([false, true])).toBe(false);
        expect(find([null, false, true])).toBe(null);
        expect(find([undefined, 3, 'ohai'])).toBe(undefined);
        expect(find([NaN, 3, 'ohai'])).toBe(NaN);
    });

    it('find uses a predicate if provided', () => {
        expect(find([0, 1, 2, 3, 4], (n) => !!n)).toBe(1);
        expect(find([0, 1, 2, 3, 4], (n) => n > 1)).toBe(2);
        expect(find([0, 1, 2, 3, 4], (n) => n < 0)).toBeUndefined();
        expect(find([false, true], (x) => x)).toBe(true);
    });
});

describe('first', () => {
    it('returns nothing for an empty array', () => {
        expect(first([])).toBeUndefined();
        expect(first([undefined, undefined])).toBeUndefined();
    });

    it('returns the first value in the array', () => {
        expect(first([3, 'ohai'])).toBe(3);
        expect(first(['ohai', 3])).toBe('ohai');
        expect(first([undefined, 3, 'ohai'])).toBe(3);
    });

    it('find may returns falsey values too', () => {
        expect(first([0, 1, 2])).toBe(0);
        expect(first([false, true])).toBe(false);
        expect(first([null, false, true])).toBe(null);
        expect(first([NaN, 3, 'ohai'])).toBe(NaN);
    });

    it('find uses a predicate if provided', () => {
        expect(first([0, 1, 2, 3, 4], (n) => !!n)).toBe(1);
        expect(first([0, 1, 2, 3, 4], (n) => n > 1)).toBe(2);
        expect(first([0, 1, 2, 3, 4], (n) => n < 0)).toBeUndefined();
        expect(first([false, true], (x) => x)).toBe(true);
    });
});

describe('flatten', () => {
    it('flatten w/ empty list', () => {
        expect(Array.from(flatten([]))).toEqual([]);
        expect(Array.from(flatten([[], [], [], [], []]))).toEqual([]);
    });

    it('flatten works', () => {
        expect(
            Array.from(
                flatten([
                    [1, 2],
                    [3, 4, 5],
                ])
            )
        ).toEqual([1, 2, 3, 4, 5]);
        expect(Array.from(flatten(['hi', 'ha']))).toEqual(['h', 'i', 'h', 'a']);
    });
});

describe('intersperse', () => {
    it('intersperse on empty sequence', () => {
        expect(Array.from(intersperse(0, []))).toEqual([]);
    });

    it('intersperse', () => {
        expect(Array.from(intersperse(-1, [13]))).toEqual([13]);
        expect(Array.from(intersperse(null, [13, 14]))).toEqual([13, null, 14]);
        expect(Array.from(intersperse('foo', [1, 2, 3, 4]))).toEqual([1, 'foo', 2, 'foo', 3, 'foo', 4]);
    });
});

describe('itake', () => {
    it('itake is tested through take() tests', () => {
        // This is okay
    });
});

describe('pairwise', () => {
    it('does nothing for empty array', () => {
        expect(Array.from(pairwise([]))).toEqual([]);
        expect(Array.from(pairwise([1]))).toEqual([]);
    });

    it('it returns pairs of input', () => {
        expect(Array.from(pairwise([0, 1, 2]))).toEqual([
            [0, 1],
            [1, 2],
        ]);
        expect(Array.from(pairwise([1, 2]))).toEqual([[1, 2]]);
        expect(Array.from(pairwise([1, 2, 3, 4]))).toEqual([
            [1, 2],
            [2, 3],
            [3, 4],
        ]);
    });
});

describe('partition', () => {
    it('partition empty list', () => {
        expect(partition([], isEven)).toEqual([[], []]);
    });

    it('partition splits input list into two lists', () => {
        const values = [1, -2, 3, 4, 5, 6, 8, 8, 0, -2, -3];
        expect(partition(values, isEven)).toEqual([
            [-2, 4, 6, 8, 8, 0, -2],
            [1, 3, 5, -3],
        ]);
        expect(partition(values, isPositive)).toEqual([
            [1, 3, 4, 5, 6, 8, 8, 0],
            [-2, -2, -3],
        ]);
    });

    it('parition retains rich type info', () => {
        const values = ['hi', 3, null, 'foo', -7];
        const [good, bad] = partition(values, isNum);
        expect(good).toEqual([3, -7]);
        //     ^^^^ number[]
        expect(bad).toEqual(['hi', null, 'foo']);
        //     ^^^ (string | null)[]
    });
});

describe('roundrobin', () => {
    it('roundrobin on empty list', () => {
        expect(Array.from(roundrobin())).toEqual([]);
        expect(Array.from(roundrobin([]))).toEqual([]);
        expect(Array.from(roundrobin([], []))).toEqual([]);
        expect(Array.from(roundrobin([], [], []))).toEqual([]);
        expect(Array.from(roundrobin([], [], [], []))).toEqual([]);
    });

    it('roundrobin on equally sized lists', () => {
        expect(Array.from(roundrobin([1], [2], [3]))).toEqual([1, 2, 3]);
        expect(Array.from(roundrobin([1, 2], [3, 4]))).toEqual([1, 3, 2, 4]);
        expect(Array.from(roundrobin('foo', 'bar')).join('')).toEqual('fboaor');
    });

    it('roundrobin on unequally sized lists', () => {
        expect(Array.from(roundrobin([1], [], [2, 3, 4]))).toEqual([1, 2, 3, 4]);
        expect(Array.from(roundrobin([1, 2, 3, 4, 5], [6, 7]))).toEqual([1, 6, 2, 7, 3, 4, 5]);
        expect(Array.from(roundrobin([1, 2, 3], [4], [5, 6, 7, 8]))).toEqual([1, 4, 5, 2, 6, 3, 7, 8]);
    });
});

describe('heads', () => {
    it('heads on empty list', () => {
        expect(Array.from(heads())).toEqual([]);
        expect(Array.from(heads([]))).toEqual([]);
        expect(Array.from(heads([], []))).toEqual([]);
        expect(Array.from(heads([], [], []))).toEqual([]);
        expect(Array.from(heads([], [], [], []))).toEqual([]);
    });

    it('heads on equally sized lists', () => {
        expect(Array.from(heads([1], [2], [3]))).toEqual([[1, 2, 3]]);
        expect(Array.from(heads([1, 2], [3, 4]))).toEqual([
            [1, 3],
            [2, 4],
        ]);
        expect(Array.from(heads('foo', 'bar')).map((s) => s.join(''))).toEqual(['fb', 'oa', 'or']);
    });

    it('heads on unequally sized lists', () => {
        expect(Array.from(heads([1], [], [2, 3, 4]))).toEqual([[1, 2], [3], [4]]);
        expect(Array.from(heads([1, 2, 3, 4, 5], [6, 7]))).toEqual([[1, 6], [2, 7], [3], [4], [5]]);
        expect(Array.from(heads([1, 2, 3], [4], [5, 6, 7, 8]))).toEqual([[1, 4, 5], [2, 6], [3, 7], [8]]);
    });
});

describe('take', () => {
    it('take on empty array', () => {
        expect(take(0, [])).toEqual([]);
        expect(take(1, [])).toEqual([]);
        expect(take(99, [])).toEqual([]);
    });

    it('take on infinite input', () => {
        expect(take(5, Math.PI.toString())).toEqual(['3', '.', '1', '4', '1']);
    });

    it('take on infinite input', () => {
        expect(take(0, range(999)).length).toEqual(0);
        expect(take(1, range(999)).length).toEqual(1);
        expect(take(99, range(999)).length).toEqual(99);
    });
});

describe('uniqueJustseen', () => {
    it('uniqueJustseen w/ empty list', () => {
        expect(Array.from(uniqueJustseen([]))).toEqual([]);
    });

    it('uniqueJustseen', () => {
        expect(Array.from(uniqueJustseen([1, 2, 3, 4, 5]))).toEqual([1, 2, 3, 4, 5]);
        expect(Array.from(uniqueJustseen([1, 1, 1, 2, 2]))).toEqual([1, 2]);
        expect(Array.from(uniqueJustseen([1, 1, 1, 2, 2, 1, 1, 1, 1]))).toEqual([1, 2, 1]);
    });

    it('uniqueEverseen with key function', () => {
        expect(Array.from(uniqueJustseen('AaABbBCcaABBb', (s) => s.toLowerCase()))).toEqual(['A', 'B', 'C', 'a', 'B']);
    });
});

describe('uniqueEverseen', () => {
    it('uniqueEverseen w/ empty list', () => {
        expect(Array.from(uniqueEverseen([]))).toEqual([]);
    });

    it('uniqueEverseen never emits dupes, but keeps input ordering', () => {
        expect(Array.from(uniqueEverseen([1, 2, 3, 4, 5]))).toEqual([1, 2, 3, 4, 5]);
        expect(Array.from(uniqueEverseen([1, 1, 1, 2, 2, 3, 1, 3, 0, 4]))).toEqual([1, 2, 3, 0, 4]);
        expect(Array.from(uniqueEverseen([1, 1, 1, 2, 2, 1, 1, 1, 1]))).toEqual([1, 2]);
    });

    it('uniqueEverseen with key function', () => {
        expect(Array.from(uniqueEverseen('AAAABBBCCDAABBB'))).toEqual(['A', 'B', 'C', 'D']);
        expect(Array.from(uniqueEverseen('ABCcAb', (s) => s.toLowerCase()))).toEqual(['A', 'B', 'C']);
        expect(Array.from(uniqueEverseen('AbCBBcAb', (s) => s.toLowerCase()))).toEqual(['A', 'b', 'C']);
    });
});
