const express = require('express');
const path = require('path');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

const app = express();
const OUTPUT_PATH = path.resolve(__dirname, 'out');
const compiler = webpack(webpackConfig);

app.use(express.static(OUTPUT_PATH));

compiler.watch({
  aggregateTimeout: 300,
  poll: true,
}, err => console.error(err));

app.listen(3000, () => console.log('App listening at 3000.'));
