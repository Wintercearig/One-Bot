module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:node/recommended"
    ],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "plugins": [
        "node",
        "prettier"
    ],
    "rules": {
        "semi": ["error", "always"],  // Semicolons are always required
        "no-unused-vars": "error",  // Detect unused variables
        "no-undef": "error",  // Detect usage of undeclared variables
        "no-extra-semi": "error",  // Disallow extra semicolons
        "eqeqeq": ["error", "always"],  // Enforce strict equality (=== and !==)
        "no-const-assign": "error",  // Disallow reassigning constants
        "no-var": "error",  // Use "let" or "const" instead of "var"
        "no-multiple-empty-lines": ["error", {"max": 2}],  // Limit consecutive empty lines
      }
};