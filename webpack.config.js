const path = require('path');

module.exports = {
  cache: true,
  entry: {
    main: './src/index.ts',
  },
  devtool: '#source-map',
  mode: 'production',
  target: 'node',
  node: {
    __filename: true,
    __dirname: true,
  },
  module: {
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
    minimize: true,
    namedModules: true,
    namedChunks: true,
    // usedExports: true,
    // splitChunks: {
    //   chunks: 'all',
    // },
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
};
