"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var defaultMeta = {
    lang: 'en',
    title: 'code-mortician Dead Code Report',
    style: './css/style.css',
    description: 'code-mortician Dead Code Report',
    author: 'The code-mortician Team',
    charset: 'utf-8'
};
var pageMetadata;
function generateHtmlPage(unusedEntities, pageMeta) {
    if (pageMeta === void 0) { pageMeta = defaultMeta; }
    pageMetadata = pageMeta;
    return "\n<!DOCTYPE html>\n<html lang=\"" + pageMeta.lang + "\">\n  <head>\n    <title>\n      " + pageMeta.title + "\n    </title>\n    <meta charset=\"" + pageMeta.charset + "\">\n    <meta name=\"description\" content=\"" + pageMeta.description + "\">\n    <meta name=\"author\" content=\"" + pageMeta.author + "\">\n    <link rel=\"stylesheet\" href=\"" + pageMeta.style + "\">\n  </head>\n  <body>\n    " + getLayoutHtml(unusedEntities) + "\n  </body>\n</html>\n  ";
}
exports.generateHtmlPage = generateHtmlPage;
function getLayoutHtml(unusedEntities) {
    return "\n<div class=\"siteContainer flex-row\">\n  <div class=\"header\">" + pageMetadata.title + "</div>\n  <div class=\"bottomLayout flex-column\">\n    <div class=\"sidebar flex-row\">" + getSidebarHtml(unusedEntities) + "</div>\n    <div class=\"content flex-row\">" + getContentHtml(unusedEntities) + "</div>\n  </div>\n</div>\n  ";
}
function getSidebarHtml(unusedEntities) {
    var returnVal = "";
    if (unusedEntities && unusedEntities.length) {
        unusedEntities.forEach(function (unusedFileEntity) {
            returnVal += "\n        <a href=\"#" + unusedFileEntity.fileName + "\">" + unusedFileEntity.fileName + "</a>\n      ";
        });
    }
    return returnVal;
}
function getContentHtml(unusedFileEntities) {
    var returnVal = "";
    if (unusedFileEntities && unusedFileEntities.length) {
        unusedFileEntities.forEach(function (unusedFileEntity) {
            returnVal += "<a id=\"" + unusedFileEntity.fileName + "\"></a>";
            var props = Object.keys(unusedFileEntity).forEach(function (key) {
                var unusedFileProp = unusedFileEntity[key];
                if (Array.isArray(unusedFileProp) && unusedFileProp.length) {
                    unusedFileProp.forEach(function (unusedEntity) {
                        returnVal += "" + getEntityHtml(unusedEntity);
                    });
                }
            });
        });
    }
    return returnVal;
}
function getEntityHtml(unusedEntity) {
    var returnVal = "  \n<div class=\"unusedEntity flex\">\n  <h3>" + unusedEntity.entityType + ": " + unusedEntity.name + "</h3>\n  <div class=\"entityBody flex-row\">\n  ";
    Object.keys(unusedEntity).forEach(function (key) {
        returnVal += "\n    <div class=\"entityProperty\">\n      <span class=\"label\">" + key + ":</span>\n      <span class=\"value\">" + unusedEntity[key] + "</span>\n    </div>\n    ";
    });
    returnVal += "\n  </div>\n </div>\n  ";
    return returnVal;
}
//# sourceMappingURL=site-builder.js.map