var test = require('tap').test
var jlDebounce = require('./index.js')
var level = require('level-mem')

test('test debouncing', function (t) {
	var sessionId = "session id not"
	var emailAddress = "em@i.l"
	var beginAuthCalls = 0;
	var core = {
		beginAuthentication: function () {
			beginAuthCalls++
		}
	}
	var coreCopy = Object.create(core)
	var database = level('dbnc')

	t.deepEqual(core, coreCopy, "core and copy started equal")
	jlDebounce(core, database)
	t.notDeepEqual(core, coreCopy, "jlDebounce modifed core")
	core.beginAuthentication(sessionId, emailAddress, function (err, details) {
		t.notOk(err, "no error")
		details.allowed
		details.remaining
	})

	t.end()
})
