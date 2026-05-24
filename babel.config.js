/**
 * Configuração do Babel para o projeto Zentrix.
 * Inclui o plugin do react-native-reanimated (deve ser o último plugin).
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
