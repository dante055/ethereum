const path = require('path');
module.exports = {
  mode: 'development',
  entry: './client/src/app.js',
  output: {
    path: path.resolve(__dirname, '.client/public'),
    filename: 'bundle.js',
  },
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, './client/public'),
    compress: true,
    port: 9000,
  },
};
