/**
 * Example: Maybe<A> — the classic optional value.
 *
 * Run with:  npx tsx examples/01-maybe.ts
 *
 * Demonstrates:
 *   - Declaring a tagged union with arity-1 (Maybe<A>)
 *   - Named (object-style) constructors
 *   - Exhaustive pattern matching with `match`
 *   - Widened return types via `matchW`
 *   - Partial matching with default via `matchOr`
 *   - Pretty-printing via `show` and iterating `tags`
 *
 * In a real project, you would import from the published package:
 *   import { mkTaggedUnion } from 'tagged-ts/named'
 * Here we use a relative path because this file lives inside the repo.
 */

import type { MkData, TaggedLambda1 } from '../src/named'
import { mkTaggedUnion } from '../src/named'

// ---------------------------------------------------------------------------
// 1. Declare the union type
// ---------------------------------------------------------------------------

type Nothing = { readonly tag: 'Nothing' }
type Just<A> = { readonly tag: 'Just'; readonly value: A }
type Maybe<A> = Just<A> | Nothing

// The Lambda interface lets the library thread the `A` type parameter
// through the generated constructors, guards, and match functions.
interface MaybeLambda extends TaggedLambda1 {
  readonly type: Maybe<this['A']>
  readonly data: MkData<this['type']>
}

// ---------------------------------------------------------------------------
// 2. Generate constructors and utilities
// ---------------------------------------------------------------------------

const Maybe = mkTaggedUnion<MaybeLambda>({
  Just: true, // has fields beyond the discriminant
  Nothing: false, // no fields beyond the discriminant
})

// ---------------------------------------------------------------------------
// 3. Build values
// ---------------------------------------------------------------------------

const aJust: Maybe<number> = Maybe.Just({ value: 42 })
const aNothing: Maybe<number> = Maybe.Nothing // nullary — used like a constant

// ---------------------------------------------------------------------------
// 4. Exhaustive `match` — all cases must be handled, same return type
// ---------------------------------------------------------------------------

const describe = (m: Maybe<number>): string =>
  Maybe.match(m, {
    Just: ({ value }) => `got ${value}`,
    Nothing: () => 'got nothing',
  })

console.log(describe(aJust)) // got 42
console.log(describe(aNothing)) // got nothing

// ---------------------------------------------------------------------------
// 5. `matchW` — handlers may return different types
// ---------------------------------------------------------------------------

const widened = Maybe.matchW(aJust, {
  Just: ({ value }) => value, // number
  Nothing: () => 'empty' as const, // 'empty'
})
// widened has type `number | 'empty'`
console.log('matchW:', widened)

// ---------------------------------------------------------------------------
// 6. `matchOr` — handle only the cases you care about, default covers the rest
// ---------------------------------------------------------------------------

const safeGet = (m: Maybe<number>, fallback: number): number =>
  Maybe.matchOr(m, { Just: ({ value }) => value }, () => fallback)

console.log('safeGet(Just 42, 0) =', safeGet(aJust, 0)) // 42
console.log('safeGet(Nothing, 0) =', safeGet(aNothing, 0)) // 0

// ---------------------------------------------------------------------------
// 7. v0.6 utilities: `show` and `tags`
// ---------------------------------------------------------------------------

console.log('show:', Maybe.show(aJust)) // Just({ value: 42 })
console.log('show:', Maybe.show(aNothing)) // Nothing
console.log('tags:', Maybe.tags) // ['Just', 'Nothing']
