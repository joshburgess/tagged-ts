import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { mkArbitrary, mkArbitraryCustom } from '../../src/fast-check'

// ===========================================================================
// Setup
// ===========================================================================

type Nothing = { readonly tag: 'Nothing' }
type Just<A> = { readonly tag: 'Just'; readonly value: A }
type Maybe<A> = Just<A> | Nothing

type Failure<E> = { readonly tag: 'Failure'; readonly error: E }
type Success<A> = { readonly tag: 'Success'; readonly value: A }
type Result<E, A> = Success<A> | Failure<E>

type Emit<S, A> = {
  readonly tag: 'Emit'
  readonly state: S
  readonly value: A
}
type End = { readonly tag: 'End' }
type Stream<S, A> = Emit<S, A> | End

type Increment = { readonly type: 'Increment'; readonly amount: number }
type Reset = { readonly type: 'Reset' }
type CounterAction = Increment | Reset

// ===========================================================================
// mkArbitrary
// ===========================================================================

describe('mkArbitrary', () => {
  it('produces union members with the correct discriminant', () => {
    const arbMaybe = mkArbitrary<Maybe<number>>({
      Just: { value: fc.integer() },
      Nothing: {},
    })

    fc.assert(
      fc.property(arbMaybe, m => m.tag === 'Just' || m.tag === 'Nothing'),
    )
  })

  it('produces nullary members as constants', () => {
    const arbMaybe = mkArbitrary<Maybe<number>>({
      Just: { value: fc.integer() },
      Nothing: {},
    })

    fc.assert(
      fc.property(arbMaybe, m => {
        if (m.tag === 'Nothing') {
          return Object.keys(m).length === 1
        }
        return typeof m.value === 'number'
      }),
    )
  })

  it('handles multi-field members', () => {
    const arbStream = mkArbitrary<Stream<string, number>>({
      Emit: { state: fc.string(), value: fc.integer() },
      End: {},
    })

    fc.assert(
      fc.property(arbStream, s => {
        if (s.tag === 'End') return true
        return typeof s.state === 'string' && typeof s.value === 'number'
      }),
    )
  })

  it('handles binary unions like Result', () => {
    const arbResult = mkArbitrary<Result<string, number>>({
      Success: { value: fc.integer() },
      Failure: { error: fc.string() },
    })

    fc.assert(
      fc.property(arbResult, r => {
        if (r.tag === 'Success') return typeof r.value === 'number'
        return typeof r.error === 'string'
      }),
    )
  })

  it('exercises all members over many runs', () => {
    const arbMaybe = mkArbitrary<Maybe<number>>({
      Just: { value: fc.integer() },
      Nothing: {},
    })

    const seen = new Set<string>()
    for (let i = 0; i < 200; i++) {
      const sample = fc.sample(arbMaybe, 1)[0]
      if (sample) seen.add(sample.tag)
      if (seen.size === 2) break
    }
    expect(seen).toEqual(new Set(['Just', 'Nothing']))
  })
})

// ===========================================================================
// mkArbitraryCustom
// ===========================================================================

describe('mkArbitraryCustom', () => {
  it('uses a custom discriminant key', () => {
    const arbCounter = mkArbitraryCustom<CounterAction, 'type'>('type', {
      Increment: { amount: fc.integer() },
      Reset: {},
    })

    fc.assert(
      fc.property(arbCounter, c => {
        if (c.type === 'Reset') return true
        return typeof c.amount === 'number'
      }),
    )
  })

  it('produces values without a `tag` key', () => {
    const arbCounter = mkArbitraryCustom<CounterAction, 'type'>('type', {
      Increment: { amount: fc.integer() },
      Reset: {},
    })

    fc.assert(fc.property(arbCounter, c => !('tag' in c) && 'type' in c))
  })
})

// ===========================================================================
// Error cases
// ===========================================================================

describe('mkArbitrary error handling', () => {
  it('throws on empty spec', () => {
    expect(() =>
      // biome-ignore lint/suspicious/noExplicitAny: exercising runtime error
      mkArbitrary<Maybe<number>>({} as any),
    ).toThrow(/at least one member/)
  })

  it('accepts partial spec at runtime — completeness is a TypeScript guarantee', () => {
    // Documented behavior: mkArbitrary has no runtime type info, so it cannot
    // detect a missing member. A spec with only some members produces an
    // arbitrary that generates only those members. Completeness is enforced
    // by `ArbitrarySpec`'s mapped type at compile time; bypassing it with
    // `as any` is accepted at runtime and silently produces a partial
    // generator. Callers wanting runtime validation should assert on the
    // union tag list themselves.
    const arbPartial = mkArbitrary<Maybe<number>>(
      // biome-ignore lint/suspicious/noExplicitAny: exercising partial spec
      { Just: { value: fc.integer() } } as any,
    )
    fc.assert(fc.property(arbPartial, m => m.tag === 'Just'))
  })
})

// ===========================================================================
// Integration: round-trip generated values through parse/equals/show
// ===========================================================================

import type { MkData, TaggedLambda1, TaggedLambda2 } from '../../src/named'
import { mkTaggedUnion } from '../../src/named'

interface MaybeLambda extends TaggedLambda1 {
  readonly type: Maybe<this['A']>
  readonly data: MkData<this['type']>
}
interface StreamLambda extends TaggedLambda2 {
  readonly type: Stream<this['E'], this['A']>
  readonly data: MkData<this['type']>
}

const MaybeU = mkTaggedUnion<MaybeLambda>({ Just: true, Nothing: false })
const StreamU = mkTaggedUnion<StreamLambda>({ Emit: true, End: false })

describe('mkArbitrary round-trips', () => {
  const arbMaybe = mkArbitrary<Maybe<number>>({
    Just: { value: fc.integer() },
    Nothing: {},
  })

  it('generated values are parseable by the matching union', () => {
    fc.assert(fc.property(arbMaybe, m => MaybeU.parse(m) !== undefined))
  })

  it('generated values survive JSON round-trip under equals', () => {
    fc.assert(
      fc.property(arbMaybe, m => {
        const clone = JSON.parse(JSON.stringify(m)) as typeof m
        return MaybeU.equals(m, clone)
      }),
    )
  })

  it('each generated value matches exactly one guard', () => {
    fc.assert(
      fc.property(arbMaybe, m => {
        const hits = MaybeU.tags.filter(tag => {
          const guard = MaybeU.is[tag as keyof typeof MaybeU.is] as (
            x: unknown,
          ) => boolean
          return guard(m)
        })
        return hits.length === 1
      }),
    )
  })

  it('multi-field positional-style unions round-trip too', () => {
    const arbStream = mkArbitrary<Stream<string, number>>({
      Emit: { state: fc.string(), value: fc.integer() },
      End: {},
    })
    fc.assert(
      fc.property(arbStream, s => {
        const clone = JSON.parse(JSON.stringify(s)) as typeof s
        return StreamU.equals(s, clone) && StreamU.parse(s) !== undefined
      }),
    )
  })
})
