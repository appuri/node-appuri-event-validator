## Appuri Event Validator

A simple event validator based on [Joi](https://github.com/hapijs/joi) for posting events to [Appuri's Data Platform](https://appuri.readme.io/docs/event-format).

### Usage

```
node
> var validator = require('appuri-event-validator')
undefined
> validator({ entype: 'user', evname: 'foobar', user_id: 'bob', body: {} })
{ error: null,
  value: { entype: 'user', evname: 'foobar', user_id: 'bob', body: {} } }
> validator.isValid({ entype: 'user', evname: 'foobar', user_id: 'bob' })
true
> validator({ entype: 'user', evname: 'foobar', user_id: 'bob', ts: 123 })
{ error:
   { [ValidationError: child "ts" fails because ["ts" must be a string]]
     isJoi: true,
     name: 'ValidationError',
     details: [ [Object] ],
     _object: { entype: 'user', evname: 'foobar', user_id: 'bob', ts: 123 },
     annotate: [Function] },
  value: { entype: 'user', evname: 'foobar', user_id: 'bob', ts: 123 } }
```