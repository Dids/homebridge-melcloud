export default {
  // preset: "ts-jest",
  preset: "ts-jest/presets/js-with-ts-esm",
  // moduleFileExtensions: ["js", "ts", "tsx"],
  // transform: {
  //   "^.+\\.(ts|tsx)$": "ts-jest",
  //   "^.+\\.(js)$": "babel-jest",
  // },
  transformIgnorePatterns: [
    "node_modules/(?!(data-uri-to-buffer|formdata-polyfill|fetch-blob|node-fetch|node:http)/)"
  ],
  // transformIgnorePatterns: [],
  // transformIgnorePatterns: ["/node_modules/"],
  setupFilesAfterEnv: ["jest-extended/all"],
  testPathIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/test/**/*.spec.ts", "**/test/**/*.test.ts"],
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: '.coverage',
  globals: {
    "ts-jest": {
      // tsconfig: "./tsconfig.test.json",
      tsconfig: "./tsconfig.json",
      useESM: true
    }
  },
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  }
}
