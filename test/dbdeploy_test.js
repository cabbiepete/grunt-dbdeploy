'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.dbdeploy = {
  setUp: function(done) {
    // setup here if necessary

    this.dbDeployTask = require('../tasks/dbdeploy.js');
    done();
  },
  taskCheck: function(test) {
    test.expect(2);

    test.notStrictEqual(this.dbDeployTask, undefined, 'the dbdeploy task should be defined');
    test.equal(typeof this.dbDeployTask, "function", 'the dbdeploy task should be a function');
    test.done();

  },
  default_options: function(test) {
    test.expect(1);

    var actual_deploy = grunt.file.read('tmp/default_options_deploy.sql');
    var expected_deploy = grunt.file.read('test/expected/default_options_deploy.sql');
    test.equal(actual_deploy, expected_deploy, 'should describe what the default behavior is.');

    test.done();
  },
/*  custom_options: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/custom_options');
    var expected = grunt.file.read('test/expected/custom_options');
    test.equal(actual, expected, 'should describe what the custom option(s) behavior is.');

    test.done();
  },*/
};
