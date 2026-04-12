import resolve from '@rollup/plugin-node-resolve'
import { swc } from 'rollup-plugin-swc3'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
  ],
  plugins: [
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
  ],
}
