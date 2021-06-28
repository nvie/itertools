import { Primitive } from './types';

export type CmpFn<T> = (T, T) => number;

export function keyToCmp<T>(keyFn: (T) => Primitive): CmpFn<T>;
export function identityPredicate<T>(x: T): boolean;
export function numberIdentity<T>(x: T): number;
export function primitiveIdentity<T>(x: T): Primitive;
