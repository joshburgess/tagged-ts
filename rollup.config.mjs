import resolve from '@rollup/plugin-node-resolve'
import { swc } from 'rollup-plugin-swc3'

const plugins = [
  resolve({ extensions: ['.ts', '.js'] }),
  swc({
    jsc: {
      parser: { syntax: 'typescript', decorators: false },
      target: 'es2022',
      loose: true,
      keepClassNames: true,
      assumptions: {
        noClassCalls: true,
        setPublicClassFields: true,
        ignoreFunctionLength: true,
        ignoreFunctionName: true,
      },
    },
    sourceMaps: true,
  }),
]

const entry = (input, outDir) => ({
  input,
  output: [
    {
      file: `${outDir}/index.js`,
      format: 'es',
      sourcemap: true,
    },
    {
      file: `${outDir}/index.cjs`,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
  ],
  plugins,
  // Silence EMPTY_BUNDLE for the root entry: src/index.ts is types-only,
  // so after type-stripping there is no runtime code to bundle. We still
  // want the empty bundle emitted as a valid resolution target for
  // `import 'tagged-ts'`.
  onwarn(warning, warn) {
    if (warning.code === 'EMPTY_BUNDLE') return
    warn(warning)
  },
})

export default [
  entry('src/index.ts', 'dist'),
  entry('src/named/index.ts', 'dist/named'),
  entry('src/positional/index.ts', 'dist/positional'),
]
