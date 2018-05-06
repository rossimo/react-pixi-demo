const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: 'development',
    devServer: {
        host: '0.0.0.0'
    },
    context: path.resolve(__dirname, 'src'),
    entry: {
        game: './index.tsx',
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader'
        }]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json']
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: 'index.html'
        }, {
            from: 'resources/*'
        }])
    ]
};
