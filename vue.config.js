module.exports = {
  transpileDependencies: ["color"],
  runtimeCompiler: true,
  // NOTE: set alias via `configureWebpack` or `chainWebpack`
  configureWebpack: {
    resolve: {
      alias: {
        "balm-ui-plus": "balm-ui/dist/balm-ui-plus.js",
        "balm-ui-css": "balm-ui/dist/balm-ui.css",
      },
    },
  },
  // pages: {
  //   index: {
  //     entry: "src/index.ts",
  //   },
  // },
}
