const path = require('path');

module.exports = {
  parser: '@babel/eslint-parser',
  env: {
    browser: true,
  },
  plugins: ['react', 'react-hooks', 'jsdoc'],
  extends: [
    'airbnb',
    'plugin:react/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    babelOptions: {
      configFile: './assets/.babelrc',
    },
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', path.resolve(__dirname, './src')],
          ['~', path.resolve(__dirname, './src/js')],
        ],
        extensions: [
          '.js', '.jsx',
          '.scss', '.mp4', '.jpg', 'jpeg', '.png', '.svg',
        ],
      },
    },
    react: {
      version: '16.13',
    },
  },
  rules: {
    'max-len': ['warn', { code: 80, ignoreRegExpLiterals: true }],
    'jsdoc/no-undefined-types': 1,

    // enable development in windows
    'linebreak-style': 'off',

    // methods that could use 'this' when overwritten
    'class-methods-use-this': 'off',

    // leaving room to expand more exports
    'import/prefer-default-export': 'warn',

    // for DOM and Web API
    'no-param-reassign': ['error', { props: false }],

    // mongodb
    'no-underscore-dangle': ['error', { allow: ['_id'] }],

    // no type checking
    'react/prop-types': 'off',

    // hoc components
    'react/jsx-props-no-spreading': 'off',

    // it's okay to use index if the array is constant
    'react/no-array-index-key': 'off',

    // component slots
    'react/no-unstable-nested-components': [
      'error',
      { allowAsProps: true },
    ],

    // I don't see why associating labels with id is unacceptable
    // and bootstrap don't support nested label
    'jsx-a11y/label-has-associated-control': ['error', {
      required: {
        every: ['nesting', 'id'],
      },
    }],

    // resolve 'function-declaration' and 'unnamed function' conflict
    'react/function-component-definition': [
      2,
      { namedComponents: 'arrow-function' },
    ],

    // TBC... too much work for little performance gain?
    'react/jsx-no-constructed-context-values': 'off',

    // ARIA: TBC...
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-noninteractive-element-to-interactive-role': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/media-has-caption': 'off',
  },
};
