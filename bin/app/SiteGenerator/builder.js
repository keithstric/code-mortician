"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-extra");
var path = require("path");
var rimraf = require("rimraf");
var site_builder_1 = require("./site-builder");
var defaultOptions = {
    outputPath: 'graveyard-docs',
    copyFolders: ['./css']
};
/**
 * Construct the html and create the appropriate files
 * @param unusedFileEntities
 * @param options
 */
function buildSite(unusedFileEntities, options) {
    if (options === void 0) { options = defaultOptions; }
    var outputPath = options.outputPath;
    console.log("Writing documentation to " + outputPath);
    // delete everything in the outputPath
    if (fs.existsSync(outputPath)) {
        try {
            rimraf.sync(outputPath);
        }
        catch (e) {
            console.error('Error Deleting output path', e);
        }
    }
    // Generate the html and dump into the output path
    var html = site_builder_1.generateHtmlPage(unusedFileEntities);
    try {
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath);
        }
        var docsPath = path.join(outputPath, 'index.html');
        fs.writeFileSync(docsPath, html);
    }
    catch (e) {
        console.error('Error creating output path', e);
    }
    // Copy the asset folders to the output path
    try {
        for (var _i = 0, _a = options.copyFolders; _i < _a.length; _i++) {
            var folder = _a[_i];
            var assetFolderPath = path.join(path.dirname(require.main.filename), folder);
            var destFolderPath = path.join(outputPath, folder);
            if (fs.existsSync(assetFolderPath)) {
                fs.copySync(assetFolderPath, destFolderPath);
            }
        }
    }
    catch (e) {
        console.error('Error copying asset directories', e);
    }
}
exports.buildSite = buildSite;
//# sourceMappingURL=builder.js.map