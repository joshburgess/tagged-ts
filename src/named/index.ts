/**
 * Named (object-style) constructors for tagged unions.
 *
 * Constructors take a single object with named fields:
 * ```ts
 * Maybe.Just({ value: 42 })
 * Stream.Emit({ state: 's', value: 42 })
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
 * - `true` = has fields beyond the discriminant key -> function constructor
 * - `false` = no fields beyond the discriminant key -> constant value
 *
 * @example
 * ```ts
 * // Just<A> has `value` (true), Nothing has no extra fields (false)
 * const Maybe = mkTaggedUnion<MaybeLambda>({ Just: true, Nothing: false })
 * ```
 *
 * @since 0.4.0
 */
export type MemberSpec<F extends TaggedLambda0, DK extends string = 'tag'> = {
  [K in DataKeys<F>]: {} extends Omit<MemberShape<F, K>, DK> ? false : true
}

// ---------------------------------------------------------------------------
// Type helpers (internal)
// ---------------------------------------------------------------------------

/**
 * Constructor type for a non-nullary member (has fields beyond the discriminant).
 * Takes a single object with the remaining named fields.
 */
type NonNullaryConstructor<
  F extends TaggedLambda0,
  K extends DataKeys<F>,
  DiscriminantKey extends string,
> = F extends TaggedLambda4
  ? <S, R, E, A>(
      fields: Omit<
        ApplyData4<F, S, R, E, A>[K & keyof ApplyData4<F, S, R, E, A>],
        DiscriminantKey
      >,
    ) => ApplyType4<F, S, R, E, A>
  : F extends TaggedLambda3
    ? <R, E, A>(
        fields: Omit<
          ApplyData3<F, R, E, A>[K & keyof ApplyData3<F, R, E, A>],
          DiscriminantKey
        >,
      ) => ApplyType3<F, R, E, A>
    : F extends TaggedLambda2
      ? <E, A>(
          fields: Omit<
            ApplyData2<F, E, A>[K & keyof ApplyData2<F, E, A>],
            DiscriminantKey
          >,
        ) => ApplyType2<F, E, A>
      : F extends TaggedLambda1
        ? <A>(
            fields: Omit<
              ApplyData1<F, A>[K & keyof ApplyData1<F, A>],
              DiscriminantKey
            >,
          ) => ApplyType1<F, A>
        : (
            fields: Omit<
              ApplyData0<F>[K & keyof ApplyData0<F>],
              DiscriminantKey
            >,
          ) => ApplyType0<F>

/**
 * Constructor type for a single member of a tagged union.
 * Nullary members are constant values; non-nullary members are functions.
 */
type ConstructorFor<
  F extends TaggedLambda0,
  K extends DataKeys<F>,
  DiscriminantKey extends string,
> =
  {} extends Omit<MemberShape<F, K>, DiscriminantKey>
    ? NullaryConstructor<F>
    : NonNullaryConstructor<F, K, DiscriminantKey>

// ---------------------------------------------------------------------------
// Constructors
// ---------------------------------------------------------------------------

/**
 * Generated data constructors for a tagged union (named/object style).
 *
 * Nullary members (no fields beyond the discriminant) are constant values.
 * Non-nullary members are functions taking an object with named fields.
 *
 * @since 0.4.0
 */
export type Constructors<
  F extends TaggedLambda0,
  DiscriminantKey extends string,
> = {
  [K in DataKeys<F>]: ConstructorFor<F, K, DiscriminantKey>
}

// ---------------------------------------------------------------------------
// TaggedUnion result type
// ---------------------------------------------------------------------------

/**
 * The combined result: constructors + guards + match variants.
 *
 * @since 0.4.0
 */
export type TaggedUnion<
  F extends TaggedLambda0,
  DiscriminantKey extends string,
> = Constructors<F, DiscriminantKey> & {
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

const mkTaggedUnionImpl = <F extends TaggedLambda0, DK extends string>(
  dk: DK,
  members: Record<string, boolean>,
): TaggedUnion<F, DK> => {
  const constructors: Record<string, unknown> = {}

  for (const [memberTag, hasFields] of Object.entries(members)) {
    const discriminantPair = { [dk]: memberTag }
    if (hasFields) {
      constructors[memberTag] = (fields: Record<string, unknown>) => ({
        ...discriminantPair,
        ...fields,
      })
    } else {
      constructors[memberTag] = discriminantPair
    }
  }

  const shared = mkGuardsAndMatchers(dk, Object.keys(members))

  return { ...constructors, ...shared } as unknown as TaggedUnion<F, DK>
}

// ---------------------------------------------------------------------------
// Main API: mkTaggedUnion
// ---------------------------------------------------------------------------

/**
 * Generates constructors, guards, and match for a tagged union
 * using named (object-style) constructors.
 *
 * Uses `'tag'` as the discriminant key. For custom discriminant keys,
 * use `mkTaggedUnionCustom`.
 *
 * Members with fields beyond the discriminant become function constructors
 * that take a single object with named fields.
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
 * const Maybe = mkTaggedUnion<MaybeLambda>({ Just: true, Nothing: false })
 *
 * Maybe.Just({ value: 42 })  // Maybe<number>
 * Maybe.Nothing               // Maybe<never>
 * ```
 *
 * @since 0.4.0
 */
export const mkTaggedUnion = <F extends TaggedLambda0>(
  members: MemberSpec<F, 'tag'>,
): TaggedUnion<F, 'tag'> =>
  mkTaggedUnionImpl<F, 'tag'>('tag', members as Record<string, boolean>)

// ---------------------------------------------------------------------------
// Main API: mkTaggedUnionCustom
// ---------------------------------------------------------------------------

/**
 * Generates constructors, guards, and match for a tagged union
 * with a custom discriminant key, using named (object-style) constructors.
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
 *   First: true,
 *   Second: true,
 *   Third: false,
 * })
 * ```
 *
 * @since 0.4.0
 */
export const mkTaggedUnionCustom =
  <F extends TaggedLambda0>() =>
  <DK extends string>(
    discriminant: DK,
    members: MemberSpec<F, DK>,
  ): TaggedUnion<F, DK> =>
    mkTaggedUnionImpl<F, DK>(discriminant, members as Record<string, boolean>)
