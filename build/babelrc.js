module.exports = {
  presets: [["@babel/env", { modules: "commonjs" }]],
  plugins: [
    "babel-plugin-vue-jsx-modifier",
    "babel-plugin-transform-vue-jsx",
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
