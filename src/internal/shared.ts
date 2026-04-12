/**
 * Shared types and runtime used by both named and positional modules.
 *
 * @internal
 */

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
} from '../Lambda.js'
import type { SelectUnionMember } from './Utils.js'

// ---------------------------------------------------------------------------
// Shared internal types
// ---------------------------------------------------------------------------

/**
 * The shape of a data map member with base (unknown) type parameters.
 *
 * @internal
 */
export type MemberShape<
  F extends TaggedLambda0,
  K extends DataKeys<F>,
> = F['data'][K & keyof F['data']]

/**
 * Constructor type for a nullary member (no fields beyond the discriminant).
 * Always a constant value — arity determines the constructor form.
 *
 * @internal
 */
export type NullaryConstructor<F extends TaggedLambda0> =
  F extends TaggedLambda4
    ? ApplyType4<F, never, never, never, never>
    : F extends TaggedLambda3
      ? ApplyType3<F, never, never, never>
      : F extends TaggedLambda2
        ? ApplyType2<F, never, never>
        : F extends TaggedLambda1
          ? ApplyType1<F, never>
          : ApplyType0<F>

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
// Tags (readonly list of member tag strings)
// ---------------------------------------------------------------------------

/**
 * A readonly list of all member tag strings for a tagged union, in the
 * order they were declared in the member spec.
 *
 * Useful for runtime enumeration: iterating every case, building dropdown
 * options, generating error messages, etc.
 *
 * @since 0.6.0
 */
export type Tags<F extends TaggedLambda0> = ReadonlyArray<DataKeys<F>>

// ---------------------------------------------------------------------------
// Equals (structural deep equality)
// ---------------------------------------------------------------------------

/**
 * Structural deep equality for two values of a tagged union.
 *
 * Returns `true` when both values have the same discriminant and all
 * fields are structurally equal (recursive comparison over plain objects
 * and arrays; primitives compared with `Object.is`).
 *
 * @since 0.6.0
 */
export type Equals<F extends TaggedLambda0> = F extends TaggedLambda4
  ? <S, R, E, A>(
      a: ApplyType4<F, S, R, E, A>,
      b: ApplyType4<F, S, R, E, A>,
    ) => boolean
  : F extends TaggedLambda3
    ? <R, E, A>(a: ApplyType3<F, R, E, A>, b: ApplyType3<F, R, E, A>) => boolean
    : F extends TaggedLambda2
      ? <E, A>(a: ApplyType2<F, E, A>, b: ApplyType2<F, E, A>) => boolean
      : F extends TaggedLambda1
        ? <A>(a: ApplyType1<F, A>, b: ApplyType1<F, A>) => boolean
        : (a: ApplyType0<F>, b: ApplyType0<F>) => boolean

// ---------------------------------------------------------------------------
// Parse (shallow tag-based narrow from unknown)
// ---------------------------------------------------------------------------

/**
 * Shallow parser that narrows an `unknown` value to the tagged union if it
 * has the discriminant key set to one of the known member tags.
 *
 * This is a *shallow* check: only the discriminant is validated — field
 * shapes are **not** checked. Compose with a schema library
 * (zod, valibot, etc.) if you need deeper validation.
 *
 * @since 0.6.0
 */
export type Parse<F extends TaggedLambda0> = F extends TaggedLambda4
  ? <S, R, E, A>(x: unknown) => ApplyType4<F, S, R, E, A> | undefined
  : F extends TaggedLambda3
    ? <R, E, A>(x: unknown) => ApplyType3<F, R, E, A> | undefined
    : F extends TaggedLambda2
      ? <E, A>(x: unknown) => ApplyType2<F, E, A> | undefined
      : F extends TaggedLambda1
        ? <A>(x: unknown) => ApplyType1<F, A> | undefined
        : (x: unknown) => ApplyType0<F> | undefined

// ---------------------------------------------------------------------------
// Shared runtime
// ---------------------------------------------------------------------------

/**
 * Structural deep equality used by generated `equals`.
 *
 * - Primitives compared with `Object.is` (so `NaN === NaN`)
 * - Arrays compared element-wise (same length)
 * - Plain objects compared by own enumerable keys (same set)
 * - All other object types (Map, Set, Date, class instances, etc.)
 *   compared with `Object.is` (reference equality)
 * - Cyclic structures handled coinductively: if we encounter a pair
 *   (a, b) already on the comparison stack, we assume them equal. This
 *   means two self-referential structures with the same shape return
 *   `true` instead of stack-overflowing.
 *
 * @internal
 */
export const deepEquals = (a: unknown, b: unknown): boolean =>
  deepEqualsInner(a, b, new WeakMap())

const deepEqualsInner = (
  a: unknown,
  b: unknown,
  seen: WeakMap<object, WeakSet<object>>,
): boolean => {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object') return false
  if (a === null || b === null) return false

  // Cycle guard: if we're already comparing this (a, b) pair further up
  // the stack, coinductively assume they're equal. Without this, cyclic
  // structures would recurse forever.
  const seenForA = seen.get(a as object)
  if (seenForA?.has(b as object)) return true
  if (seenForA) seenForA.add(b as object)
  else seen.set(a as object, new WeakSet([b as object]))

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqualsInner(a[i], b[i], seen)) return false
    }
    return true
  }
  if (Array.isArray(b)) return false
  // Only treat plain objects as structurally comparable. Non-plain objects
  // (Map, Set, Date, class instances with custom prototypes) fall through to
  // reference equality, which Object.is already handled above.
  const protoA = Object.getPrototypeOf(a)
  const protoB = Object.getPrototypeOf(b)
  if (
    (protoA !== Object.prototype && protoA !== null) ||
    (protoB !== Object.prototype && protoB !== null)
  ) {
    return false
  }
  const ak = Object.keys(a as object)
  const bk = Object.keys(b as object)
  if (ak.length !== bk.length) return false
  for (const k of ak) {
    if (!Object.hasOwn(b as object, k)) return false
    if (
      !deepEqualsInner(
        (a as Record<string, unknown>)[k],
        (b as Record<string, unknown>)[k],
        seen,
      )
    )
      return false
  }
  return true
}

