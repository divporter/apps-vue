// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeExternals = require("webpack-node-externals")

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
    externals: config.mode === "production" ? [nodeExternals()] : [],
  }),
}
