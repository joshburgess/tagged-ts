/**
 * tagged-ts: Type-safe tagged unions with generated constructors,
 * guards, and pattern matching.
 *
 * @since 0.3.0
 */

import type { SelectUnionMember, StringKeyOf } from './internal/Utils'
import type {
  ApplyData0,
  ApplyData1,
  ApplyData2,
  ApplyData3,
  ApplyData4,
  ApplyType0,
  ApplyType1,
  ApplyType2,
  ApplyType3,
  ApplyType4,
  DataKeys,
  TaggedLambda0,
  TaggedLambda1,
  TaggedLambda2,
  TaggedLambda3,
  TaggedLambda4,
} from './Lambda'

// Re-export Lambda types for user convenience
export type {
  ApplyData0,
  ApplyData1,
  ApplyData2,
  ApplyData3,
  ApplyData4,
  ApplyType0,
  ApplyType1,
  ApplyType2,
  ApplyType3,
  ApplyType4,
  DataKeys,
  MkData,
  TaggedLambda,
  TaggedLambda0,
  TaggedLambda1,
  TaggedLambda2,
  TaggedLambda3,
  TaggedLambda4,
} from './Lambda'

// ---------------------------------------------------------------------------
// MemberSpec
// ---------------------------------------------------------------------------

/**
 * The shape of a data map member with base (unknown) type parameters.
 */
type MemberShape<F extends TaggedLambda0, K extends DataKeys<F>> = F['data'][K &
  keyof F['data']]

/**
 * Describes which members of a tagged union have fields beyond the discriminant.
 *
 * - `['field1', 'field2', ...]` = has fields beyond the discriminant key ->
 *   function constructor with positional args in the specified order
 * - `[]` = no fields beyond the discriminant key -> constant value
 *
 * @example
 * ```ts
 * // Just<A> has `value`, Nothing has no extra fields
 * const Maybe = mkTaggedUnion<MaybeLambda>()({ Just: ['value'], Nothing: [] })
 *
 * Maybe.Just(42)  // positional arg
 * Maybe.Nothing   // constant value
 * ```
 *
 * @since 0.5.0
 */
export type MemberSpec<F extends TaggedLambda0, DK extends string = 'tag'> = {
  [K in DataKeys<F>]: {} extends Omit<MemberShape<F, K>, DK>
    ? readonly []
    : readonly StringKeyOf<Omit<MemberShape<F, K>, DK>>[]
}

// ---------------------------------------------------------------------------
// Type helpers (internal)
// ---------------------------------------------------------------------------

/**
 * Map a tuple of field names to a tuple of the corresponding value types.
 *
 * Given an object `T` and an ordered tuple of its keys `Keys`,
 * produces a tuple of `T[K]` values in the same order.
 */
type FieldsToTuple<T, Keys extends readonly string[]> = {
  -readonly [I in keyof Keys]: Keys[I] extends keyof T ? T[Keys[I]] : never
}

/**
 * Constructor type for a nullary member (no fields beyond the discriminant).
 * Always a constant value — arity determines the constructor form.
 */
type NullaryConstructor<F extends TaggedLambda0> = F extends TaggedLambda4
  ? ApplyType4<F, never, never, never, never>
  : F extends TaggedLambda3
    ? ApplyType3<F, never, never, never>
    : F extends TaggedLambda2
      ? ApplyType2<F, never, never>
      : F extends TaggedLambda1
        ? ApplyType1<F, never>
        : ApplyType0<F>

/**
 * Constructor type for a non-nullary member (has fields beyond the discriminant).
 * Takes positional arguments in the order specified by the field names tuple.
 */
type NonNullaryConstructor<
  F extends TaggedLambda0,
  K extends DataKeys<F>,
  DiscriminantKey extends string,
  FieldKeys extends readonly string[],
