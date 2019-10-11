module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: ["standard", "standard-jsx", "plugin:vue/recommended"],
  parserOptions: {
    parser: "typescript-eslint-parser",
    ecmaVersion: 2017,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    // disable rules which don't work in TypeScript
    "no-undef": "off",
    "no-unused-vars": "off",
    "space-infix-ops": "off",
    "no-useless-constructor": "off",
    "import/export": "off",
    "func-call-spacing": "off",

    // disable rules which conflict with Prettier
    indent: "off",
    semi: "off",
    quotes: "off",
    "space-before-function-paren": "off",
    "react/jsx-indent": "off",
    "react/jsx-indent-props": "off",

    // other code style
    yoda: "off",
    "linebreak-style": ["error", "unix"],

    // jsx
    "jsx-quotes": ["error", "prefer-double"],

    // vue
    "vue/require-default-prop": "off"
  }
};
