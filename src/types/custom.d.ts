import { Maybe, Predicate } from './types';

export function icompact<T>(iterable: Iterable<T>): Iterable<NonNullable<T>>;
export function compact<T>(iterable: Iterable<T>): Array<NonNullable<T>>;
export function compactObject<O extends object>(obj: O): { [K in keyof O]: NonNullable<O[K]> };
export function first<T>(iterable: Iterable<T>, keyFn?: Predicate<T>): Maybe<T>;
export function flatmap<T, S>(iterable: Iterable<T>, mapper: (item: T) => Iterable<S>): Iterable<S>;
