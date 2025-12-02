import ts from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'

export default [
  ...ts.configs.recommended,
  stylistic.configs.customize({
  }),
  {
    rules: {
      '@stylistic/max-len': ['warn', { code: 80 }],
      '@stylistic/function-paren-newline': ['error', 'consistent'],
      '@stylistic/object-curly-newline': ['error', { consistent: true }],
      'no-duplicate-imports': ['error'],

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        caughtErrors: 'none',
        ignoreRestSiblings: true,
      }],
    },
  },
]
