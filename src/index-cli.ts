#!/usr/bin/env node
/**
 * This file sets up the commander cli interface
 */

import * as program from 'commander';
import {Application} from './app/application';

const pkg = require('../package.json');

// Handler for embalm
program
	.version(pkg.version)
	.action(() => {
		const projectPath = process.cwd();
		console.log('start action running at path', projectPath);
		const options = {
			sourceFilePath: projectPath
		};
		const app = new Application(options);
		app.generate();
	});

program.parse(process.argv);
