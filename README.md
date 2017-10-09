[![Build Status](https://travis-ci.org/nvie/itertools.js.svg?branch=master)](https://travis-ci.org/nvie/itertools.js)

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
```

Will log out:

    1, 'hello'
    2, 'there'
    3, 'hello'
    4, 'there'


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


<a name="zip" href="#zip">#</a> <b>zip</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

...


<a name="zip3" href="#zip3">#</a> <b>zip3</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

...


### Ports of itertools

* [chain](#chain)
* compress
* cycle
* icompress
* ifilter
* imap
* izip
* izip3
* izipAll
* izipLongest
* takewhile
* zipAll
* zipLongest

<a name="chain" href="#chain">#</a> <b>chain</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/itertools.js "Source")
...


### Ports of more-itertools

* [chunked](#chunked)
* first
* flatten
* itake
* pairwise
* partition
* take
* uniqueEverseen
* uniqueJustseen

<a name="chunked" href="#chunked">#</a> <b>chunked</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/more-itertools.js "Source")
...


### Additions

* [compact](#compact)
* compactObject
* flatmap
* icompact

<a name="compact" href="#compact">#</a> <b>compact</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/custom.js "Source")

...
