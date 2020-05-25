/**
 * @since 0.0.1
 */

import {
  DistributiveKeyOf,
  DiscriminantValue,
  DiscriminatedUnionMember,
  SelectUnionMember,
  StringKeyOf,
} from './internal/Utils'

// type-level registry machinery

/**
 * A type-level utility that helps to construct a valid type constructor `Spec`
 *
 * @since 0.0.1
 */
export type MkTypeConstructorSpec<
  Type extends object,
  DiscriminantKey extends StringKeyOf<Type>,
  Data extends {
    [K in DiscriminantValue<Type, DiscriminantKey>]: SelectUnionMember<
      DiscriminantKey,
      K,
      DiscriminatedUnionMember<Type, DiscriminantKey, K>
    >
  }
> = {
  readonly type: Type
  readonly data: Data
}

/**
 * A type-level Map for nullary type constructors,
 *
 * or, in other words, those of kind: `*`
 *
 * @since 0.0.1
 */
export interface TypeConstructorRegistry0 {}

/**
 * A type-level Map for type constructors taking 1 type param,
 *
 * or, in other words, those of kind: `* -> *`
 *
 * @since 0.0.1
 */
export interface TypeConstructorRegistry1<A> {}

/**
 * A type-level Map for type constructors taking 2 type params,
 *
 * or, in other words, those of kind: `* -> * -> *`
 *
 * @since 0.0.1
 */
export interface TypeConstructorRegistry2<E, A> {}

/**
 * A type-level Map for type constructors taking 3 type params,
 *
 * or, in other words, those of kind: `* -> * -> * -> *`
 *
 * @since 0.0.1
 */
export interface TypeConstructorRegistry3<R, E, A> {}

/**
 * A type-level Map for type constructors taking 4 type params,
 *
 * or, in other words, those of kind: `* -> * -> * -> * -> *`
 *
 * @since 0.0.1
 */
export interface TypeConstructorRegistry4<S, R, E, A> {}

/**
 * A union of all type constructor registries
 *
 * @since 0.0.1
 */
export type TypeConstructorRegistry =
  | TypeConstructorRegistry0
  | TypeConstructorRegistry1<unknown>
  | TypeConstructorRegistry2<unknown, unknown>
  | TypeConstructorRegistry3<unknown, unknown, unknown>
  | TypeConstructorRegistry4<unknown, unknown, unknown, unknown>

/**
 * A union of all keys of the entries in the type constructor registries
 *
 * @since 0.0.1
 */
export type KeyOfTypeConstructorRegistry = DistributiveKeyOf<
  TypeConstructorRegistry
>

/**
 * A type-level utility that gets the type constructor `Spec` associated with
 * a given key of an entry in one of the type constructor registries
 *
 * @since 0.0.1
 */
export type GetSpec<
  TypeURI extends KeyOfTypeConstructorRegistry
> = TypeURI extends keyof TypeConstructorRegistry0
  ? TypeConstructorRegistry0[TypeURI]
  : TypeURI extends keyof TypeConstructorRegistry1<unknown>
  ? TypeConstructorRegistry1<unknown>[TypeURI]
  : TypeURI extends keyof TypeConstructorRegistry2<unknown, unknown>
  ? TypeConstructorRegistry2<unknown, unknown>[TypeURI]
  : TypeURI extends keyof TypeConstructorRegistry3<unknown, unknown, unknown>
  ? TypeConstructorRegistry3<unknown, unknown, unknown>[TypeURI]
  : TypeURI extends keyof TypeConstructorRegistry4<
      unknown,
      unknown,
      unknown,
      unknown
    >
  ? TypeConstructorRegistry4<unknown, unknown, unknown, unknown>[TypeURI]
  : never

/**
 * A type-level literal string corresponding to the `type` field of a `Spec`
 *
 * @since 0.0.1
 */
export type SpecType = 'type'

/**
 * A type-level literal string corresponding to the `data` field of a `Spec`
 *
 * @since 0.0.1
 */
export type SpecData = 'data'

/**
 * A type-level utility that gets a portion of a type constructor `Spec` when
 * given a type constructor registry key and a `Spec` field, 'type' or 'data'
 *
 * @since 0.0.1
 */
export type GetSpecField<
  TypeURI extends KeyOfTypeConstructorRegistry,
  SpecField extends SpecType | SpecData
> = GetSpec<TypeURI>[SpecField]

/**
 * A type-level utility that gets a the `type` portion of a type constructor
 * `Spec` when given a type constructor registry key
 *
 * @since 0.0.1
 */
export type GetType<
  TypeURI extends KeyOfTypeConstructorRegistry
> = GetSpecField<TypeURI, SpecType>

/**
 * A type-level utility that gets a the `data` portion of a type constructor
 * `Spec` when given a type constructor registry key
 *
 * @since 0.0.1
 */
export type GetData<
  TypeURI extends KeyOfTypeConstructorRegistry
> = GetSpecField<TypeURI, SpecData>
