module.exports = {
  transpileDependencies: ["color"],
  runtimeCompiler: true,
  configureWebpack: (config) => ({
    resolve: {
      alias: {
        "balm-ui-plus": "balm-ui/dist/balm-ui-plus.js",
        "balm-ui-css": "balm-ui/dist/balm-ui.css",
      },
    },
    externals:
      config.mode === "production"
        ? {
            "@oneblink/apps": "@oneblink/apps",
            "aws-sdk": "aws-sdk",
          }
        : {},
  }),
}
