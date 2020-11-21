module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: ["standard", "standard-jsx", "plugin:vue/recommended"],
  plugins: ["@typescript-eslint/eslint-plugin"],
  parserOptions: {
    parser: "@typescript-eslint/parser",
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
    "no-extra-parens": "off",
    "no-redeclare": "off",
    "import/export": "off",
    "func-call-spacing": "off",

    // disable rules which conflict with Prettier
    indent: "off",
    semi: "off",
    quotes: "off",
    "space-before-function-paren": "off",
    "react/jsx-curly-newline": "off",
    "react/jsx-indent": "off",
    "react/jsx-indent-props": "off",
    "multiline-ternary": "off",

    // other code style
    yoda: "off",
    "linebreak-style": ["error", "unix"],
    "react/jsx-handler-names": "off",

    // jsx
    "jsx-quotes": ["error", "prefer-double"],

    // vue
    "vue/require-default-prop": "off",
    "vue/one-component-per-file": "off"
  }
};
