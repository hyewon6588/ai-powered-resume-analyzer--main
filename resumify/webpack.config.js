module.exports = {
    resolve: {
      fallback: {
        fs: false, // This disables the 'fs' module
        http: require.resolve('stream-http'), // Polyfill for 'http'
        https: require.resolve('https-browserify'), // Polyfill for 'https'
        url: require.resolve('url/') // Polyfill for 'url'
      }
    }
  };
  