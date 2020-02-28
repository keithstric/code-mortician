#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require("commander");
var application_1 = require("./app/application");
var pkg = require('../package.json');
program
    .version(pkg.version);
program
    .command('start [path]')
    .description('Start scanning source files for dead code')
    .action(function (path) {
    console.log('start action running at path', program.path);
    var options = {
        sourceFilePath: path
    };
    var app = new application_1.Application(options); //
    app.generate();
    console.log('unusedEntities=', app.unusedEntities);
});
program
    .command('list [path]')
    .description('List the source files which will be scanned')
    .action(function (path) {
    console.log('list command executed', path);
    var options = {
        sourceFilePath: path
    };
    var app = new application_1.Application(options);
    app.sourceFileNames.forEach(function (fileName) {
        console.log(fileName);
    });
});
program.parse(process.argv);
//# sourceMappingURL=index-cli.js.map