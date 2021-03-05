/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge');

const webpackConfigBase = require("./webpack.base.config");

const isEnvProduction = process.env.NODE_ENV === 'production';

const webpackConfigDev = {
    devtool: 'cheap-module-source-map',
    devServer: {
        // contentBase: path.join(__dirname,'public'),
        // host: 'localhost',
        proxy: { // proxy URLs to backend development server
            '/api': {
                // target: 'http://localhost:8090',
                target: isEnvProduction ? 'http://todo.towardsky.top' : 'http://localhost:8089',
            },
        },
        port: 8083,
        historyApiFallback: true,
    },
    // plugins: [

        // new webpack.SourceMapDevToolPlugin({
        //     filename: '[name].js',
        //     test: /.(tsx?|jsx?|css|less|scss)$/,
        //     exclude: '/node_modules/',
        // })
    // ],
};
module.exports = merge(webpackConfigBase, webpackConfigDev);