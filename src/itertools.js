// @flow

export type Maybe<T> = T | void;
export type Predicate<T> = T => boolean;
export type Primitive = string | number | boolean;
type CmpFn<T> = (T, T) => number;

export function identity<T>(x: T): T {
    return x;
}

export function primitiveIdentity<T>(x: T): Primitive {
    if (typeof x !== 'string' && typeof x !== 'number' && typeof x !== 'boolean') {
        throw new Error('Please provide a key function that can establish object identity');
    }
    return x;
}

function numberIdentity<T>(x: T): number {
    if (typeof x !== 'number') {
        console.error('Inputs must be numbers, got', x);
        throw new Error('Inputs must be numbers');
    }
    return x;
}

function identityPredicate<T>(x: T): boolean {
    return !!x;
}

function isDefined<T>(x: T): boolean {
    return x !== undefined;
}

/**
 * Returns true when any of the items in iterable are truthy.  An optional key
 * function can be used to define what truthiness means for this specific
 * collection.
 *
 * Examples:
 *
 *     any([])                          // => false
 *     any([0])                         // => false
 *     any([0, 1, null, undefined])     // => true
 *
 * Examples with using a key function:
 *
 *     any([1, 4, 5], n => n % 2 == 0)  // => true
 *     any([{name: 'Bob'}, {name: 'Alice'}], person => person.name.startsWith('C'))  // => false
 *
 */
export function any<T>(iterable: Iterable<T>, keyFn?: Predicate<T>): boolean {
    keyFn = keyFn || identityPredicate;
    for (let item of iterable) {
        if (keyFn(item)) {
            return true;
        }
    }

    return false;
}

/**
 * Returns true when all of the items in iterable are truthy.  An optional key
 * function can be used to define what truthiness means for this specific
 * collection.
 *
 * Examples:
 *
 *     all([])                          // => true
 *     all([0])                         // => false
 *     all([0, 1, 2])                   // => false
 *     all([1, 2, 3])                   // => true
 *
 * Examples with using a key function:
 *
 *     all([2, 4, 6], n => n % 2 == 0)  // => true
 *
 */
export function all<T>(iterable: Iterable<T>, keyFn?: Predicate<T>): boolean {
    keyFn = keyFn || identityPredicate;
    for (let item of iterable) {
        if (!keyFn(item)) {
            return false;
        }
    }

    return true;
}

/**
 * Returns true when any of the items in the iterable are equal to the target object.
 *
 * Examples:
 *
 *     contains([], 'whatever')         // => false
 *     contains([3], 42)                // => false
 *     contains([3], 3)                 // => true
 *     contains([0, 1, 2], 2)           // => true
 *
 */
export function contains<T>(haystack: Iterable<T>, needle: T): boolean {
    return any(haystack, x => x === needle);
}

export function chain<T>(...iterables: Array<Iterable<T>>): Iterable<T> {
    return flatten(iterables);
}

export function* cycle<T>(iterable: Iterable<T>): Iterable<T> {
    let saved = [...iterable];
    while (saved.length > 0) {
        for (let element of saved) {
            yield element;
        }
    }
}

export function* enumerate<T>(iterable: Iterable<T>, start: number = 0): Iterable<[number, T]> {
    let index: number = start;
    for (let value of iterable) {
        yield [index++, value];
    }
}

export function* ifilter<T>(iterable: Iterable<T>, predicate: Predicate<T>): Iterable<T> {
    for (let value of iterable) {
        if (predicate(value)) {
            yield value;
        }
    }
}

export function first<T>(iterable: Iterable<T>, keyFn?: Predicate<T>): Maybe<T> {
    keyFn = keyFn || isDefined;
    for (let value of iterable) {
        if (keyFn(value)) {
            return value;
        }
    }
    return undefined;
}

export function* flatten<T>(iterableOfIterables: Iterable<Iterable<T>>): Iterable<T> {
    for (let iterable of iterableOfIterables) {
        for (let item of iterable) {
            yield item;
        }
    }
}

/**
 * Returns 0 or more values for every value in the given iterable
 *
 * Examples:
 *
 *      Get Ids for an Author and its aliases
 *      flatmap(author => [author.id, ...author.aliases.map(a => a.id)], authors)
 *
 */
export function flatmap<T, S>(iterable: Iterable<T>, mapper: T => Iterable<S>): Iterable<S> {
    return flatten(imap(iterable, mapper));
}

export function* imap<T, V>(iterable: Iterable<T>, mapper: T => V): Iterable<V> {
    for (let value of iterable) {
        yield mapper(value);
    }
}

export function map<T, V>(iterable: Iterable<T>, mapper: T => V): Array<V> {
    return [...imap(iterable, mapper)];
}

