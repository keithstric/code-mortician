#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require("commander");
var application_1 = require("./app/application");
var pkg = require('../package.json');
// Handler for embalm
program
    .version(pkg.version);
// Handler for start
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
program.parse(process.argv);
//# sourceMappingURL=index-cli.js.map