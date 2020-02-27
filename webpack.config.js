const path = require('path');
const HtmlWebPlugin = require('html-webpack-plugin'); // creating html file
const CopyPlugin = require('copy-webpack-plugin'); // copy files 
const ImageminPlugin = require('imagemin-webpack-plugin').default
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // This plugin extracts CSS into separate files. It creates a CSS file per JS file which contains CSS. It supports On-Demand-Loading of CSS and SourceMaps.
const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: './src/app.js',
  performance: {
    maxEntrypointSize: 1000000, // 1 mb,
    maxAssetSize: 5000000 // 5 mb
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/main.js'
  },
  mode: 'develpment',
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new HtmlWebPlugin({
      filename: 'index.html',
      template: './src/index.html',
      title: 'Basic webpack app for vanilla js projects by SteelRay'
    }),
    new CopyPlugin([{
      from: path.resolve(__dirname, './src/assets'),
      to: path.resolve(__dirname, './dist/assets'),
      // ignore: ['*.sql'] // do not copy 
    }]),
    new ImageminPlugin({
      test: /\.(jpe?g|png|gif|svg)$/i
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: devMode ? 'css/[name].min.css' : '[name].[hash].css', // output path/name
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
    }),
  ],
  module: {
    rules: [{
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [{
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          {
            loader: 'css-loader',
            options: {
              url: false
            }
          },
          // 'postcss-loader', // more about https://postcss.org/
          {
            loader: 'sass-loader',
            options: {
              includePaths: [path.resolve(__dirname, './node_modules'),
                path.resolve(__dirname, './src/sass')
              ],
              importLoaders: 1
            }
          },
        ],
      },
    ]
  }
}