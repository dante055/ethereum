const path = require('path');

module.exports = {
  mode: 'development',
  entry: './client/src/utils.js',
  output: {
    path: path.resolve(__dirname, './client/public'),
    filename: 'bundle.js',
  },
};
