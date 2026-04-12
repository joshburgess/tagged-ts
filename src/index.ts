/**
 * tagged-ts: Type-safe tagged unions with generated constructors,
 * guards, and pattern matching.
 *
 * This root module exports shared types used by both constructor styles.
 * For constructors, import from a style-specific module:
 *
 * - `tagged-ts/named` — object-style: `Maybe.Just({ value: 42 })`
 * - `tagged-ts/positional` — positional: `Maybe.Just(42)`
 *
 * @since 0.3.0
 */

// Shared operational types (guards, match variants)
export type {
  Guards,
  Match,
  Matcher,
  MatcherW,
  MatchOr,
  MatchW,
} from './internal/shared.js'
// Lambda types (type lambdas, MkData, Apply*, DataKeys)
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
} from './Lambda.js'
