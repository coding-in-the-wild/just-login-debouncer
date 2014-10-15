var test = require('tap').test
var jlDebounce = require('./index.js')
var level = require('level-mem')

test('test debouncing', function (t) {
	var sessionId = "session id not"
	var emailAddress = "em@i.l"
	var coreThing = {
		beginAuthCalls: 0,
		beginAuthentication: function (err, sid, ea, cb) {
			var calledWithDotCall = (typeof this.ArrayBuffer === 'function')
			coreThing.beginAuthCalls++
			console.log('args:',arguments)
			if (typeof ea === 'function') {
				ea(err, sid, calledWithDotCall)
			} else {
				cb(err, sid, ea, calledWithDotCall)
			}
		}
	}
	coreThing.beginAuthentication.call(null, null, {}, function (e, sid, ea, calledWithDotCall) {
		t.notOk(e, 'no err')
		t.ok(calledWithDotCall, 'was called with Fn.call(null...)')
		coreThing.beginAuthentication(null, {}, function (e, sid, ea, calledWithDotCall) {
			t.notOk(e, 'no err')
			t.notOk(calledWithDotCall, 'was not called with Fn.call(null...)')
			var core = Object.create(coreThing)
			var coreCopy = Object.create(coreThing)
			t.deepEqual(core, coreCopy, "core and copy started equal")

			var database = level('dbnc')
			jlDebounce(core, database)
			t.notDeepEqual(core, coreCopy, "jlDebounce modifed core")
			core.beginAuthentication(sessionId, emailAddress, function (err, sid, ea, calledWithDotCall) {
				t.ok(calledWithDotCall, 'was called with Fn.call(null...)')
				t.notOk(err, "no error")
				t.notOk(err && err.debounce, "no debounce error")
				t.equal(sid, sessionId, 'has session id')
				t.ok(ea, emailAddress, 'has email address')
				core.beginAuthentication(sessionId, emailAddress, function (err, details, calledWithDotCall) {
					t.ok(calledWithDotCall, 'was called with Fn.call(null...)')
					t.ok(err, "no error")
					t.ok(err && err.debounce, "no debounce error")
					t.ok(details, 'has details')
					t.ok(details && details.remaining, 'has details.remaining')
					t.ok(details && details.allowed, 'has details.allowed')
					t.end()
				})
			})
		})
	})
})
