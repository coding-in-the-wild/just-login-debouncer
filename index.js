var parallel = require('run-parallel')
var Debouncer = require('debouncer')
var ms = require('ms')
var delayTimes = ['0 s', '5 s', '30 s', '5 m', '10 m', '30 m', '1 hr'].map(ms)

module.exports = function (core, db) {
	var beginAuth = Object.create(core).beginAuthentication
	var debounce = new Debouncer(db, { delayTimeMs: delayTimes })

	function debounceKey(key) {
		return function (done) {
			debounce(key, function (err, allowed, remaining) {
				if (err) {
					done(err)
				} else {
					done(null, {
						allowed: allowed,
						remaining: remaining
					})
				}
			})
		}
	}

	core.beginAuthentication = function beginAuthentication(sessionId, emailAddress, cb) {
		parallel({
			email: debounceKey(emailAddress),
			session: debounceKey(sessionId)
		}, function (err, result) {
			if (err) {
				cb && cb(err)
			} else if (result.email.allowed && result.session.allowed) { // This is what we want
				beginAuth.call(null, sessionId, emailAddress, cb)
			} else {
				var debounceError = new Error('Email and/or session debounce failure')
				debounceError.debounce = true
				cb && cb(debounceError, {
					allowed: result.email.allowed && result.session.allowed,
					remaining: Math.max(result.email.remaining, result.session.remaining)
				})
			}
		})
	}
}
