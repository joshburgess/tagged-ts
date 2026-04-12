import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.ts'],
    exclude: ['test/tsconfig.json', 'test/**/types.ts'],
    passWithNoTests: true,
  },
})
