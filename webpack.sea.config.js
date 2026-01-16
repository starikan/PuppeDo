const path = require('path');

module.exports = {
  cache: true,
  entry: {
    main: './index.js',
  },
  devtool: false, // no source maps for SEA
  mode: 'production',
  target: 'node',
  node: {
    __filename: false,
    __dirname: false,
  },
  externals: [
    'playwright',
    'puppeteer',
  ],
  module: {
    exprContextCritical: false,  // Отключает warnings о dynamic requires
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  optimization: {
    minimize: false,
  },
  output: {
    filename: 'sea.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
};