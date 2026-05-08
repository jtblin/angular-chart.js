import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'test/test.unit.ts',
  output: {
    file: 'dist/test.unit.bundled.js',
    format: 'iife',
    name: 'test',
    sourcemap: true,
    globals: {
      'angular': 'angular',
      'chart.js': 'Chart',
      'sinon': 'sinon'
    }
  },
  external: ['angular', 'chart.js', 'sinon'],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      outDir: 'dist'
    }),
    resolve(),
    commonjs()
  ]
};
