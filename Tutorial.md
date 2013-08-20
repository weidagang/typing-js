###Usage###
```JavaScript
typing.match(type, data); // true: match; false: not matched
```

###Built-in Types###

1) **any**

```any``` matches any value in JavaScript including null and undefined. 

Examples:
```Javascript
assert(any, null);
assert(any, undefined);
assert(any, 123);
assert(any, 'hello typing.js');
assert(any, {});
assert(any, []);
assert(any, function() {});
```

2) **bool**

```bool``` matches ```true``` or ```false```.

Examples:
```JavaScript
assert(bool, true);
assert(bool, false);
```
