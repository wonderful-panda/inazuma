module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es6: true
    },
    extends: [
        "standard",
        "standard-jsx",
        "plugin:vue/recommended"
    ],
    parserOptions: {
        parser: "typescript-eslint-parser",
        ecmaVersion: 2017,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true
        }
    },
    rules: {
        // disable rules which does not work in TypeScript
        "no-undef": "off",
        "no-unused-vars": "off",
        "space-infix-ops": "off",
        "no-useless-constructor": "off",
        "import/export": "off",

        // code style
        "yoda": "off",
        "indent": ["error", 4, { SwitchCase: 1 }],
        "semi": ["error", "always"],
        "quotes": ["error", "double", { allowTemplateLiterals: true } ],
        "space-before-function-paren": ["error", "never"],
        "jsx-quotes": ["error", "prefer-double"],

        // jsx
        "react/jsx-indent": ["error", 4],
        "react/jsx-indent-props": ["error", 4],

        // vue
        "vue/require-default-prop": "off"
    }
}