> = F extends TaggedLambda4
  ? <S, R, E, A>(
      ...fields: FieldsToTuple<
        Omit<
          ApplyData4<F, S, R, E, A>[K & keyof ApplyData4<F, S, R, E, A>],
          DiscriminantKey
        >,
        FieldKeys
      >
    ) => ApplyType4<F, S, R, E, A>
  : F extends TaggedLambda3
    ? <R, E, A>(
        ...fields: FieldsToTuple<
          Omit<
            ApplyData3<F, R, E, A>[K & keyof ApplyData3<F, R, E, A>],
            DiscriminantKey
          >,
          FieldKeys
        >
      ) => ApplyType3<F, R, E, A>
    : F extends TaggedLambda2
      ? <E, A>(
          ...fields: FieldsToTuple<
            Omit<
              ApplyData2<F, E, A>[K & keyof ApplyData2<F, E, A>],
              DiscriminantKey
            >,
            FieldKeys
          >
        ) => ApplyType2<F, E, A>
      : F extends TaggedLambda1
        ? <A>(
            ...fields: FieldsToTuple<
              Omit<
                ApplyData1<F, A>[K & keyof ApplyData1<F, A>],
                DiscriminantKey
              >,
              FieldKeys
            >
          ) => ApplyType1<F, A>
        : (
            ...fields: FieldsToTuple<
              Omit<ApplyData0<F>[K & keyof ApplyData0<F>], DiscriminantKey>,
              FieldKeys
            >
          ) => ApplyType0<F>

/**
 * Constructor type for a single member of a tagged union.
 * Nullary members are constant values; non-nullary members are functions
 * with positional args.
 */
type ConstructorFor<
  F extends TaggedLambda0,
  K extends DataKeys<F>,
  DiscriminantKey extends string,
  SpecEntry extends readonly string[],
> = SpecEntry extends readonly []
  ? NullaryConstructor<F>
  : NonNullaryConstructor<F, K, DiscriminantKey, SpecEntry>

// ---------------------------------------------------------------------------
// Constructors
// ---------------------------------------------------------------------------

/**
 * Generated data constructors for a tagged union.
 *
 * Nullary members (no fields beyond the discriminant) are constant values.
 * Non-nullary members are functions taking positional arguments in the
 * order specified by the member spec.
 *
 * @since 0.5.0
 */
export type Constructors<
  F extends TaggedLambda0,
  DiscriminantKey extends string,
  Spec extends Record<string, readonly string[]>,
> = {
  [K in DataKeys<F>]: ConstructorFor<
    F,
    K,
    DiscriminantKey,
    K extends keyof Spec
      ? Spec[K] extends readonly string[]
        ? Spec[K]
        : never
      : never
  >
}

// ---------------------------------------------------------------------------
// Match
// ---------------------------------------------------------------------------

/**
 * Generated `match` (pattern matching / fold) function for a tagged union.
 *
 * @since 0.3.0
 */
export type Match<
  F extends TaggedLambda0,
  DiscriminantKey extends string,
> = F extends TaggedLambda4
  ? <S, R, E, A, B>(
      a: ApplyType4<F, S, R, E, A>,
      caseHandlers: {
        [K in DataKeys<F>]: (
          x: ApplyData4<F, S, R, E, A>[K & keyof ApplyData4<F, S, R, E, A>],
        ) => B
      },
    ) => B
  : F extends TaggedLambda3
    ? <R, E, A, B>(
        a: ApplyType3<F, R, E, A>,
        caseHandlers: {
          [K in DataKeys<F>]: (
            x: ApplyData3<F, R, E, A>[K & keyof ApplyData3<F, R, E, A>],
          ) => B
        },
      ) => B
    : F extends TaggedLambda2
      ? <E, A, B>(
          a: ApplyType2<F, E, A>,
          caseHandlers: {
            [K in DataKeys<F>]: (
              x: ApplyData2<F, E, A>[K & keyof ApplyData2<F, E, A>],
            ) => B
          },
        ) => B
      : F extends TaggedLambda1
        ? <A, B>(
            a: ApplyType1<F, A>,
            caseHandlers: {
              [K in DataKeys<F>]: (
                x: ApplyData1<F, A>[K & keyof ApplyData1<F, A>],
              ) => B
            },
          ) => B
        : <B>(
            a: ApplyType0<F>,
            caseHandlers: {
              [K in DataKeys<F>]: (
                x: ApplyData0<F>[K & keyof ApplyData0<F>],
              ) => B
            },
          ) => B

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

/**
 * Generated type guard predicates for a tagged union.
 *
 * @since 0.3.0
 */
