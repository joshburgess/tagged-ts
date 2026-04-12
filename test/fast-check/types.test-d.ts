/**
 * Type-level tests for tagged-ts/fast-check.
 *
 * Covers `mkArbitrary`, `mkArbitraryCustom`, `ArbitrarySpec`, and
 * `FieldArbs`. Verifies that:
 * - Spec completeness is enforced at compile time (missing member rejected)
 * - Non-nullary members require all declared fields
 * - Field arbitrary types must match the declared field types
 * - Nullary members reject extra field arbitraries
 * - Custom discriminant key is threaded through ArbitrarySpec
 *
 * This file is loaded by vitest's typecheck mode (see vitest.config.ts)
 * and is also picked up by `tsc --noEmit`.
 */

import fc, { type Arbitrary } from 'fast-check'
import { describe, expectTypeOf, test } from 'vitest'
import type { ArbitrarySpec, FieldArbs } from '../../src/fast-check'
import { mkArbitrary, mkArbitraryCustom } from '../../src/fast-check'

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

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
  test('return type is Arbitrary<U>', () => {
    const arb = mkArbitrary<Maybe<number>>({
      Just: { value: fc.integer() },
      Nothing: {},
    })
    expectTypeOf(arb).toEqualTypeOf<Arbitrary<Maybe<number>>>()
  })

  test('spec requires all members (completeness)', () => {
    // @ts-expect-error - missing 'Nothing' member
    mkArbitrary<Maybe<number>>({ Just: { value: fc.integer() } })
  })

  test('non-nullary member requires all declared fields', () => {
    mkArbitrary<Maybe<number>>({
      // @ts-expect-error - missing 'value' arbitrary on Just
      Just: {},
      Nothing: {},
    })
  })

  test('rejects wrong field arbitrary type', () => {
    mkArbitrary<Maybe<number>>({
      // @ts-expect-error - value is number, but arbitrary is Arbitrary<string>
      Just: { value: fc.string() },
      Nothing: {},
    })
  })

  test('rejects unknown field names', () => {
    mkArbitrary<Maybe<number>>({
      // @ts-expect-error - 'val' is not a field of Just
      Just: { val: fc.integer() },
      Nothing: {},
    })
  })

  test('rejects fields on nullary members', () => {
    mkArbitrary<Maybe<number>>({
      Just: { value: fc.integer() },
      // @ts-expect-error - Nothing has no fields
      Nothing: { extra: fc.integer() },
    })
  })

  test('multi-field non-nullary members (Stream)', () => {
    const arb = mkArbitrary<Stream<string, number>>({
      Emit: { state: fc.string(), value: fc.integer() },
      End: {},
    })
    expectTypeOf(arb).toEqualTypeOf<Arbitrary<Stream<string, number>>>()
  })

  test('multi-field requires all fields', () => {
    mkArbitrary<Stream<string, number>>({
      // @ts-expect-error - missing 'value' field
      Emit: { state: fc.string() },
      End: {},
    })
  })

  test('multi-member Result both sides typed correctly', () => {
    const arb = mkArbitrary<Result<string, number>>({
      Success: { value: fc.integer() },
      Failure: { error: fc.string() },
    })
    expectTypeOf(arb).toEqualTypeOf<Arbitrary<Result<string, number>>>()
  })

  test('rejects cross-swapped field arbitraries (Result)', () => {
    mkArbitrary<Result<string, number>>({
      // @ts-expect-error - value is number, not string
      Success: { value: fc.string() },
      Failure: { error: fc.string() },
    })
  })
})

// ===========================================================================
// mkArbitraryCustom
// ===========================================================================

describe('mkArbitraryCustom', () => {
  test('threads custom discriminant through ArbitrarySpec', () => {
    const arb = mkArbitraryCustom<CounterAction, 'type'>('type', {
      Increment: { amount: fc.integer() },
      Reset: {},
    })
    expectTypeOf(arb).toEqualTypeOf<Arbitrary<CounterAction>>()
  })

  test('rejects spec shaped for wrong discriminant key', () => {
    mkArbitraryCustom<CounterAction, 'type'>('type', {
      // @ts-expect-error - Reset has no fields, cannot take an arbitrary
      Reset: { amount: fc.integer() },
      Increment: { amount: fc.integer() },
    })
  })

  test('rejects wrong field type under custom discriminant', () => {
    mkArbitraryCustom<CounterAction, 'type'>('type', {
      // @ts-expect-error - amount is number, not string
      Increment: { amount: fc.string() },
      Reset: {},
    })
  })

  test('requires all members under custom discriminant', () => {
    // @ts-expect-error - missing 'Reset' member
    mkArbitraryCustom<CounterAction, 'type'>('type', {
      Increment: { amount: fc.integer() },
    })
  })
})

// ===========================================================================
// FieldArbs
// ===========================================================================

describe('FieldArbs<Fields>', () => {
  test('maps each field to Arbitrary<FieldType>', () => {
    expectTypeOf<FieldArbs<{ a: number; b: string }>>().toEqualTypeOf<{
      a: Arbitrary<number>
      b: Arbitrary<string>
    }>()
  })

  test('preserves readonly fields (kept as Arbitrary<T>)', () => {
    expectTypeOf<
      FieldArbs<{ readonly a: number; readonly b: boolean }>
    >().toEqualTypeOf<{
      readonly a: Arbitrary<number>
      readonly b: Arbitrary<boolean>
    }>()
  })

  test('empty fields map to empty object', () => {
    expectTypeOf<FieldArbs<{}>>().toEqualTypeOf<{}>()
  })
})

// ===========================================================================
// ArbitrarySpec
// ===========================================================================

describe('ArbitrarySpec<U, DK>', () => {
  test('nullary member maps to Record<string, never>', () => {
    type NothingSpec = ArbitrarySpec<Maybe<number>, 'tag'>['Nothing']
    expectTypeOf<NothingSpec>().toEqualTypeOf<Record<string, never>>()
  })

  test('non-nullary member maps to FieldArbs of its fields', () => {
    type JustSpec = ArbitrarySpec<Maybe<number>, 'tag'>['Just']
    expectTypeOf<JustSpec>().toEqualTypeOf<{
      readonly value: Arbitrary<number>
    }>()
  })

  test('multi-field non-nullary member (Emit)', () => {
    type EmitSpec = ArbitrarySpec<Stream<string, number>, 'tag'>['Emit']
    expectTypeOf<EmitSpec>().toEqualTypeOf<{
      readonly state: Arbitrary<string>
      readonly value: Arbitrary<number>
    }>()
  })

  test('custom discriminant: Increment under "type" key', () => {
    type IncSpec = ArbitrarySpec<CounterAction, 'type'>['Increment']
    expectTypeOf<IncSpec>().toEqualTypeOf<{
      readonly amount: Arbitrary<number>
    }>()
  })

  test('custom discriminant: Reset is nullary Record<string, never>', () => {
    type ResetSpec = ArbitrarySpec<CounterAction, 'type'>['Reset']
    expectTypeOf<ResetSpec>().toEqualTypeOf<Record<string, never>>()
  })

  test('spec keys are the union discriminant tag literals', () => {
    expectTypeOf<keyof ArbitrarySpec<Maybe<number>, 'tag'>>().toEqualTypeOf<
      'Just' | 'Nothing'
    >()
    expectTypeOf<
      keyof ArbitrarySpec<Result<string, number>, 'tag'>
    >().toEqualTypeOf<'Success' | 'Failure'>()
    expectTypeOf<keyof ArbitrarySpec<CounterAction, 'type'>>().toEqualTypeOf<
      'Increment' | 'Reset'
    >()
  })
})
