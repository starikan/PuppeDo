module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        targets: {
          node: 12,
        },
        corejs: 3,
        // debug: true,
      },
    ],
    '@babel/preset-typescript',
  ],
};
