var baseConfig = require('./webpack.config');

module.exports = Object.assign(baseConfig, {
    devtool: 'inline-source-map'
});
