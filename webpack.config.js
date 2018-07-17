const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    app: [
      // './src/index.ts'
      './src/fiber.test.ts'
    ]
  },
  resolve: {
    extensions: ['.js', '.ts'],
    modules: [
      './src',
      './node_modules',
    ],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          'ts-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'body',
    }),
  ],
  devServer: {
    port: '12346',
    contentBase: './build',
    watchContentBase: true,
    stats: { colors: true },
  },
};
