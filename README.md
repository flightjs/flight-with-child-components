# flight-with-child-components

[![Build Status](https://travis-ci.org/flightjs/flight-with-child-components.png?branch=master)](http://travis-ci.org/flightjs/flight-with-child-components)

A [Flight](https://github.com/flightjs/flight) mixin for nesting components by coupling their life-cycles, making sure that a component and its children are torn down together.

A component that intends to initialize child components should mix in `withChildComponents` and attach the children using `this.attachChild`.

The child will be passed an even to listen out for – when it's triggered, the child will teardown. `withChildComponents` mixin adds a unique event name to the parent (`this.childTeardownEvent`) for this use, but you can manually specify a `teardownOn` event name in the child's attrs.

This construct supports trees of components because, if the child also mixes in `withChildComponents`, it's `childTeardownEvent` will be fired before it is torn down, and that will teardown any further children in a cascade.

## Installation

```bash
bower install --save flight-with-child-components
```

## Example

In the parent component, mixin `withChildComponents` into the parent.

```js
var withChildComponents = require('path/to/the/mixin');
var ChildComponent = require('some/child');
var AnotherChildComponent = require('some/other/child');

return defineComponent(parentComponent, withChildComponents);

function parentComponent() {

  this.after('initialize', function () {
    // this.attachChild does all the work needed to support nesting
    this.attachChild(ChildComponent, this.select('someChild'));

    // it supports the same API as 'attachTo'
    this.attachChild(AnotherChildComponent, '.another-child', {
      teardownOn: 'someEvent'
    });
  });

}
```

## Development

Install the Node.js and client-side dependencies by running the following
commands in the repo's root directory.

```bash
npm install
```

To continuously run the tests in Chrome during development, just run:

```bash
npm run watch-test
```

## Contributing to this project

Anyone and everyone is welcome to contribute. Please take a moment to
review the [guidelines for contributing](CONTRIBUTING.md).

* [Bug reports](CONTRIBUTING.md#bugs)
* [Feature requests](CONTRIBUTING.md#features)
* [Pull requests](CONTRIBUTING.md#pull-requests)
