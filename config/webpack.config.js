var webpack = require('webpack');

var plugins = [
    new webpack.optimize.OccurrenceOrderPlugin()
];

module.exports = {
    entry: './src',
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['env', {
                                targets: {
                                    browsers: [
                                        '> 1%',
                                        'last 2 versions'
                                    ]
                                }
                            }]
                        ]
                    }
                }
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
