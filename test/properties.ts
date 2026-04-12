import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import type {
  MkData,
  TaggedLambda0,
  TaggedLambda1,
  TaggedLambda2,
  TaggedLambda3,
} from '../src'
import { mkTaggedUnion, mkTaggedUnionCustom } from '../src'

// ---------------------------------------------------------------------------
// Setup: Maybe<A> (arity 1, discriminant 'tag')
// ---------------------------------------------------------------------------

type Nothing = { readonly tag: 'Nothing' }
type Just<A> = { readonly tag: 'Just'; readonly value: A }
type Maybe<A> = Just<A> | Nothing

interface MaybeLambda extends TaggedLambda1 {
  readonly type: Maybe<this['A']>
  readonly data: MkData<this['type']>
}

const Maybe = mkTaggedUnion<MaybeLambda>({ Just: true, Nothing: false })

// ---------------------------------------------------------------------------
// Setup: Result<E, A> (arity 2, discriminant 'tag')
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
// Setup: CounterAction (arity 0, discriminant 'type')
// ---------------------------------------------------------------------------

type Increment = { readonly type: 'Increment'; readonly amount: number }
type Reset = { readonly type: 'Reset' }
type CounterAction = Increment | Reset

interface CounterActionLambda extends TaggedLambda0 {
  readonly type: CounterAction
  readonly data: MkData<this['type'], 'type'>
}

const CounterAction = mkTaggedUnionCustom<CounterActionLambda>()('type', {
  Increment: true,
  Reset: false,
})

// ---------------------------------------------------------------------------
// Setup: Trio<A> (arity 1, custom discriminant 'kind')
// ---------------------------------------------------------------------------

type First<A> = { readonly kind: 'First'; readonly value: A }
type Second<A> = { readonly kind: 'Second'; readonly value: A }
type Third<A> = { readonly kind: 'Third' }
type Trio<A> = First<A> | Second<A> | Third<A>

interface TrioLambda extends TaggedLambda1 {
  readonly type: Trio<this['A']>
  readonly data: MkData<this['type'], 'kind'>
}

const Trio = mkTaggedUnionCustom<TrioLambda>()('kind', {
  First: true,
  Second: true,
  Third: false,
})

// ---------------------------------------------------------------------------
// Setup: Env<R, E, A> (arity 3, discriminant 'tag')
// ---------------------------------------------------------------------------

type Ask<R> = { readonly tag: 'Ask'; readonly resource: R }
type Pure<A> = { readonly tag: 'Pure'; readonly value: A }
type Raise<E> = { readonly tag: 'Raise'; readonly error: E }
type EnvHalt = { readonly tag: 'Halt' }
type Env<R, E, A> = Ask<R> | Pure<A> | Raise<E> | EnvHalt

interface EnvLambda extends TaggedLambda3 {
  readonly type: Env<this['R'], this['E'], this['A']>
  readonly data: MkData<this['type']>
}

const Env = mkTaggedUnion<EnvLambda>({
  Ask: true,
  Pure: true,
  Raise: true,
  Halt: false,
})

// ===========================================================================
// Arbitraries
// ===========================================================================

const arbJsonValue = fc.jsonValue({ maxDepth: 3 })

const arbMaybe: fc.Arbitrary<Maybe<fc.JsonValue>> = fc.oneof(
  arbJsonValue.map(v => Maybe.Just({ value: v })),
  fc.constant(Maybe.Nothing as Maybe<fc.JsonValue>),
)

const arbResult: fc.Arbitrary<Result<fc.JsonValue, fc.JsonValue>> = fc.oneof(
  arbJsonValue.map(v =>
    Result.Success<fc.JsonValue, fc.JsonValue>({ value: v }),
  ),
  arbJsonValue.map(e =>
    Result.Failure<fc.JsonValue, fc.JsonValue>({ error: e }),
  ),
)

const arbCounterAction: fc.Arbitrary<CounterAction> = fc.oneof(
  fc.integer().map(n => CounterAction.Increment({ amount: n })),
  fc.constant(CounterAction.Reset),
)

