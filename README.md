## Appuri Event Validator

A simple event validator for posting events to [Appuri's Data Platform](https://appuri.readme.io/docs/event-format).

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

#### validator.normalizeId

A helper function will ensure a field is a 40-character string for a `user_id` by taking the md5 hash of it if it is over 40 characters. It also lowercases the string by default.

```
> validator.normalizeId('foo')
'foo'
> validator.normalizeId('FOO')
'foo'
> validator.normalizeId('FOO', false)
'FOO'
> validator.normalizeId('someREALLYlongemail@somereallycooldomainohyeah.org')
'9f093e950b00655a8060ad9c99c982f8'
```
