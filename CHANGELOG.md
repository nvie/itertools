## v2.1.2

- Improve tree-shakability when used in bundlers

## v2.1.1

- Improve documentation
- Fix a bug in `reduce()` in a very small edge case

## v2.1.0

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

## v2.0.0

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

## v1.7.1

- Add missing re-export of `islice` at the top level

## v1.7.0

- TypeScript support!
- Declare official support for Node 16.x
- Drop support for Node 13.x (unstable release)

## v1.6.1

- Include an error code with every FlowFixMe suppression
  (Flow 0.132.x compatibility)

## v1.6.0

- New itertool: `heads()`

## v1.5.4

- Export `roundrobin()` at the top level

## v1.5.3

- Fix bug in `chunked()` when input is exactly dividable

## v1.5.2

- Export `count()` function at the top level 🤦‍♂️

## v1.5.1

- Internal change to make the code Flow 0.105.x compatible. Basically stops
  using array spreads (`[...things]`) in favor of `Array.from()`.

## v1.5.0

- Remove direct code dependency on `regenerator-runtime` (let `@babel/runtime`
  manage it)

## v1.4.0

- Switch to Babel 7

## v1.3.2

- Export `filter` at the top level

## v1.3.1

- New build system
- Cleaner NPM package contents

## v1.3.0

- Drop support for Node 7

## v1.2.2

- Make itertools.js fully [Flow Strict](https://flow.org/en/docs/strict/)

## v1.2.1

- Export `permutations()` at the top-level

## v1.2.0

- Add port of `groupby()` function (see #87, thanks @sgenoud!)

## v1.1.6

- declare library to be side effect free (to help optimize webpack v4 builds)

## v1.1.5

- Include regenerator runtime via babel-runtime

## v1.1.4

- Make `regenerator-runtime` a normal runtime dependency

## v1.1.3

- Lower required version of `regenerator-runtime`

## v1.1.2

- Properly declare dependency on `regenerator-runtime`

## v1.1.1

- Fix bug in `cycle()` with infinite inputs

## v1.1.0

Started keeping a CHANGELOG.
