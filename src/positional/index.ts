/**
 * Positional constructors for tagged unions.
 *
 * Constructors take positional arguments in the order specified
 * by the field names array in the member spec:
 * ```ts
 * Maybe.Just(42)
 * Stream.Emit('s', 42)
 * ```
 *
 * @since 0.5.0
 */

import type {
  Guards,
  Match,
  Matcher,
  MatcherW,
  MatchOr,
  MatchW,
  MemberShape,
  NullaryConstructor,
} from '../internal/shared'
import { mkGuardsAndMatchers } from '../internal/shared'
import type { StringKeyOf } from '../internal/Utils'
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
} from '../Lambda'

export type {
  Guards,
  Match,
  Matcher,
  MatcherW,
  MatchOr,
  MatchW,
} from '../internal/shared'
// Re-export shared types for single-import convenience
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
} from '../Lambda'

// ---------------------------------------------------------------------------
// MemberSpec
// ---------------------------------------------------------------------------

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
 * Generated data constructors for a tagged union (positional style).
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

  const shared = mkGuardsAndMatchers(dk, Object.keys(members))

  return { ...constructors, ...shared } as unknown as TaggedUnion<F, DK, Spec>
}

// ---------------------------------------------------------------------------
// Main API: mkTaggedUnion
// ---------------------------------------------------------------------------

/**
 * Generates constructors, guards, and match for a tagged union
 * using positional constructors.
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
 * with a custom discriminant key, using positional constructors.
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
