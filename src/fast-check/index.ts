/**
 * fast-check arbitrary generators for tagged unions.
 *
 * Produces `Arbitrary<Union>` instances from a spec of field arbitraries
 * keyed by member tag. Works with both the named and positional
 * constructor styles — the generated shape is identical, only the
 * constructor API differs.
 *
 * Requires `fast-check` as a peer dependency.
 *
 * @example
 * ```ts
 * import fc from 'fast-check'
 * import { mkArbitrary } from 'tagged-ts/fast-check'
 *
 * type Nothing = { readonly tag: 'Nothing' }
 * type Just<A> = { readonly tag: 'Just'; readonly value: A }
 * type Maybe<A> = Just<A> | Nothing
 *
 * const arbMaybe = mkArbitrary<Maybe<number>>({
 *   Just: { value: fc.integer() },
 *   Nothing: {},
 * })
 *
 * fc.assert(
 *   fc.property(arbMaybe, m => typeof m.tag === 'string'),
 * )
 * ```
 *
 * @since 0.6.0
 */

import fc, { type Arbitrary } from 'fast-check'

// ---------------------------------------------------------------------------
// Spec types
// ---------------------------------------------------------------------------

/**
 * Record of field arbitraries matching the field types of a single
 * non-nullary union member.
 *
 * @since 0.6.0
 */
export type FieldArbs<Fields> = {
  [K in keyof Fields]: Arbitrary<Fields[K]>
}

/**
 * Spec for building an `Arbitrary<U>` for a discriminated union `U`.
 *
 * For each member (keyed by its discriminant value):
 * - Nullary members (no fields beyond the discriminant) take `{}`.
 * - Non-nullary members take a record of field arbitraries keyed by
 *   field name.
 *
 * `DK` defaults to `'tag'`. Override when your union uses a different
 * discriminant key.
 *
 * @since 0.6.0
 */
export type ArbitrarySpec<U extends object, DK extends string = 'tag'> = {
  [K in U[DK & keyof U] & string]: {} extends Omit<
    Extract<U, { [P in DK]: K }>,
    DK
  >
    ? Record<string, never>
    : FieldArbs<Omit<Extract<U, { [P in DK]: K }>, DK>>
}

// ---------------------------------------------------------------------------
// Runtime implementation
// ---------------------------------------------------------------------------

const mkArbitraryImpl = <U extends object>(
  dk: string,
  spec: Record<string, Record<string, Arbitrary<unknown>>>,
): Arbitrary<U> => {
  const arbs: Arbitrary<unknown>[] = []
  for (const [memberTag, fieldSpec] of Object.entries(spec)) {
    const fieldEntries = Object.entries(fieldSpec)
    if (fieldEntries.length === 0) {
      arbs.push(fc.constant({ [dk]: memberTag }))
    } else {
      const recordSpec: Record<string, Arbitrary<unknown>> = {}
      for (const [k, v] of fieldEntries) recordSpec[k] = v
      arbs.push(
        fc.record(recordSpec).map(fields => ({ [dk]: memberTag, ...fields })),
      )
    }
  }
  if (arbs.length === 0) {
    throw new Error('mkArbitrary: spec must contain at least one member')
  }
  return fc.oneof(
    ...(arbs as [Arbitrary<unknown>, ...Arbitrary<unknown>[]]),
  ) as Arbitrary<U>
}

// ---------------------------------------------------------------------------
// Main API
// ---------------------------------------------------------------------------

/**
 * Build a fast-check `Arbitrary<U>` for a discriminated union using the
 * default discriminant key `'tag'`. For custom discriminants, use
 * `mkArbitraryCustom`.
 *
 * @example
 * ```ts
 * const arbMaybe = mkArbitrary<Maybe<number>>({
 *   Just: { value: fc.integer() },
 *   Nothing: {},
 * })
 * ```
 *
 * @since 0.6.0
 */
export const mkArbitrary = <U extends object>(
  spec: ArbitrarySpec<U, 'tag'>,
): Arbitrary<U> =>
  mkArbitraryImpl<U>(
    'tag',
    spec as Record<string, Record<string, Arbitrary<unknown>>>,
  )

/**
 * Build a fast-check `Arbitrary<U>` for a discriminated union with a
 * custom discriminant key.
 *
 * @example
 * ```ts
 * const arbCounter = mkArbitraryCustom<CounterAction, 'type'>('type', {
 *   Increment: { amount: fc.integer() },
 *   Reset: {},
 * })
 * ```
 *
 * @since 0.6.0
 */
export const mkArbitraryCustom = <U extends object, DK extends string>(
  dk: DK,
  spec: ArbitrarySpec<U, DK>,
): Arbitrary<U> =>
  mkArbitraryImpl<U>(
    dk,
    spec as Record<string, Record<string, Arbitrary<unknown>>>,
  )
