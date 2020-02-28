#!/usr/bin/env node

import * as program from 'commander';
import {Application} from './app/application';

const pkg = require('../package.json');

program
	.version(pkg.version);

program
	.command('start [path]')
	.description('Start scanning source files for dead code')
	.action((path) => {
		console.log('start action running at path', program.path);
		const options = {
			sourceFilePath: path
		};
		const app = new Application(options); //
		app.generate();
		console.log('unusedEntities=', app.unusedEntities);
	});

program
	.command('list [path]')
	.description('List the source files which will be scanned')
	.action((path) => {
		console.log('list command executed', path);
		const options = {
			sourceFilePath: path
		};
		const app = new Application(options);
		app.sourceFileNames.forEach((fileName) => {
			console.log(fileName);
		});
	});

program.parse(process.argv);
