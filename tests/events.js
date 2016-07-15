/*
NOTE: Using _HI instead of just 'HI' throughout tests so we don't inadvertently
reference window.HI which is a common mistake I've made in the past in various
plugins (e.g. using "HI.whatever" instead of "this.HI.whatever").
*/

chai.should();

describe('Events: A HumanInput instance', function () {
    var HumanInput = window.HumanInput;
    var _HI;

    beforeEach(function () {
        var settings = {logLevel: 'DEBUG'};
        _HI = new HumanInput(window, settings);
        _HI.init();
    });

    describe('should allow listening', function() {

        it('to events with complex names', function() {
            var callCount = 0,
                events = ['event', 'event.whatever', 'scoped:event', '★★★★★'];
            _HI.on(events, function() { callCount++; });
            _HI.trigger(events);
            callCount.should.equal(events.length);
        });

        it('to aliased events', function() {
            var callCount = 0,
                events = ['bar', 'ctrl-b'];
            _HI.aliases.foo = 'bar';
            _HI.aliases['★'] = 'ctrl-b';
            _HI.on(events, function() { callCount++; });
            _HI.trigger(events);
            callCount.should.equal(events.length);
        });

        it('to remapped events', function() {
            var callCount = 0,
                map = {w: 'moveup', s: 'movedown'};
            _HI.map(map);
            // Listen for the mapped event names
            _HI.on(['moveup', 'movedown'], function() { callCount++; });
            // Trigger the original event names
            _HI.trigger(['w', 's']);
            callCount.should.equal(2);
        });

        it('to the same event multiple times', function() {
            var first = false, second = false;
            _HI.on('event', function() { first = true; });
            _HI.on('event', function() { second = true; });
            _HI.trigger('event');
            first.should.be.true;
            second.should.be.true;
        });

        it('with a maximum trigger count', function() {
            var callCount = 0, maxTimes = 2;
            _HI.on('event', function() { callCount++; }, null, maxTimes);
            for (var i=0; i<maxTimes+1; i++) {
                _HI.trigger('event');
            }
            callCount.should.equal(maxTimes);
        });

        it('with the one-shot shortcut', function() {
            var onceCallCount = 0,
                otherCallCount = 0;
            _HI.on('event', function() { otherCallCount++; });
            _HI.once('event', function() { onceCallCount++; });
            _HI.trigger('event');
            _HI.trigger('event');
            onceCallCount.should.equal(1);
            otherCallCount.should.equal(2);
        });

        it('while respecting custom contexts', function(done) {
            var ctx = {foo: 'bar'};
            _HI.on('event', function() {
                this.should.equal(ctx);
                done();
            }, ctx);
            _HI.trigger('event');
        });

    });

    describe('should allow triggering', function() {

        it('to multiple events at the same time', function() {
            var first, second;
            _HI.on('event1', function() { first = true; });
            _HI.on('event2', function() { second = true; });
            _HI.trigger(['event1', 'event2']);
            first.should.be.true;
            second.should.be.true;
        });

        it('to multiple events as separate triggers', function() {
            var callCount = 0;
            _HI.on('event', function(){ callCount++; }, null, 2);
            _HI.trigger(['event', 'event', 'event']);
            callCount.should.equal(2);
        });

        it('while passing arguments to the handler', function(done) {
            var arg1 = {}, arg2 = {};
            _HI.on('event', function(a1, a2) {
                a1.should.equal(arg1);
                a2.should.equal(arg2);
                done();
            })
            _HI.trigger('event', arg1, arg2);
        });

        it('inside a limited-by-count listener handler', function() {
            var callCount = 0;
            _HI.on('event', function() {
                callCount++;
                _HI.trigger('event');
            }, null, 2);
            _HI.trigger('event');
            callCount.should.equal(2);
        })

    });

    describe('should allow unregistering handlers', function() {

        it('globally', function() {
            var callCount = 0;
            _HI.on('event', function() { callCount++; });
            _HI.trigger('event');
            _HI.off();
            _HI.trigger('event');
            callCount.should.equal(1);
        });

        it('by name', function() {
            var firstCallCount = 0,
                secondCallCount = 0;
            _HI.on('event', function() { firstCallCount++; });
            _HI.on('event', function() { firstCallCount++; });
            _HI.on('other-event', function() { secondCallCount++; });
            // NOTE: Events with dashes (-) *should* be sorted when added via on() but *not* when triggered (don't want to add expensive sorting overhead to trigger())
            _HI.trigger(['event', 'event-other']); // This is correct: it is supposed to be "event-other" when triggered.
            _HI.off('event');
            _HI.trigger(['event', 'event-other']);
            firstCallCount.should.equal(2);
            secondCallCount.should.equal(2);
        });

        it('by context', function() {
            var context = {foo: 'bar'},
                firstCallCount = 0,
                secondCallCount = 0;
            _HI.on('event', function() { firstCallCount++; }, context);
            _HI.on('event', function() { secondCallCount++; });
            _HI.off('event', null, context);
            _HI.trigger('event');
            _HI.trigger('event');
            firstCallCount.should.equal(0);
            secondCallCount.should.equal(2);
        });

        it('during triggering', function() {
            var first, second, third, fourth;
            first = second = third = fourth = false;
            _HI.on('event1', function() { first = true; });
            _HI.on('event2', function() { second = true; _HI.off('event3'); });
            _HI.on('event3', function() { third = true; });
            _HI.on('event4', function() { fourth = true; });
            _HI.trigger(['event1', 'event2', 'event3', 'event4']);
            first.should.be.true;
            second.should.be.true;
            third.should.be.false;
            fourth.should.be.true;
        });

    });

});
