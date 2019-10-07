module.exports = {
  presets: [["@babel/env", { modules: "commonjs" }], "vca-jsx", "@vue/app"],
  plugins: [
    "babel-plugin-vue-jsx-modifier",
    [
      "@babel/plugin-transform-runtime",
      {
        regenerator: true
      }
    ],
    [
      "emotion",
      {
        autoLabel: true
      }
    ]
  ]
};
