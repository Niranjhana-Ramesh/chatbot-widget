const path = require('path');

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
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
