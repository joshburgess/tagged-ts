/**
 * @since 0.0.1
 */

import {
  DiscriminantValue,
  DiscriminatedUnionMember,
  Nominal,
  SelectUnionMember,
  StringKeyOf,
  getMemberTags,
  unsafeCoerce,
} from './internal/Utils'
import {
  GetType,
  KeyOfTypeConstructorRegistry,
  GetData,
  GetSpec,
  SpecData,
  SpecType,
  TypeConstructorRegistry0,
  TypeConstructorRegistry1,
  TypeConstructorRegistry2,
  TypeConstructorRegistry3,
  TypeConstructorRegistry4,
} from './Registry'

/**
 * Used as configuration to set the `NullaryConstructorsMode` to 'constant'
 *
 * @since 0.0.1
 */
export const constant = 'constant'

/**
 * The `NullaryConstructorsMode` setting for 'constant' nullary constructors
 *
 * @since 0.0.1
 */
export type NullaryConstructorsMode_Constant = typeof constant

/**
 * Used as configuration to set the `NullaryConstructorsMode` to 'thunk'
 *
 * @since 0.0.1
 */
export const thunk = 'thunk'

/**
 * The `NullaryConstructorsMode` setting for 'thunk' nullary constructors
 *
 * @since 0.0.1
 */
export type NullaryConstructorsMode_Thunk = typeof thunk

/**
 * A union of the valid options used to set the nullary constructors mode
 *
 * @since 0.0.1
 */
export type NullaryConstructorsMode =
  | NullaryConstructorsMode_Constant
  | NullaryConstructorsMode_Thunk

/**
 * NOT EXPORTED
 *
 * @since 0.0.1
 */
const mk__ = (a: void): __ => unsafeCoerce<void, __>(a)

/**
 * NOT EXPORTED
 *
 * @since 0.0.1
 */
// tslint:disable-next-line class-name
interface __ extends Nominal<'__', void> {}

/**
 * A value of type `__`, a Nominal type equivalent to the run-time type `void`
 *
 * Used as a placeholder when interacting with the library's generation functions
 *
 * @since 0.0.1
 */
export const __ = mk__(undefined)

// generated capabilities

/**
 * A type-level representation of a tagged union's generated data constructors
 *
 * @since 0.0.1
 */
export type Constructors<
  TypeURI extends KeyOfTypeConstructorRegistry,
  T extends GetType<TypeURI>,
  DiscriminantKey extends StringKeyOf<T>,
  Mode extends NullaryConstructorsMode
