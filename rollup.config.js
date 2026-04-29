import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import {createRequire} from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const isWatch = process.env.ROLLUP_WATCH;

const banner = `/*!
 * ${pkg.name} - ${pkg.description}
 * ${pkg.homepage}
 * Version: ${pkg.version}
 *
 * Copyright 2016-2026 Jerome Touffe-Blin
 * Released under the ${pkg.license} license
 * https://github.com/jtblin/angular-chart.js/blob/main/LICENSE
 */
`;

export default {
  input: 'src/angular-chart.js',
  output: [
    {
      file: 'dist/angular-chart.js',
      format: 'umd',
      name: 'angularChart',
      banner,
      sourcemap: true,
      globals: {
        'angular': 'angular',
        'chart.js': 'Chart',
      },
    },
    {
      file: 'dist/angular-chart.min.js',
      format: 'umd',
      name: 'angularChart',
      banner,
      sourcemap: true,
      plugins: [terser()],
      globals: {
        'angular': 'angular',
        'chart.js': 'Chart',
      },
    },
    {
      file: 'dist/angular-chart.mjs',
      format: 'es',
      banner,
      sourcemap: true,
      globals: {
        'angular': 'angular',
        'chart.js': 'Chart',
      },
    },
    {
      file: 'dist/angular-chart.cjs.js',
      format: 'cjs',
      banner,
      sourcemap: true,
      globals: {
        'angular': 'angular',
        'chart.js': 'Chart',
      },
    },
  ],
  external: ['angular', 'chart.js'],
  plugins: [
    resolve(),
    commonjs(),
    isWatch && serve({
      contentBase: '',
      port: 8045,
      open: false,
    }),
    isWatch && livereload('dist'),
  ],
};
