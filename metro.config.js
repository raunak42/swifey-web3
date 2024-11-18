const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@ethersproject/constants': require.resolve('@ethersproject/constants'),
  'ethers': require.resolve('ethers'),
};

module.exports = config; 