export type Guards<
  F extends TaggedLambda0,
  DiscriminantKey extends string,
> = F extends TaggedLambda4
  ? {
      [K in DataKeys<F>]: <S, R, E, A>(
        x: ApplyType4<F, S, R, E, A>,
      ) => x is SelectUnionMember<DiscriminantKey, K, ApplyType4<F, S, R, E, A>>
    } & {
      readonly memberOfUnion: <S, R, E, A, U>(
        action: ApplyType4<F, S, R, E, A> | U,
      ) => action is ApplyType4<F, S, R, E, A>
    }
  : F extends TaggedLambda3
    ? {
        [K in DataKeys<F>]: <R, E, A>(
          x: ApplyType3<F, R, E, A>,
        ) => x is SelectUnionMember<DiscriminantKey, K, ApplyType3<F, R, E, A>>
      } & {
        readonly memberOfUnion: <R, E, A, U>(
          action: ApplyType3<F, R, E, A> | U,
        ) => action is ApplyType3<F, R, E, A>
      }
    : F extends TaggedLambda2
      ? {
          [K in DataKeys<F>]: <E, A>(
            x: ApplyType2<F, E, A>,
          ) => x is SelectUnionMember<DiscriminantKey, K, ApplyType2<F, E, A>>
        } & {
          readonly memberOfUnion: <E, A, U>(
            action: ApplyType2<F, E, A> | U,
          ) => action is ApplyType2<F, E, A>
        }
      : F extends TaggedLambda1
        ? {
            [K in DataKeys<F>]: <A>(
              x: ApplyType1<F, A>,
            ) => x is SelectUnionMember<DiscriminantKey, K, ApplyType1<F, A>>
          } & {
            readonly memberOfUnion: <A, U>(
              action: ApplyType1<F, A> | U,
            ) => action is ApplyType1<F, A>
          }
        : {
            [K in DataKeys<F>]: (
              x: ApplyType0<F>,
            ) => x is SelectUnionMember<DiscriminantKey, K, ApplyType0<F>>
          } & {
            readonly memberOfUnion: <U>(
              action: ApplyType0<F> | U,
            ) => action is ApplyType0<F>
          }

// ---------------------------------------------------------------------------
// MatchW (widened return type)
// ---------------------------------------------------------------------------

/**
 * Like `match`, but each case handler can return a different type.
 * The result type is the union of all handler return types.
 *
 * @since 0.4.0
 */
export type MatchW<
  F extends TaggedLambda0,
  DiscriminantKey extends string,
> = F extends TaggedLambda4
  ? <
      S,
      R,
      E,
      A,
      Cases extends {
        [K in DataKeys<F>]: (
          x: ApplyData4<F, S, R, E, A>[K & keyof ApplyData4<F, S, R, E, A>],
        ) => unknown
      },
    >(
      a: ApplyType4<F, S, R, E, A>,
      caseHandlers: Cases,
    ) => ReturnType<Cases[DataKeys<F>]>
  : F extends TaggedLambda3
    ? <
        R,
        E,
        A,
        Cases extends {
          [K in DataKeys<F>]: (
            x: ApplyData3<F, R, E, A>[K & keyof ApplyData3<F, R, E, A>],
          ) => unknown
        },
      >(
        a: ApplyType3<F, R, E, A>,
        caseHandlers: Cases,
      ) => ReturnType<Cases[DataKeys<F>]>
    : F extends TaggedLambda2
      ? <
          E,
          A,
          Cases extends {
            [K in DataKeys<F>]: (
              x: ApplyData2<F, E, A>[K & keyof ApplyData2<F, E, A>],
            ) => unknown
          },
        >(
          a: ApplyType2<F, E, A>,
          caseHandlers: Cases,
        ) => ReturnType<Cases[DataKeys<F>]>
      : F extends TaggedLambda1
        ? <
            A,
            Cases extends {
              [K in DataKeys<F>]: (
                x: ApplyData1<F, A>[K & keyof ApplyData1<F, A>],
              ) => unknown
            },
          >(
            a: ApplyType1<F, A>,
            caseHandlers: Cases,
          ) => ReturnType<Cases[DataKeys<F>]>
        : <
            Cases extends {
              [K in DataKeys<F>]: (
                x: ApplyData0<F>[K & keyof ApplyData0<F>],
              ) => unknown
            },
          >(
            a: ApplyType0<F>,
            caseHandlers: Cases,
          ) => ReturnType<Cases[DataKeys<F>]>

