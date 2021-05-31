const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  target: 'node',
  mode: 'production',
  externals: [nodeExternals()],
  entry: [
    './src/bin/www'
  ],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index.js'
  },
  resolve: {
    extensions: [".js"]
  },
  node: {
    console: true,
    global: true,
    process: true,
    Buffer: true,
    __filename: true,
    __dirname: true,
    setImmediate: true,
    path: true
  },
  module: {
    rules: [
      {
        test: /.js/,
        // exclude: /(node_modules)/, // 新增
        use: ['babel-loader']
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin()
  ]
}