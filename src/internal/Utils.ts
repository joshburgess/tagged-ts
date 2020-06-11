/**
 * @since 0.2.0
 */

// internal type-level utilities

/**
 * A version of `keyof` that distributes over the members of a union type
 *
 * @since 0.2.0
 *
 * @internal !!! Use at your own risk, could change at any time !!!
 */
export type DistributiveKeyOf<U extends object> = U extends unknown
  ? keyof U
  : never

/**
 * Select the member of a union type by matching on the the provided key, `K`,
 * and value, `V`, returning `never` if no match occurs
 *
 * @since 0.2.0
 *
 * @internal !!! Use at your own risk, could change at any time !!!
 */
export type SelectUnionMember<
  K extends PropertyKey,
  T,
  U extends object
> = U extends {
  [P in K]: T
} &
  infer A
  ? unknown extends A
    ? U
    : A
  : never

/**
 * Used to specify the string keys of an object or union of objects
 *
 * @since 0.2.0
 *
 * @internal !!! Use at your own risk, could change at any time !!!
 */
export type StringKeyOf<A extends object> = keyof A & string

/**
 * A type-level representation of the tag for a data constructor
 *
 * @since 0.2.0
 *
 * @internal !!! Use at your own risk, could change at any time !!!
 */
export type DiscriminantValue<
  A extends object,
  DiscriminantKey extends StringKeyOf<A>
> = A[DiscriminantKey] & string

/**
 * A type-level representation of a member of a tagged union
 *
 * @since 0.2.0
 *
 * @internal !!! Use at your own risk, could change at any time !!!
 */
export type DiscriminatedUnionMember<
  A extends object,
  DiscriminantKey extends StringKeyOf<A>,
  Value extends DiscriminantValue<A, DiscriminantKey>
> = Extract<A, { [K in DiscriminantKey]: Value }>

/**
 * An interface used to construct (simulated) Nominal types
 *
 * @since 0.2.0
 *
 * @internal !!! Use at your own risk, could change at any time !!!
 */
export interface Nominal<Identifier extends string, A> {
  readonly _Identifier: Identifier
  readonly _Symbol: unique symbol
  readonly _A: A
}

// internal run-time utilities

/**
 * Keys the tags associated with each member of a tagged union
 *
 * @since 0.2.0
 *
 * @internal !!! Use at your own risk, could change at any time !!!
 */
export const getMemberTags = <
  A extends Record<string, unknown>,
  K extends keyof A
>(
  x: A,
): ReadonlyArray<K> => (Object.keys(x) as unknown) as ReadonlyArray<K>

/**
 * Unsafe type coercion, converting any `A` into any `B`
 *
 * @since 0.2.0
 *
 * @internal !!! Use at your own risk, could change at any time !!!
 */
export const unsafeCoerce = <A, B>(a: A): B => (a as unknown) as B
