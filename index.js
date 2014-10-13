var parallel = require('run-parallel')
var Debouncer = require('debouncer')

module.exports = function (core, db) {
	var beginAuth = Object.create(core).beginAuthentication
	var debounce = new Debouncer(debouncingDb, { //Untested :)
		delayTimeMs: ['0 s', '5 s', '30 s', '5 m', '10 m', '30 m', '1 hr'].map(function (str) {
			return ms(str)
		})
	})

	core.beginAuthentication = function beginAuthentication(sessionId, emailAddress, cb) {
		parallel({
			email: function (done) {
				debounce(emailAddress, function (err, allowed, remaining) {
					done(err, {
						allowed: allowed,
						remaining: remaining
					})
				})
			}, session: function (done) {
				debounce(sessionId, function (err, allowed, remaining) {
					done(err, {
						allowed: allowed,
						remaining: remaining
					})
				})
			}
		},
		function (err, result) {
			if (!err) {
				cb(err)
			} else if (result.email.allowed && result.session.allowed) { //This is what we want
				beginAuth(sessionId, emailAddress, cb)
			} else  { //Email and/or session debounce failed
				var debounceError = new Error('Email and/or session debounce failure')
				debounceError.debounce = true
				cb(debounceError, {
					allowed: false,
					remaining: Math.max(result.email.remaining, result.session.remaining)
				})
			}
		})
	}
}
