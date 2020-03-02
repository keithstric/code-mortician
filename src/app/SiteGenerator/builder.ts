import {DeadSourceFileEntity} from "../../types";
import * as fs from 'fs-extra';
import * as path from 'path';
import * as rimraf from 'rimraf';
import {generateHtmlPage} from "./site-builder";

const defaultOptions = {
	outputPath: 'graveyard-docs',
	copyFolders: ['./css']
};

/**
 * Construct the html and create the appropriate files
 * @param unusedFileEntities
 * @param options
 */
export function buildSite(unusedFileEntities: DeadSourceFileEntity[], options = defaultOptions) {
	const {outputPath} = options;
	console.log(`Writing documentation to ${outputPath}`);

	// delete everything in the outputPath
	if (fs.existsSync(outputPath)) {
		try {
			rimraf.sync(outputPath);
		}catch(e) {
			console.error('Error Deleting output path', e);
		}
	}
	// Generate the html and dump into the output path
	const html = generateHtmlPage(unusedFileEntities);
	try {
		if (!fs.existsSync(outputPath)) {
			fs.mkdirSync(outputPath);
		}
		const docsPath = path.join(outputPath, 'index.html');
		fs.writeFileSync(docsPath, html);
	}catch(e) {
		console.error('Error creating output path', e);
	}
	// Copy the asset folders to the output path
	try {
		for (let folder of options.copyFolders) {
			const assetFolderPath = path.join(path.dirname(require.main.filename), folder);
			const destFolderPath = path.join(outputPath, folder);
			if (fs.existsSync(assetFolderPath)) {
				fs.copySync(assetFolderPath, destFolderPath);
			}
		}
	}catch(e) {
		console.error('Error copying asset directories', e);
	}
}
