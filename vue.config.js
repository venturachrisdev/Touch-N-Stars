const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
   
  },
  lintOnSave: process.env.NODE_ENV !== 'production' ? 'warning' : false,
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(true) // Setze auf `false` für den Produktionsmodus
      })
    ]
  }
});
