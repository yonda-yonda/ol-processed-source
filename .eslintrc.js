module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "plugin:react/recommended",
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:import/react",
    "plugin:react-hooks/recommended",
    "plugin:jest/recommended",
  ],
  parser: "@typescript-eslint/parser",
  settings: {
    "import/resolver": {
      alias: {
        map: [
          ["~", "./src/"]
        ],
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
      },
    },
    react: {
      version: "detect"
    },
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 13,
    sourceType: "module",
  },
  plugins: ["react", "react-hooks", "@typescript-eslint", "jest"],
  rules: {
    quotes: [2, "double"],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
};