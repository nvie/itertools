import { Maybe, Predicate, Primitive } from './types';

export function all<T>(iterable: Iterable<T>, keyFn?: Predicate<T>): boolean;
export function any<T>(iterable: Iterable<T>, keyFn?: Predicate<T>): boolean;
export function contains<T>(haystack: Iterable<T>, needle: T): boolean;
export function* enumerate<T>(iterable: Iterable<T>, start: number = 0): Iterable<[number, T]>;
export function filter<T>(iterable: Iterable<T>, predicate: Predicate<T>): T[];
export function iter<T>(iterable: Iterable<T>): Iterator<T>;
export function map<T, V>(iterable: Iterable<T>, mapper: (T) => V): V[];
export function max<T>(iterable: Iterable<T>, keyFn: (T) => number = numberIdentity): Maybe<T>;
export function min<T>(iterable: Iterable<T>, keyFn: (T) => number = numberIdentity): Maybe<T>;
function _range(start: number, stop: number, step: number): Iterable<number>;
export function range(a: number, ...rest: number[]): Iterable<number>;
export function reduce<T, O>(iterable: Iterable<T>, reducer: (O, T, number) => O, start: O): O;
export function reduce_<T>(iterable: Iterable<T>, reducer: (T, T, number) => T): Maybe<T>;
export function sorted<T>(iterable: Iterable<T>, keyFn?: (T) => Primitive, reverse?: boolean): T[];
export function sum(iterable: Iterable<number>): number;
export function zip<T1, T2>(xs: Iterable<T1>, ys: Iterable<T2>): Array<[T1, T2]>;
export function zip3<T1, T2, T3>(xs: Iterable<T1>, ys: Iterable<T2>, zs: Iterable<T3>): Array<[T1, T2, T3]>;
