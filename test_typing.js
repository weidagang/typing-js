#!/usr/bin/env node

// dependencies
var util = require('util');
var assert = require('assert');
var typing = require('./typing.js');
var t_any = typing.t_any;
var t_null = typing.t_null;
var t_nonnull = typing.t_nonnull;
var t_func = typing.t_func;
var t_int = typing.t_int;
var t_str = typing.t_str;
var t_array = typing.t_array;
var t_tuple = typing.t_tuple;
var t_table = typing.t_table;
var t_or = typing.t_or;
var t_and = typing.t_and;

// test case
function test_1() {
    var t_cmd_meta = {
        program : t_str(1,30),
        version : t_int(1,100),
        version_name : t_str(1,30),
        subcommands : t_array(t_str(1)),
        options : {
            flags : t_table(t_str(0,1), t_str(2), t_str),
            parameters : t_table(t_str(0,1), t_str(2), t_str, t_or(t_str, t_int))
        },
        usages : t_table(t_str, t_array(t_str(1)), t_array(t_str(1)), t_str, t_func)
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

    var matched = typing.check('t_cmd_meta', value);

    console.log('Result: ' + matched);
}

function test_t_any(i) {
    console.log('t_any: ' + typeof(t_any));
    assert(typing.check(t_any, null), util.format('case %d.1 failed', i));
    assert(typing.check(t_any, ''), util.format('case %d.2 failed', i));
    assert(typing.check(t_any, 'hello typing.js'), util.format('case %d.3 failed', i));
    assert(typing.check(t_any, function() {}), util.format('case %d.4 failed', i));
    assert(typing.check(t_any, [1,2,3]), util.format('case %d.5 failed', i));
    assert(typing.check(t_any, {}), util.format('case %d.6 failed', i));
}

function test_t_str(i) {
    assert(typing.check(t_str(0,0), null), util.format('case %d.1 failed', i));
    assert(typing.check(t_str(0,0), ''), util.format('case %d.2 failed', i));
    assert(typing.check(t_str(0,1), null), util.format('case %d.3 failed', i));
    assert(typing.check(t_str(0,1), ''), util.format('case %d.4 failed', i));
    assert(typing.check(t_str(1,1), 'q'), util.format('case %d.5 failed', i));
    assert(!typing.check(t_str(1,1), null), util.format('case %d.6 failed', i));
    assert(!typing.check(t_str(1,30), ''), util.format('case %d.7 failed', i));
    assert(!typing.check(t_str(1,5), 'hello world'), util.format('case %d.8 failed', i));
    assert(typing.check(t_str(1,5), 'hello'), util.format('case %d.9 failed', i));
    assert(typing.check(t_str(1), 'hello'), util.format('case %d.10 failed', i));
    assert(!typing.check(t_str(10), 'hello'), util.format('case %d.11 failed', i));
    assert(!typing.check(t_str, ['a', 'b', 'c']), util.format('case %d.11 failed', i));
    assert(!typing.check(t_str(0), ['a']), util.format('case %d.12 failed', i));
    assert(!typing.check(t_str, {}), util.format('case %d.13 failed', i));
    assert(!typing.check(t_str(0), {}), util.format('case %d.14 failed', i));
    assert(!typing.check(t_str, function(){}), util.format('case %d.15 failed', i));
    assert(!typing.check(t_str(0,1000), function(){}), util.format('case %d.16 failed', i));
}

function test_t_array(i) {
    assert(typing.check(t_array, []), util.format('case %d.1 failed', i));
    assert(typing.check(t_array, [1, 'foo', {}, null]), util.format('case %d.2 failed', i));
    assert(!typing.check(t_array(t_str(1)), [null, 'foo']), util.format('case %d.3 failed', i));
    assert(!typing.check(t_array(t_str(3)), ['', 'foo']), util.format('case %d.4 failed', i));
    assert(!typing.check(t_array(t_str), [{}, 'foo']), util.format('case %d.5 failed', i));
    assert(!typing.check(t_array(t_str), [[], 'foo']), util.format('case %d.6 failed', i));
    assert(!typing.check(t_array(t_str(3,10)), [[], 'foo']), util.format('case %d.7 failed', i));
    assert(!typing.check(t_array(t_str(3,10)), [function(){}, 'foo']), util.format('case %d.8 failed', i));
    assert(typing.check(t_array(t_str(3,3)), ['foo', 'bar', 'pee', 'ijk']), util.format('case %d.9 failed', i));
    assert(!typing.check(t_array(t_array(t_str(3,3))), ['foo', 'bar', 'pee', 'ijk']), util.format('case %d.10 failed', i));
    assert(typing.check(t_array(t_array(t_str(3,3))), [['foo'], ['bar', 'pee', 'ijk']]), util.format('case %d.10 failed', i));
}

function test_t_tuple(i) {
    assert(typing.check(t_tuple(t_int(1,100), t_str(1,100), t_func), [50, 'foobar', function(){}]), util.format('case %d.1 failed', i));
    assert(!typing.check(t_tuple(t_int(1,100), t_str(1,100), t_func), [0, 'foobar', function(){}]), util.format('case %d.2 failed', i));
    assert(typing.check(t_tuple(t_int(1,100), t_str(1,100), t_tuple(t_str(11, 11), t_str(1))), 
        [100, 'foobar', ['13550013607', 'Tianfu Software Park C2']]), util.format('case %d.3 failed', i));
    assert(!typing.check(t_tuple(t_int(1,100), t_str(1,100), t_tuple(t_str(11, 11), t_str(1))), 
        [100, 'foobar', ['85432828', 'Tianfu Software Park C2']]), util.format('case %d.4 failed', i));
}

function test_t_table(i) {
    assert(typing.check(t_table(t_int(1,100), t_str(1,1), t_str), [[1, 'h', 'host'], [2, 'p', null]]), util.format('case %d.1 failed', i)); 
    assert(!typing.check(t_table(t_int(1,100), t_str(1,1), t_str), [[1, 'h', 'host'], [2, 'port', null]]), util.format('case %d.1 failed', i)); 
}

function test_t_anonymous(i) {
    console.log('case 5.1');
    assert(typing.check({ id : t_int(1), name : t_str(1,20), score : t_int(0,100) }
        , { id : 1, name : 'todd', score : 98 }), util.format('case %d.1 failed', i));
    assert(!typing.check({ id : t_int(1), name : t_str(1,20), score : t_int(0,100) }
        , { id : 1, score : 6 }), util.format('case %d.2 failed', i));
    assert(typing.check({ id : t_int(1), name : t_str(1,20), score : t_int(0,100), contact : t_tuple(t_str(11,11), t_str(1)) }
        , { id : 1, score : 6, name : 'dagang', contact : ['13550013607', 'Tianfu Software Park C3'] }), util.format('case %d.3 failed', i));
    assert(!typing.check({ id : t_int(1), name : t_str(1,20), score : t_int(0,100), contact : t_tuple(t_str(11,11), t_str(1)) }
        , { id : 1, score : 6, contact : ['85432828', 'Tianfu Software Park C3'] }), util.format('case %d.4 failed', i));
}

try {
    console.log(util.format('hello %s', 'typing.js'));
    test_t_any(1);
    test_t_str(2);
    test_t_array(3);
    test_t_tuple(4);
    test_t_anonymous(5);
    test_t_table(6);
    test_1();

    console.log("ALL TEST CASES PASSED");
}
catch (e) {
    console.error(e.stack);
}
