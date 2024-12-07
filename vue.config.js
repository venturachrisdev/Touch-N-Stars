const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {/*
      "/v2/api": {
        target: "http://localhost:1888", // URL des API-Servers
        secure: false, // SSL-Zertifikate ignorieren (optional)
        changeOrigin: true, // Erzwingt Cross-Origin-Header-Anpassungen
        pathRewrite: { "^/v2/api": "/v2/api" }, // (Optional) Umschreiben des Pfads
        logLevel: "debug", 
      },
      "/v2/tppa": {
        target: "ws://localhost:1888", // URL des API-Servers
        secure: false, // SSL-Zertifikate ignorieren (optional)
        changeOrigin: true, // Erzwingt Cross-Origin-Header-Anpassungen
        pathRewrite: { "^/v2/tppa": "/v2/tppa" }, // (Optional) Umschreiben des Pfads
        logLevel: "debug", 
      },
    */},
  },
});
