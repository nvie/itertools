[![npm](https://img.shields.io/npm/v/itertools.svg)](https://www.npmjs.com/package/itertools)
[![Build Status](https://github.com/nvie/itertools.js/workflows/test/badge.svg)](https://github.com/nvie/itertools.js/actions)
[![Coverage Status](https://img.shields.io/coveralls/nvie/itertools.js/master.svg)](https://coveralls.io/github/nvie/itertools.js?branch=master)
[![Minified Size](https://badgen.net/bundlephobia/minzip/itertools)](https://bundlephobia.com/result?p=itertools)

A JavaScript port of Python's awesome
[itertools](https://docs.python.org/library/itertools.html) standard library.

Usage example:

```javascript
>>> import { izip, cycle } from 'itertools';
>>>
>>> const xs = [1, 2, 3, 4];
>>> const ys = ['hello', 'there'];
>>> for (const [x, y] of izip(xs, cycle(ys))) {
>>>     console.log(x, y);
>>> }
1 'hello'
2 'there'
3 'hello'
4 'there'
```


## About argument order

In Python, many of the itertools take a function as an argument.  In the JS
port of these we initially kept these orderings the same to stick closely to
the Python functions, but in practice, it turns out to be more pragmatic to
flip them, so the function gets to be the second param.  Example:

In Python:

```python
map(fn, items)
```

But in JavaScript:

```python
map(items, fn)
```

The rationale for this flipping of argument order is because in practice, the
function bodies can span multiple lines, in which case the following block will
remaing aesthetically pleasing:

```javascript
import { map } from 'itertools';

const numbers = [1, 2, 3];
const squares = map(numbers, n => {

    //
    // Do something wild with these numbers here
    //
    // ...
    return n * n;

});
```

## API

The `itertools` package consists of a few building blocks:

* [Ports of builtins](#ports-of-builtins)
* [Ports of itertools](#ports-of-itertools)
* [Ports of more-itertools](#ports-of-more-itertools)
* [Additions](#additions)


### Ports of builtins

* [all](#all)
* [any](#any)
* [contains](#contains)
* [enumerate](#enumerate)
* [filter](#filter)
* [iter](#iter)
* [map](#map)
* [max](#max)
* [min](#min)
* [range](#range)
* [reduce](#reduce)
* [reduce\_](#reduce_)
* [sorted](#sorted)
* [sum](#sum)
* [zip](#zip)
* [zip3](#zip3)

<a name="all" href="#all">#</a> <b>all</b>(iterable: <i>Iterable&lt;T&gt;</i>, keyFn?: <i>Predicate&lt;T&gt;</i>): <i>boolean</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

Returns true when all of the items in iterable are truthy.  An optional key
function can be used to define what truthiness means for this specific
collection.

Examples:

```javascript
all([])                           // => true
all([0])                          // => false
all([0, 1, 2])                    // => false
all([1, 2, 3])                    // => true
```

Examples with using a key function:

```javascript
all([2, 4, 6], n => n % 2 === 0)  // => true
all([2, 4, 5], n => n % 2 === 0)  // => false
```


<a name="any" href="#any">#</a> <b>any</b>(iterable: <i>Iterable&lt;T&gt;</i>, keyFn?: <i>Predicate&lt;T&gt;</i>): <i>boolean</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

Returns true when any of the items in iterable are truthy.  An optional key
function can be used to define what truthiness means for this specific
collection.

Examples:

```javascript
any([])                           // => false
any([0])                          // => false
any([0, 1, null, undefined])      // => true
```

Examples with using a key function:

```javascript
any([1, 4, 5], n => n % 2 === 0)  // => true
any([{name: 'Bob'}, {name: 'Alice'}], person => person.name.startsWith('C'))  // => false
```


<a name="contains" href="#contains">#</a> <b>contains</b>(haystack: <i>Iterable&lt;T&gt;</i>, needle: <i>T</i>): <i>boolean</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

Returns true when any of the items in the iterable are equal to the target
object.

Examples:

```javascript
contains([], 'whatever')         // => false
contains([3], 42)                // => false
contains([3], 3)                 // => true
contains([0, 1, 2], 2)           // => true
```


<a name="enumerate" href="#enumerate">#</a> <b>enumerate</b>(iterable: <i>Iterable&lt;T&gt;</i>, start: <i>number = 0</i>): <i>Iterable&lt;[number, T]&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

Returns an iterable of enumeration pairs.  Iterable must be a sequence, an
iterator, or some other object which supports iteration.  The elements produced
by returns a tuple containing a counter value (starting from 0 by default) and
the values obtained from iterating over given iterable.

Example:

```javascript
import { enumerate } from 'itertools';

console.log([...enumerate(['hello', 'world'])]);
// [0, 'hello'], [1, 'world']]
```

<a name="filter" href="#filter">#</a> <b>filter</b>(iterable: <i>Iterable&lt;T&gt;</i>, predicate: <i>Predicate&lt;T&gt;</i>): <i>Array&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

Non-lazy version of [ifilter](#ifilter).


<a name="iter" href="#iter">#</a> <b>iter</b>(iterable: <i>Iterable&lt;T&gt;</i>): <i>Iterator&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

Returns an iterator object for the given iterable.  This can be used to
manually get an iterator for any iterable datastructure.  The purpose and main
use case of this function is to get a single iterator (a thing with state,
think of it as a "cursor") which can only be consumed once.


<a name="map" href="#map">#</a> <b>map</b>(iterable: _Iterable&lt;T&gt;_, mapper: _T =&gt; V_): _Array&lt;V&gt;_ [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

Non-lazy version of [imap](#imap).


<a name="max" href="#max">#</a> <b>max</b>(iterable: <i>Iterable&lt;T&gt;</i>, keyFn?: <i>T =&gt; number</i>): <i>Maybe&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

Return the largest item in an iterable.  Only works for numbers, as ordering is
pretty poorly defined on any other data type in JS.  The optional `keyFn`
argument specifies a one-argument ordering function like that used for
[sorted](#sorted).

If the iterable is empty, `undefined` is returned.

If multiple items are maximal, the function returns either one of them, but
which one is not defined.


<a name="min" href="#min">#</a> <b>min</b>(iterable: <i>Iterable&lt;T&gt;</i>, keyFn?: <i>T =&gt; number</i>): <i>Maybe&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

Return the smallest item in an iterable.  Only works for numbers, as ordering
is pretty poorly defined on any other data type in JS.  The optional `keyFn`
argument specifies a one-argument ordering function like that used for
[sorted](#sorted).

If the iterable is empty, `undefined` is returned.

If multiple items are minimal, the function returns either one of them, but
which one is not defined.


<a name="range" href="#range">#</a> <b>range</b>(start: <i>number</i>): <i>Iterable&lt;number&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")<br />
<a name="range" href="#range">#</a> <b>range</b>(start: <i>number</i>, stop: <i>number</i>, step: <i>number</i> = 1): <i>Iterable&lt;number&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

Returns an iterator producing all the numbers in the given range one by one,
starting from `start` (default 0), as long as `i < stop`, in increments of
`step` (default 1).

`range(a)` is a convenient shorthand for `range(0, a)`.

Various valid invocations:

    range(5)           // [0, 1, 2, 3, 4]
    range(0, 5)        // [0, 1, 2, 3, 4]
    range(0, 5, 2)     // [0, 2, 4]
    range(5, 0, -1)    // [5, 4, 3, 2, 1]
    range(-3)          // []

For a positive `step`, the iterator will keep producing values `n` as long as
the stop condition `n < stop` is satisfied.

For a negative `step`, the iterator will keep producing values `n` as long as
the stop condition `n > stop` is satisfied.

The produced range will be empty if the first value to produce already does not
meet the value constraint.


<a name="reduce" href="#reduce">#</a> <b>reduce</b>(iterable: <i>Iterable&lt;T&gt;</i>, reducer: <i>(O, T, number) =&gt; O</i>, start: <i>O</i>): <i>O</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")<br />
<a name="reduce_" href="#reduce_">#</a> <b>reduce\_</b>(iterable: <i>Iterable&lt;T&gt;</i>, reducer: <i>(T, T, number) =&gt; T</i>): <i>Maybe&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

Apply function of two arguments cumulatively to the items of sequence, from
left to right, so as to reduce the sequence to a single value.  For example:

    reduce([1, 2, 3, 4, 5], (x, y) => x + y, 0)

calculates

    (((((0+1)+2)+3)+4)+5)

The left argument, `x`, is the accumulated value and the right argument, `y`,
is the update value from the sequence.

**Difference between `reduce()` and `reduce\_()`**:  `reduce()` requires an
explicit initializer, whereas `reduce_()` will automatically use the first item
in the given iterable as the initializer.  When using `reduce()`, the
initializer value is placed before the items of the sequence in the
calculation, and serves as a default when the sequence is empty.  When using
`reduce_()`, and the given iterable is empty, then no default value can be
derived and `undefined` will be returned.


<a name="sorted" href="#sorted">#</a> <b>sorted</b>(iterable: <i>Iterable&lt;T&gt;</i>, keyFn?: <i>T =&gt; Primitive</i></i>, reverse?: <i>boolean</i>): <i>Array&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

Return a new sorted list from the items in iterable.

Has two optional arguments:

* `keyFn` specifies a function of one argument providing a primitive identity
  for each element in the iterable.  that will be used to compare.  The default
  value is to use a default identity function that is only defined for
  primitive types.

* `reverse` is a boolean value.  If `true`, then the list elements are sorted
  as if each comparison were reversed.


<a name="sum" href="#sum">#</a> <b>sum</b>(iterable: <i>Iterable&lt;number&gt;</i>): <i>number</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

Sums the items of an iterable from left to right and returns the total.  The
sum will defaults to 0 if the iterable is empty.


<a name="zip" href="#zip">#</a> <b>zip</b>(xs: <i>Iterable&lt;T1&gt;</i>, ys: <i>Iterable&lt;T2&gt;</i>): <i>Array&lt;[T1, T2]&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")<br />
<a name="zip3" href="#zip3">#</a> <b>zip3</b>(xs: <i>Iterable&lt;T1&gt;</i>, ys: <i>Iterable&lt;T2&gt;</i>, zs: <i>Iterable&lt;T3&gt;</i>): <i>Array&lt;[T1, T2, T3]&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

Non-lazy version of [izip](#izip) / [izip3](#izip3).


### Ports of itertools

* [chain](#chain)
* [compress](#compress)
* [count](#count)
* [cycle](#cycle)
* [dropwhile](#dropwhile)
* [groupby](#groupby)
* [icompress](#icompress)
* [ifilter](#ifilter)
* [imap](#imap)
* [islice](#islice)
* [izip](#izip)
* [izip3](#izip3)
* [izipLongest](#izipLongest)
* [izipMany](#izipMany)
* [permutations](#permutations)
* [repeat](#repeat)
* [takewhile](#takewhile)
* [zipLongest](#zipLongest)
* [zipMany](#zipMany)

<a name="chain" href="#chain">#</a> <b>chain</b>(...iterables: <i>Array&lt;Iterable&lt;T&gt;&gt;</i>): <i>Iterable&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Returns an iterator that returns elements from the first iterable until it is
exhausted, then proceeds to the next iterable, until all of the iterables are
exhausted.  Used for treating consecutive sequences as a single sequence.


<a name="compress" href="#compress">#</a> <b>compress</b>(iterable: <i>Iterable&lt;T&gt;</i>, selectors: <i>Iterable&lt;boolean&gt;</i>): <i>Array&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Non-lazy version of [icompress](#icompress).


<a name="count" href="#count">#</a> <b>count</b>(start: <i>number</i>, step: <i>number</i>): <i>Iterable&lt;number&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Returns an iterator that counts up values starting with number `start` (default
0), incrementing by `step`.  To decrement, use a negative step number.


<a name="cycle" href="#cycle">#</a> <b>cycle</b>(iterable: <i>Iterable&lt;T&gt;</i>): <i>Iterable&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Returns an iterator producing elements from the iterable and saving a copy of
each.  When the iterable is exhausted, return elements from the saved copy.
Repeats indefinitely.


<a name="dropwhile" href="#dropwhile">#</a> <b>dropwhile</b>(iterable: <i>Iterable&lt;T&gt;</i>, predicate: <i>T =&gt; bool</i>): <i>Iterable&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Returns an iterator that drops elements from the iterable as long as the
predicate is true; afterwards, returns every remaining element.  **Note:** the
iterator does not produce any output until the predicate first becomes false.

<a name="groupby" href="#groupby">#</a> <b>groupby</b>(iterable: <i>Iterable&lt;T&gt;</i>, keyFcn: <i>T =&gt; Primitive</i>): <i>Iterable&lt;[Primitive, Iterable&lt;T&gt;]&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Make an Iterable that returns consecutive keys and groups from the iterable.
The key is a function computing a key value for each element. If not specified,
key defaults to an identity function and returns the element unchanged.
Generally, the iterable needs to already be sorted on the same key function.

The operation of `groupby()` is similar to the `uniq` filter in Unix. It
generates a break or new group every time the value of the key function changes
(which is why it is usually necessary to have sorted the data using the same
key function). That behavior differs from `SQL`’s `GROUP BY` which aggregates
common elements regardless of their input order.

The returned group is itself an iterator that shares the underlying iterable
with `groupby()`. Because the source is shared, when the `groupby()` object is
advanced, the previous group is no longer visible. So, if that data is needed
later, it should be stored as an Array.


<a name="icompress" href="#icompress">#</a> <b>icompress</b>(iterable: <i>Iterable&lt;T&gt;</i>, selectors: <i>Iterable&lt;boolean&gt;</i>): <i>Iterable&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Returns an iterator that filters elements from data returning only those that
have a corresponding element in selectors that evaluates to `true`.  Stops when
either the data or selectors iterables has been exhausted.


<a name="ifilter" href="#ifilter">#</a> <b>ifilter</b>(iterable: <i>Iterable&lt;T&gt;</i>, predicate: <i>Predicate&lt;T&gt;</i>): <i>Iterable&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Returns an iterator that filters elements from iterable returning only those
for which the predicate is true.

<a name="imap" href="#imap">#</a> <b>imap</b>(iterable: <i>Iterable&lt;T&gt;</i>, mapper: <i>T =&gt; V</i>): <i>Iterable&lt;V&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Returns an iterator that computes the given mapper function using arguments
from each of the iterables.


<a name="islice" href="#islice">#</a> <b>islice</b>(iterable: <i>Iterable&lt;T&gt;</i>[, start: <i>number</i>], stop: <i>number</i>[, step: <i>number</i>]): <i>Iterable&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Returns an iterator that returns selected elements from the iterable.  If
`start` is non-zero, then elements from the iterable are skipped until start is
reached.  Then, elements are returned by making steps of `step` (defaults to
1).  If set to higher than 1, items will be skipped.  If `stop` is provided,
then iteration continues until the iterator reached that index, otherwise, the
iterable will be fully exhausted.  `islice()` does not support negative values
for `start`, `stop`, or `step`.


<a name="izip" href="#izip">#</a> <b>izip</b>(xs: <i>Iterable&lt;T1&gt;</i>, ys: <i>Iterable&lt;T2&gt;</i>): <i>Iterable&lt;[T1, T2]&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")<br />
<a name="izip3" href="#izip3">#</a> <b>izip3</b>(xs: <i>Iterable&lt;T1&gt;</i>, ys: <i>Iterable&lt;T2&gt;</i>, zs: <i>Iterable&lt;T3&gt;</i>): <i>Iterable&lt;[T1, T2, T3]&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Returns an iterator that aggregates elements from each of the iterables.  Used
for lock-step iteration over several iterables at a time.  When iterating over
two iterables, use `izip2`.  When iterating over three iterables, use `izip3`,
etc.  `izip` is an alias for `izip2`.


<a name="izipLongest" href="izipLongest">#</a> <b>izipLongest</b>(xs: <i>Iterable&lt;T1&gt;</i>, ys: <i>Iterable&lt;T2&gt;</i>, filler?: <i>D</i>): <i>Iterable&lt;[T1 | D, T2 | D]&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")<br />
<a name="izipLongest3" href="izipLongest3">#</a> <b>izipLongest3</b>(xs: <i>Iterable&lt;T1&gt;</i>, ys: <i>Iterable&lt;T2&gt;</i>, zs: <i>Iterable&lt;T3&gt;</i>, filler?: <i>D</i>): <i>Iterable&lt;[T1 | D, T2 | D, T3 | D]&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Returns an iterator that aggregates elements from each of the iterables.  If the
iterables are of uneven length, missing values are filled-in with fillvalue.
Iteration continues until the longest iterable is exhausted.


<a name="izipMany" href="#izipMany">#</a> <b>izipMany</b>(...iters: <i>Array&lt;Iterable&lt;T&gt;&gt;</i>): <i>Iterable&lt;Array&lt;T&gt;&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Like the other izips (`izip`, `izip3`, etc), but generalized to take an
unlimited amount of input iterables.  Think `izip(*iterables)` in Python.

**Note:** Due to Flow type system limitations, you can only "generially" zip
iterables with homogeneous types, so you cannot mix types like `<A, B>` like
you can with `izip`().


<a name="permutations" href="#permutations">#</a> <b>permutations</b>(iterable: <i>Iterable&lt;T&gt;</i>, r: number = undefined): <i>Iterable&lt;Array<T>&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Return successive `r`-length permutations of elements in the iterable.

If `r` is not specified, then `r` defaults to the length of the iterable and
all possible full-length permutations are generated.

Permutations are emitted in lexicographic sort order.  So, if the input
iterable is sorted, the permutation tuples will be produced in sorted order.

Elements are treated as unique based on their position, not on their value.  So
if the input elements are unique, there will be no repeat values in each
permutation.


<a name="repeat" href="#repeat">#</a> <b>repeat</b>(thing: <i>T</i>, times: number = undefined): <i>Iterable&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Returns an iterator that produces values over and over again.  Runs
indefinitely unless the times argument is specified.


<a name="takewhile" href="#takewhile">#</a> <b>takewhile</b>(iterable: <i>Iterable&lt;T&gt;</i>, predicate: <i>T =&gt; bool</i>): <i>Iterable&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Returns an iterator that produces elements from the iterable as long as the
predicate is true.

<a name="zipLongest" href="zipLongest">#</a> <b>zipLongest</b>(xs: <i>Iterable&lt;T1&gt;</i>, ys: <i>Iterable&lt;T2&gt;</i>, filler?: <i>D</i>): <i>Array&lt;[T1 | D, T2 | D]&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")<br />
<a name="zipLongest3" href="zipLongest3">#</a> <b>zipLongest3</b>(xs: <i>Iterable&lt;T1&gt;</i>, ys: <i>Iterable&lt;T2&gt;</i>, zs: <i>Iterable&lt;T3&gt;</i>, filler?: <i>D</i>): <i>Array&lt;[T1 | D, T2 | D, T3 | D]&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Non-lazy version of [izipLongest](#izipLongest) and friends.

<a name="zipMany" href="#zipMany">#</a> <b>zipMany</b>(...iters: <i>Array&lt;Iterable&lt;T&gt;&gt;</i>): <i>Array&lt;Array&lt;T&gt;&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Non-lazy version of [izipMany](#izipMany).


### Ports of more-itertools

* [chunked](#chunked)
* [flatten](#flatten)
* [intersperse](#intersperse)
* [itake](#itake)
* [pairwise](#pairwise)
* [partition](#partition)
* [roundrobin](#roundrobin)
* [heads](#heads)
* [take](#take)
* [uniqueEverseen](#uniqueEverseen)
* [uniqueJustseen](#uniqueJustseen)

<a name="chunked" href="#chunked">#</a> <b>chunked</b>(iterable: <i>Iterable&lt;T&gt;</i>, size: <i>number</i>): <i>Iterable&lt;Array&lt;T&gt;&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")

Break iterable into lists of length `size`:

    >>> [...chunked([1, 2, 3, 4, 5, 6], 3)]
    [[1, 2, 3], [4, 5, 6]]

If the length of iterable is not evenly divisible by `size`, the last returned
list will be shorter:

    >>> [...chunked([1, 2, 3, 4, 5, 6, 7, 8], 3)]
    [[1, 2, 3], [4, 5, 6], [7, 8]]


<a name="flatten" href="#flatten">#</a> <b>flatten</b>(iterableOfIterables: <i>Iterable&lt;Iterable&lt;T&gt;&gt;</i>): <i>Iterable&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")

Return an iterator flattening one level of nesting in a list of lists:

    >>> [...flatten([[0, 1], [2, 3]])]
    [0, 1, 2, 3]


<a name="intersperse" href="#intersperse">#</a> <b>intersperse</b>(value: T, iterable: <i>Iterable&lt;T&gt;</i>): <i>Iterable&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")

Intersperse filler element `value` among the items in `iterable`.

    >>> [...intersperse(-1, range(1, 5))]
    [1, -1, 2, -1, 3, -1, 4]


<a name="itake" href="#itake">#</a> <b>itake</b>(n: <i>number</i>, iterable: <i>Iterable&lt;T&gt;</i>): <i>Iterable&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")

Returns an iterable containing only the first `n` elements of the given
iterable.


<a name="pairwise" href="#pairwise">#</a> <b>pairwise</b>(iterable: <i>Iterable&lt;T&gt;</i>): <i>Iterable&lt;[T, T]&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")

Returns an iterator of paired items, overlapping, from the original.  When the
input iterable has a finite number of items `n`, the outputted iterable will
have `n - 1` items.

    >>> pairwise([8, 2, 0, 7])
    [(8, 2), (2, 0), (0, 7)]


<a name="partition" href="#partition">#</a> <b>partition</b>(iterable: <i>Iterable&lt;T&gt;</i>, predicate: <i>Predicate&lt;T&gt;</i>): <i>[Array&lt;T&gt;, Array&lt;T&gt;]</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")

Returns a 2-tuple of arrays.  Splits the elements in the input iterable into
either of the two arrays.  Will fully exhaust the input iterable.  The first
array contains all items that match the predicate, the second the rest:

    >>> const isOdd = x => x % 2 !== 0;
    >>> const iterable = range(10);
    >>> const [odds, evens] = partition(iterable, isOdd);
    >>> odds
    [1, 3, 5, 7, 9]
    >>> evens
    [0, 2, 4, 6, 8]


<a name="roundrobin" href="#roundrobin">#</a> <b>roundrobin</b>(...iterables: <i>Array&lt;Iterable&lt;T&gt;&gt;</i>): <i>Iterable&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")

Yields the next item from each iterable in turn, alternating between them.
Continues until all items are exhausted.

    >>> [...roundrobin([1, 2, 3], [4], [5, 6, 7, 8])]
    [1, 4, 5, 2, 6, 3, 7, 8]


<a name="heads" href="#heads">#</a> <b>heads</b>(...iterables: <i>Array&lt;Iterable&lt;T&gt;&gt;</i>): <i>Iterable&lt;Array&lt;T&gt;&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")

Like `roundrobin()`, but will group the output per "round".

    >>> [...heads([1, 2, 3], [4], [5, 6, 7, 8])]
    [[1, 4, 5], [2, 6], [3, 7], [8]]


<a name="take" href="#take">#</a> <b>take</b>(n: <i>number</i>, iterable: <i>Iterable&lt;T&gt;</i>): <i>Array&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")

Non-lazy version of [itake](#itake).


<a name="uniqueEverseen" href="#uniqueEverseen">#</a> <b>uniqueEverseen</b>(iterable: <i>Iterable&lt;T&gt;</i>, keyFn?: <i>T =&gt; Primitive</i></i>): <i>Iterable&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")

Yield unique elements, preserving order.

    >>> [...uniqueEverseen('AAAABBBCCDAABBB')]
    ['A', 'B', 'C', 'D']
    >>> [...uniqueEverseen('AbBCcAB', s => s.toLowerCase())]
    ['A', 'b', 'C']


<a name="uniqueJustseen" href="#uniqueJustseen">#</a> <b>uniqueJustseen</b>(iterable: <i>Iterable&lt;T&gt;</i>, keyFn?: <i>T =&gt; Primitive</i></i>): <i>Iterable&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")

Yields elements in order, ignoring serial duplicates.

    >>> [...uniqueJustseen('AAAABBBCCDAABBB')]
    ['A', 'B', 'C', 'D', 'A', 'B']
    >>> [...uniqueJustseen('AbBCcAB', s => s.toLowerCase())]
    ['A', 'b', 'C', 'A', 'B']


### Additions

* [compact](#compact)
* [compactObject](#compactObject)
* [first](#first)
* [flatmap](#flatmap)
* [icompact](#icompact)

<a name="compact" href="#compact">#</a> <b>compact</b>(iterable: <i>Iterable&lt;T&gt;</i>): <i>Array&lt;$NonMaybeType&lt;T&gt;&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/custom.js "Source")

Non-lazy version of [icompact](#icompact).


<a name="compactObject" href="#compactObject">#</a> <b>compactObject</b><i>&lt;O: { [key: string]: * }&gt;</i>(obj: <i>O</i>): <i>$ObjMap&lt;O, &lt;T&gt;(T) =&gt; $NonMaybeType&lt;T&gt;&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/custom.js "Source")

> **NOTE:** 🙀 OMG, that type signature! **Don't panic.** Just look at the example :)

Removes all undefined values from the given object.  Returns a new object.

    >>> compactObject({ a: 1, b: undefined, c: 0, d: null })
    { a: 1, c: 0, d: null }


<a name="first" href="#first">#</a> <b>first</b>(iterable: <i>Iterable&lt;T&gt;</i>, keyFn?: <i>Predicate&lt;T&gt;</i>): <i>Maybe&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/custom.js "Source")

Returns the first item in the iterable for which the predicate holds, if any.
If no such item exists, `undefined` is returned.  The default predicate is any
defined value.


<a name="flatmap" href="#flatmap">#</a> <b>flatmap</b>(iterable: <i>Iterable&lt;T&gt;</i>, mapper: <i>T =&gt; Iterable&lt;S&gt;</i>): <i>Iterable&lt;S&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/custom.js "Source")

Returns 0 or more values for every value in the given iterable.  Technically,
it's just calling map(), followed by flatten(), but it's a very useful
operation if you want to map over a structure, but not have a 1:1 input-output
mapping.  Instead, if you want to potentially return 0 or more values per input
element, use flatmap():

For example, to return all numbers `n` in the input iterable `n` times:

    >>> const repeatN = n => repeat(n, n);
    >>> [...flatmap([0, 1, 2, 3, 4], repeatN)]
    [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]  // note: no 0


<a name="icompact" href="#icompact">#</a> <b>icompact</b>(iterable: <i>Iterable&lt;T&gt;</i>): <i>Iterable&lt;$NonMaybeType&lt;T&gt;&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/custom.js "Source")

Returns an iterable, filtering out any `undefined` values from the input
iterable.  This function is useful to convert a list of `Maybe<T>`'s to a list
of `T`'s, discarding all the undefined values:

    >>> compact([1, 2, undefined, 3])
    [1, 2, 3]

