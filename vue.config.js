module.exports = {
  transpileDependencies: ["color"],
  runtimeCompiler: true,
  configureWebpack: {
    resolve: {
      alias: {
        "balm-ui-plus": "balm-ui/dist/balm-ui-plus.js",
        "balm-ui-css": "balm-ui/dist/balm-ui.css",
      },
    },
    externals: {
      vue: "vue",
      "@oneblink/apps": "@oneblink/apps",
      "aws-sdk": "aws-sdk",
      "@sentry": "@sentry",
    },
  },
}
