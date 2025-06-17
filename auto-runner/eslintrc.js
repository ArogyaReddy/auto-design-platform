// .eslintrc.js
module.exports = {
    env: {
        browser: true,
        node: true,
        es2021: true
    },
    extends: [
        'eslint:recommended',
        'plugin:prettier/recommended' // Integrates Prettier with ESLint
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    plugins: [
        'prettier'
    ],
    rules: {
        'prettier/prettier': 'error'
    }
};