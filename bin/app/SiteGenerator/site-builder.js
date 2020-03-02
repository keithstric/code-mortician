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
    return "\n<div class=\"siteContainer flex-column\">\n  <div class=\"header flex-row\">" + pageMetadata.title + "</div>\n  <div class=\"bottomLayout flex-row\">\n    <div class=\"sidebar flex-column\">" + getSidebarHtml(unusedEntities) + "</div>\n    <div class=\"content flex-column\">" + getContentHtml(unusedEntities) + "</div>\n  </div>\n</div>\n  ";
}
function getSidebarHtml(unusedEntities) {
    var returnVal = "";
    if (unusedEntities && unusedEntities.length) {
        unusedEntities = unusedEntities.sort(function (a, b) {
            return a.fileName > b.fileName ? 1 : a.fileName < b.fileName ? -1 : 0;
        });
        unusedEntities.forEach(function (unusedFileEntity) {
            returnVal += "\n        <a href=\"#" + unusedFileEntity.fileName + "\" class=\"sidebarLink\" title=\"" + unusedFileEntity.filePath + "\">" + unusedFileEntity.fileName + "</a>\n      ";
        });
    }
    return returnVal;
}
function getContentHtml(unusedFileEntities) {
    var returnVal = "";
    if (unusedFileEntities && unusedFileEntities.length) {
        unusedFileEntities.sort(function (a, b) {
            return a.fileName > b.fileName ? 1 : a.fileName < b.fileName ? -1 : 0;
        });
        unusedFileEntities.forEach(function (unusedFileEntity) {
            returnVal += "<a id=\"" + unusedFileEntity.fileName + "\"></a>";
            var props = Object.keys(unusedFileEntity).forEach(function (key) {
                var unusedFileProp = unusedFileEntity[key];
                if (Array.isArray(unusedFileProp) && unusedFileProp.length) {
                    unusedFileProp = unusedFileProp.sort(function (a, b) {
                        return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
                    });
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
    var returnVal = "  \n<div class=\"unusedEntity flex-column\">\n  <h3>" + unusedEntity.entityType + ": " + unusedEntity.name + "</h3>\n  <div class=\"entityBody flex-column\">\n  ";
    var keys = Object.keys(unusedEntity).sort();
    keys.forEach(function (key) {
        returnVal += "\n    <div class=\"entityProperty\">\n      <span class=\"label\">" + key + ":</span>\n      <span class=\"value\">" + unusedEntity[key] + "</span>\n    </div>\n    ";
    });
    returnVal += "\n  </div>\n </div>\n  ";
    return returnVal;
}
//# sourceMappingURL=site-builder.js.map