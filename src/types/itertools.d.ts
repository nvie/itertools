import { Maybe, Predicate, Primitive } from './types';

export function chain<T>(...iterables: Array<Iterable<T>>): Iterable<T>;
export function count(start?: number, step?: number): Iterable<number>;
export function compress<T>(data: Iterable<T>, selectors: Iterable<boolean>): T[];
export function cycle<T>(iterable: Iterable<T>): Iterable<T>;
export function dropwhile<T>(iterable: Iterable<T>, predicate: Predicate<T>): Iterable<T>;
export function groupby<T, U extends Primitive>(iterable: Iterable<T>, keyFn?: (item: T) => U): Iterable<[U, Iterable<T>]>;
export function icompress<T>(data: Iterable<T>, selectors: Iterable<boolean>): Iterable<T>;
export function ifilter<T>(iterable: Iterable<T>, predicate: Predicate<T>): Iterable<T>;
export function imap<T, V>(iterable: Iterable<T>, mapper: (item: T) => V): Iterable<V>;
export function islice<T>(iterable: Iterable<T>, start: number, stop?: number, step?: number): Iterable<T>;
export function izip<T1, T2>(xs: Iterable<T1>, ys: Iterable<T2>): Iterable<[T1, T2]>;
export function izip2<T1, T2>(xs: Iterable<T1>, ys: Iterable<T2>): Iterable<[T1, T2]>;
export function izip3<T1, T2, T3>(xs: Iterable<T1>, ys: Iterable<T2>, zs: Iterable<T3>): Iterable<[T1, T2, T3]>;
export function izipLongest<T1, T2, D = undefined>(
    xs: Iterable<T1>,
    ys: Iterable<T2>,
    filler: D
): Iterable<[T1 | D, T2 | D]>;
export function izipLongest2<T1, T2, D = undefined>(
    xs: Iterable<T1>,
    ys: Iterable<T2>,
    filler: D
): Iterable<[T1 | D, T2 | D]>;
export function izipLongest3<T1, T2, T3, D = undefined>(
    xs: Iterable<T1>,
    ys: Iterable<T2>,
    zs: Iterable<T3>,
    filler: D
): Iterable<[T1 | D, T2 | D, T3 | D]>;
export function izipMany<T>(...iters: Array<Iterable<T>>): Iterable<T[]>;
export function permutations<T>(iterable: Iterable<T>, r: Maybe<number>): Iterable<T[]>;
export function repeat<T>(thing: T, times?: number): Iterable<T>;
export function takewhile<T>(iterable: Iterable<T>, predicate: Predicate<T>): Iterable<T>;
export function zipLongest<T1, T2, D = undefined>(
    xs: Iterable<T1>,
    ys: Iterable<T2>,
    filler: D
): Array<[T1 | D, T2 | D]>;
export function zipLongest2<T1, T2, D = undefined>(
    xs: Iterable<T1>,
    ys: Iterable<T2>,
    filler: D
): Array<[T1 | D, T2 | D]>;
export function zipLongest3<T1, T2, T3, D = undefined>(
    xs: Iterable<T1>,
    ys: Iterable<T2>,
    zs: Iterable<T3>,
    filler: D
): Array<[T1 | D, T2 | D, T3 | D]>;
export function zipMany<T>(...iters: Array<Iterable<T>>): T[][];
