import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
// import minify from 'rollup-plugin-babel-minify';
import ignore from "rollup-plugin-ignore"
import pkg from './package.json';

export default [{
  input: 'dist/index.js',
  context: "window",
  shimMissingExports: true,
  treeshake: false,
  output: {
    exports: "named",
    name: "BonarooExport",
    file: pkg.browser,
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    ignore(["fs", "crypto", "stream"]),
    resolve(),
    commonjs(),
    // minify({ comments: false }),
  ],
}];
