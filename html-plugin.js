const fs = require('fs');
const path = require('path');

function HtmlPlugin ({ emitConfig, handlebars }) {
  // options contains the folder structure of apps
  // link texts for footer, see config.json
  this.emitConfig = emitConfig;
  this.handlebars = handlebars;
}

function emitFile ({ template, filePath, context }) {
  const fileContents = template(context);
  fs.writeFileSync(filePath, fileContents);
}

function getScriptTag (name, hash) {
  return `<script src="${name}.${hash}.js"></script>`;
}

function getContext (app, namedChunks, emitConfig) {
  const title = app.title;
  const sharedChunk = namedChunks[emitConfig.sharedBundle];
  let appChunk = namedChunks[app.folder];

  // sub app case as sub app names don't strictly match
  if (!appChunk) {
    const appChunkName = Object.keys(namedChunks).filter(n => n.match(app.folder))[0];
    appChunk = namedChunks[appChunkName];
  }
  const sharedScript = `${getScriptTag(app.isMain ? sharedChunk.name : `../../${sharedChunk.name}`, sharedChunk.renderedHash)}`; 
  const scripts = `${sharedScript}${getScriptTag(app.isMain ? app.folder : 'index', appChunk.renderedHash)}`;
  return { title, scripts };
}

HtmlPlugin.prototype.apply = function apply (compiler) {
  const emitConfig = this.emitConfig;
  const handlebars = this.handlebars;
  compiler.plugin('after-emit', (compilation) => {
    // create files
    const indexTemplate = fs.readFileSync(emitConfig.template);
    // send it via handlebars
    const template = handlebars.compile(indexTemplate.toString());
    const namedChunks = compilation && compilation.namedChunks;

    // emit the main app html
    emitFile({
      template,
      filePath: path.resolve(compilation.outputOptions.path, 'index.html'),
      context: getContext(emitConfig.apps.filter(a => a.isMain)[0], namedChunks, emitConfig),
    });

    // emit sub app htmls
    for (const prop in namedChunks) {
      emitConfig.apps.filter(a => !a.isMain).forEach((sub) => {
        if (prop.match(sub.folder)) {
          emitFile({
            template,
            filePath: path.resolve(compilation.outputOptions.path, `${prop}.html`),
            context: getContext(sub, namedChunks, emitConfig),
          });
        }
      });
    }
  });
};

module.exports = HtmlPlugin;
