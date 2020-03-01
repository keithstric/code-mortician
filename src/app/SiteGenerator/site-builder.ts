import {UnusedSourceFileEntity} from '../../types';

const defaultMeta = {
    lang: 'en',
    title: 'code-mortician Dead Code Report',
    style: './css/style.css',
    description: 'code-mortician Dead Code Report',
    author: 'Keith Strickland',
    charset: 'utf-8'
};

export function generatePage(unusedEntities: UnusedSourceFileEntity[], pageMeta = defaultMeta) {
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
  
  </body>
</html>
  `;
}
