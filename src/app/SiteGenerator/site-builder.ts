import {DeadEntity, DeadSourceFileEntity} from '../../types';

const defaultMeta = {
    lang: 'en',
    title: 'code-mortician Dead Code Report',
    style: './css/style.css',
    description: 'code-mortician Dead Code Report',
    author: 'The code-mortician Team',
    charset: 'utf-8'
};
let pageMetadata;

export function generateHtmlPage(unusedEntities: DeadSourceFileEntity[], pageMeta = defaultMeta) {
  pageMetadata = pageMeta;
  return `
<!DOCTYPE html>
<html lang="${pageMeta.lang}">
  <head>
    <title>
      ${pageMeta.title}
    </title>
    <meta charset="${pageMeta.charset}">
    <meta name="description" content="${pageMeta.description}">
    <meta name="author" content="${pageMeta.author}">
    <link rel="stylesheet" href="${pageMeta.style}">
  </head>
  <body>
    ${getLayoutHtml(unusedEntities)}
  </body>
</html>
  `;
}

function getLayoutHtml(unusedEntities: DeadSourceFileEntity[]) {
  return `
<div class="siteContainer flex-column">
  <div class="header flex-row">${pageMetadata.title}</div>
  <div class="bottomLayout flex-row">
    <div class="sidebar flex-column">${getSidebarHtml(unusedEntities)}</div>
    <div class="content flex-column">${getContentHtml(unusedEntities)}</div>
  </div>
</div>
  `;
}

function getSidebarHtml(unusedEntities: DeadSourceFileEntity[]) {
  let returnVal = ``;
  if (unusedEntities && unusedEntities.length) {
    unusedEntities = unusedEntities.sort((a, b) => {
      return a.fileName > b.fileName ? 1 : a.fileName < b.fileName ? -1 : 0;
    });
    unusedEntities.forEach((unusedFileEntity) => {
      returnVal += `
        <a href="#${unusedFileEntity.fileName}" class="sidebarLink" title="${unusedFileEntity.filePath}">${unusedFileEntity.fileName}</a>
      `;
    });
  }
  return returnVal;
}

function getContentHtml(unusedFileEntities: DeadSourceFileEntity[]) {
  let returnVal = ``;
  if (unusedFileEntities && unusedFileEntities.length) {
    unusedFileEntities.sort((a, b) => {
      return a.fileName > b.fileName ? 1 : a.fileName < b.fileName ? -1 : 0;
    });
    unusedFileEntities.forEach((unusedFileEntity) => {
      returnVal += `<a id="${unusedFileEntity.fileName}"></a>`;
      const props = Object.keys(unusedFileEntity).forEach((key) => {
        let unusedFileProp: DeadEntity[] = unusedFileEntity[key];
        if (Array.isArray(unusedFileProp) && unusedFileProp.length) {
          unusedFileProp = unusedFileProp.sort((a, b) => {
            return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
          });
          unusedFileProp.forEach((unusedEntity) => {
            returnVal += `${getEntityHtml(unusedEntity)}`;
          });
        }
      });
    });
  }
  return returnVal;
}

function getEntityHtml(unusedEntity: DeadEntity) {
  let returnVal = `  
<div class="unusedEntity flex-column">
  <h3>${unusedEntity.entityType}: ${unusedEntity.name}</h3>
  <div class="entityBody flex-column">
  `;
  const keys = Object.keys(unusedEntity).sort();
  keys.forEach((key) => {
    returnVal += `
    <div class="entityProperty">
      <span class="label">${key}:</span>
      <span class="value">${unusedEntity[key]}</span>
    </div>
    `;
  });
  returnVal += `
  </div>
 </div>
  `;
  return returnVal;
}
