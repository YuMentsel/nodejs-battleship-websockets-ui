import path from 'node:path';

export default {
  mode: 'production',
  entry: './index',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    clean: true,
    filename: 'index.js',
    path: path.resolve(__dirname, './dist'),
  },
};
