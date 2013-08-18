#!/usr/bin/env node

// dependencies
util = require('util');
assert = require('assert');

// The core structure to store type definitions
var types = {
};

//++++ core functions 

// define type 
function define(name, definition) {
    //console.log('define type: name=%s, def=%j', name, definition);
    if (null == name || !is_str(name) || 0 == name.length) {
        throw new Error('Invalid type name: ' + name);
    }

    if (!is_valid_type(definition)) {
        throw new Error('Invalid type definition: ' + definition);
    }
    
    debug('define type: name=%s, def=%j', name, definition);
    types[name] = definition;
}

// check type 
function check(type, value) { 
    console.log('+check(), type=' + type.__name__ + ', value=' + value);
    
    // if the <type> has __check__ function, then just use it
    if (is_func(type.__check__)) {
        return type.__check__(value);
    }
    else if (is_json(type)) {
        // if the <type> is an object, do pattern matching 
        console.log(5);
        if (!is_json(value)) {
            console.log(1);
            console.error('value %j is not JSON object', value);
            return false;
        }

        for (var prop in type) {
            if (undefined === value[prop]) {
                console.error('Attribute ' + prop + ' is missing');
                return false;
            }
            var matched = check(type[prop], value[prop]);
            if (true != matched) {
                console.log(2);
                console.error('attribute %s type mismatch, type=%s, value=%j', prop, type_name(type[prop]), value[prop]);
                return false;
            }
        }

        return true;
    }
    else if (is_str(type)) {
        // if the <type> is a string, it's a type name 
        if (null != types[type]) {
            console.log(3);
            return check(types[type], value);
        }
        else {
            console.error('Undefined type ' + type);
            return false; 
        }
    }

    console.log(4);
    return false;
}

function is_valid_type(def) {
    if (is_func(def.__check__)) {
        return true;
    }

    if (is_str(def)) {
        if (name == def || null != types[name]) {
            return true;
        }
    }

    if (is_json(def)) {
        for (var prop in def) {
            if (!is_valid_type(def[prop])) {
                console.error('Invalid type: %j', def[prop]);
                return false;
            }
        }

        return true;
    }

    return false;
}

//-- core functions 


//++++ util functions
function debug() {
    console.log(arguments);
}

function error() {
    console.error(arguments);
}

function generate_type_name(fn, args) {
    console.log('+generate_type_name(), fn=%s, args=%j', typeof(fn), args);
    var name = fn.name;
    if (null != args.__name__) {
        name += '(' + args.__name__ + ')'; 
    }
    else if (is_str(args)) {
        name += '(' + args + ')'; 
    }
    else if (is_args(args) || is_array(args)) {
        name += '(';
        for (var i = 0; i < args.length; ++i) {
            if (i > 0) {
                name += ',';
            }
            if (args[i].__name__) {
                console.log('type_name: ' + args[i].__name__);
                name += args[i].__name__;
            }
            else {
                console.log('type_name: ' + args[i]);
                name += args[i];
            }
        }
        name += ')';
    }
    return name;
}

function type_name(type) {
    if (null != type.__name__) {
        return type.__name__;
    }

    if (is_str(type)) {
        return type;
    }
    
    return null;
}

function is_str(arg) {
    return "string" == typeof(arg); 
}

function is_json(arg) {
    return "object" == typeof(arg) && !(arg instanceof Array); 
}

function is_array(arg) {
    return arg instanceof Array; 
}

function is_args(args) {
    if (is_json(args) && args.length >= 0) {
        for (var i = 0; i < args.length; ++i) {
            if (undefined === args[i]) {
                return false;
            }
        }
        return true;
    }
    return false;
}

function is_num(arg) {
    return "number" == typeof(arg); 
}

function is_int(arg) {
    console.log('is_int, arg=%s, type=%s', arg, typeof(arg));
    return "number" == typeof(arg) && (0 == arg % 1); 
}

function is_float(arg) {
    return "number" == typeof(arg) && (0 != arg % 1); 
}

function is_func(arg) {
    return "function" == typeof(arg); 
}
//---- util functions


//++++ type operations
// and
function and() {
    var _args = arguments;
    var _and = function() {};
    _and.__check__ = function(value) {
        for (var i in _args) {
            if (true != check(_args[i], value)) {
                return false;
            }
        }
        return true;
    };
    return _and;
}

// or 
function or() {
    console.log('+or(), type=%s', typeof(or)); 
    var _args = arguments;
    var _or = function() {};
    _or.__name__ = generate_type_name(or, _args);
    console.log('type name of or: %s', _or.__name__);
    _or.__check__ = function(value) {
        for (var i in _args) {
            if (true == check(_args[i], value)) {
                return true;
            }
        }
        return false;
    };
    return _or;
}
//---- type operations


//++++ built-in types
// any: any type
function any() {
}

any.__name__ = 'any';

any.__check__ = function(value) {
    return true;
}

// none: nullable type, extends other types to accept null value
function nullable(type) {
    console.log('+nullable(), typeof(type)=' + typeof(type));
    function _nullable() {
    }

    _nullable.__name__ = generate_type_name(nullable, type);
    console.log("nullable type name: " + _nullable.__name__);

    _nullable.__check__ = function(value) {
        return null == value || check(type, value); 
    };

    return _nullable;
}

