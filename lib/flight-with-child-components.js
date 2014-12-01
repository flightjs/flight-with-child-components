/**
 * withChildComponents
 *
 * See the README.md for up-to-date docs.
 */
define(function () {
    'use strict';

    var teardownEventCount = 0;

    function withBoundLifecycle() {
        // Use deprecated defaultAttrs() only if necessary
        var defineDefaultAttributes = this.attrDef? this.attributes: this.defaultAttrs;
        defineDefaultAttributes.call(this, {
            teardownOn: ''
        });

        /**
         * If we were given a teardownOn event then listen out for it to teardown.
         */
        this.after('initialize', function () {
            if (this.attr.teardownOn) {
                if (this.attr.teardownOn === this.childTeardownEvent) {
                    throw new Error('Component initialized to listen for its own teardown event.');
                }
                this.on(document, this.attr.teardownOn, function () {
                    this.teardown();
                });
            }
        });
    }

    function withChildComponents() {
        /**
         * Give every component that uses this mixin a new, unique childTeardownEvent
         */
        this.before('initialize', function () {
            this.childTeardownEvent =
                this.childTeardownEvent ||
                withChildComponents.nextTeardownEvent();
        });

        /**
         * Before this component's teardown, tell all the children to teardown
         */
        this.before('teardown', function () {
            this.trigger(this.childTeardownEvent);
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
            var mixins = Component.prototype.mixedIn || [];
            var isMixedIn = (mixins.indexOf(withBoundLifecycle) > -1) ? true : false;
            (isMixedIn ?
                Component :
                Component.mixin(withBoundLifecycle)).attachTo(destination, attrs);
        };

    }

    withChildComponents.nextTeardownEvent = function () {
        teardownEventCount += 1;
        return '_teardownEvent' + teardownEventCount;
    };

    // Export the child lifecycle mixin
    withChildComponents.withBoundLifecycle = withBoundLifecycle;

    return withChildComponents;
});
