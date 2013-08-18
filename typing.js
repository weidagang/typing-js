// dependencies
//var util = require('util');

// The core structure to store type definitions
var types = {
};

//++++ core functions 

// define type 
function define(name, definition) {
    if (null == name || !is_str(name) || 0 == name.length) {
        throw new Error('Invalid type name: ' + name);
    }

    if (!is_valid_type(definition)) {
        throw new Error('Invalid type definition: ' + definition);
    }
    
    types[name] = definition;
}

// check type 
function check(type, value) { 
    //console.log("+check(), type=%s, value=%s", util.inspect(type), util.inspect(value));
    // if the <type> has __check__ function, then just use it
    if (is_func(type.__check__)) {
        return type.__check__(value);
    }
    else if (is_json(type)) {
        // if the <type> is an object, do pattern matching 
        if (!is_json(value)) {
            return false;
        }

        for (var prop in type) {
            var matched = check(type[prop], value[prop]);
            if (true != matched) {
                return false;
            }
        }

        return true;
    }
    else if (is_str(type)) {
        // if the <type> is a string, it's a type name 
        if (null != types[type]) {
            return check(types[type], value);
        }
        else {
            console.error('Undefined type ' + type);
            return false; 
        }
    }

    return false;
}

function is_valid_type(def) {
    if (is_func(def.__check__)) {
        return true;
    }
    else if (is_str(def)) {
        if (name == def || null != types[name]) {
            return true;
        }
        return false;
    }
    else if (is_json(def)) {
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

// lazy resolving type
function type(name) {
    var _type = function() {};

    _type.__name__ = name;

    _type.__check__  = function(value) {
        return (null != types[name]) && check(types[name], value);
    };

    return _type;
}

//-- core functions 


//++++ util functions
function generate_type_name(fn, args) {
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
                name += args[i].__name__;
            }
            else {
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
    var _args = arguments;
    var _or = function() {};
    _or.__name__ = generate_type_name(or, _args);
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
    function _nullable() {
    }

    _nullable.__name__ = generate_type_name(nullable, type);

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
    var _args = arguments;
    var _str = function() {};

    _str.__name__ = generate_type_name(str, _args); 

    _str.__check__ = function(value) {
        if (null == value) {
            if (min_len > 0) {
                return false;
            }
            return true;
        }

        if (!is_str(value)) {
            return false;
        }

        if (null != min_len && value.length < min_len) {
            return false; 
        }

        if (null != max_len && value.length > max_len) {
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
            return false;
        }

        if (null != min && value < min) {
            return false;
        }

        if (null != max && value > max) {
            return false;
        }

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
    for (var i in _args) {
        if (!is_valid_type(_args[i])) {
            throw new Error('Invalid element type for tuple ' + _args[i]);
        }
        
        if (_args[i].__name__) {
            _arg_names.push(_args[i].__name__);
        }
        else if (is_json(_args[i])) {
            _arg_names.push('JSON');
        }
    }

    var _tuple = function() {};

    _tuple.__name__ = generate_type_name(tuple, _arg_names);

    _tuple.__check__ = function(value) {
        if (!is_array(value)) {
            return false;
        }

        if (_args.length != value.length) {
            return false;
        }

        for (var i = 0; i < _args.length; ++i) {
            if (true != check(_args[i], value[i])) {
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

    for (var i = 0; i < _args.length; ++i) {
    }
    _table.__name__ = generate_type_name(table, _args);
    _table.__check__ = array(tuple.apply(null, _args)).__check__;
    return _table;
}
//---- built-in types


//++++ module exports
module.exports = {
    'define' : define,
    'check' : check,
    'type' : type,

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
