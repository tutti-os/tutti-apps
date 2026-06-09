export default {
  defaultNS: "radar",
  disablePlurals: true,
  extract: {
    functions: ["i18n.t"],
    ignore: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "src/i18n/**",
      "src/routeTree.gen.ts",
    ],
    input: ["src/**/*.{ts,tsx}"],
    output: "src/i18n/locales/{{language}}/{{namespace}}.json",
    transComponents: ["Trans"],
  },
  keySeparator: ".",
  locales: ["zh-CN", "en-US"],
  nsSeparator: ":",
  preservePatterns: [
    "categories.*",
    "semantic.*.kicker",
    "semantic.*.steps",
    "semantic.*.title",
  ],
  primaryLanguage: "zh-CN",
  secondaryLanguages: ["en-US"],
};
