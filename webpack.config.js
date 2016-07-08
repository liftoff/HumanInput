const webpack = require('webpack');
const path = require('path');
const VERSION = '"' + process.env.HI_VERSION + '"' || '"DEVELOPMENT RELEASE DO NOT USE IN PRODUCTION"';
var PROD = JSON.parse(process.env.PROD_ENV || '0');

module.exports = {
    entry: {
        'humaninput-full': "./src/humaninput-full.js",
        humaninput: "./src/humaninput.js",
    },
    output: {
        path: './build',
        filename: PROD ? '[name].min.js' : '[name].js',
        library: ["HumanInput", "[name]"],
        libraryTarget: "umd"
    },
    module: {
        loaders: [{
            test: /\.(js)$/,
            exclude: /node_modules/,
            loaders: [
                'expose?HumanInput',
                'babel-loader',
            ]
        }]
    },
    plugins: PROD ? [
        new webpack.DefinePlugin({
            __VERSION__: VERSION
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            output: {
                comments: false
            },
            sourceMap: false
        })
    ] : [
        new webpack.DefinePlugin({
            __VERSION__: VERSION
        })
    ],
};