/**
 * Format an arbitrary value for inclusion in a `show` output string.
 *
 * Produces readable output similar to `util.inspect`:
 *
 * - Primitives: `42`, `true`, `null`, `undefined`, `"hi"`, `42n`, `Symbol(x)`
 * - Functions: `[Function: name]`
 * - Arrays: `[1, 2, 3]`
 * - Plain objects: `{ key: value }`
 * - Class instances: `ClassName { field: value }`
 * - Dates: `Date("2024-01-01T00:00:00.000Z")`
 * - RegExps: `/pattern/flags`
 * - Errors: `TypeError("message")`
 * - Maps: `Map("k" => 1, "j" => 2)`
 * - Sets: `Set(1, 2, 3)`
 * - Cycles: `[Circular]` placeholder where a value refers to an ancestor
 *
 * @internal
 */
export const formatValue = (v: unknown): string => {
  const seen = new WeakSet<object>()
  const go = (x: unknown): string => {
    if (x === null) return 'null'
    if (x === undefined) return 'undefined'
    const t = typeof x
    if (t === 'string') return JSON.stringify(x)
    if (t === 'number') {
      // Preserve -0 which String() would render as "0"
      return Object.is(x, -0) ? '-0' : String(x)
    }
    if (t === 'boolean') return String(x)
    if (t === 'bigint') return `${String(x)}n`
    if (t === 'symbol') return (x as symbol).toString()
    if (t === 'function') {
      const name = (x as { name?: string }).name
      return name ? `[Function: ${name}]` : '[Function]'
    }
    // From here on, x is a non-null object.
    const obj = x as object
    if (seen.has(obj)) return '[Circular]'
    seen.add(obj)
    if (Array.isArray(obj)) return `[${obj.map(go).join(', ')}]`
    if (obj instanceof Date) return `Date(${JSON.stringify(obj.toISOString())})`
    if (obj instanceof RegExp) return obj.toString()
    if (obj instanceof Error)
      return `${obj.name}(${JSON.stringify(obj.message)})`
    if (obj instanceof Map) {
      const entries = Array.from(obj.entries())
        .map(([k, v]) => `${go(k)} => ${go(v)}`)
        .join(', ')
      return `Map(${entries})`
    }
    if (obj instanceof Set) {
      const values = Array.from(obj.values()).map(go).join(', ')
      return `Set(${values})`
    }
    const keys = Object.keys(obj)
    const inner = keys
      .map(k => `${k}: ${go((obj as Record<string, unknown>)[k])}`)
      .join(', ')
    const proto = Object.getPrototypeOf(obj)
    const isPlain = proto === null || proto === Object.prototype
    if (isPlain) return keys.length === 0 ? '{}' : `{ ${inner} }`
    const className =
      (proto?.constructor as { name?: string } | undefined)?.name ?? 'Object'
    return keys.length === 0 ? `${className} {}` : `${className} { ${inner} }`
  }
  return go(v)
}

/**
 * Build the shared (style-agnostic) runtime features: tags, equals, parse.
 * Used by both named and positional modules.
 *
 * @internal
 */
export const mkSharedFeatures = (
  dk: string,
  memberTags: string[],
): {
  tags: readonly string[]
  equals: (a: unknown, b: unknown) => boolean
  parse: (x: unknown) => unknown
} => {
  const tags = Object.freeze([...memberTags])
  const tagSet = new Set(memberTags)

  const equals = (a: unknown, b: unknown): boolean => deepEquals(a, b)

  const parse = (x: unknown): unknown => {
    if (typeof x !== 'object' || x === null) return undefined
    if (Array.isArray(x)) return undefined
    // Require an *own* discriminant key. Prevents Object.create-based
    // prototype pollution from passing as a valid union member.
    if (!Object.hasOwn(x, dk)) return undefined
    const tag = (x as Record<string, unknown>)[dk]
    if (typeof tag !== 'string' || !tagSet.has(tag)) return undefined
    return x
  }

  return { tags, equals, parse }
}

// ---------------------------------------------------------------------------
// Guards and matchers runtime
// ---------------------------------------------------------------------------

/**
 * Build guards, match functions, and other shared runtime from a
 * discriminant key and set of member tags. Used by both named and
 * positional modules.
 *
 * @internal
 */
export const mkGuardsAndMatchers = (
  dk: string,
  memberTags: string[],
): {
  is: Record<string, unknown>
  match: unknown
  matchW: unknown
  matchOr: unknown
  matcher: unknown
  matcherW: unknown
} => {
  const guards: Record<string, (x: unknown) => boolean> = {}
  for (const memberTag of memberTags) {
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

  return { is, match, matchW: match, matchOr, matcher, matcherW: matcher }
}
