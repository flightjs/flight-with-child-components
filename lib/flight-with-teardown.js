/**
 * withTeardown is a helper for coupling components, to make sure that a component and its children
 * are torn down together.
 *
 * A component that intends to initialize child components should mix in withTeardown and
 * attach the children with a `teardownOn` attribute. This can be any event, but the withTeardown
 * mixin adds a globally unique event name to the parent (this.childTeardownEvent) for this use.
 *
 * The child needs only to mix in withTeardown – this sets up listeners for the teardownOn event,
 * if it's passed, and tears down the child when this event is fired.
 *
 * This construct supports trees of components becuase a child's childTeardownEvent will be
 * fired before the child is torn down, and that will teardown any of the child's children.
 *
 * Example usage:
 *
 *  In the parent component:

        var withTeardown = require('path/to/with/teardown');
        var ChildComponent = require('some/child');
        var AnotherChildComponent = require('another/child');

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

 *  In the child component:

        var withTeardown = require('path/to/with/teardown');
        return defineComponent(childComponent, withTeardown);

 */
define(function () {
    'use strict';

    var teardownEventCount = 0;

    function withTeardown() {
        /* jshint validthis: true */

        /**
         * Give every component that uses this mixin a new, unique childTeardownEvent
         */
        this.before('initialize', function () {
            this.childTeardownEvent = this.childTeardownEvent || withTeardown.nextTeardownEvent();
        });

        /**
         * Before this component's teardown, tell all the children to teardown
         */
        this.before('teardown', function () {
            this.trigger(document, this.childTeardownEvent);
        });

        /**
         * If we were given a teardownOn event then listen out for it to teardown.
         */
        this.after('initialize', function () {
            if (this.attr.teardownOn) {
                if (this.attr.teardownOn === this.childTeardownEvent) {
                    throw new Error('Component initialized to listen for its own teardown event.');
                }
                this.on(document, this.attr.teardownOn, this.teardown);
            }
        });

        /**
         * Utility method for attaching a component with teardownOn.
         *
         * Takes Component (with attachTo method) plus destination and attrs arguments, which should
         * be the same as in a normal attachTo call.
         */
        this.attachChild = function (Component, destination, attrs) {
            attrs = attrs || {};
            if (!attrs.teardownOn) {
                attrs.teardownOn = this.childTeardownEvent;
            }
            Component
                .mixin(withTeardown)
                .attachTo(destination, attrs);
        };

    }

    withTeardown.nextTeardownEvent = function () {
        teardownEventCount += 1;
        return '_teardownEvent' + teardownEventCount;
    };

    return withTeardown;
});
