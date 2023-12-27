module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,

  rules: {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      // Unused variables are fine if they start with an underscore
      { args: "all", argsIgnorePattern: "^_.*", varsIgnorePattern: "^_.*" },
    ],
  },

  overrides: [
    {
      files: ["test/**"],

      // Special config for test files
      rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
      },
    },
  ],
};
