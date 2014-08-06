define(function (require) {
    'use strict';

    var defineComponent = require('flight/lib/component');
    var withChildComponents = require('lib/flight-with-child-components');

    describeMixin('lib/flight-with-child-components', function () {

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
            FakeComponent = function () {}
            FakeComponent.prototype = {
                mixedIn: [],
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
            var parentEventSpy = spyOnEvent(document, parent.childTeardownEvent);
            parent.teardown();
            expect(parentEventSpy).toHaveBeenTriggeredOn(document);
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
            var parentEventSpy = spyOnEvent(document, parent.childTeardownEvent);
            parent.teardown();
            expect(parentEventSpy).toHaveBeenTriggeredOn(document);
            expect(window.childDidTeardown).toBe(true);
            expect(window.otherChildDidTeardown).toBe(true);
        });

        describe('attachChild', function () {
            it('should attach child with teardownOn', function () {
                this.setupComponent();
                this.component.attachChild(FakeComponent, '.my-selector', { test: true });
                expect(FakeComponent.attachTo).toHaveBeenCalledWith('.my-selector', {
                    test: true,
                    teardownOn: this.component.childTeardownEvent
                });
            });
            it('should mix withBoundLifecycle into child', function () {
                this.setupComponent();
                var spy = spyOn(ComponentWithoutMixin, 'mixin').and.callThrough();
                this.component.attachChild(ComponentWithoutMixin, '.my-selector', {});
                expect(spy).toHaveBeenCalledWith(withChildComponents.withBoundLifecycle);
            });
            it('should not mix withBoundLifecycle twice', function () {
                this.setupComponent();
                var ComponentWithBoundLifecyleMixin = ComponentWithoutMixin.mixin(
                    withChildComponents.withBoundLifecycle
                );
                var spy = spyOn(ComponentWithBoundLifecyleMixin, 'mixin').and.callThrough();
                this.component.attachChild(ComponentWithBoundLifecyleMixin, '.my-selector', {});
                expect(spy).not.toHaveBeenCalledWith(withChildComponents.withBoundLifecycle);
            });
            it('should not overwrite a passed teardownOn event', function () {
                this.setupComponent();
                this.component.attachChild(FakeComponent, '.my-selector', { test: true, teardownOn: 'someTeardownEvent' });
                expect(FakeComponent.attachTo).toHaveBeenCalledWith('.my-selector', {
                    test: true,
                    teardownOn: 'someTeardownEvent'
                });
            });
        });

    });

});
