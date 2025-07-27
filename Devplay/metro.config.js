const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Ensure that all platforms are loaded
config.resolver.platforms = ["ios", "android", "native", "web"];

module.exports = config;
