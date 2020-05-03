module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        targets: {
          node: 4,
        },
        corejs: 3,
        // debug: true,
      },
    ],
    '@babel/preset-typescript',
  ],
  // plugins: ['@babel/proposal-class-properties', '@babel/proposal-object-rest-spread'],
};