> = {
  [MemberURI in DiscriminantValue<T, DiscriminantKey>]: {} extends Omit<
    DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>,
    DiscriminantKey
  > // has no fields other than the discriminant field
    ? TypeURI extends keyof TypeConstructorRegistry0
      ? Mode extends NullaryConstructorsMode_Constant
        ? TypeConstructorRegistry0[TypeURI][SpecType]
        : () => TypeConstructorRegistry0[TypeURI][SpecType]
      : TypeURI extends keyof TypeConstructorRegistry1<unknown>
      ? Mode extends NullaryConstructorsMode_Constant
        ? TypeConstructorRegistry1<never>[TypeURI][SpecType]
        : <A>() => TypeConstructorRegistry1<A>[TypeURI][SpecType]
      : TypeURI extends keyof TypeConstructorRegistry2<unknown, unknown>
      ? Mode extends NullaryConstructorsMode_Constant
        ? TypeConstructorRegistry2<never, never>[TypeURI][SpecType]
        : <E, A>() => TypeConstructorRegistry2<E, A>[TypeURI][SpecType]
      : TypeURI extends keyof TypeConstructorRegistry3<
          unknown,
          unknown,
          unknown
        >
      ? Mode extends NullaryConstructorsMode_Constant
        ? TypeConstructorRegistry3<never, never, never>[TypeURI][SpecType]
        : <R, E, A>() => TypeConstructorRegistry3<R, E, A>[TypeURI][SpecType]
      : TypeURI extends keyof TypeConstructorRegistry4<
          unknown,
          unknown,
          unknown,
          unknown
        >
      ? Mode extends NullaryConstructorsMode_Constant
        ? TypeConstructorRegistry4<
            never,
            never,
            never,
            never
          >[TypeURI][SpecType]
        : <S, R, E, A>() => TypeConstructorRegistry4<
            S,
            R,
            E,
            A
          >[TypeURI][SpecType]
      : never // has extra fields
    : TypeURI extends keyof TypeConstructorRegistry0
    ? (
        fields: {
          [Field in keyof Omit<
            DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>,
            DiscriminantKey
          >]: MemberURI extends keyof TypeConstructorRegistry0[TypeURI][SpecData]
            ? Field extends TypeConstructorRegistry0[TypeURI][SpecData][MemberURI]
              ? TypeConstructorRegistry0[TypeURI][SpecData][MemberURI][Field]
              : never
            : never
        },
      ) => TypeConstructorRegistry0[TypeURI][SpecType]
    : TypeURI extends keyof TypeConstructorRegistry1<unknown>
    ? <A>(
        fields: {
          [Field in keyof Omit<
            DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>,
            DiscriminantKey
          >]: MemberURI extends keyof TypeConstructorRegistry1<
            A
          >[TypeURI][SpecData]
            ? Field extends keyof TypeConstructorRegistry1<
                A
              >[TypeURI][SpecData][MemberURI]
              ? TypeConstructorRegistry1<A>[TypeURI][SpecData][MemberURI][Field]
              : never
            : never
        },
      ) => TypeConstructorRegistry1<A>[TypeURI][SpecType]
    : TypeURI extends keyof TypeConstructorRegistry2<unknown, unknown>
    ? <E, A>(
        fields: {
          [Field in keyof Omit<
            DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>,
            DiscriminantKey
          >]: MemberURI extends keyof TypeConstructorRegistry2<
            E,
            A
          >[TypeURI][SpecData]
            ? Field extends keyof TypeConstructorRegistry2<
                E,
                A
              >[TypeURI][SpecData][MemberURI]
              ? TypeConstructorRegistry2<
                  E,
                  A
                >[TypeURI][SpecData][MemberURI][Field]
              : never
            : never
        },
      ) => TypeConstructorRegistry2<E, A>[TypeURI][SpecType]
    : TypeURI extends keyof TypeConstructorRegistry3<unknown, unknown, unknown>
    ? <R, E, A>(
        fields: {
          [Field in keyof Omit<
            DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>,
            DiscriminantKey
          >]: MemberURI extends keyof TypeConstructorRegistry3<
            R,
            E,
            A
          >[TypeURI][SpecData]
            ? Field extends keyof TypeConstructorRegistry3<
                R,
                E,
                A
              >[TypeURI][SpecData][MemberURI]
              ? TypeConstructorRegistry3<
                  R,
                  E,
                  A
                >[TypeURI][SpecData][MemberURI][Field]
              : never
            : never
        },
      ) => TypeConstructorRegistry3<R, E, A>[TypeURI][SpecType]
    : TypeURI extends keyof TypeConstructorRegistry4<
        unknown,
        unknown,
        unknown,
        unknown
      >
    ? <S, R, E, A>(
        fields: {
          [Field in keyof Omit<
            DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>,
            DiscriminantKey
          >]: MemberURI extends TypeConstructorRegistry4<
            S,
            R,
            E,
            A
          >[TypeURI][SpecData]
            ? Field extends keyof TypeConstructorRegistry4<
                S,
                R,
                E,
                A
              >[TypeURI][SpecData]
              ? TypeConstructorRegistry4<
                  S,
                  R,
                  E,
                  A
                >[TypeURI][SpecData][MemberURI][Field]
              : never
            : never
        },
      ) => TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecType]
    : never
}

/**
 * Generates data constructors for the members of a tagged union
 *
 * @since 0.0.1
 */
export const mkConstructors = <
  TypeURI extends KeyOfTypeConstructorRegistry
>() => <
  T extends GetType<TypeURI>,
  DiscriminantKey extends StringKeyOf<T>,
  Mode extends NullaryConstructorsMode
