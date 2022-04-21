export default {
  moduleFileExtensions: ["js", "ts", "tsx"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  testMatch: ["**/test/**/*.spec.ts", "**/test/**/*.test.ts"],
  testEnvironment: "node",
}
