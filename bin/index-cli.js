#!/usr/bin/env node
"use strict";
/**
 * This file sets up the commander cli interface
 */
Object.defineProperty(exports, "__esModule", { value: true });
var program = require("commander");
var application_1 = require("./app/application");
var pkg = require('../package.json');
// Handler for embalm
program
    .version(pkg.version)
    .action(function () {
    var projectPath = process.cwd();
    console.log('start action running at path', projectPath);
    var options = {
        sourceFilePath: projectPath
    };
    var app = new application_1.Application(options); //
    app.generate();
});
// Handler for start
// program
// 	.command('start [projectPath]')
// 	.description('Start scanning source files for dead code')
// 	.action((projectPath) => {
// 		console.log('start action running at path', program.projectPath);
// 		const options = {
// 			sourceFilePath: projectPath
// 		};
// 		const app = new Application(options); //
// 		app.generate();
// 	});
program.parse(process.argv);
//# sourceMappingURL=index-cli.js.map