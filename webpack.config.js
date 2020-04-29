const path = require('path');

module.exports = {
  entry: './src/index.ts',
  devtool: '#source-map',
  externals: {
    // lodash : {
    //   commonjs: 'lodash',
    //   amd: 'lodash',
    //   root: '_' // indicates global variable
    // }
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  optimization: {
    minimize: false,
    // children: true,
    namedModules: true,
    namedChunks: true,
    // splitChunks: {
    //   chunks: 'all',
    // },
  },
  // experiments: {
  //   outputModule: true,
  // },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
};
