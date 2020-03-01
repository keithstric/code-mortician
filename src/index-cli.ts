#!/usr/bin/env node

import * as program from 'commander';
import {Application} from './app/application';

const pkg = require('../package.json');

// Handler for embalm
program
	.version(pkg.version);

// Handler for start
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

program.parse(process.argv);
