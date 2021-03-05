/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const getPublicPath = require('./config/index');

const isEnvProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isEnvProduction ? 'production' : 'development',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: getPublicPath(),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: '/node_modules/',
        use: {
          loader: 'awesome-typescript-loader',
        },
      },
      {
        test: /\.jsx?$/,
        exclude: '/node_modules/',
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.html?$/,
        use: {
          loader: 'html-loader',
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
        // use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
          },
          {
            loader: "less-loader",
            options: {
              lessOptions: { // 如果使用less-loader@5，请移除 lessOptions 这一级直接配置选项。
                modifyVars: {
                  'primary-color': '#008000cc',
                },
                javascriptEnabled: true,
              },
            },
          },
        ],
        // exclude: '/node_modules/',
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          // {
          //     loader: 'url-loader',
          //     options: {
          //         limit: 100000,
          //         name: '[name].[ext]',
          //         outputPath: './static',
          //         pulicPath: '/static',
          //     },
          // },
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: './static',
              pulicPath: '/static',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'bundle.css',
    }),
    new HtmlWebPackPlugin({
      title: 'my app',
      filename: 'index.html',
      template: 'public/index.html',
    }),
    // 将dll生成的_dll_vendor.js 引入到index.html
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/imgs', to: 'static' },
      ],
    }),
    // new webpack.SourceMapDevToolPlugin({
    //     filename: '[name].js',
    //     test: /.(tsx?|jsx?|css|less|scss)$/,
    //     exclude: '/node_modules/',
    // })
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: true,
        },
      }),
      // 压缩css
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
};
