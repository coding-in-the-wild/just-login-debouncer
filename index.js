var parallel = require('run-parallel')

module.exports = function (core) {

	var beginAuth = Object.create(core).beginAuthentication

	core.beginAuthentication = function beginAuthentication(sessionId, emailAddress, cb) {
		parallel([
			function (done) { //email
				debounce(emailAddress, function (err, allowed, remaining) {
					done(err, {
						allowed: allowed,
						remaining: remaining
					})
				})
			}, function (done) { //session
				debounce(sessionId, function (err, allowed, remaining) {
					done(err, {
						allowed: allowed,
						remaining: remaining
					})
				})
			}
		],
		function (err, result) {
			var email = result[0]
			var session = result[1]
			if (!err) {
				cb(err)
			} else if (email.allowed && session.allowed) { //This is what we want
				beginAuth(sessionId, emailAddress, cb)
			} else  { //Email and/or session debounce failed
				var debounceError = new Error('Email and/or session debounce failure')
				debounceError.debounce = true
				cb(debounceError, {
					allowed: false,
					remaining: Math.max(email.remaining, session.remaining) || email.remaining || session.remaining
				})
			}
		})
	}
}