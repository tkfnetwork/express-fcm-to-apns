import { uglify } from 'rollup-plugin-uglify';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import pkg from './package.json';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import externals from 'rollup-plugin-node-externals';

const input = 'src/index.ts';

const output = [
  {
    file: pkg.main,
    format: 'cjs',
  },
  {
    file: pkg.module,
    format: 'es',
  },
];

const external = Object.keys(pkg.dependencies);

// [
//   'express-http-proxy',
//   'object-hash',
//   ''
// ]

const plugins = [
  typescript(),
  json(),
  resolve({
    preferBuiltins: true,
  }),
  babel({
    babelHelpers: 'inline',
  }),
  externals(),
  commonjs({
    namedExports: {
      'push-receiver': ['listen', 'register'],
    },
  }),
  // uglify(),
];

export default {
  external,
  input,
  output,
  plugins,
};
