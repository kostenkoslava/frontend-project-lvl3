const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  target: 'node',
  entry: {
    main: path.resolve(__dirname, './src/index.js'),
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'RSS agregator',
      template: path.resolve(__dirname, './src/template.html'),
      filename: 'index.html',

    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};