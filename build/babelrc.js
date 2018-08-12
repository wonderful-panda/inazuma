module.exports = {
  presets: ["env"],
  plugins: [
    "vue-jsx-modifier",
    "transform-vue-jsx",
    [
      "transform-runtime",
      {
        polyfill: false,
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
