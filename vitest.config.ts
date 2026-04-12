import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.ts'],
    exclude: ['test/tsconfig.json', 'test/**/*.test-d.ts'],
    passWithNoTests: true,
    typecheck: {
      enabled: true,
      include: ['test/**/*.test-d.ts'],
    },
  },
})
