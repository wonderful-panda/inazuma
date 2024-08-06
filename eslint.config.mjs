import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import path from "path";

export default tseslint.config({
  files:["src/react/**/*.{ts,tsx}"],
  ignores: [
    "node_modules",
    "*.scss.d.ts"
  ],
  plugins: {
    react,
    "react-hooks": reactHooks
  },
  extends: [
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  rules: {
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
    ...reactHooks.configs.recommended.rules,
    "@typescript-eslint/no-unused-vars": ["error", {
      argsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
    }],
    "react/prop-types": "off",
    yoda: "off",
    "linebreak-style": ["error", "unix"],
    "react-hooks/exhaustive-deps": ["error", {
      additionalHooks: "useCallbackWith"
    }]
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: "src/react"
    }
  }
});
