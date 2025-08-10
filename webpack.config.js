const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/widget.js',
  output: {
    filename: 'chatbot-widget.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'ChatbotWidget',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, // Extracts CSS into separate file
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'chatbot-widget.css'
    })
  ]
};
