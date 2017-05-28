module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/build'
  },
  resolve: {
    extensions: [".js", ".ts"]
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'ws://localhost:3000',
        ws: true
      }
    }
  }
};