const webpack = require('webpack');

module.exports = function override(config, env) {
  config.resolve.fallback = {
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert/'),
    util: require.resolve('util/'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify/browser'),
    url: require.resolve('url/'),
    buffer: require.resolve('buffer/'),
  };

  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    })
  );

  return config;
};
