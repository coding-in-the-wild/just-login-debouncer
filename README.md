just-login-debouncer
==================

#Install and Require

With npm do: 
	
	npm install just-login-debouncer

Require in src:

```js
var justLoginDebouncer = require('just-login-debouncer')
```

##justLoginDebouncer(core)

Takes a core created by the just-login-core.

Wraps `core.beginAuthentication()` with a debounce function for the session id and the email address.

If one session id tries to send emails to multiple email addresses in quick succession, this will ignore the repeats during a certain time period after the first is allowed. The time is extended after each email is sent, but is reduced after a while.

If multiple session ids try to send emails to one email address is quick succession, this will ignore the repeats during a certain time period after the first is allowed. The time is extended after each email is sent, but is reduced after a while.

#License

[VOL](http://veryopenlicense.com/)