/**
 * Make the passed in iterable an actual iterable.  Note that any iterable is fine: a lazy iterable, or an
 * iterable data structure like an Array.  The result will only be iterable once, which is the main use
 * case for this function.
 */
export function iter<T>(iterable: Iterable<T>): Iterator<T> {
    // TODO: Not sure why Flow choked on this expression below, but at least we lock down the
    // type transformation in the function signature this way.
    // $FlowFixMe
    return iterable[Symbol.iterator]();
}

export function* izip2<T1, T2>(xs: Iterable<T1>, ys: Iterable<T2>): Iterable<[T1, T2]> {
    xs = iter(xs);
    ys = iter(ys);
    for (;;) {
        const x = xs.next();
        const y = ys.next();
        if (!x.done && !y.done) {
            yield [x.value, y.value];
        } else {
            // One of the iterables exhausted
            return;
        }
    }
}

export function* izip3<T1, T2, T3>(xs: Iterable<T1>, ys: Iterable<T2>, zs: Iterable<T3>): Iterable<[T1, T2, T3]> {
    xs = iter(xs);
    ys = iter(ys);
    zs = iter(zs);
    for (;;) {
        const x = xs.next();
        const y = ys.next();
        const z = zs.next();
        if (!x.done && !y.done && !z.done) {
            yield [x.value, y.value, z.value];
        } else {
            // One of the iterables exhausted
            return;
        }
    }
}

/**
 * Like the other izip's, but generalized.  Due to type system limitations, you can only "generially"
 * zip iterables with homogeneous types, so you cannot mix types like <A, B> like you can with izip2()
 */
export function* izipAll<T>(...iters: Array<Iterable<T>>): Iterable<Array<T>> {
    // Make them all iterables
    const iterables = iters.map(iter);

    for (;;) {
        const heads: Array<IteratorResult<T, any>> = iterables.map(xs => xs.next());
        if (all(heads, h => !h.done)) {
            yield heads.map(h => ((h.value: any): T));
        } else {
            // One of the iterables exhausted
            return;
        }
    }
}

export const izip = izip2;

export function zip<T1, T2>(xs: Iterable<T1>, ys: Iterable<T2>): Array<[T1, T2]> {
    return [...izip2(xs, ys)];
}

export function zip3<T1, T2, T3>(xs: Iterable<T1>, ys: Iterable<T2>, zs: Iterable<T3>): Array<[T1, T2, T3]> {
    return [...izip3(xs, ys, zs)];
}

export function zipAll<T>(...iters: Array<Iterable<T>>): Array<Array<T>> {
    return [...izipAll(...iters)];
}

export function* izipLongest2<T1, T2, D>(
    xs: Iterable<T1>,
    ys: Iterable<T2>,
    filler: Maybe<D> = undefined
): Iterable<[T1 | D, T2 | D]> {
    xs = iter(xs);
    ys = iter(ys);
    for (;;) {
        const x = xs.next();
        const y = ys.next();
        if (x.done && y.done) {
            // All iterables exhausted
            return;
        } else {
            yield [!x.done ? x.value : filler, !y.done ? y.value : filler];
        }
    }
}

export function zipLongest2<T1, T2, D>(
    xs: Iterable<T1>,
    ys: Iterable<T2>,
    filler: Maybe<D> = undefined
): Array<[T1 | D, T2 | D]> {
    return [...izipLongest2(xs, ys, filler)];
}

export const izipLongest = izipLongest2;
export const zipLongest = zipLongest2;

export function* icompress<T>(data: Iterable<T>, selectors: Iterable<boolean>): Iterable<T> {
    for (let [d, s] of izip(data, selectors)) {
        if (s) {
            yield d;
        }
    }
}

export function compress<T>(data: Iterable<T>, selectors: Iterable<boolean>): Array<T> {
    return [...icompress(data, selectors)];
}

export function* range(a: number, b?: number, step?: number): Iterable<number> {
    let start: number, stop: number;
    step = step || 1;
    (step: number);

    // range(a) means range(0, a)
    if (typeof b === 'undefined' || b === null) {
        [start, stop] = [0, a];
    } else {
        [start, stop] = [a, b];
    }

    let pred: Predicate<number>;
    if (step >= 0) {
        pred = curr => curr < stop;
    } else {
        pred = curr => curr > stop; // with negative step
    }

    let curr: number = start;
    while (pred(curr)) {
        yield curr;
        curr += step;
    }
}

export function* itake<T>(n: number, iterable: Iterable<T>): Iterable<T> {
    iterable = iter(iterable);
    while (n-- > 0) {
        let s = iterable.next();
        if (!s.done) {
            yield s.value;
        } else {
            // Iterable exhausted, quit early
            return;
        }
    }
}

export function take<T>(n: number, iterable: Iterable<T>): Array<T> {
    return [...itake(n, iterable)];
}

