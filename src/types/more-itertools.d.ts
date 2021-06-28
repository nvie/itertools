import { Predicate, Primitive } from './types';

export function chunked<T>(iterable: Iterable<T>, size: number): Iterable<T[]>;
export function flatten<T>(iterableOfIterables: Iterable<Iterable<T>>): Iterable<T>;
export function intersperse<T>(value: T, iterable: Iterable<T>): Iterable<T>;
export function itake<T>(n: number, iterable: Iterable<T>): Iterable<T>;
export function pairwise<T>(iterable: Iterable<T>): Iterable<[T, T]>;
export function partition<T>(iterable: Iterable<T>, predicate: Predicate<T>): [T[], T[]];
export function roundrobin<T>(...iters: Array<Iterable<T>>): Iterable<T>;
export function heads<T>(...iters: Array<Iterable<T>>): Iterable<T[]>;
export function take<T>(n: number, iterable: Iterable<T>): T[];
export function uniqueEverseen<T>(iterable: Iterable<T>, keyFn?: (item: T) => Primitive): Iterable<T>;
export function uniqueJustseen<T>(iterable: Iterable<T>, keyFn?: (item: T) => Primitive): Iterable<T>;
