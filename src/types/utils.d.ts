import { Primitive } from './types';

export type CmpFn<T> = (a: T, b: T) => number;

export function keyToCmp<T>(keyFn: (value: T) => Primitive): CmpFn<T>;
export function identityPredicate(x: unknown): boolean;
export function numberIdentity(x: unknown): number;
export function primitiveIdentity(x: unknown): Primitive;