const arbTrio: fc.Arbitrary<Trio<fc.JsonValue>> = fc.oneof(
  arbJsonValue.map(v => Trio.First({ value: v })),
  arbJsonValue.map(v => Trio.Second({ value: v })),
  fc.constant(Trio.Third as Trio<fc.JsonValue>),
)

const arbEnv: fc.Arbitrary<Env<fc.JsonValue, fc.JsonValue, fc.JsonValue>> =
  fc.oneof(
    arbJsonValue.map(r =>
      Env.Ask<fc.JsonValue, fc.JsonValue, fc.JsonValue>({ resource: r }),
    ),
    arbJsonValue.map(v =>
      Env.Pure<fc.JsonValue, fc.JsonValue, fc.JsonValue>({ value: v }),
    ),
    arbJsonValue.map(e =>
      Env.Raise<fc.JsonValue, fc.JsonValue, fc.JsonValue>({ error: e }),
    ),
    fc.constant(Env.Halt as Env<fc.JsonValue, fc.JsonValue, fc.JsonValue>),
  )

// ===========================================================================
// Property: constructor -> guard roundtrip
// ===========================================================================

describe('constructor -> guard roundtrip', () => {
  it('Maybe: is.Just(Just(x)) === true for any x', () => {
    fc.assert(
      fc.property(arbJsonValue, v => {
        expect(Maybe.is.Just(Maybe.Just({ value: v }))).toBe(true)
      }),
    )
  })

  it('Maybe: is.Nothing(Nothing) === true', () => {
    expect(Maybe.is.Nothing(Maybe.Nothing)).toBe(true)
  })

  it('Result: is.Success(Success(x)) === true for any x', () => {
    fc.assert(
      fc.property(arbJsonValue, v => {
        expect(Result.is.Success(Result.Success({ value: v }))).toBe(true)
      }),
    )
  })

  it('Result: is.Failure(Failure(x)) === true for any x', () => {
    fc.assert(
      fc.property(arbJsonValue, e => {
        expect(Result.is.Failure(Result.Failure({ error: e }))).toBe(true)
      }),
    )
  })

  it('CounterAction: is.Increment(Increment(n)) === true for any n', () => {
    fc.assert(
      fc.property(fc.integer(), n => {
        expect(
          CounterAction.is.Increment(CounterAction.Increment({ amount: n })),
        ).toBe(true)
      }),
    )
  })

  it('CounterAction: is.Reset(Reset) === true', () => {
    expect(CounterAction.is.Reset(CounterAction.Reset)).toBe(true)
  })

  it('Trio: each variant passes its own guard', () => {
    fc.assert(
      fc.property(arbJsonValue, v => {
        expect(Trio.is.First(Trio.First({ value: v }))).toBe(true)
        expect(Trio.is.Second(Trio.Second({ value: v }))).toBe(true)
      }),
    )
    expect(Trio.is.Third(Trio.Third)).toBe(true)
  })

  it('Env: each variant passes its own guard', () => {
    fc.assert(
      fc.property(arbJsonValue, v => {
        expect(Env.is.Ask(Env.Ask({ resource: v }))).toBe(true)
        expect(Env.is.Pure(Env.Pure({ value: v }))).toBe(true)
        expect(Env.is.Raise(Env.Raise({ error: v }))).toBe(true)
      }),
    )
    expect(Env.is.Halt(Env.Halt)).toBe(true)
  })
})

// ===========================================================================
// Property: guard mutual exclusivity
// ===========================================================================

