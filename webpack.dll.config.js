/* eslint-disable @typescript-eslint/no-var-requires */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

// 只需要使用yarn run dll一次就行
module.exports = {
  mode: 'production',
  entry: {
    // 这里把react方面的东西和babel放到这里
    vendor: ['react', 'react-dom', 'react-router-dom', 'react-redux'],
  },
  output: {
    filename: 'dll/_dll_[name].js',
    path: path.resolve(__dirname, 'dist'),
    library: '_dll_[name]',
  },
  plugins: [
    new CleanWebpackPlugin(), // 删除dll目录下的文件
    new webpack.DllPlugin({
      name: '_dll_[name]',
      path: path.resolve(__dirname, 'dist/dll', 'mainfist.json'),
    }),
  ],
};
