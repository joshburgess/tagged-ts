/**
 * @since 0.2.0
 */

// internal type-level utilities

/**
 * Used to specify the string keys of an object or union of objects
 *
 * @since 0.2.0
 *
 * @internal !!! Use at your own risk, could change at any time !!!
 */
export type StringKeyOf<A extends object> = keyof A & string

/**
 * Select the member of a union type by matching on the the provided key, `K`,
 * and value, `V`, returning `never` if no match occurs
 *
 * @since 0.2.0
 *
 * @internal !!! Use at your own risk, could change at any time !!!
 */
export type SelectUnionMember<K extends PropertyKey, T, U> = U extends {
  [P in K]: T
} & infer A
  ? unknown extends A
    ? U
    : A
  : never
