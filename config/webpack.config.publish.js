var constants = require('./constants');
var baseConfig = require('./webpack.config');

module.exports = Object.assign(baseConfig, {
    output: {
        library: 'flight-with-child-components',
        filename: 'flight-with-child-components.js',
        libraryTarget: 'umd',
        path: constants.BUILD_DIRECTORY
    }
});