describe('guard mutual exclusivity', () => {
  it('Maybe: exactly one guard returns true for any member', () => {
    fc.assert(
      fc.property(arbMaybe, m => {
        const results = [Maybe.is.Just(m), Maybe.is.Nothing(m)]
        expect(results.filter(Boolean).length).toBe(1)
      }),
    )
  })

  it('Result: exactly one guard returns true for any member', () => {
    fc.assert(
      fc.property(arbResult, r => {
        const results = [Result.is.Success(r), Result.is.Failure(r)]
        expect(results.filter(Boolean).length).toBe(1)
      }),
    )
  })

  it('CounterAction: exactly one guard returns true for any member', () => {
    fc.assert(
      fc.property(arbCounterAction, a => {
        const results = [
          CounterAction.is.Increment(a),
          CounterAction.is.Reset(a),
        ]
        expect(results.filter(Boolean).length).toBe(1)
      }),
    )
  })

  it('Trio: exactly one guard returns true for any member', () => {
    fc.assert(
      fc.property(arbTrio, t => {
        const results = [Trio.is.First(t), Trio.is.Second(t), Trio.is.Third(t)]
        expect(results.filter(Boolean).length).toBe(1)
      }),
    )
  })

  it('Env: exactly one guard returns true for any member', () => {
    fc.assert(
      fc.property(arbEnv, e => {
        const results = [
          Env.is.Ask(e),
          Env.is.Pure(e),
          Env.is.Raise(e),
          Env.is.Halt(e),
        ]
        expect(results.filter(Boolean).length).toBe(1)
      }),
    )
  })
})

// ===========================================================================
// Property: guard/match consistency
// ===========================================================================

describe('guard/match consistency', () => {
  it('Maybe: match returns the tag iff the corresponding guard is true', () => {
    fc.assert(
      fc.property(arbMaybe, m => {
        const matchedTag = Maybe.match(m, {
          Just: _x => 'Just' as const,
          Nothing: _x => 'Nothing' as const,
        })
        expect(Maybe.is.Just(m)).toBe(matchedTag === 'Just')
        expect(Maybe.is.Nothing(m)).toBe(matchedTag === 'Nothing')
      }),
    )
  })

  it('Result: match returns the tag iff the corresponding guard is true', () => {
    fc.assert(
      fc.property(arbResult, r => {
        const matchedTag = Result.match(r, {
          Success: _x => 'Success' as const,
          Failure: _x => 'Failure' as const,
        })
        expect(Result.is.Success(r)).toBe(matchedTag === 'Success')
        expect(Result.is.Failure(r)).toBe(matchedTag === 'Failure')
      }),
    )
  })

  it('Env: match returns the tag iff the corresponding guard is true', () => {
    fc.assert(
      fc.property(arbEnv, e => {
        const matchedTag = Env.match(e, {
          Ask: _x => 'Ask' as const,
          Pure: _x => 'Pure' as const,
          Raise: _x => 'Raise' as const,
          Halt: _x => 'Halt' as const,
        })
        expect(Env.is.Ask(e)).toBe(matchedTag === 'Ask')
        expect(Env.is.Pure(e)).toBe(matchedTag === 'Pure')
        expect(Env.is.Raise(e)).toBe(matchedTag === 'Raise')
        expect(Env.is.Halt(e)).toBe(matchedTag === 'Halt')
      }),
    )
  })
})

// ===========================================================================
// Property: guard idempotency
// ===========================================================================

describe('guard idempotency', () => {
  it('calling a guard twice returns the same result', () => {
    fc.assert(
      fc.property(arbMaybe, m => {
        expect(Maybe.is.Just(m)).toBe(Maybe.is.Just(m))
        expect(Maybe.is.Nothing(m)).toBe(Maybe.is.Nothing(m))
        expect(Maybe.is.memberOfUnion(m)).toBe(Maybe.is.memberOfUnion(m))
      }),
    )
  })
})

// ===========================================================================
// Property: memberOfUnion accepts all members
// ===========================================================================

describe('memberOfUnion accepts all constructed members', () => {
  it('Maybe', () => {
    fc.assert(
      fc.property(arbMaybe, m => {
        expect(Maybe.is.memberOfUnion(m)).toBe(true)
      }),
    )
  })

  it('Result', () => {
    fc.assert(
      fc.property(arbResult, r => {
        expect(Result.is.memberOfUnion(r)).toBe(true)
      }),
    )
  })

  it('CounterAction', () => {
    fc.assert(
      fc.property(arbCounterAction, a => {
        expect(CounterAction.is.memberOfUnion(a)).toBe(true)
      }),
    )
  })

  it('Trio', () => {
    fc.assert(
      fc.property(arbTrio, t => {
        expect(Trio.is.memberOfUnion(t)).toBe(true)
      }),
    )
  })

  it('Env', () => {
    fc.assert(
      fc.property(arbEnv, e => {
        expect(Env.is.memberOfUnion(e)).toBe(true)
      }),
    )
  })
})

