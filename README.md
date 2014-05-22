# flight-with-teardown

A [Flight](https://github.com/flightjs/flight) mixin for nesting components by coupling their life-cycles, making sure that a component and its children are torn down together.

A component that intends to initialize child components should mix in `withTeardown` and
attach the children with a `teardownOn` attribute. This can be any event, but the `withTeardown`
mixin adds a unique event name to the parent (`this.childTeardownEvent`) for this use.

The child needs only to mix in `withTeardown` – this sets up listeners for the `teardownOn` event,
if it's passed, and tears-down the child when this event is fired.

This construct supports trees of components becuase a child's `childTeardownEvent` will be
fired before the child is torn down, and that will teardown any of the child's children in a cascade.

## Installation

```bash
bower install --save flight-with-teardown
```

## Example

In the parent component, mixin `withTeardown` into the parent and its child dependencies.

```js
var withTeardown = require('path/to/with/teardown');
var ChildComponent = require('some/child').mixin(withTeardown);
var AnotherChildComponent = require('another/child').mixin(withTeardown);

return defineComponent(parentComponent, withTeardown);

// ...

    this.after('initialize', function () {

        ChildComponent.attachTo(this.select('aChild'), {
            teardownOn: this.childTeardownEvent
        });

        AnotherChildComponent.attachTo(this.select('anotherChild'), {
            teardownOn: this.childTeardownEvent
        });

        // To avoid having to supply this.childTeardownEvent, use attachChild
        this.attachChild(YetAnotherChildComponent, this.select('yetAnotherChild'));

    });

// ...

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
