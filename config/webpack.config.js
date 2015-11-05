var webpack = require('webpack');

var DedupePlugin = webpack.optimize.DedupePlugin;
var OccurenceOrderPlugin = webpack.optimize.OccurenceOrderPlugin;
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

var plugins = [
    new DedupePlugin(),
    new OccurenceOrderPlugin()
];

if (process.env.NODE_ENV === 'publish') {
    plugins.push(
        new UglifyJsPlugin({
            compress: {
                dead_code: true,
                drop_console: true,
                screw_ie8: true,
                warnings: true
            }
        })
    );
}

module.exports = {
    entry: './src',
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    },
    resolve: {
        alias: {
            flight: 'flightjs'
        }
    },
    output: {
        path: './dist',
        filename: 'flight-with-child-components.js'
    },
    plugins: plugins
};
