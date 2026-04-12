/**
 * Example: Property-based testing with fast-check + mkArbitrary.
 *
 * Run with:  npx tsx examples/06-property-testing.ts
 *
 * Demonstrates:
 *   - Generating arbitrary values of a tagged union via `mkArbitrary`
 *   - Using fast-check properties to verify laws about the union:
 *       1. equals is reflexive
 *       2. JSON round-trip preserves equals
 *       3. every generated value matches exactly one guard
 *       4. parse accepts every generated value
 *
 * These properties catch a wide class of bugs that example-based tests
 * miss, and they take only a few lines to express once you have an
 * `Arbitrary<Union>` from `mkArbitrary`.
 *
 * fast-check is an optional peer dependency of tagged-ts; it only needs
 * to be installed if you use the `tagged-ts/fast-check` entry point.
 */

import fc from 'fast-check'
import { mkArbitrary } from '../src/fast-check'
import type { MkData, TaggedLambda1 } from '../src/named'
import { mkTaggedUnion } from '../src/named'

// ---------------------------------------------------------------------------
// 1. A small union to exercise
// ---------------------------------------------------------------------------

type Nothing = { readonly tag: 'Nothing' }
type Just<A> = { readonly tag: 'Just'; readonly value: A }
type Maybe<A> = Just<A> | Nothing

interface MaybeLambda extends TaggedLambda1 {
  readonly type: Maybe<this['A']>
  readonly data: MkData<this['type']>
}

const Maybe = mkTaggedUnion<MaybeLambda>({ Just: true, Nothing: false })

// ---------------------------------------------------------------------------
// 2. Build an `Arbitrary<Maybe<number>>`
// ---------------------------------------------------------------------------

// For every non-nullary member, supply a field arbitrary keyed by field
// name. Nullary members take `{}`.
const arbMaybe = mkArbitrary<Maybe<number>>({
  Just: { value: fc.integer() },
  Nothing: {},
})

// ---------------------------------------------------------------------------
// 3. Properties
// ---------------------------------------------------------------------------

const check = (label: string, prop: fc.IProperty<unknown>): void => {
  try {
    fc.assert(prop, { numRuns: 200 })
    console.log(`ok   ${label}`)
  } catch (err) {
    console.log(`FAIL ${label}`)
    console.log(String(err))
  }
}

// (1) equals is reflexive: a === a
check(
  'equals is reflexive',
  fc.property(arbMaybe, m => Maybe.equals(m, m)),
)

// (2) JSON round-trip preserves equals
check(
  'JSON round-trip preserves equals',
  fc.property(arbMaybe, m => {
    const clone = JSON.parse(JSON.stringify(m)) as typeof m
    return Maybe.equals(m, clone)
  }),
)

// (3) every generated value matches exactly one guard
check(
  'each value matches exactly one guard',
  fc.property(arbMaybe, m => {
    const hits = Maybe.tags.filter(tag => {
      const guard = Maybe.is[tag as keyof typeof Maybe.is] as (
        x: unknown,
      ) => boolean
      return guard(m)
    })
    return hits.length === 1
  }),
)

// (4) parse accepts every generated value
check(
  'parse accepts every generated value',
  fc.property(arbMaybe, m => Maybe.parse(m) !== undefined),
)

// ---------------------------------------------------------------------------
// 4. Show a few sample values
// ---------------------------------------------------------------------------

console.log('\nsamples:')
for (const sample of fc.sample(arbMaybe, 5)) {
  console.log(' ', Maybe.show(sample))
}
