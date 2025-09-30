import '@babel/polyfill';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';

import '~/../scss/main.scss';
import '~/lib/config';

import Admin from './components/Admin';

ReactDOM.render(
  <Suspense fallback="loading...">
    <Admin />
  </Suspense>,
  document.getElementById('root'),
);
