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

Takes a core created by the just-login-core, and debounces the `beginAuthentication()` function with the session id and the email address.
