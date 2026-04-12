/**
 * Type Lambda machinery for simulating Higher-Kinded Types.
 *
 * Instead of using a global registry with declaration merging, users define
 * a TypeLambda interface that carries both the union type and the data
 * constructor map, computed from `this`-based type parameter slots.
 *
 * @since 0.3.0
 */

import type { StringKeyOf } from './internal/Utils.js'

// ---------------------------------------------------------------------------
// Type Lambda base interfaces
// ---------------------------------------------------------------------------

/**
 * Base type lambda for nullary type constructors (kind: `*`).
 *
 * Extend this interface and override `type` and `data` to define a
 * tagged union with no type parameters.
 *
 * @since 0.3.0
 */
export interface TaggedLambda0 {
  readonly type: unknown
  readonly data: Record<string, unknown>
}

/**
 * Type lambda for unary type constructors (kind: `* -> *`).
 *
 * Use `this['A']` in your `type` and `data` overrides to reference
 * the type parameter.
 *
 * @example
 * ```ts
 * type Nothing = { readonly tag: 'Nothing' }
 * type Just<A> = { readonly tag: 'Just'; readonly value: A }
 * type Maybe<A> = Just<A> | Nothing
 *
 * interface MaybeLambda extends TaggedLambda1 {
 *   readonly type: Maybe<this['A']>
 *   readonly data: MkData<this['type']>
 * }
 * ```
 *
 * @since 0.3.0
 */
export interface TaggedLambda1 extends TaggedLambda0 {
  readonly A: unknown
}

/**
 * Type lambda for binary type constructors (kind: `* -> * -> *`).
 *
 * Use `this['E']` and `this['A']` in your overrides.
 *
 * @since 0.3.0
 */
export interface TaggedLambda2 extends TaggedLambda1 {
  readonly E: unknown
}

/**
 * Type lambda for ternary type constructors (kind: `* -> * -> * -> *`).
 *
 * Use `this['R']`, `this['E']`, and `this['A']` in your overrides.
 *
 * @since 0.3.0
 */
export interface TaggedLambda3 extends TaggedLambda2 {
  readonly R: unknown
}

/**
 * Type lambda for quaternary type constructors (kind: `* -> * -> * -> * -> *`).
 *
 * Use `this['S']`, `this['R']`, `this['E']`, and `this['A']` in your overrides.
 *
 * @since 0.3.0
 */
export interface TaggedLambda4 extends TaggedLambda3 {
  readonly S: unknown
}

/**
 * Union of all TaggedLambda arities.
 *
 * @since 0.3.0
 */
export type TaggedLambda =
  | TaggedLambda0
  | TaggedLambda1
  | TaggedLambda2
  | TaggedLambda3
  | TaggedLambda4

// ---------------------------------------------------------------------------
// Apply: substitute type arguments into a lambda
// ---------------------------------------------------------------------------

/**
 * Apply a nullary lambda to get the union type.
 *
 * @since 0.3.0
 */
export type ApplyType0<F extends TaggedLambda0> = F['type']

/**
 * Apply a unary lambda with one type argument.
 *
 * @since 0.3.0
 */
export type ApplyType1<F extends TaggedLambda1, A> = (F & {
  readonly A: A
})['type']

/**
 * Apply a binary lambda with two type arguments.
 *
 * @since 0.3.0
 */
export type ApplyType2<F extends TaggedLambda2, E, A> = (F & {
  readonly E: E
  readonly A: A
})['type']

/**
 * Apply a ternary lambda with three type arguments.
 *
 * @since 0.3.0
 */
export type ApplyType3<F extends TaggedLambda3, R, E, A> = (F & {
  readonly R: R
  readonly E: E
  readonly A: A
})['type']

/**
 * Apply a quaternary lambda with four type arguments.
 *
 * @since 0.3.0
 */
export type ApplyType4<F extends TaggedLambda4, S, R, E, A> = (F & {
  readonly S: S
  readonly R: R
  readonly E: E
  readonly A: A
})['type']

