module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        alias: {
          '@ethersproject/constants': './node_modules/@ethersproject/constants',
        },
      }],
    ],
  };
}; 