// ===========================================================================
// Property: memberOfUnion rejects non-members
// ===========================================================================

describe('memberOfUnion rejects non-members', () => {
  const arbWrongTag = fc.record({
    tag: fc
      .string()
      .filter(
        s =>
          ![
            'Just',
            'Nothing',
            'Success',
            'Failure',
            'Ask',
            'Pure',
            'Raise',
            'Halt',
          ].includes(s),
      ),
  })

  const arbWrongType = fc.record({
    type: fc.string().filter(s => !['Increment', 'Reset'].includes(s)),
  })

  const arbWrongKind = fc.record({
    kind: fc.string().filter(s => !['First', 'Second', 'Third'].includes(s)),
  })

  it('rejects objects with wrong tag value', () => {
    fc.assert(
      fc.property(arbWrongTag, obj => {
        expect(Maybe.is.memberOfUnion(obj)).toBe(false)
        expect(Result.is.memberOfUnion(obj)).toBe(false)
        expect(Env.is.memberOfUnion(obj)).toBe(false)
      }),
    )
  })

  it('rejects objects with wrong type value', () => {
    fc.assert(
      fc.property(arbWrongType, obj => {
        expect(CounterAction.is.memberOfUnion(obj)).toBe(false)
      }),
    )
  })

  it('rejects objects with wrong kind value', () => {
    fc.assert(
      fc.property(arbWrongKind, obj => {
        expect(Trio.is.memberOfUnion(obj)).toBe(false)
      }),
    )
  })

  it('rejects arbitrary non-object values', () => {
    const arbNonObject = fc.oneof(
      fc.integer(),
      fc.string(),
      fc.boolean(),
      fc.constant(null),
      fc.constant(undefined),
    )

    fc.assert(
      fc.property(arbNonObject, val => {
        expect(Maybe.is.memberOfUnion(val)).toBe(false)
        expect(Result.is.memberOfUnion(val)).toBe(false)
        expect(CounterAction.is.memberOfUnion(val)).toBe(false)
        expect(Trio.is.memberOfUnion(val)).toBe(false)
        expect(Env.is.memberOfUnion(val)).toBe(false)
      }),
    )
  })

  it('rejects objects without the discriminant key', () => {
    fc.assert(
      fc.property(fc.record({ x: arbJsonValue, y: arbJsonValue }), obj => {
        expect(Maybe.is.memberOfUnion(obj)).toBe(false)
        expect(Result.is.memberOfUnion(obj)).toBe(false)
      }),
    )
  })
})

// ===========================================================================
// Property: cross-union guard rejection
// ===========================================================================

describe('cross-union guard rejection', () => {
  it('Maybe members are rejected by Result guards', () => {
    fc.assert(
      fc.property(arbMaybe, m => {
        expect(Result.is.memberOfUnion(m as unknown)).toBe(false)
      }),
    )
  })

  it('Result members are rejected by Maybe guards', () => {
    fc.assert(
      fc.property(arbResult, r => {
        expect(Maybe.is.memberOfUnion(r as unknown)).toBe(false)
      }),
    )
  })

  it('CounterAction members are rejected by Maybe guards', () => {
    fc.assert(
      fc.property(arbCounterAction, a => {
        expect(Maybe.is.memberOfUnion(a as unknown)).toBe(false)
      }),
    )
  })

  it('Trio members are rejected by Result guards', () => {
    fc.assert(
      fc.property(arbTrio, t => {
        expect(Result.is.memberOfUnion(t as unknown)).toBe(false)
      }),
    )
  })
})

// ===========================================================================
// Property: match with identity handlers is identity
// ===========================================================================

