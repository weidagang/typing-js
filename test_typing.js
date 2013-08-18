#!/usr/bin/env node

// imports 
var util = require('util');
var assert = require('assert');
var typing = require('./typing.js');

var type = typing.type;
var any = typing.any;
var nullable = typing.nullable;
var func = typing.func;
var int = typing.int;
var bool = typing.bool;
var str = typing.str;
var array = typing.array;
var tuple = typing.tuple;
var table = typing.table;
var or = typing.or;
var and = typing.and;

// test cases
function test_any(i) {
    assert(typing.check(any, null), util.format('case %d.1 failed', i));
    assert(typing.check(any, ''), util.format('case %d.2 failed', i));
    assert(typing.check(any, 'hello typing.js'), util.format('case %d.3 failed', i));
    assert(typing.check(any, function() {}), util.format('case %d.4 failed', i));
    assert(typing.check(any, [1,2,3]), util.format('case %d.5 failed', i));
    assert(typing.check(any, {}), util.format('case %d.6 failed', i));

    console.log(util.format('test suit %d passed', i));
}

function test_str(i) {
    assert(typing.check(str(0,0), null), util.format('case %d.1 failed', i));
    assert(typing.check(str(0,0), ''), util.format('case %d.2 failed', i));
    assert(typing.check(str(0,1), null), util.format('case %d.3 failed', i));
    assert(typing.check(str(0,1), ''), util.format('case %d.4 failed', i));
    assert(typing.check(str(1,1), 'q'), util.format('case %d.5 failed', i));
    assert(!typing.check(str(1,1), null), util.format('case %d.6 failed', i));
    assert(!typing.check(str(1,30), ''), util.format('case %d.7 failed', i));
    assert(!typing.check(str(1,5), 'hello world'), util.format('case %d.8 failed', i));
    assert(typing.check(str(1,5), 'hello'), util.format('case %d.9 failed', i));
    assert(typing.check(str(1), 'hello'), util.format('case %d.10 failed', i));
    assert(!typing.check(str(10), 'hello'), util.format('case %d.11 failed', i));
    assert(!typing.check(str, ['a', 'b', 'c']), util.format('case %d.11 failed', i));
    assert(!typing.check(str(0), ['a']), util.format('case %d.12 failed', i));
    assert(!typing.check(str, {}), util.format('case %d.13 failed', i));
    assert(!typing.check(str(0), {}), util.format('case %d.14 failed', i));
    assert(!typing.check(str, function(){}), util.format('case %d.15 failed', i));
    assert(!typing.check(str(0,1000), function(){}), util.format('case %d.16 failed', i));

    console.log(util.format('test suit %d passed', i));
}

function test_array(i) {
    assert(typing.check(array, []), util.format('case %d.1 failed', i));
    assert(typing.check(array, [1, 'foo', {}, null]), util.format('case %d.2 failed', i));
    assert(!typing.check(array(str(1)), [null, 'foo']), util.format('case %d.3 failed', i));
    assert(!typing.check(array(str(3)), ['', 'foo']), util.format('case %d.4 failed', i));
    assert(!typing.check(array(str), [{}, 'foo']), util.format('case %d.5 failed', i));
    assert(!typing.check(array(str), [[], 'foo']), util.format('case %d.6 failed', i));
    assert(!typing.check(array(str(3,10)), [[], 'foo']), util.format('case %d.7 failed', i));
    assert(!typing.check(array(str(3,10)), [function(){}, 'foo']), util.format('case %d.8 failed', i));
    assert(typing.check(array(str(3,3)), ['foo', 'bar', 'pee', 'ijk']), util.format('case %d.9 failed', i));
    assert(!typing.check(array(array(str(3,3))), ['foo', 'bar', 'pee', 'ijk']), util.format('case %d.10 failed', i));
    assert(typing.check(array(array(str(3,3))), [['foo'], ['bar', 'pee', 'ijk']]), util.format('case %d.10 failed', i));
    assert(!typing.check(array, null), util.format('case %d.11 failed', i));
    assert(!typing.check(array(int), null), util.format('case %d.12 failed', i));

    console.log(util.format('test suit %d passed', i));
}

