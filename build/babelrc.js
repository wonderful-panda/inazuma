module.exports = {
  presets: ["vca-jsx", "@vue/app"],
  plugins: [
    "@emotion",
    ["babel-plugin-vue-tsx-functional/lib/plugin", { funcName: "_fc" }],
    "babel-plugin-vue-jsx-modifier",
    [
      "@babel/plugin-transform-runtime",
      {
        regenerator: true
      }
    ]
  ]
};
