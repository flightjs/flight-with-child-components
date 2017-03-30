'use strict';

var constants = require('./constants');
var webpackConfig = require('./webpack.config.test');

module.exports = function (config) {
    config.set({
        basePath: constants.ROOT_DIRECTORY,
        browsers: [ process.env.TRAVIS ? 'Firefox' : 'Chrome' ],
        browserNoActivityTimeout: 60000,
        client: {
            captureConsole: true,
            useIframe: true
        },
        files: [
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
            'src/specs.context.js'
        ],
        frameworks: [
            'jasmine'
        ],
        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-sourcemap-loader',
            'karma-webpack'
        ],
        preprocessors: {
            'src/specs.context.js': [ 'webpack', 'sourcemap' ]
        },
        reporters: [ 'dots' ],
        singleRun: true,
        webpack: webpackConfig
    });
};
