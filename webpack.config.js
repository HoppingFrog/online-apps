const path = require('path');
const fs = require('fs');
const autoprefixer = require('autoprefixer');
const precss = require('precss');
const webpack = require('webpack');
const HtmlPlugin = require('./html-plugin');
const exec = require('child_process').exec;
const emitConfig = require('./config.json');
const handlebars = require('handlebars');

const isDevelopment = process.env.NODE_ENV !== 'production';

const appDir = path.resolve(__dirname, './app');
const app = './app';
const dependencies = Object.keys(require('./package.json').dependencies);

// clean the `out` folder
exec('rm -rf out/*');

function isDirectory (dir) {
  return fs.lstatSync(dir).isDirectory();
}

// main app + sub-apps + vendor code entry chunking
const allEntries = fs.readdirSync(appDir)
  .filter(sub => isDirectory(path.resolve(app, sub)))
  .reduce((prev, curr) => {
    const newPrev = Object.assign({}, prev); // because eslint :/
    newPrev[`${app}/${curr}/index`] = path.join(appDir, curr);
    return newPrev;
  }, {
    app,
    shared: dependencies,
  });

const config = {
  entry: allEntries,

  output: {
    path: path.resolve(__dirname, 'out'),
    filename: '[name].[chunkhash].js',
    chunkFilename: '[id].chunk.js',
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
      { test: /\.css$/, exclude: /node_modules/, loader: 'style-loader!css-loader!postcss-loader' },
      { test: /\.woff(2)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
      { test: /\.ttf$/, loader: 'file' },
      { test: /\.eot$/, loader: 'file' },
      { test: /\.svg$/, loader: 'file' },
    ],
  },

  // TODO: add browser list
  postcss: () => [autoprefixer, precss],

  devtool: 'source-map',

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({ name: 'shared' }),
    new HtmlPlugin({ emitConfig, handlebars }),
  ],

  resolve: {
    alias: {
      react: 'preact-compat',
      'react-dom': 'preact-compat',
    },
  },
};

if (!isDevelopment) {
  delete config.devtool;

  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      comments: false,
    }));
}

module.exports = config;
