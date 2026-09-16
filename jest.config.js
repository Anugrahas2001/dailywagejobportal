// // jest.config.js
// const nextJest = require("next/jest");

// const createJestConfig = nextJest({
//   dir: "./",
// });

// const customJestConfig = {
//   setupFilesAfterEnv: ["<rootDir>/jest.setup.js"], // <-- "setupFilesAfterEnv", correct one
//   testEnvironment: "jest-environment-jsdom",
//   moduleNameMapper: {
//     "^@/(.*)$": "<rootDir>/$1",
//   },
// };

// module.exports = createJestConfig(customJestConfig);

// jest.config.mjs  (renamed from .js, and file extension matters here too)
import nextJest from "next/jest.js"; // note: sometimes needs explicit .js in ESM

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default createJestConfig(customJestConfig);