// ---------------------------------------------------------------------------
// MatchOr (partial match with default)
// ---------------------------------------------------------------------------

/**
 * Partial pattern match with a default fallback handler.
 *
 * Only provide handlers for the cases you care about; unmatched
 * cases fall through to the `otherwise` handler.
 *
 * @since 0.4.0
 */
export type MatchOr<
  F extends TaggedLambda0,
  DiscriminantKey extends string,
> = F extends TaggedLambda4
  ? <S, R, E, A, B>(
      a: ApplyType4<F, S, R, E, A>,
      caseHandlers: Partial<{
        [K in DataKeys<F>]: (
          x: ApplyData4<F, S, R, E, A>[K & keyof ApplyData4<F, S, R, E, A>],
        ) => B
      }>,
      otherwise: (a: ApplyType4<F, S, R, E, A>) => B,
    ) => B
  : F extends TaggedLambda3
    ? <R, E, A, B>(
        a: ApplyType3<F, R, E, A>,
        caseHandlers: Partial<{
          [K in DataKeys<F>]: (
            x: ApplyData3<F, R, E, A>[K & keyof ApplyData3<F, R, E, A>],
          ) => B
        }>,
        otherwise: (a: ApplyType3<F, R, E, A>) => B,
      ) => B
    : F extends TaggedLambda2
      ? <E, A, B>(
          a: ApplyType2<F, E, A>,
          caseHandlers: Partial<{
            [K in DataKeys<F>]: (
              x: ApplyData2<F, E, A>[K & keyof ApplyData2<F, E, A>],
            ) => B
          }>,
          otherwise: (a: ApplyType2<F, E, A>) => B,
        ) => B
      : F extends TaggedLambda1
        ? <A, B>(
            a: ApplyType1<F, A>,
            caseHandlers: Partial<{
              [K in DataKeys<F>]: (
                x: ApplyData1<F, A>[K & keyof ApplyData1<F, A>],
              ) => B
            }>,
            otherwise: (a: ApplyType1<F, A>) => B,
          ) => B
        : <B>(
            a: ApplyType0<F>,
            caseHandlers: Partial<{
              [K in DataKeys<F>]: (
                x: ApplyData0<F>[K & keyof ApplyData0<F>],
              ) => B
            }>,
            otherwise: (a: ApplyType0<F>) => B,
          ) => B

// ---------------------------------------------------------------------------
// Matcher (curried data-last match)
// ---------------------------------------------------------------------------

/**
 * Curried (data-last) version of `match`.
 *
 * Returns a function that pattern-matches on a value.
 * Designed for use in pipelines / function composition.
 *
 * @since 0.4.0
 */
export type Matcher<
  F extends TaggedLambda0,
  DiscriminantKey extends string,
> = F extends TaggedLambda4
  ? <S, R, E, A, B>(
      caseHandlers: {
        [K in DataKeys<F>]: (
          x: ApplyData4<F, S, R, E, A>[K & keyof ApplyData4<F, S, R, E, A>],
        ) => B
      },
    ) => (a: ApplyType4<F, S, R, E, A>) => B
  : F extends TaggedLambda3
    ? <R, E, A, B>(
        caseHandlers: {
          [K in DataKeys<F>]: (
            x: ApplyData3<F, R, E, A>[K & keyof ApplyData3<F, R, E, A>],
          ) => B
        },
      ) => (a: ApplyType3<F, R, E, A>) => B
    : F extends TaggedLambda2
      ? <E, A, B>(
          caseHandlers: {
            [K in DataKeys<F>]: (
              x: ApplyData2<F, E, A>[K & keyof ApplyData2<F, E, A>],
            ) => B
          },
        ) => (a: ApplyType2<F, E, A>) => B
      : F extends TaggedLambda1
        ? <A, B>(
            caseHandlers: {
              [K in DataKeys<F>]: (
                x: ApplyData1<F, A>[K & keyof ApplyData1<F, A>],
              ) => B
            },
          ) => (a: ApplyType1<F, A>) => B
        : <B>(
            caseHandlers: {
              [K in DataKeys<F>]: (
                x: ApplyData0<F>[K & keyof ApplyData0<F>],
              ) => B
            },
          ) => (a: ApplyType0<F>) => B

