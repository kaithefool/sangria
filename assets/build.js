#!/usr/bin/env node
import * as esbuild from 'esbuild'
import { sassPlugin } from 'esbuild-sass-plugin'
import { resolve } from 'node:path'
import fs, { rmSync } from 'node:fs'

const { argv } = process
const { dirname } = import.meta
const watch = argv.includes('--watch')
const outdir = resolve(
  dirname,
  argv.find((a) => /^--outdir=/.test(a))?.replace(/^--outdir=/, '') ||
    '../server/assets',
)
const entryRoot = resolve(dirname, 'src/entry')
const entryPoints = fs
  .readdirSync(entryRoot)
  .map((dir) => {
    const p = resolve(entryRoot, dir, 'main.tsx')
    return fs.existsSync(p) && { in: p, out: dir }
  })
  .filter((p) => p)

const rebuildLog = {
  name: 'rebuild-log',
  setup({ onStart, onEnd }) {
    let t
    onStart(() => {
      t = Date.now()
    })
    onEnd(() => {
      console.log('Assets built in', Date.now() - t, 'ms')
    })
  },
}

const cleanDir = {
  name: 'clean-dir',
  setup({ onStart }) {
    onStart(() => {
      fs.readdirSync(outdir).forEach((p) => {
        rmSync(resolve(outdir, p), {
          recursive: true,
        })
      })
    })
  },
}

const sass = sassPlugin({
  quietDeps: true,
  silenceDeprecations: [
    'import',
    'abs-percent',
    'global-builtin',
    'color-functions',
    'function-units',
  ],
})

const ctx = await esbuild.context({
  plugins: [rebuildLog, sass, cleanDir],
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
  entryPoints,
  outdir,
  entryNames: '[name]-[hash]',
})

if (watch) {
  await ctx.watch()
} else {
  await ctx.rebuild()
  process.exit()
}