function test_tuple(i) {
    assert(typing.check(tuple(int(1,100), str(1,100), func), [50, 'foobar', function(){}]), util.format('case %d.1 failed', i));
    assert(!typing.check(tuple(int(1,100), str(1,100), func), [0, 'foobar', function(){}]), util.format('case %d.2 failed', i));
    assert(typing.check(tuple(int(1,100), str(1,100), tuple(str(11, 11), str(1))), 
        [100, 'foobar', ['13550013607', 'Tianfu Software Park C2']]), util.format('case %d.3 failed', i));
    assert(!typing.check(tuple(int(1,100), str(1,100), tuple(str(11, 11), str(1))), 
        [100, 'foobar', ['85432828', 'Tianfu Software Park C2']]), util.format('case %d.4 failed', i));
    assert(!typing.check(tuple(int(1,100), str(1,100), func), null), util.format('case %d.5 failed', i));
    assert(typing.check(tuple(int(1,100), str(1,100), {phone : str, address : str}), [23, 'todd', {phone : '13550013607', address : 'CD 5037'}])
        , util.format('case %d.6 failed', i));

    console.log(util.format('test suit %d passed', i));
}

function test_table(i) {
    assert(typing.check(table(int(1,100), str(1,1), str), [[1, 'h', 'host'], [2, 'p', null]]), util.format('case %d.1 failed', i)); 
    assert(!typing.check(table(int(1,100), str(1,1), str), null), util.format('case %d.2 failed', i)); 
    assert(!typing.check(table(int(1,100), str(1,1), str), [[1, 'h', 'host'], [2, 'port', null]]), util.format('case %d.3 failed', i)); 

    console.log(util.format('test suit %d passed', i));
}

function test_anonymous(i) {
    assert(typing.check({ id : int(1), name : str(1,20), score : int(0,100) }
        , { id : 1, name : 'todd', score : 98 }), util.format('case %d.1 failed', i));
    assert(!typing.check({ id : int(1), name : str(1,20), score : int(0,100) }
        , { id : 1, score : 6 }), util.format('case %d.2 failed', i));
    assert(typing.check({ id : int(1), name : str(1,20), score : int(0,100), contact : tuple(str(11,11), str(1)) }
        , { id : 1, score : 6, name : 'dagang', contact : ['13550013607', 'Tianfu Software Park C3'] }), util.format('case %d.3 failed', i));
    assert(!typing.check({ id : int(1), name : str(1,20), score : int(0,100), contact : tuple(str(11,11), str(1)) }
        , { id : 1, score : 6, contact : ['85432828', 'Tianfu Software Park C3'] }), util.format('case %d.4 failed', i));

    console.log(util.format('test suit %d passed', i));
}

function test_nullable(i) {
    assert(typing.check(nullable(str), null), util.format('case %d.1 failed', i));
    assert(typing.check(nullable(int), null), util.format('case %d.2 failed', i));
    assert(typing.check(nullable(bool), null), util.format('case %d.3 failed', i));
    assert(typing.check(nullable(func), null), util.format('case %d.4 failed', i));
    assert(typing.check(nullable(array), null), util.format('case %d.6 failed', i));
    assert(typing.check(nullable(tuple(int, str)), null), util.format('case %d.7 failed', i));
    assert(typing.check(nullable(table(int(1,10), str(0,1))), null), util.format('case %d.8 failed', i));

    console.log(util.format('test suit %d passed', i));
}