// ---------------------------------------------------------------------------
// ApplyData: substitute type arguments to get the data constructor map
// ---------------------------------------------------------------------------

/**
 * @since 0.3.0
 */
export type ApplyData0<F extends TaggedLambda0> = F['data']

/**
 * @since 0.3.0
 */
export type ApplyData1<F extends TaggedLambda1, A> = (F & {
  readonly A: A
})['data']

/**
 * @since 0.3.0
 */
export type ApplyData2<F extends TaggedLambda2, E, A> = (F & {
  readonly E: E
  readonly A: A
})['data']

/**
 * @since 0.3.0
 */
export type ApplyData3<F extends TaggedLambda3, R, E, A> = (F & {
  readonly R: R
  readonly E: E
  readonly A: A
})['data']

/**
 * @since 0.3.0
 */
export type ApplyData4<F extends TaggedLambda4, S, R, E, A> = (F & {
  readonly S: S
  readonly R: R
  readonly E: E
  readonly A: A
})['data']

// ---------------------------------------------------------------------------
// Arity detection: determine which lambda kind F is
// ---------------------------------------------------------------------------

/**
 * True if F has the `S` slot (extends TaggedLambda4 but not just TaggedLambda3).
 * We detect by checking if `S` is a known key beyond the TaggedLambda3 shape.
 *
 * @since 0.3.0
 */
export type IsLambda4<F extends TaggedLambda0> = F extends TaggedLambda4
  ? true
  : false

/**
 * @since 0.3.0
 */
export type IsLambda3<F extends TaggedLambda0> = F extends TaggedLambda4
  ? false
  : F extends TaggedLambda3
    ? true
    : false

/**
 * @since 0.3.0
 */
export type IsLambda2<F extends TaggedLambda0> = F extends TaggedLambda3
  ? false
  : F extends TaggedLambda2
    ? true
    : false

/**
 * @since 0.3.0
 */
export type IsLambda1<F extends TaggedLambda0> = F extends TaggedLambda2
  ? false
  : F extends TaggedLambda1
    ? true
    : false

/**
 * @since 0.3.0
 */
export type IsLambda0<F extends TaggedLambda0> = F extends TaggedLambda1
  ? false
  : true

// ---------------------------------------------------------------------------
// Helper: get the discriminant values from the data map keys
// ---------------------------------------------------------------------------

/**
 * Extract the discriminant (tag) values from a lambda's data map keys.
 *
 * @since 0.3.0
 */
export type DataKeys<F extends TaggedLambda0> = StringKeyOf<F['data']>

// ---------------------------------------------------------------------------
// MkData: auto-generate a data map from a discriminated union type
// ---------------------------------------------------------------------------

/**
 * Compute a data constructor map from a discriminated union type.
 *
 * Given a union type `T` and its discriminant key `DK`, produces a record
 * mapping each discriminant value to its corresponding union member.
 *
 * This eliminates the need to manually define a separate data map type.
 *
 * @example
 * ```ts
 * type Nothing = { readonly tag: 'Nothing' }
 * type Just<A> = { readonly tag: 'Just'; readonly value: A }
 * type Maybe<A> = Just<A> | Nothing
 *
 * interface MaybeLambda extends TaggedLambda1 {
 *   readonly type: Maybe<this['A']>
 *   readonly data: MkData<this['type']> // auto-computed!
 * }
 * ```
 *
 * @example
 * ```ts
 * // With a custom discriminant key:
 * type First<A> = { readonly kind: 'First'; readonly value: A }
 * type Second<A> = { readonly kind: 'Second'; readonly value: A }
 * type Third = { readonly kind: 'Third' }
 * type Trio<A> = First<A> | Second<A> | Third
 *
 * interface TrioLambda extends TaggedLambda1 {
 *   readonly type: Trio<this['A']>
 *   readonly data: MkData<this['type'], 'kind'>
 * }
 * ```
 *
 * @since 0.3.0
 */
export type MkData<T extends object, DK extends string = 'tag'> = {
  readonly [K in T[DK & keyof T] & string]: Extract<T, { [P in DK]: K }>
}
