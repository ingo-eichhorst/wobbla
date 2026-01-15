module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Customize rules as needed for this project
    'no-console': 'off', // Allow console.log in Node.js
    'func-names': 'off', // Allow anonymous functions
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }], // Allow ++ in for loops
    'no-param-reassign': ['error', { props: false }], // Allow modifying properties of parameters
    'max-len': ['error', { code: 120, ignoreComments: true, ignoreStrings: true }], // Increase line length to 120
    'global-require': 'off', // Allow require() inside functions for Node.js
    'import/extensions': ['error', 'ignorePackages', { js: 'always' }], // Require .js extensions for local files
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ], // Remove ForOfStatement from restricted syntax
    'consistent-return': 'off', // Allow functions to return undefined
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Allow unused variables that start with _
  },
  overrides: [
    {
      files: ['static/**/*.js'],
      env: {
        browser: true,
        node: false,
      },
      globals: {
        angular: 'readonly',
      },
    },
    {
      files: ['utils/bullshit.js'],
      rules: {
        'max-len': 'off',
      },
    },
  ],
};
