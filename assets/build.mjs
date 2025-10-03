#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */
import * as esbuild from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';

const watch = process.argv.includes('--watch');

const rebuildLog = {
  name: 'rebuild-log',
  setup({ onStart, onEnd }) {
    let t;
    onStart(() => {
      t = Date.now();
    });
    onEnd(() => {
      console.log('Assets build finished in', Date.now() - t, 'ms');
    });
  },
};

const ctx = await esbuild.context({
  plugins: [
    sassPlugin({
      quietDeps: true,
      silenceDeprecations: [
        'import',
        'abs-percent',
        'global-builtin',
        'color-functions',
        'function-units',
      ],
    }),
    rebuildLog,
  ],
  bundle: true,
  minify: true,
  sourcemap: true,
  loader: {
    '.mp4': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.png': 'file',
    '.svg': 'file',
  },
  outdir: '../server/assets',
  entryPoints: [
    { in: './src/js/home/index.jsx', out: 'home' },
    { in: './src/js/admin/index.jsx', out: 'admin' },
  ],
});

if (watch) {
  await ctx.watch();
} else {
  await ctx.rebuild();
  process.exit();
}
