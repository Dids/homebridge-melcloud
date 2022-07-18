module.exports = {
  // root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: [
    'import',
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': [ '.ts', '.tsx' ],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  // parserOptions: {
  //   ecmaVersion: 2018,
  //   sourceType: 'module',
  //   project: './tsconfig.json'
  // },
  rules: {
    // '@typescript-eslint/array-type': ['error', {default: 'generic'}],
    // '@typescript-eslint/brace-style': 'error',
    // '@typescript-eslint/comma-spacing': 'error',
    // '@typescript-eslint/explicit-function-return-type': 'error',
    // '@typescript-eslint/func-call-spacing': 'error',
    // '@typescript-eslint/indent': ['error', 2],
    // '@typescript-eslint/lines-between-class-members': ['error', {"exceptAfterSingleLine": true}],
    // '@typescript-eslint/no-base-to-string': 'error',
    // '@typescript-eslint/no-explicit-any': 'error',
    // '@typescript-eslint/no-unnecessary-boolean-literal-compare': ['error', {"allowComparingNullableBooleansToTrue": false, "allowComparingNullableBooleansToFalse": false}],
    // '@typescript-eslint/no-var-requires': 'error',
    // '@typescript-eslint/prefer-optional-chain': 'error',
    // '@typescript-eslint/prefer-readonly': 'error',
    // '@typescript-eslint/quotes': ['error', 'single', {"allowTemplateLiterals": false}],
    // '@typescript-eslint/semi': ['error', 'never'],
    // '@typescript-eslint/space-before-function-paren': ['error', 'never'],
    // '@typescript-eslint/type-annotation-spacing': 'error',
    // 'comma-dangle': 'error',
    // 'no-confusing-arrow': 'error',
    // 'no-lonely-if': 'error',
    // 'no-trailing-spaces': 'error',
    // 'no-unneeded-ternary': 'error',
    // 'one-var': ['error', 'never'],

    'no-console': 'warn',
    'no-debugger': 'warn',
    'quotes': [ 'error', 'single', {
      allowTemplateLiterals: true,
    } ],
    'max-len': 'off',
    'class-methods-use-this': 'off',
    'semi': 'off',
    'no-shadow': 'off',

    'object-curly-newline': [ 'error', {
      // 'minProperties': 2,
      'ObjectExpression': 'always',
      'ImportDeclaration': {
        'minProperties': 2,
      },
      'ExportDeclaration': {
        'minProperties': 2,
      },
    } ],
    'object-curly-spacing': [ 'error', 'always' ],
    'array-bracket-spacing': [ 'error', 'always' ],
    'comma-dangle': [ 'error', 'always-multiline' ],

    '@typescript-eslint/member-delimiter-style': [
      'error', {
        'multiline': {
          'delimiter': 'none', // 'none' or 'semi' or 'comma'
          'requireLast': true,
        },
        'singleline': {
          'delimiter': 'comma', // 'semi' or 'comma'
          'requireLast': false,
        },
      },
    ],
    '@typescript-eslint/semi': [ 'error', 'never' ],
    '@typescript-eslint/indent': [ 'error', 2 ],
    '@typescript-eslint/no-shadow': [ 'error' ],

    'import/no-unresolved': 'error',
    'import/extensions': [
      'error',
      'always',
      {
        ts: 'never',
      },
    ],
  },
}