nullable.__name__ = 'nullable';

nullable.__check__ = function(value) {
    return null == value; 
};

// str: string type
function str(min_len, max_len) {
    console.log('min_len=%d, max_len=%d, arguments=%j', min_len, max_len, arguments);
    var _args = arguments;
    var _str = function() {};

    _str.__name__ = generate_type_name(str, _args); 

    console.log('str type name %s, %d, %d',  _str.__name__, min_len, max_len);

    _str.__check__ = function(value) {
        console.log('str check, min_len=%d, max_len=%d, value=%s', min_len, max_len, value);
        if (null == value) {
            if (min_len > 0) {
                console.log('str check 1');
                return false;
            }
            return true;
        }

        if (!is_str(value)) {
            console.log('str check 2');
            return false;
        }

        if (null != min_len && value.length < min_len) {
            console.log('str check 3, valuelen=%d, minlen=%d', value.length, min_len);
            return false; 
        }

        if (null != max_len && value.length > max_len) {
            console.log('str check 4');
            return false;
        }

        return true;
    };

    return _str;
}

str.__name__ = 'str';

str.__check__ = function(value) {
    return null == value || is_str(value)    
};

// bool: bool type
function bool() {
}

bool.__name__ = 'bool';

bool.__check__ = function(value) {
    return 'boolean' == typeof(value);
}

// int: integer type
function int(min, max) {
    var _args = arguments;
    var _int = function() {};
    
    _int.__name__ = generate_type_name(int, _args);

    _int.__check__ = function(value) {
        if (null == value) {
            return false;
        }

        if (!is_int(value)) {
            console.log('int check 1');
            return false;
        }

        if (null != min && value < min) {
            console.log('int check 2, value=%d, min=%d', value, min);
            return false;
        }

        if (null != max && value > max) {
            console.log('int check 3');
            return false;
        }

        console.log('int check 4');
        return true;
    };

    return _int;
}

int.__name__ = 'int';

int.__check__ = function(value) {
    return null != value && is_int(value);
}

// oneof: enumeration
function oneof() {
    var _args = arguments;
    var _oneof = function() {}; 
    
    _oneof.__name__ = generate_type_name(oneof, _args);

    _oneof.__check__ = function(value) {
        for (var i in _args) {
            if (_args[i] == value) {
                return true;
            }
        }
        return false;
    };

    return _oneof;
}

// func: function type
function func() {
}

func.__name__ = 'func';

func.__check__ = function(value) {
    return is_func(value);
};

// array: array type
function array(t_item) {
    if (!is_valid_type(t_item)) {
        throw new Error('Invalid element type for array: ' + t_item);
    }

    var _array = function() {};
    
    _array.__name__ = generate_type_name(array, t_item.__name__);

    _array.__check__ = function(value) {
        console.log('array check, t_iterm=%s, value=%j', t_item.__name__, value);
        if (!is_array(value)) {
            return false;
        }
        for (var i = 0; i < value.length; ++i) {
            if (true != check(t_item, value[i])) {
                return false;
            }
        }
        return true;
    };

    return _array;
}

array.__name__ = 'array';

array.__check__ = array(any).__check__;

// tuple: tuple type
function tuple() {
    var _args = arguments;
    var _arg_names = [];
    console.log('+tuple(), args:%j', _args);
    for (var i in _args) {
        if (!is_valid_type(_args[i])) {
            throw new Error('Invalid element type for tuple ' + _args[i]);
        }
        
        console.log('arg[%d]: %s', i, _args[i].__name__);
        _arg_names.push(_args[i].__name__);
    }

    var _tuple = function() {};

    _tuple.__name__ = generate_type_name(tuple, _arg_names);

    _tuple.__check__ = function(value) {
        if (!is_array(value)) {
            console.log('tuple() check 1, args:%j', _args);
            return false;
        }

        if (_args.length != value.length) {
            console.log('tuple() check 2, args:%j', _args);
            return false;
        }

        for (var i = 0; i < _args.length; ++i) {
            if (true != check(_args[i], value[i])) {
                console.log('tuple() check 3, type=%s, value=%s', _args[i].__name__, value[i]);
                return false;
            }
        }

        return true;
    };

    return _tuple;
}

// table: table type
function table() {
    var _args = arguments;
    var _table = function() {};

    console.log('+table(), n: %d, args:%j', _args.length, _args);
    for (var i = 0; i < _args.length; ++i) {
        console.log('arg %d, %s', i, _args[i].__name__);
    }
    _table.__name__ = generate_type_name(table, _args);
    console.log('table type name: ' + _table.__name__);
    _table.__check__ = array(tuple.apply(null, _args)).__check__;
    return _table;
}
//---- built-in types


//++++ module exports
module.exports = {
    'define' : define,
    'check' : check,

    'and' : and,
    'or' : or,

    'any' : any,
    'nullable' : nullable,
    'bool' : bool,
    'str' : str,
    'int' : int,
    'oneof' : oneof,
    'func' : func,
    'array' : array,
    'tuple' : tuple,
    'table' : table
}
//---- module exports
