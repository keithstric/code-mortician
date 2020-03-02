import {UnusedSourceFileEntity} from "../../types";
import * as fs from 'fs';
import * as path from 'path';
import {generateHtmlPage} from "./site-builder";

/**
 * The default options. All paths are relative to package.json
 */
const defaultOptions = {
	outputPath: './graveyard-docs',
	copyFolders: ['./images', './css']
};

export function buildSite(unusedFileEntities: UnusedSourceFileEntity[], options = defaultOptions) {
	const docsDirPath = path.join(path.dirname(require.main.filename), options.outputPath);
	// delete everything in the outputPath
	try {
		for (let file of fs.readdirSync(docsDirPath)) {
			fs.rmdirSync(path.join(docsDirPath, file));
		}
	}catch(e) {
		console.error(e);
	}

	const html = generateHtmlPage(unusedFileEntities);
	try {
		fs.mkdirSync(docsDirPath);
	}catch(e) {
		console.log('Directory already exists');
	}
	const docsPath = path.join(docsDirPath, 'index.html');
	console.log('docsPath=', docsPath);
	fs.writeFileSync(docsPath, html);
}