// ---------------------------------------------------------------------------
// MatcherW (curried data-last widened match)
// ---------------------------------------------------------------------------

/**
 * Curried (data-last) version of `matchW`.
 *
 * Like `matcher`, but each case handler can return a different type.
 * Designed for use in pipelines / function composition.
 *
 * @since 0.4.0
 */
export type MatcherW<
  F extends TaggedLambda0,
  DiscriminantKey extends string,
> = F extends TaggedLambda4
  ? <
      S,
      R,
      E,
      A,
      Cases extends {
        [K in DataKeys<F>]: (
          x: ApplyData4<F, S, R, E, A>[K & keyof ApplyData4<F, S, R, E, A>],
        ) => unknown
      },
    >(
      caseHandlers: Cases,
    ) => (a: ApplyType4<F, S, R, E, A>) => ReturnType<Cases[DataKeys<F>]>
  : F extends TaggedLambda3
    ? <
        R,
        E,
        A,
        Cases extends {
          [K in DataKeys<F>]: (
            x: ApplyData3<F, R, E, A>[K & keyof ApplyData3<F, R, E, A>],
          ) => unknown
        },
      >(
        caseHandlers: Cases,
      ) => (a: ApplyType3<F, R, E, A>) => ReturnType<Cases[DataKeys<F>]>
    : F extends TaggedLambda2
      ? <
          E,
          A,
          Cases extends {
            [K in DataKeys<F>]: (
              x: ApplyData2<F, E, A>[K & keyof ApplyData2<F, E, A>],
            ) => unknown
          },
        >(
          caseHandlers: Cases,
        ) => (a: ApplyType2<F, E, A>) => ReturnType<Cases[DataKeys<F>]>
      : F extends TaggedLambda1
        ? <
            A,
            Cases extends {
              [K in DataKeys<F>]: (
                x: ApplyData1<F, A>[K & keyof ApplyData1<F, A>],
              ) => unknown
            },
          >(
            caseHandlers: Cases,
          ) => (a: ApplyType1<F, A>) => ReturnType<Cases[DataKeys<F>]>
        : <
            Cases extends {
              [K in DataKeys<F>]: (
                x: ApplyData0<F>[K & keyof ApplyData0<F>],
              ) => unknown
            },
          >(
            caseHandlers: Cases,
          ) => (a: ApplyType0<F>) => ReturnType<Cases[DataKeys<F>]>

// ---------------------------------------------------------------------------
// TaggedUnion result type
// ---------------------------------------------------------------------------

/**
 * The combined result: constructors + guards + match variants.
 *
 * @since 0.5.0
 */
export type TaggedUnion<
  F extends TaggedLambda0,
  DiscriminantKey extends string,
  Spec extends Record<string, readonly string[]> = Record<
    string,
    readonly string[]
  >,
> = Constructors<F, DiscriminantKey, Spec> & {
  readonly is: Guards<F, DiscriminantKey>
  readonly match: Match<F, DiscriminantKey>
  readonly matchW: MatchW<F, DiscriminantKey>
  readonly matchOr: MatchOr<F, DiscriminantKey>
  readonly matcher: Matcher<F, DiscriminantKey>
  readonly matcherW: MatcherW<F, DiscriminantKey>
}

// ---------------------------------------------------------------------------
// Runtime implementation (internal)
// ---------------------------------------------------------------------------

const mkTaggedUnionImpl = <
  F extends TaggedLambda0,
  DK extends string,
  Spec extends Record<string, readonly string[]>,