>(
  config: {
    readonly discriminantKey: DiscriminantKey
    readonly nullaryConstructorsMode: Mode
  },
  memberTagsRecord: Mode extends NullaryConstructorsMode_Constant
    ? {
        [K in DiscriminantValue<T, DiscriminantKey>]: {
          [Fields in keyof GetSpec<TypeURI>[SpecData][K &
            keyof GetSpec<TypeURI>[SpecData]]]: __
        }
      }
    : {
        [K in DiscriminantValue<T, DiscriminantKey>]: __
      },
): Constructors<TypeURI, T, DiscriminantKey, Mode> => {
  const result = {} as {
    [K in DiscriminantValue<T, DiscriminantKey>]: Constructors<
      TypeURI,
      T,
      DiscriminantKey,
      Mode
    >[K]
  }

  if (config.nullaryConstructorsMode === constant) {
    const pairs = <R extends typeof memberTagsRecord>(rec: R) =>
      (Object.entries(rec) as unknown) as ReadonlyArray<
        readonly [
          DiscriminantValue<T, DiscriminantKey>,
          {
            [K in DiscriminantValue<T, DiscriminantKey>]: {
              [Fields in keyof GetSpec<TypeURI>[SpecData][K &
                keyof GetSpec<TypeURI>[SpecData]]]: __
            }
          }[DiscriminantValue<T, DiscriminantKey>],
        ]
      >

    for (const [memberTag, memberFields] of pairs(memberTagsRecord)) {
      const discriminantPair = { [config.discriminantKey]: memberTag }
      const isNullaryConstructor = Object.keys(memberFields).length === 1

      const constructor = ((isNullaryConstructor
        ? discriminantPair
        : (
            fields: Omit<
              DiscriminatedUnionMember<
                T,
                DiscriminantKey,
                DiscriminantValue<T, DiscriminantKey>
              >,
              DiscriminantKey
            >,
          ) => ({
            ...discriminantPair,
            ...fields,
          })) as unknown) as Constructors<
        TypeURI,
        T,
        DiscriminantKey,
        Mode
      >[typeof memberTag]

      result[memberTag] = constructor
    }
  } else {
    for (const memberTag of getMemberTags(
      memberTagsRecord as {
        [K in DiscriminantValue<T, DiscriminantKey>]: __
      },
    )) {
      const discriminantPair = { [config.discriminantKey]: memberTag }
      const constructor = (((
        fields: Omit<
          DiscriminatedUnionMember<
            T,
            DiscriminantKey,
            DiscriminantValue<T, DiscriminantKey>
          >,
          DiscriminantKey
        >,
      ) =>
        // tslint:disable-next-line strict-type-predicates
        fields === undefined || fields === null || typeof fields !== 'object'
          ? discriminantPair
          : { ...discriminantPair, ...fields }) as unknown) as Constructors<
        TypeURI,
        T,
        DiscriminantKey,
        Mode
      >[typeof memberTag]

      result[memberTag] = constructor
    }
  }

  return result
}

/**
 * A type-level representation of a tagged union's generated `match` function
 *
 * @since 0.0.1
 */
export type Match<
  TypeURI extends KeyOfTypeConstructorRegistry,
  T extends GetType<TypeURI>,
  DiscriminantKey extends StringKeyOf<T>
> = TypeURI extends keyof TypeConstructorRegistry0
  ? <B>(
      a: TypeConstructorRegistry0[TypeURI][SpecType],
      caseHandlers: {
        [K in DiscriminantValue<T, DiscriminantKey>]: (
          x: TypeConstructorRegistry0[TypeURI][SpecData][K &
            keyof TypeConstructorRegistry0[TypeURI][SpecData]],
        ) => B
      },
    ) => B
  : TypeURI extends keyof TypeConstructorRegistry1<unknown>
  ? <A, B>(
      a: TypeConstructorRegistry1<A>[TypeURI][SpecType],
      caseHandlers: {
        [K in DiscriminantValue<T, DiscriminantKey>]: (
          x: TypeConstructorRegistry1<A>[TypeURI][SpecData][K &
            keyof TypeConstructorRegistry1<A>[TypeURI][SpecData]],
        ) => B
      },
    ) => B
  : TypeURI extends keyof TypeConstructorRegistry2<unknown, unknown>
  ? <E, A, B>(
      a: TypeConstructorRegistry2<E, A>[TypeURI][SpecType],
      caseHandlers: {
        [K in DiscriminantValue<T, DiscriminantKey>]: (
          x: TypeConstructorRegistry2<E, A>[TypeURI][SpecData][K &
            keyof TypeConstructorRegistry2<E, A>[TypeURI][SpecData]],
        ) => B
      },
    ) => B
  : TypeURI extends keyof TypeConstructorRegistry3<unknown, unknown, unknown>
  ? <R, E, A, B>(
      a: TypeConstructorRegistry3<R, E, A>[TypeURI][SpecType],
      caseHandlers: {
        [K in DiscriminantValue<T, DiscriminantKey>]: (
          x: TypeConstructorRegistry3<R, E, A>[TypeURI][SpecData][K &
            keyof TypeConstructorRegistry3<R, E, A>[TypeURI][SpecData]],
        ) => B
      },
    ) => B
  : TypeURI extends keyof TypeConstructorRegistry4<
      unknown,
      unknown,
      unknown,
      unknown
    >
  ? <S, R, E, A, B>(
      caseHandlers: {
        [K in DiscriminantValue<T, DiscriminantKey>]: (
          x: TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecData][K &
            keyof TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecData]],
        ) => B
      },
    ) => (a: TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecType]) => B
  : never

