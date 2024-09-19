## [Unreleased]

- Officially drop Node 16 support (it may still work)

## [2.3.2] - 2024-05-27

- Fix missing top-level exports for `izipLongest3` and `intersperse`

## [2.3.1] - 2024-04-05

- Actually export the new itertool at the top level

## [2.3.0] - 2024-04-05

- Add new `dupes(iterable, keyFn?)` function, which returns groups of all
  duplicate items in iterable.

## [2.2.5] - 2024-03-07

- Add missing export for `repeat`

## [2.2.4] - 2024-02-19

- Type output types of all itertools more precisely

## [2.2.3] - 2024-01-09

Fixes a bug where some iterators would render an inputted generator unusable,
causing it to no longer be consumable after the iterable returns.

Example:

```tsx
function* gen() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
}

const lazy = gen();

// [1, 2]
Array.from(islice(lazy, 0, 2));

Array.from(lazy);
// ❌ Previously:    []
// ✅ Now correctly: [3, 4]
```

This bug only happened when the source was a generator. It did not happen on
a normal iterable.

Similar bugs were present in:

- `find()`
- `islice()`
- `takewhile()`
- `dropwhile()`

No other iterables were affected by this bug. This is the same bug that was
fixed in 2.2.2 for `reduce()`, so many thanks again for surfacing this edge
case, @quangloc99! 🙏

## [2.2.2] - 2024-01-09

- Fix `reduce()` bug where using it on a lazy generator would produce the wrong
  result (thanks for finding, @quangloc99 🙏!)

## [2.2.1] - 2024-01-04

- Fix `islice()` regression where it wasn't stopping on infinite iterables
  (thanks for finding, @Kareem-Medhat 🙏!)

## [2.2.0]

- Move to ESM by default
- Drop support for node 12.x and 14.x  
  (they probably still work, but they're EoL)

## [2.1.2]

- Improve tree-shakability when used in bundlers

## [2.1.1]

- Improve documentation
- Fix a bug in `reduce()` in a very small edge case

## [2.1.0]

The following functions retain richer type information about their arguments:

- `ifilter()`
- `filter()`
- `partition()`

For example, TypeScript will now know the following:

```ts
const items = [3, "hi", -7, "foo", 13];

function isNum(value: unknown): value is number {
  return typeof value === "number";
}

const numbers: number[] = filter(items, isNum); // ✅

const [numbers, strings] = partition(items, isNum); // ✅
//     ^^^^^^^  ^^^^^^^ string[]
//     number[]
```

- Add new `find(iterable, pred)` function, which is almost the same as
  `first(iterable, pred)` but behaves slightly more intuitive in the case
  where no predicate function is given.

- Fix bug in `chunked()` with `size=1`

## [2.0.0]

**Breaking changes:**

- Rewritten source code in TypeScript (instead of Flow)
- Modern ESM and CJS dual exports (fully tree-shakable when using ESM)
- Massively [reduced bundle size](https://bundlephobia.com/package/itertools@2.0.0)
- Targeted ES2015 (instead of ES5)
- Support only TypeScript versions >= 4.3
- Drop Flow support\*
- Drop Node 10.x support
- `icompact`, `compact`, and `compactObject` functions will now also remove
  `null` values, not only `undefined`

(\*: I'm still open to bundling Flow types within this package, but only if
that can be supported in a maintenance-free way, for example by using a script
that will generate `*.flow` files from TypeScript source files. If someone can
add support for that, I'm open to pull requests! 🙏 )

## [1.7.1]

- Add missing re-export of `islice` at the top level

## [1.7.0]

- TypeScript support!
- Declare official support for Node 16.x
- Drop support for Node 13.x (unstable release)

## [1.6.1]

- Include an error code with every FlowFixMe suppression
  (Flow 0.132.x compatibility)

## [1.6.0]

- New itertool: `heads()`

## [1.5.4]

- Export `roundrobin()` at the top level

## [1.5.3]

- Fix bug in `chunked()` when input is exactly dividable

## [1.5.2]

- Export `count()` function at the top level 🤦‍♂️

## [1.5.1]

- Internal change to make the code Flow 0.105.x compatible. Basically stops
  using array spreads (`[...things]`) in favor of `Array.from()`.

## [1.5.0]

- Remove direct code dependency on `regenerator-runtime` (let `@babel/runtime`
  manage it)

## [1.4.0]

- Switch to Babel 7

## [1.3.2]

- Export `filter` at the top level

## [1.3.1]

- New build system
- Cleaner NPM package contents

## [1.3.0]

- Drop support for Node 7

## [1.2.2]

- Make itertools.js fully [Flow Strict](https://flow.org/en/docs/strict/)

## [1.2.1]

- Export `permutations()` at the top-level

## [1.2.0]

- Add port of `groupby()` function (see #87, thanks @sgenoud!)

## [1.1.6]

- declare library to be side effect free (to help optimize webpack v4 builds)

## [1.1.5]

- Include regenerator runtime via babel-runtime

## [1.1.4]

- Make `regenerator-runtime` a normal runtime dependency

## [1.1.3]

- Lower required version of `regenerator-runtime`

## [1.1.2]

- Properly declare dependency on `regenerator-runtime`

## [1.1.1]

- Fix bug in `cycle()` with infinite inputs

## [1.1.0]

Started keeping a CHANGELOG.
