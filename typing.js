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

function make_type_name(fn, args) {
    console.log('+make_type_name(), fn=%s, args=%j', typeof(fn), args);
    var name = fn.name;
    if (is_str(args)) {
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
function t_and() {
    var _args = arguments;
    var _t_and = function() {};
    _t_and.__check__ = function(value) {
        for (var i in _args) {
            if (true != check(_args[i], value)) {
                return false;
            }
        }
        return true;
    };
    return _t_and;
}

// or 
function t_or() {
    console.log('+t_or(), type=%s', typeof(t_or)); 
    var _args = arguments;
    var _t_or = function() {};
    _t_or.__name__ = make_type_name(t_or, _args);
    console.log('type name of t_or: %s', _t_or.__name__);
    _t_or.__check__ = function(value) {
        for (var i in _args) {
            if (true == check(_args[i], value)) {
                return true;
            }
        }
        return false;
    };
    return _t_or;
}
//---- type operations


//++++ built-in types
// t_any: any type
function t_any() {
}

t_any.__name__ = 't_any';

t_any.__check__ = function(value) {
    return true;
}

// t_null: null type
function t_null() {
}

t_null.__name__ = 't_null';

t_null.__check__ = function(value) {
    return null == value; 
};

// t_nonnull: non-null type
function t_nonnull() {
};

t_null.__name__ = 't_nonnull';

t_null.__check__ = function(value) {
    return null != value;
};

// t_str: string type
function t_str(min_len, max_len) {
    console.log('min_len=%d, max_len=%d, arguments=%j', min_len, max_len, arguments);
    var _args = arguments;
    var _t_str = function() {};

    _t_str.__name__ = make_type_name(t_str, _args); 

    console.log('str type name %s, %d, %d',  _t_str.__name__, min_len, max_len);

    _t_str.__check__ = function(value) {
        console.log('t_str check, min_len=%d, max_len=%d, value=%s', min_len, max_len, value);
        if (null == value) {
            if (min_len > 0) {
                console.log('t_str check 1');
                return false;
            }
            return true;
        }

        if (!is_str(value)) {
            console.log('t_str check 2');
            return false;
        }

        if (null != min_len && value.length < min_len) {
            console.log('t_str check 3, valuelen=%d, minlen=%d', value.length, min_len);
            return false; 
        }

        if (null != max_len && value.length > max_len) {
            console.log('t_str check 4');
            return false;
        }

        return true;
    };

    return _t_str;
}

t_str.__name__ = 't_str';

t_str.__check__ = function(value) {
    return null == value || is_str(value)    
};

// t_int: integer type
function t_int(min, max) {
    var _args = arguments;
    var _t_int = function() {};
    
    _t_int.__name__ = make_type_name(t_int, _args);

    _t_int.__check__ = function(value) {
        if (null == value) {
            return false;
        }

        if (!is_int(value)) {
            console.log('t_int check 1');
            return false;
        }

        if (null != min && value < min) {
            console.log('t_int check 2, value=%d, min=%d', value, min);
            return false;
        }

        if (null != max && value > max) {
            console.log('t_int check 3');
            return false;
        }

        console.log('t_int check 4');
        return true;
    };

    return _t_int;
}

t_int.__name__ = 't_int';

t_int.__check__ = function(value) {
    return null != value && is_int(value);
}

// t_enum: enumeration
function t_enum() {
    var _args = arguments;
    var _t_enum = function() {}; 
    
    _t_enum.__name__ = make_type_name(t_enum, _args);

    _t_enum.__check__ = function(value) {
        for (var i in _args) {
            if (_args[i] == value) {
                return true;
            }
        }
        return false;
    };

    return _t_enum;
}

// t_func: function type
function t_func() {
}

t_func.__name__ = 't_func';

t_func.__check__ = function(value) {
    return is_func(value);
};

// t_array: array type
function t_array(t_item) {
    if (!is_valid_type(t_item)) {
        throw new Error('Invalid element type for t_array: ' + t_item);
    }

    var _t_array = function() {};
    
    _t_array.__name__ = make_type_name(t_array, t_item.__name__);

    _t_array.__check__ = function(value) {
        console.log('t_array check, t_iterm=%s, value=%j', t_item.__name__, value);
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

    return _t_array;
}

t_array.__name__ = 't_array';

t_array.__check__ = t_array(t_any).__check__;

// t_tuple: tuple type
function t_tuple() {
    var _args = arguments;
    var _arg_names = [];
    console.log('+t_tuple(), args:%j', _args);
    for (var i in _args) {
        if (!is_valid_type(_args[i])) {
            throw new Error('Invalid element type for t_tuple ' + _args[i]);
        }
        
        console.log('arg[%d]: %s', i, _args[i].__name__);
        _arg_names.push(_args[i].__name__);
    }

    var _t_tuple = function() {};

    _t_tuple.__name__ = make_type_name(t_tuple, _arg_names);

    _t_tuple.__check__ = function(value) {
        if (!is_array(value)) {
            console.log('t_tuple() check 1, args:%j', _args);
            return false;
        }

        if (_args.length != value.length) {
            console.log('t_tuple() check 2, args:%j', _args);
            return false;
        }

        for (var i = 0; i < _args.length; ++i) {
            if (true != check(_args[i], value[i])) {
                console.log('t_tuple() check 3, type=%s, value=%s', _args[i].__name__, value[i]);
                return false;
            }
        }

        return true;
    };

    return _t_tuple;
}

// t_table: table type
function t_table() {
    var _args = arguments;
    var _t_table = function() {};

    console.log('+t_table(), n: %d, args:%j', _args.length, _args);
    for (var i = 0; i < _args.length; ++i) {
        console.log('arg %d, %s', i, _args[i].__name__);
    }
    _t_table.__name__ = make_type_name(t_table, _args);
    console.log('table type name: ' + _t_table.__name__);
    _t_table.__check__ = t_array(t_tuple.apply(null, _args)).__check__;
    return _t_table;
}
//---- built-in types

//++++ module exports
module.exports = {
    'define' : define,
    'check' : check
}