/**
 * Generates a `match` function that simulates pattern matching
 *
 * NOTE: Some libraries call this `fold` or `cata` because of the similarity
 * to a "generalized fold"
 *
 * @since 0.0.1
 */
export const mkMatch = <TypeURI extends KeyOfTypeConstructorRegistry>() => <
  T extends GetType<TypeURI>,
  DiscriminantKey extends StringKeyOf<T>
>(config: {
  readonly discriminantKey: DiscriminantKey
}): Match<TypeURI, T, DiscriminantKey> =>
  // internal representation is using loose types & assertions for simplicity
  // the real type information is defined in Match<TypeURI, T, DiscriminantKey>
  (<B>(
    t: T,
    caseHandlers: {
      [K in DiscriminantValue<T, DiscriminantKey>]: (
        x: GetData<TypeURI>[K & keyof GetData<TypeURI>],
      ) => B
    },
  ) => {
    const dataConstructorName = t[config.discriminantKey] as DiscriminantValue<
      T,
      DiscriminantKey
    >
    return caseHandlers[dataConstructorName](
      (t as unknown) as GetSpec<TypeURI>[SpecData][T[DiscriminantKey] &
        string &
        keyof GetSpec<TypeURI>[SpecData]],
    )
  }) as Match<TypeURI, T, DiscriminantKey>

/**
 * A type-level representation of a tagged union's generated type guard predicates
 *
 * @since 0.0.1
 */
export type Guards<
  TypeURI extends KeyOfTypeConstructorRegistry,
  T extends GetType<TypeURI>,
  DiscriminantKey extends StringKeyOf<T>
> = TypeURI extends keyof TypeConstructorRegistry0
  ? {
      [K in DiscriminantValue<T, DiscriminantKey>]: (
        x: TypeConstructorRegistry0[TypeURI][SpecType],
      ) => x is SelectUnionMember<
        DiscriminantKey,
        K,
        TypeConstructorRegistry0[TypeURI][SpecType]
      >
    } & {
      readonly memberOfUnion: <U extends unknown>(
        action: TypeConstructorRegistry0[TypeURI][SpecType] | U,
      ) => action is TypeConstructorRegistry0[TypeURI][SpecType]
    }
  : TypeURI extends keyof TypeConstructorRegistry1<unknown>
  ? {
      [K in DiscriminantValue<T, DiscriminantKey>]: <A>(
        x: TypeConstructorRegistry1<A>[TypeURI][SpecType],
      ) => x is SelectUnionMember<
        DiscriminantKey,
        K,
        TypeConstructorRegistry1<A>[TypeURI][SpecType]
      >
    } & {
      readonly memberOfUnion: <A, U extends unknown>(
        action: TypeConstructorRegistry1<A>[TypeURI][SpecType] | U,
      ) => action is TypeConstructorRegistry1<A>[TypeURI][SpecType]
    }
  : TypeURI extends keyof TypeConstructorRegistry2<unknown, unknown>
  ? {
      [K in DiscriminantValue<T, DiscriminantKey>]: <E, A>(
        x: TypeConstructorRegistry2<E, A>[TypeURI][SpecType],
      ) => x is SelectUnionMember<
        DiscriminantKey,
        K,
        TypeConstructorRegistry2<E, A>[TypeURI][SpecType]
      >
    } & {
      readonly memberOfUnion: <E, A, U extends unknown>(
        action: TypeConstructorRegistry2<E, A>[TypeURI][SpecType] | U,
      ) => action is TypeConstructorRegistry2<E, A>[TypeURI][SpecType]
    }
  : TypeURI extends keyof TypeConstructorRegistry3<unknown, unknown, unknown>
  ? {
      [K in DiscriminantValue<T, DiscriminantKey>]: <R, E, A>(
        x: TypeConstructorRegistry3<R, E, A>[TypeURI][SpecType],
      ) => x is SelectUnionMember<
        DiscriminantKey,
        K,
        TypeConstructorRegistry3<R, E, A>[TypeURI][SpecType]
      >
    } & {
      readonly memberOfUnion: <R, E, A, U extends unknown>(
        action: TypeConstructorRegistry3<R, E, A>[TypeURI][SpecType] | U,
      ) => action is TypeConstructorRegistry3<R, E, A>[TypeURI][SpecType]
    }
  : TypeURI extends keyof TypeConstructorRegistry4<
      unknown,
      unknown,
      unknown,
      unknown
    >
  ? {
      [K in DiscriminantValue<T, DiscriminantKey>]: <S, R, E, A>(
        x: TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecType],
      ) => x is SelectUnionMember<
        DiscriminantKey,
        K,
        TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecType]
      >
    } & {
      readonly memberOfUnion: <S, R, E, A, U extends unknown>(
        action: TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecType] | U,
      ) => action is TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecType]
    }
  : never

