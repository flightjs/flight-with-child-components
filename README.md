# flight-with-child-components

[![Build Status](https://travis-ci.org/flightjs/flight-with-child-components.png?branch=master)](http://travis-ci.org/flightjs/flight-with-child-components)

A [Flight](https://github.com/flightjs/flight) mixin for nesting components by coupling their life-cycles, making sure that a component and its children are torn down together.

A component that intends to initialize child components should mix in `withChildComponents` and attach the children using `this.attachChild`.

The child will be passed an even to listen out for – when it's triggered, the child will teardown. `withChildComponents` mixin adds a unique event name to the parent (`this.childTeardownEvent`) for this use, but you can manually specify a `teardownOn` event name in the child's attrs.

This construct supports trees of components because, if the child also mixes in `withChildComponents`, it's `childTeardownEvent` will be fired before it is torn down, and that will teardown any further children in a cascade.

## Installation

```bash
npm install --save flight-with-child-components
```

## Use

In the parent component, mixin `withChildComponents` into the parent.

```js
defineComponent(Component, withChildComponents);
```

This will add a generated `this.childTeardownEvent` property to the component — like `_teardownEvent7` — which will then be used to coordinate teardown with any "child" components.

You don't need to use the `childTeardownEvent` manually: instead, use the `this.attachChild` method:

```js
this.attachChild(ChildComponent, this.select('someChild'));
```

This will do some magic to make sure that the `ChildComponent` instance does teardown with (actually, just before) the parent.

Here's a full example:

```js
var withChildComponents = require('fight-with-child-components');
var ChildComponent = require('some/child');
var AnotherChildComponent = require('some/other/child');

return defineComponent(parentComponent, withChildComponents);

function parentComponent() {

  this.after('initialize', function () {
    // this.attachChild does all the work needed to support nesting
    this.attachChild(ChildComponent, this.select('someChild'));

    // it supports the same API as 'attachTo'
    this.attachChild(AnotherChildComponent, '.another-child', {
      someProperty: true,
      // You can manually specify a teardown event
      teardownOn: 'someTeardownEvent'
    });


    setTimeout(() => {
      this.trigger('someTeardownEvent');
    }, 1000);
  });
}
```

As in the above example, you can specify a custom teardown event:

```js
this.attachChild(AnotherChildComponent, '.another-child', {
  teardownOn: 'someTeardownEvent'
});
```

This allows you to *manually* cause the teardown of that child.

Importantly, this **overrides** the parent-child teardown behaviour. If you want to keep it, you must additionally supply the `childTeardownEvent`:

```js
this.attachChild(AnotherChildComponent, '.another-child', {
  teardownOn: `someTeardownEvent ${this.childTeardownEvent}`
});
```

### Non-Flight code

`withChildComponents` provides a utility to help you coordinate Flight-component teardown from non-Flight code.

First, import the `attach` method:

```js
const { attach } = require('flight-with-child-components');
```

You can use `attach` to attach Flight components like you would with `attachTo`, but you *also* can grab the resulting teardown event from the returned object:

```js
const { teardownEvent } = attach(Component, '.some-node');
```

You can then manually tear the component down using a jQuery event.

```js
$(document).trigger(teardownEvent);
```

Like with `attachChild`, you can supply a custom `teardownOn` event name:

```js
const { teardownEvent } = attach(Component, '.some-node', {
  teardownOn: 'someTeardownEvent'
});
```

In this example, `teardownEvent` will be `someTeardownEvent`.

## Development

To develop this module, clone the repository and run:

```
$ yarn && yarn test
```

If the tests pass, you have a working environment. You shouldn't need any external dependencies.

## Contributing to this project

Anyone and everyone is welcome to contribute. Please take a moment to
review the [guidelines for contributing](CONTRIBUTING.md).

* [Bug reports](CONTRIBUTING.md#bugs)
* [Feature requests](CONTRIBUTING.md#features)
* [Pull requests](CONTRIBUTING.md#pull-requests)
