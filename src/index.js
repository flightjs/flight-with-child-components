/**
 * withChildComponents
 *
 * See the README.md for up-to-date docs.
 */

var teardownEventCount = 0;

/**
 * attacher takes a function that generates an
 */
function attacher(eventNameGenerator) {
    if (typeof eventNameGenerator !== 'function') {
        eventNameGenerator = withChildComponents.nextTeardownEvent;
    }

    return function attach(Component, destination, attrs = {}) {
        if (!attrs.teardownOn) {
            attrs.teardownOn = eventNameGenerator.call(this);
        }
        var mixins = Component.prototype.mixedIn || [];
        var isMixedIn = (mixins.indexOf(withBoundLifecycle) > -1);
        var ComponentWithMixin = (
            isMixedIn
                ? Component
                : Component.mixin(withBoundLifecycle)
        );
        ComponentWithMixin.attachTo(destination, attrs);

        return {
            teardownEvent: attrs.teardownOn
        };
    };
}

function withBoundLifecycle() {
    // Use deprecated defaultAttrs() only if necessary
    var defineDefaultAttributes = (this.attrDef ? this.attributes : this.defaultAttrs);
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
    this.attachChild = attacher(function () {
        return this.childTeardownEvent;
    });
}

withChildComponents.nextTeardownEvent = function () {
    teardownEventCount += 1;
    return '_teardownEvent' + teardownEventCount;
};

withChildComponents.withBoundLifecycle = withBoundLifecycle;

/**
 * `attach` helps non-Flight code attach components and tear them down.
 *
 * Example usage:
 *
 *      const { teardownEvent } = attach(Component, $someNode, { ... });
 *
 *      ... sometime later ...
 *
 *      $(document).trigger(teardownEvent);
 */
withChildComponents.attach = attacher(function () {
    // This is called in this function, rather than passed directly, so that the
    // generator can be tested
    return withChildComponents.nextTeardownEvent();
});

module.exports = withChildComponents;