export function* takewhile<T>(iterable: Iterable<T>, predicate: Predicate<T>): Iterable<T> {
    for (let value of iterable) {
        if (!predicate(value)) return;
        yield value;
    }
}

export function partition<T>(iterable: Iterable<T>, predicate: Predicate<T>): [Array<T>, Array<T>] {
    let gold = [];
    let dust = [];

    for (let item of iterable) {
        if (predicate(item)) {
            gold.push(item);
        } else {
            dust.push(item);
        }
    }

    return [gold, dust];
}

function keyToCmp<T>(keyFn: T => Primitive): CmpFn<T> {
    return (a: T, b: T) => {
        let ka = keyFn(a);
        let kb = keyFn(b);
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

export function sorted<T>(
    iterable: Iterable<T>,
    keyFn: T => Primitive = primitiveIdentity,
    reverse: boolean = false
): Array<T> {
    const result = [...iterable];
    result.sort(keyToCmp(keyFn)); // sort in-place

    if (reverse) {
        result.reverse(); // reverse in-place
    }

    return result;
}

export function* uniqueJustseen<T>(iterable: Iterable<T>, keyFn: T => Primitive = primitiveIdentity): Iterable<T> {
    keyFn = keyFn || identity;
    let last = undefined;
    for (let item of iterable) {
        let key = keyFn(item);
        if (key !== last) {
            yield item;
            last = key;
        }
    }
}

export function* uniqueEverseen<T>(iterable: Iterable<T>, keyFn: T => Primitive = primitiveIdentity): Iterable<T> {
    keyFn = keyFn || identity;
    let seen = new Set();
    for (let item of iterable) {
        let key = keyFn(item);
        if (!seen.has(key)) {
            seen.add(key);
            yield item;
        }
    }
}

export function* icompact<T>(iterable: Iterable<T>): Iterable<$NonMaybeType<T>> {
    for (let item of iterable) {
        if (typeof item !== 'undefined') {
            yield item;
        }
    }
}

export function compact<T>(iterable: Iterable<T>): Array<$NonMaybeType<T>> {
    return [...icompact(iterable)];
}

/**
 * Removes all undefined values from the given object. Returns a new object.
 *
 * Examples:
 *   compactObject({ a: 1, b: undefined, c: 0 })
 *       // ==> { a: 1, c: 0 }
 */
export function compactObject<O: { [key: string]: any }>(obj: O): $ObjMap<O, <T>(Maybe<T>) => T> {
    let result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value !== 'undefined') {
            result[key] = value;
        }
    }
    return result;
}

/**
 * Reducer function with a start value.
 */
export function reduce<T, O>(iterable: Iterable<T>, reducer: (O, T, number) => O, start: O): O {
    iterable = iter(iterable);
    let output = start;
    for (const [index, item] of enumerate(iterable)) {
        output = reducer(output, item, index);
    }
    return output;
}

/**
 * Reducer function without a start value.  The start value will be the first item in
 * the input iterable.  For this reason, the function may not necessarily return anything
 * (i.e. if the input is empty), and the inputs and the outputs must be of homogeneous types.
 */
export function reduce_<T>(iterable: Iterable<T>, reducer: (T, T, number) => T): Maybe<T> {
    iterable = iter(iterable);
    const start = first(iterable);
    if (start === undefined) {
        return undefined;
    } else {
        return reduce(iterable, reducer, start);
    }
}

export function max<T>(iterable: Iterable<T>, keyFn?: T => number): Maybe<T> {
    const key = keyFn || numberIdentity;
    return reduce_(iterable, (x, y) => (key(x) > key(y) ? x : y));
}

export function min<T>(iterable: Iterable<T>, keyFn?: T => number): Maybe<T> {
    const key = keyFn || numberIdentity;
    return reduce_(iterable, (x, y) => (key(x) < key(y) ? x : y));
}

export function sum(iterable: Iterable<number>): number {
    return reduce(iterable, (x, y) => x + y, 0);
}

export function* pairwise<T>(iterable: Iterable<T>): Iterable<[T, T]> {
    iterable = iter(iterable);
    let r1 = iterable.next();
    if (r1.done) {
        return;
    }

    r1 = r1.value;
    for (const r2 of iterable) {
        yield [r1, r2];
        r1 = r2;
    }
}

export function* chunked<T>(iterable: Iterable<T>, chunkSize: number): Iterable<Array<T>> {
    iterable = iter(iterable);
    let r1 = iterable.next();
    if (r1.done) {
        return;
    }

    let chunk = [r1.value];

    for (const item of iterable) {
        chunk.push(item);

        if (chunk.length === chunkSize) {
            yield chunk;
            chunk = [];
        }
    }

    yield chunk;
}
