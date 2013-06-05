/*
 * grunt-dbdeploy
 * https://github.com/cabbiepete/grunt-dbdeploy
 *
 * Copyright (c) 2013 Peter Simmons
 * Licensed under the MIT license.
 */

'use strict';

var util = require('util');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('dbdeploy', 'Your task description goes here.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      dbConnection: {
        driver: 'mysql',
        user: 'root',
        password: '',
        dsn: {
          host: 'localhost',
          port: '3306',
          dbname: ''
        }
      },
      changelogTableName: 'changelog',
      deltaSet: 'Main',
      deployFileSuffix: '_deploy.sql',
      undeployFileSuffix: '_undeploy.sql',
      undoSeperator: '--//@UNDO'
    });

    // this.files points at our deltas
    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Split each file
      var deploy_undeploy = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files.
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } 
        else if (grunt.file.read(filepath).indexOf(options.undoSeperator) === -1) {
          grunt.log.warn('Source file "' + filepath + '" undo seperator "' + options.undoSeperator +'" not found.');
          return false;
        }
        else {
          return true;
        }
      }).map(function(filepath) {
        // Read file source and return deploy/undeploy parts
        var filepathParts = filepath.split('/');
        var filename = filepathParts[filepathParts.length - 1];
        var changeNumber = parseInt(filename, 0);

        var changelogInsert = "INSERT INTO "+options.changelogTableName+" (`change_number`, `delta_set`, `start_dt`, `applied_by`, `description`) VALUES ("+changeNumber+", '"+options.deltaSet+"', NOW(), 'grunt-dbdeploy', '"+filepath+" deploy');";

        var changeLogCompleteUpdate = "UPDATE "+options.changelogTableName+" SET `complete_dt` = NOW();\n";

        var parts = grunt.file.read(filepath).split(options.undoSeperator);
        
        var deploy = "--  "+filepath+" deploy\n"+changelogInsert+"\n\n"+parts[0]+"\n"+changeLogCompleteUpdate+"\n";

        var undeploy = parts[1];
        
        return [deploy, undeploy];
      });//.join(grunt.util.normalizelf(options.separator));

      grunt.log.writeln(util.format("parts = ", deploy_undeploy));

      var deploy = '', undeploy = '';
      for (var i = 0; i < deploy_undeploy.length; i += 1) {
        deploy += deploy_undeploy[i][0];
        undeploy += deploy_undeploy[i][1];
      }

      grunt.log.writeln('deploy: '+deploy+' undeploy: '+undeploy);

      // Write the deploy file.
      var deployFile = f.dest+options.deployFileSuffix;
      grunt.file.write(deployFile, deploy);
      // Print a success message.
      grunt.log.writeln('File "' + deployFile + '" created.');

      // Write the undeploy file.
      var undeployFile = f.dest+options.undeployFileSuffix;
      grunt.file.write(undeployFile, undeploy);

      // Print a success message.
      grunt.log.writeln('File "' + undeployFile + '" created.');

    });
  });

};