describe('match with identity handlers is identity', () => {
  it('Maybe', () => {
    fc.assert(
      fc.property(arbMaybe, m => {
        const result = Maybe.match(m, {
          Just: x => x as Maybe<fc.JsonValue>,
          Nothing: x => x as Maybe<fc.JsonValue>,
        })
        expect(result).toEqual(m)
      }),
    )
  })

  it('Result', () => {
    fc.assert(
      fc.property(arbResult, r => {
        const result = Result.match(r, {
          Success: x => x as Result<fc.JsonValue, fc.JsonValue>,
          Failure: x => x as Result<fc.JsonValue, fc.JsonValue>,
        })
        expect(result).toEqual(r)
      }),
    )
  })

  it('CounterAction', () => {
    fc.assert(
      fc.property(arbCounterAction, a => {
        const result = CounterAction.match(a, {
          Increment: x => x as CounterAction,
          Reset: x => x as CounterAction,
        })
        expect(result).toEqual(a)
      }),
    )
  })

  it('Trio', () => {
    fc.assert(
      fc.property(arbTrio, t => {
        const result = Trio.match(t, {
          First: x => x as Trio<fc.JsonValue>,
          Second: x => x as Trio<fc.JsonValue>,
          Third: x => x as Trio<fc.JsonValue>,
        })
        expect(result).toEqual(t)
      }),
    )
  })

  it('Env', () => {
    fc.assert(
      fc.property(arbEnv, e => {
        const result = Env.match(e, {
          Ask: x => x as Env<fc.JsonValue, fc.JsonValue, fc.JsonValue>,
          Pure: x => x as Env<fc.JsonValue, fc.JsonValue, fc.JsonValue>,
          Raise: x => x as Env<fc.JsonValue, fc.JsonValue, fc.JsonValue>,
          Halt: x => x as Env<fc.JsonValue, fc.JsonValue, fc.JsonValue>,
        })
        expect(result).toEqual(e)
      }),
    )
  })
})

// ===========================================================================
// Property: match dispatches to the correct handler
// ===========================================================================

describe('match dispatches to the correct handler', () => {
  it('Maybe: match returns discriminant value', () => {
    fc.assert(
      fc.property(arbMaybe, m => {
        const tag = Maybe.match(m, {
          Just: _x => 'Just' as const,
          Nothing: _x => 'Nothing' as const,
        })
        expect(tag).toBe(m.tag)
      }),
    )
  })

  it('Result: match returns discriminant value', () => {
    fc.assert(
      fc.property(arbResult, r => {
        const tag = Result.match(r, {
          Success: _x => 'Success' as const,
          Failure: _x => 'Failure' as const,
        })
        expect(tag).toBe(r.tag)
      }),
    )
  })

  it('CounterAction: match returns discriminant value', () => {
    fc.assert(
      fc.property(arbCounterAction, a => {
        const t = CounterAction.match(a, {
          Increment: _x => 'Increment' as const,
          Reset: _x => 'Reset' as const,
        })
        expect(t).toBe(a.type)
      }),
    )
  })

  it('Trio: match returns discriminant value', () => {
    fc.assert(
      fc.property(arbTrio, t => {
        const k = Trio.match(t, {
          First: _x => 'First' as const,
          Second: _x => 'Second' as const,
          Third: _x => 'Third' as const,
        })
        expect(k).toBe(t.kind)
      }),
    )
  })

  it('Env: match returns discriminant value', () => {
    fc.assert(
      fc.property(arbEnv, e => {
        const tag = Env.match(e, {
          Ask: _x => 'Ask' as const,
          Pure: _x => 'Pure' as const,
          Raise: _x => 'Raise' as const,
          Halt: _x => 'Halt' as const,
        })
        expect(tag).toBe(e.tag)
      }),
    )
  })
})

// ===========================================================================
// Property: match never throws for constructed values
// ===========================================================================

describe('match never throws for constructed values', () => {
  it('Maybe', () => {
    fc.assert(
      fc.property(arbMaybe, m => {
        expect(() =>
          Maybe.match(m, { Just: () => 'j', Nothing: () => 'n' }),
        ).not.toThrow()
      }),
    )
  })

  it('Env', () => {
    fc.assert(
      fc.property(arbEnv, e => {
        expect(() =>
          Env.match(e, {
            Ask: () => 'a',
            Pure: () => 'p',
            Raise: () => 'r',
            Halt: () => 'h',
          }),
        ).not.toThrow()
      }),
    )
  })
})