/**
 * Generates type guards for the members of a tagged union
 *
 * @since 0.0.1
 */
export const mkGuards = <TypeURI extends KeyOfTypeConstructorRegistry>() => <
  T extends GetType<TypeURI>,
  DiscriminantKey extends StringKeyOf<T>
>(
  config: {
    readonly discriminantKey: DiscriminantKey
  },
  // works with either nullary constructors mode
  memberTagsRecord:
    | {
        [K in DiscriminantValue<T, DiscriminantKey>]: {
          [Fields in keyof GetSpec<TypeURI>[SpecData][K &
            keyof GetSpec<TypeURI>[SpecData]]]: __
        }
      }
    | {
        [K in DiscriminantValue<T, DiscriminantKey>]: __
      },
): Guards<TypeURI, T, DiscriminantKey> => {
  // internal representation is using loose types & assertions for simplicity
  // the real type information is defined in Guards<TypeURI, T, DiscriminantKey>
  const result = {} as Guards<TypeURI, T, DiscriminantKey>

  for (const memberTag of getMemberTags(memberTagsRecord)) {
    const guard = (((
      member: T,
    ): member is Extract<
      T,
      {
        [K in DiscriminantKey]: DiscriminantValue<T, DiscriminantKey>
      }
    > =>
      (member[config.discriminantKey] as DiscriminantValue<
        T,
        DiscriminantKey
      >) === memberTag) as unknown) as Guards<
      TypeURI,
      T,
      DiscriminantKey
    >[DiscriminantValue<T, DiscriminantKey>]

    result[memberTag] = guard
  }

  return {
    ...result,
    memberOfUnion: (
      action:
        | T
        | {
            [K in DiscriminantKey]: DiscriminantValue<T, DiscriminantKey>
          },
    ): action is T => {
      const guards = (Object.values(result) as unknown) as ReadonlyArray<
        Guards<TypeURI, T, DiscriminantKey>['memberOfUnion'] &
          // give a call signature for `guard(action)` down below
          ((x: unknown) => boolean)
      >

      if (!(config.discriminantKey in action)) {
        return false
      }

      for (const guard of guards) {
        if (guard(action)) {
          return true
        }
        continue
      }

      return false
    },
  }
}

/**
 * Generates useful functions for working with a tagged union
 *
 * The most configurable version of this function offered by the library, most
 * useful to those who don't mind passing in a config each time & want maximum
 * flexibility
 *
 * @since 0.0.1
 */
export const mkTaggedUnionCustom = <
  TypeURI extends KeyOfTypeConstructorRegistry
>() => <
  T extends GetType<TypeURI>,
  DiscriminantKey extends StringKeyOf<T>,
  Mode extends NullaryConstructorsMode
