"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var site_builder_1 = require("./site-builder");
/**
 * The default options. All paths are relative to package.json
 */
var defaultOptions = {
    outputPath: './graveyard-docs',
    copyFolders: ['./images', './css']
};
function buildSite(unusedFileEntities, options) {
    if (options === void 0) { options = defaultOptions; }
    var docsDirPath = path.join(path.dirname(require.main.filename), options.outputPath);
    // delete everything in the outputPath
    try {
        for (var _i = 0, _a = fs.readdirSync(docsDirPath); _i < _a.length; _i++) {
            var file = _a[_i];
            fs.rmdirSync(path.join(docsDirPath, file));
        }
    }
    catch (e) {
        console.error(e);
    }
    var html = site_builder_1.generateHtmlPage(unusedFileEntities);
    try {
        fs.mkdirSync(docsDirPath);
    }
    catch (e) {
        console.log('Directory already exists');
    }
    var docsPath = path.join(docsDirPath, 'index.html');
    console.log('docsPath=', docsPath);
    fs.writeFileSync(docsPath, html);
}
exports.buildSite = buildSite;
//# sourceMappingURL=builder.js.map