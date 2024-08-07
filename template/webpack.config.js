const path = require('path');
const glob = require("glob");

const entry = glob.sync("static/**/*.js")
    .reduce((x, y) => Object.assign(x, {
        [y]: "./" + y,
    }), {});


module.exports = {
  // Entry point for client-side code

  // Output configuration
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'static', "js"), // Output directory
  },

  // Module loaders for handling different file types
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime'],
          },
        },
      },
    ],
  },

};