>(
  config: {
    readonly discriminantKey: DiscriminantKey
    readonly nullaryConstructorsMode: Mode
  },
  memberTagsRecord: Mode extends NullaryConstructorsMode_Constant
    ? {
        [K in DiscriminantValue<T, DiscriminantKey>]: {
          [Fields in keyof GetSpec<TypeURI>[SpecData][K &
            keyof GetSpec<TypeURI>[SpecData]]]: __
        }
      }
    : {
        [K in DiscriminantValue<T, DiscriminantKey>]: __
      },
) => {
  const constructors = mkConstructors<TypeURI>()(config, memberTagsRecord)
  const basicConfig = { discriminantKey: config.discriminantKey }

  const is = mkGuards<TypeURI>()<T, DiscriminantKey>(
    basicConfig,
    memberTagsRecord,
  )
  const match = mkMatch<TypeURI>()<T, DiscriminantKey>(basicConfig)

  return { ...constructors, is, match }
}

/**
 * Generates useful functions for working with a tagged union
 *
 * The default, go-to generation function provided by the library
 *
 * Discriminant key: `'tag'`
 *
 * Nullary constructors mode: `'constant'`
 *
 * Use `mkTaggedUnionBasic` instead if you're okay with nullary constructors being
 * functions instead of constants and/or you desire less boilerplate
 *
 * @since 0.0.1
 */
export const mkTaggedUnion = <
  TypeURI extends KeyOfTypeConstructorRegistry
>() => <
  T extends GetType<TypeURI>,
  DiscriminantKey extends 'tag' & StringKeyOf<T>
>(
  memberTagsRecord: {
    [K in DiscriminantValue<T, DiscriminantKey>]: {
      [Fields in keyof GetSpec<TypeURI>[SpecData][K &
        keyof GetSpec<TypeURI>[SpecData]]]: __
    }
  },
) => {
  const defaultConfig = {
    discriminantKey: 'tag' as DiscriminantKey,
    nullaryConstructorsMode: constant as NullaryConstructorsMode_Constant,
  }

  // tslint:disable ter-func-call-spacing
  return mkTaggedUnionCustom<TypeURI>()<
    T,
    DiscriminantKey,
    NullaryConstructorsMode_Constant
  >(defaultConfig, memberTagsRecord)
  // tslint:enable ter-func-call-spacing
}

/**
 * Generates useful functions for working with a tagged union
 *
 * An alternate version of `mkTaggedUnion` which represents nullary constructors
 * as functions (thunks) instead of constants, requiring less boilerplate
 *
 * Discriminant key: `'tag'`
 *
 * Nullary constructors mode: `'thunk'`
 *
 * @since 0.0.1
 */
export const mkTaggedUnionBasic = <
  TypeURI extends KeyOfTypeConstructorRegistry
>() => <
  T extends GetType<TypeURI>,
  DiscriminantKey extends 'tag' & StringKeyOf<T>
>(
  memberTagsRecord: {
    [K in DiscriminantValue<T, DiscriminantKey>]: __
  },
) => {
  const defaultConfig = {
    discriminantKey: 'tag' as DiscriminantKey,
    nullaryConstructorsMode: thunk as NullaryConstructorsMode_Thunk,
  }
  // tslint:disable ter-func-call-spacing
  return mkTaggedUnionCustom<TypeURI>()<
    T,
    DiscriminantKey,
    NullaryConstructorsMode_Thunk
  >(defaultConfig, memberTagsRecord)
  // tslint:enable ter-func-call-spacing
}

/**
 * Generates useful functions for working with a tagged union
 *
 * A generation function preconfigured to the right defaults for working with
 * Redux-style actions & action creators
 *
 * Discriminant key: `'type'`
 *
 * Nullary constructors mode: `'thunk'`
 *
 * @since 0.0.1
 */
export const mkTaggedUnionRedux = <
  TypeURI extends KeyOfTypeConstructorRegistry
>() => <
  T extends GetType<TypeURI>,
  DiscriminantKey extends 'type' & StringKeyOf<T>
>(
  memberTagsRecord: {
    [K in DiscriminantValue<T, DiscriminantKey>]: __
  },
) => {
  const defaultConfig = {
    discriminantKey: 'type' as DiscriminantKey,
    nullaryConstructorsMode: thunk as NullaryConstructorsMode_Thunk,
  }
  // tslint:disable ter-func-call-spacing
  return mkTaggedUnionCustom<TypeURI>()<
    T,
    DiscriminantKey,
    NullaryConstructorsMode_Thunk
  >(defaultConfig, memberTagsRecord)
  // tslint:enable ter-func-call-spacing

  // TODO: Add new `mkReducer` functionality
}
