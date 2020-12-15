const path = require('path');

const getPath = (...p) => path.resolve(process.cwd(), ...p);

module.exports = {
  mode: 'production',
  entry: getPath('src', 'index.ts'),
  output: {
    libraryTarget: 'system',
    filename: 'storasy.production.js',
    path: getPath('dist', 'system'),
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.(m?js|jsx|tsx|ts)$/,
        include: getPath('src'),
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: false,
            },
          },
        ],
      },
    ],
  },
};