function test_int(i) {
    assert(!typing.check(int, null), util.format('case %d.1 failed', i));
    assert(!typing.check(int, 0.1), util.format('case %d.2 failed', i));
    assert(typing.check(int, 0.0), util.format('case %d.3 failed', i));
    assert(typing.check(int, 0), util.format('case %d.4 failed', i));
    assert(typing.check(int, 123), util.format('case %d.5 failed', i));
    assert(typing.check(int, -123), util.format('case %d.6 failed', i));
    assert(!typing.check(int(0,0), -1), util.format('case %d.7 failed', i));
    assert(typing.check(int(0,0), 0), util.format('case %d.8 failed', i));
    assert(!typing.check(int(0,0), 2), util.format('case %d.9 failed', i));
    assert(typing.check(int(0,10), 0), util.format('case %d.10 failed', i));
    assert(!typing.check(int(0,10), -1), util.format('case %d.11 failed', i));
    assert(typing.check(int(0,10), 10), util.format('case %d.12 failed', i));
    assert(!typing.check(int(0,10), 11), util.format('case %d.13 failed', i));
    assert(typing.check(int(-100,-10), -100), util.format('case %d.14 failed', i));
    assert(typing.check(int(-100,-10), -10), util.format('case %d.15 failed', i));
    assert(!typing.check(int(-100,-10), -101), util.format('case %d.16 failed', i));
    assert(!typing.check(int(-100,-10), -9), util.format('case %d.17 failed', i));
    assert(typing.check(int, 10000000000000000), util.format('case %d.18 failed', i));
    assert(typing.check(int, Math.pow(10,100)), util.format('case %d.19 failed', i));
    assert(typing.check(int, 1e8), util.format('case %d.20 failed', i));

    console.log(util.format('test suit %d passed', i));
}

function test_cmd_meta(i) {
    var t_cmd_meta = {
        program : str(1,30),
        version : int(1,100),
        version_name : str(1,30),
        subcommands : array(str(1)),
        options : {
            flags : table(str(0,1), str(2), str),
            parameters : table(str(0,1), str(2), str, or(str, int))
        },
        usages : table(str, array(str(1)), array(str(1)), str, func)
    };

    typing.define('t_cmd_meta', t_cmd_meta);

    var value = {
        program : 'adb',
        name : 'Android Debug Bridge',
        version : 10,
        version_name : '1.0.10',
        subcommands : [ 'connect', 'disconnect', 'shell', 'push', 'install' ], 
        options : {
            flags : [
                [ 'h', 'help', 'print program usage' ],
                [ 'r', 'reinstall', 'reinstall package' ],
                [ 'l', 'localhost', 'localhost' ]
            ],
            parameters : [
                [ null, 'host', 'adb server hostname or IP address', 'localhost' ],
                [ 'p', 'port', 'adb server port', 5037 ]
            ]
        },
        usages : [
            [ 'connect', ['host', '[port]'], [], 'connect to adb server', function(){} ],
            [ 'connect', [ 'l' ], [], 'connect to the local adb server', function(){} ],
            [ 'disconnect', [], [], 'disconnect from adb server', function(){} ],
            [ 'shell', [], ['[cmd]'], 'run shell commands', function(){} ],
            [ 'push', [], ['src', 'dest'], 'push file to adb server', function(){} ],
            [ 'install', ['r'], ['package'], 'install package', function(){} ],
            [ null, ['h'], [], 'help', function(){} ],
            [ null, [], [], 'help', function(){} ]
        ]
    };

    assert(typing.check('t_cmd_meta', value), util.format('case %d.1 failed', i));

    console.log(util.format('test suit %d passed', i));
}

function test_recursion(i) {
    var t_tree = {
        value : int,
        left : nullable(type('tree')),
        right : nullable(type('tree'))
    };

    typing.define('tree', t_tree);

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

    console.log(util.format('test suit %d passed', i));
}

// main
try {
    test_any(1);
    test_str(2);
    test_array(3);
    test_tuple(4);
    test_anonymous(5);
    test_table(6);
    test_nullable(7);
    test_int(8);
    test_cmd_meta(9);
    test_recursion(10);

    console.log("ALL TEST CASES PASSED");
}
catch (e) {
    console.error(e.stack);
}
