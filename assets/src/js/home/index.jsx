import '@babel/polyfill';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';

import '@/scss/main.scss';
import '~/lib/config';

import Home from './components/Home';

ReactDOM.render(
  <Suspense fallback="loading...">
    <Home />
  </Suspense>,
  document.getElementById('root'),
);
