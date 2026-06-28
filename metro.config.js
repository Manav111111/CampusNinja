// Learn more https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Firebase JS SDK v12+ and some RN dependencies use private class
// fields (#field) which Hermes doesn't support natively. Metro needs
// to run Babel on those node_modules packages to transpile them.
//
// By overriding the transformer config, we ensure ALL files
// (including node_modules) go through Babel transformation.
config.transformer = {
  ...config.transformer,
  // This setting makes Metro NOT skip Babel for node_modules.
  // By default Metro uses a faster path that skips Babel for
  // packages inside node_modules, but this causes issues with
  // modern JS features like private fields.
  enableBabelRuntime: true,
};

module.exports = config;
