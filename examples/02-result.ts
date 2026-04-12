/**
 * Example: Result<E, A> — success / failure for error handling.
 *
 * Run with:  npx tsx examples/02-result.ts
 *
 * Demonstrates:
 *   - Arity-2 tagged unions (two type parameters: error and value)
 *   - Modeling operations that can fail without throwing
 *   - Chaining Results through a pipeline with `matchW`
 *   - Using `matchOr` for a fallback on the error path
 *   - Parsing JSON safely into a typed Result
 */

import type { MkData, TaggedLambda2 } from '../src/named'
import { mkTaggedUnion } from '../src/named'

// ---------------------------------------------------------------------------
// 1. Declare Result<E, A>
// ---------------------------------------------------------------------------

type Failure<E> = { readonly tag: 'Failure'; readonly error: E }
type Success<A> = { readonly tag: 'Success'; readonly value: A }
type Result<E, A> = Success<A> | Failure<E>

interface ResultLambda extends TaggedLambda2 {
  readonly type: Result<this['E'], this['A']>
  readonly data: MkData<this['type']>
}

const Result = mkTaggedUnion<ResultLambda>({ Success: true, Failure: true })

// ---------------------------------------------------------------------------
// 2. Model a parse pipeline that can fail at multiple points
// ---------------------------------------------------------------------------

type ParseError =
  | { readonly kind: 'InvalidJSON'; readonly source: string }
  | { readonly kind: 'MissingField'; readonly field: string }
  | {
      readonly kind: 'WrongType'
      readonly field: string
      readonly expected: string
    }

type User = { readonly name: string; readonly age: number }

const parseJSON = (source: string): Result<ParseError, unknown> => {
  try {
    return Result.Success({ value: JSON.parse(source) as unknown })
  } catch {
    return Result.Failure({ error: { kind: 'InvalidJSON', source } })
  }
}

const toUser = (raw: unknown): Result<ParseError, User> => {
  if (typeof raw !== 'object' || raw === null) {
    return Result.Failure({
      error: { kind: 'WrongType', field: '(root)', expected: 'object' },
    })
  }
  const obj = raw as Record<string, unknown>
  if (!('name' in obj)) {
    return Result.Failure({
      error: { kind: 'MissingField', field: 'name' },
    })
  }
  if (typeof obj.name !== 'string') {
    return Result.Failure({
      error: { kind: 'WrongType', field: 'name', expected: 'string' },
    })
  }
  if (!('age' in obj)) {
    return Result.Failure({ error: { kind: 'MissingField', field: 'age' } })
  }
  if (typeof obj.age !== 'number') {
    return Result.Failure({
      error: { kind: 'WrongType', field: 'age', expected: 'number' },
    })
  }
  return Result.Success({ value: { name: obj.name, age: obj.age } })
}

// ---------------------------------------------------------------------------
// 3. Chain two steps with `matchW` — carry the Failure through unchanged
// ---------------------------------------------------------------------------

const parseUser = (source: string): Result<ParseError, User> =>
  Result.matchW(parseJSON(source), {
    Success: ({ value }) => toUser(value),
    Failure: (f): Result<ParseError, User> => f,
  })

// ---------------------------------------------------------------------------
// 4. Render outcomes
// ---------------------------------------------------------------------------

const render = (r: Result<ParseError, User>): string =>
  Result.match(r, {
    Success: ({ value }) => `OK: ${value.name} (${value.age})`,
    Failure: ({ error }) => {
      switch (error.kind) {
        case 'InvalidJSON':
          return `ERR: could not parse JSON: ${error.source}`
        case 'MissingField':
          return `ERR: missing field "${error.field}"`
        case 'WrongType':
          return `ERR: field "${error.field}" should be ${error.expected}`
      }
    },
  })

console.log(render(parseUser('{"name":"Ada","age":37}'))) // OK: Ada (37)
console.log(render(parseUser('not json'))) // InvalidJSON
console.log(render(parseUser('{"age":37}'))) // MissingField name
console.log(render(parseUser('{"name":"Ada","age":"old"}'))) // WrongType age

// ---------------------------------------------------------------------------
// 5. `matchOr` — fall back to a default on any failure
// ---------------------------------------------------------------------------

const getNameOr = (r: Result<ParseError, User>, fallback: string): string =>
  Result.matchOr(r, { Success: ({ value }) => value.name }, () => fallback)

console.log(
  'name or "anon":',
  getNameOr(parseUser('{"name":"Ada","age":37}'), 'anon'),
) // Ada
console.log('name or "anon":', getNameOr(parseUser('not json'), 'anon')) // anon