// ===========================================================================
// Property: constructor preserves all fields
// ===========================================================================

describe('constructor preserves all fields', () => {
  it('Maybe.Just preserves value field', () => {
    fc.assert(
      fc.property(arbJsonValue, v => {
        const just = Maybe.Just({ value: v })
        expect(just).toEqual({ tag: 'Just', value: v })
      }),
    )
  })

  it('Maybe.Nothing has only the tag field', () => {
    expect(Object.keys(Maybe.Nothing)).toEqual(['tag'])
    expect(Maybe.Nothing).toEqual({ tag: 'Nothing' })
  })

  it('Result.Success preserves value field', () => {
    fc.assert(
      fc.property(arbJsonValue, v => {
        expect(Result.Success({ value: v })).toEqual({
          tag: 'Success',
          value: v,
        })
      }),
    )
  })

  it('Result.Failure preserves error field', () => {
    fc.assert(
      fc.property(arbJsonValue, e => {
        expect(Result.Failure({ error: e })).toEqual({
          tag: 'Failure',
          error: e,
        })
      }),
    )
  })

  it('CounterAction.Increment preserves amount field', () => {
    fc.assert(
      fc.property(fc.integer(), n => {
        expect(CounterAction.Increment({ amount: n })).toEqual({
          type: 'Increment',
          amount: n,
        })
      }),
    )
  })

  it('CounterAction.Reset has only the type field', () => {
    expect(CounterAction.Reset).toEqual({ type: 'Reset' })
  })

  it('Trio constructors preserve fields with custom discriminant key', () => {
    fc.assert(
      fc.property(arbJsonValue, v => {
        expect(Trio.First({ value: v })).toEqual({ kind: 'First', value: v })
        expect(Trio.Second({ value: v })).toEqual({ kind: 'Second', value: v })
      }),
    )
    expect(Trio.Third).toEqual({ kind: 'Third' })
  })

  it('Env constructors preserve fields at arity 3', () => {
    fc.assert(
      fc.property(arbJsonValue, v => {
        expect(Env.Ask({ resource: v })).toEqual({ tag: 'Ask', resource: v })
        expect(Env.Pure({ value: v })).toEqual({ tag: 'Pure', value: v })
        expect(Env.Raise({ error: v })).toEqual({ tag: 'Raise', error: v })
      }),
    )
    expect(Env.Halt).toEqual({ tag: 'Halt' })
  })
})

// ===========================================================================
// Property: constructor -> match -> field extraction roundtrip
// ===========================================================================

describe('constructor -> match -> field extraction roundtrip', () => {
  it('Maybe: extracting value from Just via match returns the original', () => {
    fc.assert(
      fc.property(arbJsonValue, v => {
        const extracted = Maybe.match(Maybe.Just({ value: v }), {
          Just: x => x.value,
          Nothing: _x => undefined,
        })
        expect(extracted).toEqual(v)
      }),
    )
  })

  it('Result: extracting value/error via match returns the original', () => {
    fc.assert(
      fc.property(arbJsonValue, v => {
        const extractedValue = Result.match(
          Result.Success<unknown, fc.JsonValue>({ value: v }),
          {
            Success: x => x.value,
            Failure: _x => undefined,
          },
        )
        expect(extractedValue).toEqual(v)

        const extractedError = Result.match(
          Result.Failure<fc.JsonValue, unknown>({ error: v }),
          {
            Success: _x => undefined,
            Failure: x => x.error,
          },
        )
        expect(extractedError).toEqual(v)
      }),
    )
  })

  it('Env: extracting fields via match returns the original', () => {
    fc.assert(
      fc.property(arbJsonValue, v => {
        const extracted = Env.match(
          Env.Ask<fc.JsonValue, unknown, unknown>({ resource: v }),
          {
            Ask: x => x.resource,
            Pure: _x => undefined,
            Raise: _x => undefined,
            Halt: _x => undefined,
          },
        )
        expect(extracted).toEqual(v)
      }),
    )
  })
})

