define(function (require) {
    'use strict';

    var defineComponent = require('flight/lib/component');
    var withTeardown = require('lib/flight-with-teardown');

    describeMixin('lib/flight-with-teardown', function () {

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

            Component = defineComponent(function parentComponent() {}).mixin(withTeardown);
            ChildComponent = defineComponent(function childComponent() {}).mixin(withTeardown);
            ComponentWithoutMixin = defineComponent(function componentWithoutMixin() {});
            FakeComponent = {
                mixin: function () {
                    return FakeComponent;
                },
                attachTo: jasmine.createSpy()
            };
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

        describe('as a parent', function () {

            it('should get a childTeardownEvent', function () {
                var component = new Component();
                component.initialize(window.outerDiv);
                expect(component.childTeardownEvent).toBeDefined();
            });

            it('should teardown the child when torn down', function () {
                var parent = new Component();
                parent.initialize(window.outerDiv);
                var child = new ChildComponent();
                child.initialize(window.innerDiv, {
                    teardownOn: parent.childTeardownEvent
                });
                var parentEventSpy = spyOnEvent(document, parent.childTeardownEvent);
                var childEventSpy = spyOnEvent(document, child.childTeardownEvent);
                parent.teardown();
                expect(parentEventSpy).toHaveBeenTriggeredOn(document);
                expect(childEventSpy).toHaveBeenTriggeredOn(document);
            });

            it('should teardown all children when torn down', function () {
                var parent = new Component();
                parent.initialize(window.outerDiv);
                var child = new ChildComponent();
                child.initialize(window.innerDiv, {
                    teardownOn: parent.childTeardownEvent
                });
                var otherChild = new ChildComponent();
                otherChild.initialize(document, {
                    teardownOn: parent.childTeardownEvent
                });
                var parentEventSpy = spyOnEvent(document, parent.childTeardownEvent);
                var childEventSpy = spyOnEvent(document, child.childTeardownEvent);
                var otherChildEventSpy = spyOnEvent(document, otherChild.childTeardownEvent);
                parent.teardown();
                expect(parentEventSpy).toHaveBeenTriggeredOn(document);
                expect(childEventSpy).toHaveBeenTriggeredOn(document);
                expect(otherChildEventSpy).toHaveBeenTriggeredOn(document);
            });

            describe('attachChild', function () {
                it('should attach child with teardownOn', function () {
                    setupComponent();
                    this.component.attachChild(FakeComponent, '.my-selector', { test: true });
                    expect(FakeComponent.attachTo).toHaveBeenCalledWith('.my-selector', {
                        test: true,
                        teardownOn: this.component.childTeardownEvent
                    });
                });
                it('should mix withTeardown into child', function () {
                    setupComponent();
                    var spy = spyOn(ComponentWithoutMixin, 'mixin').andCallThrough();
                    this.component.attachChild(ComponentWithoutMixin, '.my-selector', {});
                    expect(spy).toHaveBeenCalledWith(withTeardown);
                });
                it('should not overwrite a passed teardownOn event', function () {
                    setupComponent();
                    this.component.attachChild(FakeComponent, '.my-selector', { test: true, teardownOn: 'someTeardownEvent' });
                    expect(FakeComponent.attachTo).toHaveBeenCalledWith('.my-selector', {
                        test: true,
                        teardownOn: 'someTeardownEvent'
                    });
                });
            });

        });

        describe('as a child', function () {

            it('should throw when intialized with its own childTeardownEvent', function () {
                spyOn(withTeardown, 'nextTeardownEvent').andReturn('someFakeEvent');
                var child = new ChildComponent();
                expect(function () {
                    child.initialize(document, {
                        teardownOn: 'someFakeEvent'
                    });
                }).toThrow();
            });

            it('should trigger children to teardown when torndown via event', function () {
                var child = new ChildComponent();
                child.initialize(window.innerDiv, {
                    teardownOn: 'aFakeEvent'
                });
                var childEventSpy = spyOnEvent(document, child.childTeardownEvent);
                $(document).trigger('aFakeEvent');
                expect(childEventSpy).toHaveBeenTriggeredOn(document);
            });

        });

    });

});
