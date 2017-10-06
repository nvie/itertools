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
* enumerate
* [iter](#iter)
* map
* max
* min
* range
* reduce
* sorted
* sum
* zip

<a name="all" href="#all">#</a> <b>all</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")
<a name="any" href="#any">#</a> <b>any</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")
<a name="iter" href="#iter">#</a> <b>iter</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/builtins.js "Source")

...


### Ports of itertools

* [chain](#chain)
* compress
* contains
* cycle
* icompress
* ifilter
* imap
* izip
* izip3
* izipAll
* izipLongest
* takewhile
* zip3
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
* identity
* primitiveIdentity

<a name="compact" href="#compact">#</a> <b>compact</b>(): <i>TODO</i> [&lt;&gt;](https://github.com/nvie/itertools.js/blob/master/src/custom.js "Source")

...
