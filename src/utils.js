// @flow strict

import type { Primitive } from './types';

type CmpFn<T> = (T, T) => number;

export function keyToCmp<T>(keyFn: (T) => Primitive): CmpFn<T> {
    return (a: T, b: T) => {
        let ka = keyFn(a);
        let kb = keyFn(b);
        // istanbul ignore else
        if (typeof ka === 'boolean' && typeof kb === 'boolean') {
            return ka === kb ? 0 : !ka && kb ? -1 : 1;
        } else if (typeof ka === 'number' && typeof kb === 'number') {
            return ka - kb;
        } else if (typeof ka === 'string' && typeof kb === 'string') {
            return ka === kb ? 0 : ka < kb ? -1 : 1;
        } else {
            return -1;
        }
    };
}

export function identityPredicate(x: mixed): boolean {
    return !!x;
}

export function numberIdentity(x: mixed): number {
    /* istanbul ignore if */
    if (typeof x !== 'number') {
        throw new Error('Inputs must be numbers');
    }
    return x;
}

export function primitiveIdentity(x: mixed): Primitive {
    /* istanbul ignore if */
    if (typeof x !== 'string' && typeof x !== 'number' && typeof x !== 'boolean') {
        throw new Error('Please provide a key function that can establish object identity');
    }
    return x;
}
