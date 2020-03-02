import {UnusedEntity, UnusedSourceFileEntity} from '../../types';

const defaultMeta = {
    lang: 'en',
    title: 'code-mortician Dead Code Report',
    style: './css/style.css',
    description: 'code-mortician Dead Code Report',
    author: 'The code-mortician Team',
    charset: 'utf-8'
};
let pageMetadata;

export function generateHtmlPage(unusedEntities: UnusedSourceFileEntity[], pageMeta = defaultMeta) {
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

function getLayoutHtml(unusedEntities: UnusedSourceFileEntity[]) {
  return `
<div class="siteContainer flex-row">
  <div class="header">${pageMetadata.title}</div>
  <div class="bottomLayout flex-column">
    <div class="sidebar flex-row">${getSidebarHtml(unusedEntities)}</div>
    <div class="content flex-row">${getContentHtml(unusedEntities)}</div>
  </div>
</div>
  `;
}

function getSidebarHtml(unusedEntities: UnusedSourceFileEntity[]) {
  let returnVal = ``;
  if (unusedEntities && unusedEntities.length) {
    unusedEntities.forEach((unusedFileEntity) => {
      returnVal += `
        <a href="#${unusedFileEntity.fileName}">${unusedFileEntity.fileName}</a>
      `;
    });
  }
  return returnVal;
}

function getContentHtml(unusedFileEntities: UnusedSourceFileEntity[]) {
  let returnVal = ``;
  if (unusedFileEntities && unusedFileEntities.length) {
    unusedFileEntities.forEach((unusedFileEntity) => {
      returnVal += `<a id="${unusedFileEntity.fileName}"></a>`;
      const props = Object.keys(unusedFileEntity).forEach((key) => {
        const unusedFileProp = unusedFileEntity[key];
        if (Array.isArray(unusedFileProp) && unusedFileProp.length) {
          unusedFileProp.forEach((unusedEntity) => {
            returnVal += `${getEntityHtml(unusedEntity)}`;
          });
        }
      });
    });
  }
  return returnVal;
}

function getEntityHtml(unusedEntity: UnusedEntity) {
  let returnVal = `  
<div class="unusedEntity flex">
  <h3>${unusedEntity.entityType}: ${unusedEntity.name}</h3>
  <div class="entityBody flex-row">
  `;
  Object.keys(unusedEntity).forEach((key) => {
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
