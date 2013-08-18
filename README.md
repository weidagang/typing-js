JavaScript type checking and JSON schema validation
---------------------------------------------------

A simple and intuitive type checking and JSON schema validation library for JavaScript.

###Usage:

```Javascript
typing.check(<type>, <data>); //true: matched; false: not matched
```

where ```<type>``` can be:

1) Function with ```__name__``` and ```__check__``` property, i.e. the built-in type bool is defined as:

```Javascript
function bool() {}
bool.__name__ = 'bool';
bool.__check__ = function(value) { return 'boolean' == typeof(value); }
```

```typing.check(<type>, <data>)``` will call ```<type>.__check__(<data>)``` in this case. 

2) JSON object, such as:

```Javascript
{
    status : {
        code : int,
        message : str
    },
    data : table(int, str, tuple(str, str))
}
```

```typing.check(<type>, <data>)``` will do pattern matching based on the structure and recursively check the type of each property. 

###Example:

```JavaScript
// import module
var typing = require('typing');

// import the built-in types
var int = typing.int;
var str = typing.str;
...
var tuple = typing.tuple;
var table = typing.table;
````

**Define custom type with built-in types**

```JavaScript
// int(1): integer >= 1;
// str(1,50): string with length between 1 to 50;
// tuple: array with specified type and number of elements
var t_employee = tuple(int(1), str(1,50), tuple(str,str));

// matched
assert(typing.check(t_employee, [123, 'todd', ['1355-0011-107', 'CA 5607']]));

// not matched, id must be >= 1
assert(false == typing.check(t_employee, [0, 'todd', ['1355-0011-107', 'CA 5607']]));
```

**Define custom type in JSON**

```JavaScript
// typing will do pattern matching based the type defined in JSON
// nullable : null or the wrapped type
// table: equivalent of array(tuple)
var t_response = {
    status : {
        code : int,
        message : str
    },
    data : nullable(table(int(1), str(1,50), tuple(str,str)))
};

// matched
assert(typing.check(t_response, {
    status : { 
        code : 200, 
        message : 'OK'
    },
    data : [
        [1, 'Todd', ['1355-0011-107', 'CA 5607']],
        [2, 'April', ['1582-0011-108', 'CA 5607']],
        [3, 'Rex', ['1522-1011-138', 'CA 1008']]
    ]
});

// matched
assert(typing.check(t_response, {
    status : { 
        code : 404, 
        message : 'NOT FOUND'
    }
});

// not matched, status.message is missing
assert(typing.check(t_response, {
    status : {
        code : 300
    }
});
```

**Define recursive type** 
```Javascript
// define a binary tree type
// type(name): define a lazy resolved type
var t_tree = {
    value : int,
    left : nullable(type('tree')),
    right : nullable(type('tree'))
};

// define type t_node under the name 'tree'
typing.define('tree', t_tree);

// matched
assert(typing.check('tree', {
    value : 1,
    left : {
        value : 2,
        left : { value : 3 }
    },
    right : {
        value : 4,
        right : { value : 5 }
    }
}));

