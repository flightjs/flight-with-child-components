import { component as defineComponent } from 'flight';
import withChildComponents from '.';

describe('withChildComponents', function () {
    var Component;
    var ChildComponent;
    var ComponentWithoutMixin;
    var FakeComponent;

    // Initialize the component and attach it to the DOM
    beforeEach(function () {
        window.outerDiv = document.createElement('div');
        window.innerDiv = document.createElement('div');
        window.otherInnerDiv = document.createElement('div');
        window.outerDiv.appendChild(window.innerDiv);
        window.outerDiv.appendChild(window.otherInnerDiv);
        window.outerDiv.id = 'outerDiv';
        window.innerDiv.id = 'innerDiv';
        window.otherInnerDiv.id = 'otherInnerDiv';
        document.body.appendChild(window.outerDiv);

        window.childDidTeardown = false;
        window.otherChildDidTeardown = false;

        Component = defineComponent(function parentComponent() {}).mixin(withChildComponents);
        ChildComponent = defineComponent(function childComponent() {
            this.defaultAttrs({
                teardownAttr: ''
            });
            this.before('teardown', function () {
                window[this.attr.teardownAttr] = true;
            });
        });
        ComponentWithoutMixin = defineComponent(function componentWithoutMixin() {});
        FakeComponent = function () {};
        FakeComponent.prototype = {
            mixedIn: []
        };
        FakeComponent.mixin = function () {
            return FakeComponent;
        };
        FakeComponent.attachTo = jasmine.createSpy();
    });

    afterEach(function () {
        document.body.removeChild(window.outerDiv);
        window.outerDiv = null;
        window.innerDiv = null;
        window.otherInnerDiv = null;
        Component.teardownAll();
        ChildComponent.teardownAll();
        ComponentWithoutMixin.teardownAll();
    });

    it('should get a childTeardownEvent', function () {
        var component = new Component();
        component.initialize(window.outerDiv);
        expect(component.childTeardownEvent).toBeDefined();
    });

    it('should teardown the child when torn down', function () {
        var parent = new Component();
        parent.initialize(window.outerDiv);
        parent.attachChild(ChildComponent, window.innerDiv, {
            teardownAttr: 'childDidTeardown'
        });
        parent.teardown();
        expect(window.childDidTeardown).toBe(true);
    });

    it('should teardown the child when torn down if component uses new attributes', function () {
        var parent = new Component();
        parent.initialize(window.outerDiv);
        var ChildComponentWithNewAttributes = defineComponent(
            function childComponentWithNewAttributes() {
                // New method of attribute definition
                this.attributes({
                    teardownAttr: ''
                });
                this.before('teardown', function () {
                    window[this.attr.teardownAttr] = true;
                });
            }
        );
        parent.attachChild(ChildComponentWithNewAttributes, window.innerDiv, {
            teardownAttr: 'childDidTeardown'
        });
        parent.teardown();
        expect(window.childDidTeardown).toBe(true);
    });

    it('should teardown all children when torn down', function () {
        var parent = new Component();
        parent.initialize(window.outerDiv);
        parent.attachChild(ChildComponent, window.innerDiv, {
            teardownAttr: 'childDidTeardown'
        });
        parent.attachChild(ChildComponent, document, {
            teardownAttr: 'otherChildDidTeardown'
        });
        parent.teardown();
        expect(window.childDidTeardown).toBe(true);
        expect(window.otherChildDidTeardown).toBe(true);
    });

    describe('attachChild', function () {
        it('should attach child with teardownOn', function () {
            var component = new Component();
            component.initialize(window.outerDiv);
            component.attachChild(FakeComponent, '.my-selector', { test: true });
            expect(FakeComponent.attachTo).toHaveBeenCalledWith('.my-selector', {
                test: true,
                teardownOn: component.childTeardownEvent
            });
        });
        it('should return an object with the child teardown event', function () {
            var component = new Component();
            component.initialize(window.outerDiv);
            var result = component.attachChild(FakeComponent, '.my-selector', { test: true });
            expect(result.teardownEvent).toEqual(component.childTeardownEvent);
        });
        it('should mix withBoundLifecycle into child', function () {
            var component = new Component();
            component.initialize(window.outerDiv);
            var spy = spyOn(ComponentWithoutMixin, 'mixin').and.callThrough();
            component.attachChild(ComponentWithoutMixin, '.my-selector', {});
            expect(spy).toHaveBeenCalledWith(withChildComponents.withBoundLifecycle);
        });
        it('should not mix withBoundLifecycle twice', function () {
            var component = new Component();
            component.initialize(window.outerDiv);
            var ComponentWithBoundLifecyleMixin = ComponentWithoutMixin.mixin(
                withChildComponents.withBoundLifecycle
            );
            var spy = spyOn(ComponentWithBoundLifecyleMixin, 'mixin').and.callThrough();
            component.attachChild(ComponentWithBoundLifecyleMixin, '.my-selector', {});
            expect(spy).not.toHaveBeenCalledWith(withChildComponents.withBoundLifecycle);
        });
        it('should not overwrite a passed teardownOn event', function () {
            var component = new Component();
            component.initialize(window.outerDiv);
            component.attachChild(
                FakeComponent,
                '.my-selector',
                { test: true, teardownOn: 'someTeardownEvent' }
            );
            expect(FakeComponent.attachTo).toHaveBeenCalledWith('.my-selector', {
                test: true,
                teardownOn: 'someTeardownEvent'
            });
        });
    });

    describe('attach', function () {
        let _nextTeardownEvent;
        beforeEach(function () {
            _nextTeardownEvent = withChildComponents.nextTeardownEvent;
            withChildComponents.nextTeardownEvent = () => 'nextTeardownEvent';
        });
        afterEach(function () {
            withChildComponents.nextTeardownEvent = _nextTeardownEvent;
        });
        it('should allow attaching without a parent', function () {
            withChildComponents.attach(FakeComponent, '.my-selector', {
                test: true
            });
            expect(FakeComponent.attachTo).toHaveBeenCalledWith('.my-selector', {
                test: true,
                teardownOn: 'nextTeardownEvent'
            });
        });
        it('should allow attaching without a parent with a custom teardown event', function () {
            withChildComponents.attach(FakeComponent, '.my-selector', {
                test: true,
                teardownOn: 'someTeardownEvent'
            });
            expect(FakeComponent.attachTo).toHaveBeenCalledWith('.my-selector', {
                test: true,
                teardownOn: 'someTeardownEvent'
            });
        });
        it('should return an object with the supplied teardown event', function () {
            var result = withChildComponents.attach(FakeComponent, '.my-selector', {
                test: true,
                teardownOn: 'someTeardownEvent'
            });
            expect(result.teardownEvent).toEqual('someTeardownEvent');
        });
        it('should return an object with the generated teardown event', function () {
            var result = withChildComponents.attach(FakeComponent, '.my-selector', {
                test: true
            });
            expect(result.teardownEvent).toEqual('nextTeardownEvent');
        });
    });
});
