/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const { merge } = require("webpack-merge");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const WebpackBar = require('webpackbar');
const webpack = require("webpack");
const webpackConfigBase = require("./webpack.base.config");

const webpackConfigProd = {
    mode: "production",
    plugins: [
        new WebpackBar(),
        new webpack.DllReferencePlugin({
            manifest: path.resolve(__dirname, 'dist/dll', 'mainfist.json'),
        }),
        new HtmlWebpackTagsPlugin({
            // 绝对路径
            tags: ['dll/_dll_vendor.js'],
            append: false,
          }),
        // 打包分析
        // new BundleAnalyzerPlugin({
        //     analyzerMode: 'server',
        //     generateStatsFile: false,
        //     statsOptions: { source: false },
        // }),
    ],

};
module.exports = merge(webpackConfigBase, webpackConfigProd);