>(
  dk: DK,
  members: Spec,
): TaggedUnion<F, DK, Spec> => {
  const constructors: Record<string, unknown> = {}

  for (const [memberTag, fieldNames] of Object.entries(members)) {
    const discriminantPair = { [dk]: memberTag }
    if (fieldNames.length === 0) {
      constructors[memberTag] = discriminantPair
    } else {
      constructors[memberTag] = (...args: unknown[]) => {
        const result: Record<string, unknown> = { ...discriminantPair }
        for (let i = 0; i < fieldNames.length; i++) {
          result[fieldNames[i] as string] = args[i]
        }
        return result
      }
    }
  }

  const guards: Record<string, (x: unknown) => boolean> = {}
  for (const memberTag of Object.keys(members)) {
    guards[memberTag] = (member: unknown) =>
      typeof member === 'object' &&
      member !== null &&
      (member as Record<string, unknown>)[dk] === memberTag
  }

  const is = {
    ...guards,
    memberOfUnion: (action: unknown): boolean => {
      if (typeof action !== 'object' || action === null || !(dk in action)) {
        return false
      }
      return Object.values(guards).some(guard => guard(action))
    },
  }

  const match = (
    t: Record<string, string>,
    caseHandlers: Record<string, (x: unknown) => unknown>,
  ) => {
    const tag = t[dk] as string
    return (caseHandlers[tag] as (x: unknown) => unknown)(t)
  }

  const matchOr = (
    t: Record<string, string>,
    caseHandlers: Record<string, ((x: unknown) => unknown) | undefined>,
    otherwise: (x: unknown) => unknown,
  ) => {
    const tag = t[dk] as string
    const handler = caseHandlers[tag]
    return handler != null ? handler(t) : otherwise(t)
  }

  const matcher = (caseHandlers: Record<string, (x: unknown) => unknown>) => {
    return (t: Record<string, string>) => {
      const tag = t[dk] as string
      return (caseHandlers[tag] as (x: unknown) => unknown)(t)
    }
  }

  return {
    ...constructors,
    is,
    match,
    matchW: match,
    matchOr,
    matcher,
    matcherW: matcher,
  } as unknown as TaggedUnion<F, DK, Spec>
}

// ---------------------------------------------------------------------------
// Main API: mkTaggedUnion
// ---------------------------------------------------------------------------

/**
 * Generates constructors, guards, and match for a tagged union.
 *
 * Uses `'tag'` as the discriminant key. For custom discriminant keys,
 * use `mkTaggedUnionCustom`.
 *
 * Non-nullary members become function constructors with positional args
 * in the order specified by the field names array.
 * Nullary members (discriminant only) become constant values.
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
 *
 * const Maybe = mkTaggedUnion<MaybeLambda>()({ Just: ['value'], Nothing: [] })
 *
 * Maybe.Just(42)  // Maybe<number>
 * Maybe.Nothing   // Maybe<never>
 * ```
 *
 * @since 0.5.0
 */
export const mkTaggedUnion =
  <F extends TaggedLambda0>() =>
  <const Spec extends MemberSpec<F, 'tag'>>(
    members: Spec,
  ): TaggedUnion<F, 'tag', Spec> =>
    mkTaggedUnionImpl<F, 'tag', Spec>('tag', members as Spec)

// ---------------------------------------------------------------------------
// Main API: mkTaggedUnionCustom
// ---------------------------------------------------------------------------

/**
 * Generates constructors, guards, and match for a tagged union
 * with a custom discriminant key.
 *
 * Uses a double-call pattern so TypeScript can infer the discriminant
 * key type from the first argument.
 *
 * @example
 * ```ts
 * type First<A> = { readonly kind: 'First'; readonly value: A }
 * type Second<A> = { readonly kind: 'Second'; readonly value: A }
 * type Third = { readonly kind: 'Third' }
 * type Trio<A> = First<A> | Second<A> | Third
 *
 * interface TrioLambda extends TaggedLambda1 {
 *   readonly type: Trio<this['A']>
 *   readonly data: MkData<this['type'], 'kind'>
 * }
 *
 * const Trio = mkTaggedUnionCustom<TrioLambda>()('kind', {
 *   First: ['value'],
 *   Second: ['value'],
 *   Third: [],
 * })
 * ```
 *
 * @since 0.5.0
 */
export const mkTaggedUnionCustom =
  <F extends TaggedLambda0>() =>
  <DK extends string, const Spec extends MemberSpec<F, DK>>(
    discriminant: DK,
    members: Spec,
  ): TaggedUnion<F, DK, Spec> =>
    mkTaggedUnionImpl<F, DK, Spec>(discriminant, members as Spec)
