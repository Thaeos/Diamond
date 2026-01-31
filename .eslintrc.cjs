/** @type { import("eslint").Linter.Config } */
module.exports = {
  root: true,
  ignorePatterns: ["node_modules/", "metamask-sdk/", "dist/", "obsidian_vault/", "diamonds/", "gems/", "*.json", "*.md", "*.sol", "**/LaVague/**", "**/lavague/**"],
  env: { node: true, es2020: true },
  parserOptions: { ecmaVersion: 2020, sourceType: "module" },
  overrides: [
    {
      files: ["*.ts"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: ["eslint:recommended"],
      rules: {
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        "no-console": "off",
        "prefer-const": "warn",
      },
    },
    {
      files: ["wagmi-treasure-bridgeworld-config.ts"],
      env: { browser: true, node: true },
      rules: { "no-undef": "off" },
    },
  ],
};
