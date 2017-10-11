[![npm](https://img.shields.io/npm/v/itertools.svg)](https://www.npmjs.com/package/itertools)
[![Build Status](https://img.shields.io/travis/nvie/itertools.js/master.svg)](https://travis-ci.org/nvie/itertools.js)
[![Coverage Status](https://img.shields.io/coveralls/nvie/itertools.js/master.svg)](https://coveralls.io/github/nvie/itertools.js?branch=master)

A JavaScript port of Python's awesome
[itertools](https://docs.python.org/library/itertools.html) standard library.

Usage example:

```javascript
import { izip, cycle } from 'itertools';

const xs = [1, 2, 3, 4];
const ys = ['hello', 'there'];
for (const [x, y] of izip(xs, cycle(ys))) {
    console.log(x, y);
}

// 1 'hello'
// 2 'there'
// 3 'hello'
// 4 'there'
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

<a name="filter" href="#filter">#</a> <b>filter</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

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


<a name="range" href="#range">#</a> <b>range</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

...


<a name="reduce" href="#reduce">#</a> <b>reduce</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

...


<a name="sorted" href="#sorted">#</a> <b>sorted</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

...


<a name="sum" href="#sum">#</a> <b>sum</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

...


<a name="zip" href="#zip">#</a> <b>zip</b>(xs: <i>Iterable&lt;T1&gt;</i>, ys: <i>Iterable&lt;T2&gt;</i>): <i>Array&lt;[T1, T2]&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")<br />
<a name="zip3" href="#zip3">#</a> <b>zip3</b>(xs: <i>Iterable&lt;T1&gt;</i>, ys: <i>Iterable&lt;T2&gt;</i>, zs: <i>Iterable&lt;T3&gt;</i>): <i>Array&lt;[T1, T2, T3]&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

Non-lazy version of [izip](#izip) / [izip3](#izip3).


### Ports of itertools

* [chain](#chain)
* [compress](#compress)
* [count](#count)
* [cycle](#cycle)
* [dropwhile](#dropwhile)
* [icompress](#icompress)
* [ifilter](#ifilter)
* [imap](#imap)
* [islice](#islice)
* [izip3](#izip3)
* [izipAll](#izipAll)
* [izipLongest](#izipLongest)
* [izip](#izip)
* [permutations](#permutations)
* [takewhile](#takewhile)
* [zipAll](#zipAll)
* [zipLongest](#zipLongest)

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
...

Returns an iterator that aggregates elements from each of the iterables.  Used
for lock-step iteration over several iterables at a time.  When iterating over
two iterables, use `izip2`.  When iterating over three iterables, use `izip3`,
etc.  `izip` is an alias for `izip2`.


<a name="izipAll" href="#izipAll">#</a> <b>izipAll</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")
...

<a name="izipLongest" href="#izipLongest">#</a> <b>izipLongest</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")
...


<a name="permutations" href="#permutations">#</a> <b>permutations</b>(iterable: <i>Iterable&lt;T&gt;</i>, r: number = undefined): <i>Iterable&lt;Array<T>&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Return successive `r`-length permutations of elements in the iterable.

If `r` is not specified, then `r` defaults to the length of the iterable and
all possible full-length permutations are generated.

Permutations are emitted in lexicographic sort order.  So, if the input
iterable is sorted, the permutation tuples will be produced in sorted order.

Elements are treated as unique based on their position, not on their value.  So
if the input elements are unique, there will be no repeat values in each
permutation.


<a name="takewhile" href="#takewhile">#</a> <b>takewhile</b>(iterable: <i>Iterable&lt;T&gt;</i>, predicate: <i>T =&gt; bool</i>): <i>Iterable&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")

Returns an iterator that produces elements from the iterable as long as the
predicate is true.

<a name="zipAll" href="zipAll">#</a> <b>zipAll</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")
...

<a name="zipLongest" href="zipLongest">#</a> <b>zipLongest</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")
...


### Ports of more-itertools

* [chunked](#chunked)
* [first](#first)
* [flatten](#flatten)
* [itake](#itake)
* [pairwise](#pairwise)
* [partition](#partition)
* [take](#take)
* [uniqueEverseen](#uniqueEverseen)
* [uniqueJustseen](#uniqueJustseen)

<a name="chunked" href="#chunked">#</a> <b>chunked</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")
...

<a name="first" href="#first">#</a> <b>first</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")
...

<a name="flatten" href="#flatten">#</a> <b>flatten</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")
...


<a name="itake" href="#itake">#</a> <b>itake</b>(n: <i>number</i>, iterable: <i>Iterable&lt;T&gt;</i>): <i>Iterable&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")

Returns an iterable containing only the first `n` elements of the given
iterable.


<a name="pairwise" href="#pairwise">#</a> <b>pairwise</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")
...


<a name="partition" href="#partition">#</a> <b>partition</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")
...


<a name="take" href="#take">#</a> <b>take</b>(n: <i>number</i>, iterable: <i>Iterable&lt;T&gt;</i>): <i>Array&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")

Non-lazy version of [itake](#itake).


<a name="uniqueEverseen" href="#uniqueEverseen">#</a> <b>uniqueEverseen</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")
...

<a name="uniqueJustseen" href="#uniqueJustseen">#</a> <b>uniqueJustseen</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")
...


### Additions

* [compact](#compact)
* [compactObject](#compactObject)
* [flatmap](#flatmap)
* [icompact](#icompact)

<a name="compact" href="#compact">#</a> <b>compact</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/custom.js "Source")
...

<a name="compactObject" href="#compactObject">#</a> <b>compactObject</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/custom.js "Source")
...

<a name="flatmap" href="#flatmap">#</a> <b>flatmap</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/custom.js "Source")
...

<a name="icompact" href="#icompact">#</a> <b>icompact</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/custom.js "Source")
...