// ===========================================================================
// Property: matchW dispatches identically to match
// ===========================================================================

describe('matchW dispatches identically to match', () => {
  it('Maybe', () => {
    fc.assert(
      fc.property(arbMaybe, m => {
        const matchResult = Maybe.match(m, {
          Just: () => 'just',
          Nothing: () => 'nothing',
        })
        const matchWResult = Maybe.matchW(m, {
          Just: () => 'just',
          Nothing: () => 'nothing',
        })
        expect(matchResult).toBe(matchWResult)
      }),
    )
  })

  it('Result', () => {
    fc.assert(
      fc.property(arbResult, r => {
        const matchResult = Result.match(r, {
          Success: () => 'success',
          Failure: () => 'failure',
        })
        const matchWResult = Result.matchW(r, {
          Success: () => 'success',
          Failure: () => 'failure',
        })
        expect(matchResult).toBe(matchWResult)
      }),
    )
  })
})

// ===========================================================================
// Property: matchOr agrees with match when all handlers provided
// ===========================================================================

describe('matchOr agrees with match when all handlers provided', () => {
  it('Maybe', () => {
    fc.assert(
      fc.property(arbMaybe, m => {
        const handlers = {
          Just: () => 'just',
          Nothing: () => 'nothing',
        }
        const matchResult = Maybe.match(m, handlers)
        const matchOrResult = Maybe.matchOr(m, handlers, () => 'unreachable')
        expect(matchResult).toBe(matchOrResult)
      }),
    )
  })

  it('Env', () => {
    fc.assert(
      fc.property(arbEnv, e => {
        const handlers = {
          Ask: () => 'ask',
          Pure: () => 'pure',
          Raise: () => 'raise',
          Halt: () => 'halt',
        }
        const matchResult = Env.match(e, handlers)
        const matchOrResult = Env.matchOr(e, handlers, () => 'unreachable')
        expect(matchResult).toBe(matchOrResult)
      }),
    )
  })
})

// ===========================================================================
// Property: matchOr with empty handlers always calls otherwise
// ===========================================================================

describe('matchOr with empty handlers always calls otherwise', () => {
  it('Maybe', () => {
    fc.assert(
      fc.property(arbMaybe, m => {
        expect(Maybe.matchOr(m, {}, () => 'fallback')).toBe('fallback')
      }),
    )
  })

  it('Result', () => {
    fc.assert(
      fc.property(arbResult, r => {
        expect(Result.matchOr(r, {}, () => 'fallback')).toBe('fallback')
      }),
    )
  })
})

// ===========================================================================
// Property: matcher produces same results as match
// ===========================================================================

describe('matcher produces same results as match', () => {
  it('Maybe', () => {
    const handlers = {
      Just: (_x: { readonly tag: 'Just'; readonly value: fc.JsonValue }) =>
        'just',
      Nothing: (_x: { readonly tag: 'Nothing' }) => 'nothing',
    }
    const curried = Maybe.matcher(handlers)
    fc.assert(
      fc.property(arbMaybe, m => {
        expect(curried(m)).toBe(
          Maybe.match(m, { Just: () => 'just', Nothing: () => 'nothing' }),
        )
      }),
    )
  })
})

// ===========================================================================
// Property: nullary constructor reference identity
// ===========================================================================

describe('nullary constructor reference identity', () => {
  it('Maybe.Nothing is referentially identical across accesses', () => {
    expect(Maybe.Nothing).toBe(Maybe.Nothing)
  })

  it('CounterAction.Reset is referentially identical across accesses', () => {
    expect(CounterAction.Reset).toBe(CounterAction.Reset)
  })

  it('Trio.Third is referentially identical across accesses', () => {
    expect(Trio.Third).toBe(Trio.Third)
  })

  it('Env.Halt is referentially identical across accesses', () => {
    expect(Env.Halt).toBe(Env.Halt)
  })
})
