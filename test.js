var test = require('tap').test
var jlDebounce = require('./index.js')
var level = require('level-mem')

test('test debouncing', function (t) {
	var sessionId = "session id not"
	var emailAddress = "em@i.l"
	var coreThing = {
		beginAuthCalls: 0,
		beginAuthentication: function (sid, ea, cb) {
			coreThing.beginAuthCalls++
			cb(null, sid, ea)
		}
	}
	t.equal(coreThing.beginAuthCalls, 0, 'called beginAuth 0 times')
	coreThing.beginAuthentication.call(null, sessionId, emailAddress, function (e, sid, ea) {
		t.equal(coreThing.beginAuthCalls, 1, 'called beginAuth 1 times')
		t.notOk(e, 'no err')
		coreThing.beginAuthentication(sessionId, emailAddress, function (e, sid, ea) {
			t.equal(coreThing.beginAuthCalls, 2, 'called beginAuth 2 times')
			t.notOk(e, 'no err')
			var core = Object.create(coreThing)
			var coreCopy = Object.create(coreThing)
			t.deepEqual(core, coreCopy, "core and copy started equal")

			var database = level('dbnc')
			jlDebounce(core, database)
			t.notDeepEqual(core, coreCopy, "jlDebounce modifed core")
			core.beginAuthentication(sessionId, emailAddress, function (err, sid, ea) {
				t.equal(coreThing.beginAuthCalls, 3, 'called beginAuth 3 times')
				t.notOk(err, "no error")
				t.notOk(err && err.debounce, "no debounce error")
				t.equal(sid, sessionId, 'has session id')
				t.equal(ea, emailAddress, 'has email address')
				core.beginAuthentication(sessionId, emailAddress, function (err, details) {
					t.equal(coreThing.beginAuthCalls, 3, 'called beginAuth 3 times (calls cb, bot beginAuth)')
					t.ok(err, "error")
					t.ok(err && err.debounce, "debounce error")
					t.ok(details, 'has details')
					t.ok(details && details.remaining, 'has details.remaining')
					t.equal(details && details.allowed.toString(), 'false', 'has details.allowed')
					t.end()
				})
			})
		})
	})
})
