const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...(config.resolve.fallback || {}),
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    util: require.resolve('util'),
    vm: false,
  };

  // Aliases para evitar cargar módulos de Amplify incompatibles si existen imports residuales
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    'aws-amplify': false,
    '@aws-amplify/core': false,
    '@aws-amplify/pubsub': false,
    '@aws-amplify/api-graphql': false,
  };

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);

  return config;
};


