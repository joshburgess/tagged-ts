import { describe, expect, it } from 'vitest'
import type {
  MkData,
  TaggedLambda1,
  TaggedLambda2,
  TaggedLambda3,
} from '../../src/positional'
import { mkTaggedUnion } from '../../src/positional'

// ===========================================================================
// Setup: Maybe<A> (arity 1, nullary + non-nullary)
// ===========================================================================

type Nothing = { readonly tag: 'Nothing' }
type Just<A> = { readonly tag: 'Just'; readonly value: A }
type Maybe<A> = Just<A> | Nothing

interface MaybeLambda extends TaggedLambda1 {
  readonly type: Maybe<this['A']>
  readonly data: MkData<this['type']>
}

const Maybe = mkTaggedUnion<MaybeLambda>()({ Just: ['value'], Nothing: [] })

// ===========================================================================
// Setup: Result<E, A> (arity 2, all non-nullary)
// ===========================================================================

type Failure<E> = { readonly tag: 'Failure'; readonly error: E }
type Success<A> = { readonly tag: 'Success'; readonly value: A }
type Result<E, A> = Success<A> | Failure<E>

interface ResultLambda extends TaggedLambda2 {
  readonly type: Result<this['E'], this['A']>
  readonly data: MkData<this['type']>
}

const Result = mkTaggedUnion<ResultLambda>()({
  Success: ['value'],
  Failure: ['error'],
})

// ===========================================================================
// Setup: MaybeNested<A> (arity 1, nested value types)
// ===========================================================================

type NothingNested = { readonly tag: 'NothingNested' }
type JustNested<A> = {
  readonly tag: 'JustNested'
  readonly value: { readonly nested: A }
}
type MaybeNested<A> = JustNested<A> | NothingNested

interface MaybeNestedLambda extends TaggedLambda1 {
  readonly type: MaybeNested<this['A']>
  readonly data: MkData<this['type']>
}

const MaybeNested = mkTaggedUnion<MaybeNestedLambda>()({
  JustNested: ['value'],
  NothingNested: [],
})

// ===========================================================================
// Setup: ResultNested<E, A> (arity 2, nested value types)
// ===========================================================================

type FailureNested<E> = {
  readonly tag: 'FailureNested'
  readonly error: { readonly nested: E }
}
type SuccessNested<A> = {
  readonly tag: 'SuccessNested'
  readonly value: { readonly nested: A }
}
type ResultNested<E, A> = SuccessNested<A> | FailureNested<E>

interface ResultNestedLambda extends TaggedLambda2 {
  readonly type: ResultNested<this['E'], this['A']>
  readonly data: MkData<this['type']>
}

const ResultNested = mkTaggedUnion<ResultNestedLambda>()({
  SuccessNested: ['value'],
  FailureNested: ['error'],
})

// ===========================================================================
// Setup: Env<R, E, A> (arity 3, has nullary Halt)
// ===========================================================================

type Ask<R> = { readonly tag: 'Ask'; readonly resource: R }
type Pure<A> = { readonly tag: 'Pure'; readonly value: A }
type Raise<E> = { readonly tag: 'Raise'; readonly error: E }
type Halt = { readonly tag: 'Halt' }
type Env<R, E, A> = Ask<R> | Pure<A> | Raise<E> | Halt

interface EnvLambda extends TaggedLambda3 {
  readonly type: Env<this['R'], this['E'], this['A']>
  readonly data: MkData<this['type']>
}

const Env = mkTaggedUnion<EnvLambda>()({
  Ask: ['resource'],
  Pure: ['value'],
  Raise: ['error'],
  Halt: [],
})

// ===========================================================================
// Maybe<A>
// ===========================================================================

describe('Maybe<A> (arity 1, nullary + non-nullary)', () => {
  it('generates the correct API shape', () => {
    expect(typeof Maybe.Just).toBe('function')
    expect(typeof Maybe.Nothing).toBe('object')
    expect(typeof Maybe.is.Just).toBe('function')
    expect(typeof Maybe.is.Nothing).toBe('function')
    expect(typeof Maybe.is.memberOfUnion).toBe('function')
    expect(typeof Maybe.match).toBe('function')
  })

  it('nullary constructor is a constant (reference identity)', () => {
    expect(Maybe.Nothing).toBe(Maybe.Nothing)
  })

  it('non-nullary constructor is a function', () => {
    expect(typeof Maybe.Just).toBe('function')
  })

  describe('constructors', () => {
    it('builds non-nullary members with positional args', () => {
      expect(Maybe.Just(0)).toEqual({ tag: 'Just', value: 0 })
      expect(Maybe.Just('hello')).toEqual({
        tag: 'Just',
        value: 'hello',
      })
    })

    it('builds nullary members as plain objects', () => {
      expect(Maybe.Nothing).toEqual({ tag: 'Nothing' })
      expect(Object.keys(Maybe.Nothing)).toEqual(['tag'])
    })
  })

  describe('guards', () => {
    const just = Maybe.Just(42)
    const nothing: Maybe<number> = Maybe.Nothing

    it('per-member guards return true for matching members', () => {
      expect(Maybe.is.Just(just)).toBe(true)
      expect(Maybe.is.Nothing(nothing)).toBe(true)
    })

    it('per-member guards return false for non-matching members', () => {
      expect(Maybe.is.Just(nothing)).toBe(false)
      expect(Maybe.is.Nothing(just)).toBe(false)
    })

    it('memberOfUnion accepts all members', () => {
      expect(Maybe.is.memberOfUnion(just)).toBe(true)
      expect(Maybe.is.memberOfUnion(nothing)).toBe(true)
    })

    it('memberOfUnion rejects wrong tag values', () => {
      expect(Maybe.is.memberOfUnion({ tag: 'Unknown' })).toBe(false)
    })

    it('memberOfUnion rejects objects without discriminant key', () => {
      expect(Maybe.is.memberOfUnion({ foo: 'bar' })).toBe(false)
    })

    it('guards handle null and undefined safely', () => {
      expect(Maybe.is.memberOfUnion(null)).toBe(false)
      expect(Maybe.is.memberOfUnion(undefined)).toBe(false)
    })

    it('guards handle primitives safely', () => {
      expect(Maybe.is.memberOfUnion(42)).toBe(false)
      expect(Maybe.is.memberOfUnion('string')).toBe(false)
      expect(Maybe.is.memberOfUnion(true)).toBe(false)
      expect(Maybe.is.memberOfUnion(Symbol('test'))).toBe(false)
    })
  })

  describe('match', () => {
    it('dispatches to the correct handler', () => {
      const just = Maybe.Just(99)
      const nothing: Maybe<number> = Maybe.Nothing

      expect(Maybe.match(just, { Just: x => x.tag, Nothing: x => x.tag })).toBe(
        'Just',
      )
      expect(
        Maybe.match(nothing, { Just: x => x.tag, Nothing: x => x.tag }),
      ).toBe('Nothing')
    })

    it('handlers receive the correct narrowed value', () => {
      expect(
        Maybe.match(Maybe.Just(99), {
          Just: x => x.value,
          Nothing: _x => 0,
        }),
      ).toBe(99)
    })

    it('identity handlers return the original value', () => {
      const just = Maybe.Just(42)
      const nothing: Maybe<number> = Maybe.Nothing

      expect(
        Maybe.match(just, {
          Just: x => x as Maybe<number>,
          Nothing: x => x as Maybe<number>,
        }),
      ).toEqual(just)
      expect(
        Maybe.match(nothing, {
          Just: x => x as Maybe<number>,
          Nothing: x => x as Maybe<number>,
        }),
      ).toEqual(nothing)
    })
  })
})

// ===========================================================================
// Result<E, A>
// ===========================================================================

describe('Result<E, A> (arity 2, all non-nullary)', () => {
  it('generates the correct API shape', () => {
    expect(typeof Result.Success).toBe('function')
    expect(typeof Result.Failure).toBe('function')
    expect(typeof Result.is.Success).toBe('function')
    expect(typeof Result.is.Failure).toBe('function')
    expect(typeof Result.is.memberOfUnion).toBe('function')
    expect(typeof Result.match).toBe('function')
  })

  describe('constructors', () => {
    it('builds Success with positional value', () => {
      expect(Result.Success('OK')).toEqual({
        tag: 'Success',
        value: 'OK',
      })
    })

    it('builds Failure with positional error', () => {
      expect(Result.Failure(404)).toEqual({
        tag: 'Failure',
        error: 404,
      })
    })
  })

  describe('guards', () => {
    const s = Result.Success('OK')
    const f = Result.Failure(500)

    it('correctly identifies members', () => {
      expect(Result.is.Success(s)).toBe(true)
      expect(Result.is.Success(f)).toBe(false)
      expect(Result.is.Failure(f)).toBe(true)
      expect(Result.is.Failure(s)).toBe(false)
    })

    it('memberOfUnion accepts and rejects correctly', () => {
      expect(Result.is.memberOfUnion(s)).toBe(true)
      expect(Result.is.memberOfUnion(f)).toBe(true)
      expect(Result.is.memberOfUnion({ tag: 'unknown' })).toBe(false)
    })
  })

  describe('match', () => {
    it('dispatches correctly with explicit type params', () => {
      const s = Result.Success<number, string>('OK')
      const f = Result.Failure<number, string>(500)

      expect(
        Result.match(s, { Success: x => x.value, Failure: x => 'failed' }),
      ).toBe('OK')
      expect(
        Result.match(f, { Success: x => x.value, Failure: _x => 'failed' }),
      ).toBe('failed')
    })
  })
})

// ===========================================================================
// MaybeNested<A> (nested value types)
// ===========================================================================

describe('MaybeNested<A> (nested value types)', () => {
  it('constructors handle nested fields', () => {
    expect(MaybeNested.JustNested({ nested: 42 })).toEqual({
      tag: 'JustNested',
      value: { nested: 42 },
    })
    expect(MaybeNested.NothingNested).toEqual({ tag: 'NothingNested' })
  })

  it('match extracts nested values', () => {
    const j = MaybeNested.JustNested({ nested: 99 })
    expect(
      MaybeNested.match(j, {
        JustNested: x => x.value.nested,
        NothingNested: _x => 0,
      }),
    ).toBe(99)
  })

  it('guards work with nested types', () => {
    const j = MaybeNested.JustNested({ nested: 0 })
    const n: MaybeNested<number> = MaybeNested.NothingNested

    expect(MaybeNested.is.JustNested(j)).toBe(true)
    expect(MaybeNested.is.NothingNested(n)).toBe(true)
    expect(MaybeNested.is.memberOfUnion(j)).toBe(true)
    expect(MaybeNested.is.memberOfUnion(n)).toBe(true)
  })
})

// ===========================================================================
// ResultNested<E, A> (nested value types, arity 2)
// ===========================================================================

describe('ResultNested<E, A> (nested value types, arity 2)', () => {
  it('constructors handle nested fields', () => {
    expect(ResultNested.SuccessNested({ nested: 'OK' })).toEqual({
      tag: 'SuccessNested',
      value: { nested: 'OK' },
    })
    expect(ResultNested.FailureNested({ nested: 404 })).toEqual({
      tag: 'FailureNested',
      error: { nested: 404 },
    })
  })

  it('match extracts nested values', () => {
    const s = ResultNested.SuccessNested<number, string>({ nested: 'OK' })
    expect(
      ResultNested.match(s, {
        SuccessNested: x => x.value.nested,
        FailureNested: _x => 'failed',
      }),
    ).toBe('OK')
  })

  it('guards work with nested types', () => {
    const s = ResultNested.SuccessNested({ nested: 'OK' })
    const f = ResultNested.FailureNested({ nested: 500 })

    expect(ResultNested.is.SuccessNested(s)).toBe(true)
    expect(ResultNested.is.FailureNested(f)).toBe(true)
    expect(ResultNested.is.memberOfUnion(s)).toBe(true)
    expect(ResultNested.is.memberOfUnion(f)).toBe(true)
  })
})

// ===========================================================================
// Env<R, E, A> (arity 3)
// ===========================================================================

describe('Env<R, E, A> (arity 3, with nullary Halt)', () => {
  it('generates the correct API shape', () => {
    expect(typeof Env.Ask).toBe('function')
    expect(typeof Env.Pure).toBe('function')
    expect(typeof Env.Raise).toBe('function')
    expect(typeof Env.Halt).toBe('object')
    expect(typeof Env.is.Ask).toBe('function')
    expect(typeof Env.is.Halt).toBe('function')
    expect(typeof Env.is.memberOfUnion).toBe('function')
    expect(typeof Env.match).toBe('function')
  })

  it('nullary constant has reference identity', () => {
    expect(Env.Halt).toBe(Env.Halt)
  })

  describe('constructors', () => {
    it('builds non-nullary members with positional args', () => {
      expect(Env.Ask('db')).toEqual({
        tag: 'Ask',
        resource: 'db',
      })
      expect(Env.Pure(true)).toEqual({ tag: 'Pure', value: true })
      expect(Env.Raise(42)).toEqual({ tag: 'Raise', error: 42 })
    })

    it('builds nullary Halt as plain object', () => {
      expect(Env.Halt).toEqual({ tag: 'Halt' })
    })
  })

  describe('guards', () => {
    const ask = Env.Ask('db')
    const pure = Env.Pure(true)
    const raise = Env.Raise(42)
    const halt: Env<string, number, boolean> = Env.Halt

    it('correctly identifies each member', () => {
      expect(Env.is.Ask(ask)).toBe(true)
      expect(Env.is.Ask(pure)).toBe(false)
      expect(Env.is.Pure(pure)).toBe(true)
      expect(Env.is.Raise(raise)).toBe(true)
      expect(Env.is.Halt(halt)).toBe(true)
      expect(Env.is.Halt(ask)).toBe(false)
    })

    it('memberOfUnion accepts all members', () => {
      expect(Env.is.memberOfUnion(ask)).toBe(true)
      expect(Env.is.memberOfUnion(pure)).toBe(true)
      expect(Env.is.memberOfUnion(raise)).toBe(true)
      expect(Env.is.memberOfUnion(halt)).toBe(true)
    })

    it('memberOfUnion rejects non-members', () => {
      expect(Env.is.memberOfUnion({ tag: 'Unknown' })).toBe(false)
      expect(Env.is.memberOfUnion(null)).toBe(false)
    })
  })

  describe('match', () => {
    it('dispatches to the correct handler', () => {
      const ask = Env.Ask('db')
      const halt: Env<string, number, boolean> = Env.Halt

      expect(
        Env.match(ask, {
          Ask: x => x.resource,
          Pure: x => String(x.value),
          Raise: x => String(x.error),
          Halt: _x => 'halt',
        }),
      ).toBe('db')

      expect(
        Env.match(halt, {
          Ask: x => x.resource,
          Pure: x => String(x.value),
          Raise: x => String(x.error),
          Halt: _x => 'halt',
        }),
      ).toBe('halt')
    })
  })
})

// ===========================================================================
// matchW (widened return type)
// ===========================================================================

describe('matchW (widened return type)', () => {
  it('dispatches like match', () => {
    const j = Maybe.Just(42)
    expect(Maybe.matchW(j, { Just: x => x.value, Nothing: _x => 0 })).toBe(42)
  })

  it('allows different return types per handler', () => {
    const j = Maybe.Just(42)
    const n: Maybe<number> = Maybe.Nothing

    const r1 = Maybe.matchW(j, {
      Just: x => x.value,
      Nothing: _x => 'nothing',
    })
    expect(r1).toBe(42)

    const r2 = Maybe.matchW(n, {
      Just: x => x.value,
      Nothing: _x => 'nothing',
    })
    expect(r2).toBe('nothing')
  })

  it('works with arity-2', () => {
    const s = Result.Success('OK')
    expect(
      Result.matchW(s, { Success: x => x.value, Failure: x => x.error }),
    ).toBe('OK')
  })

  it('works with arity-3', () => {
    const ask = Env.Ask('db')
    expect(
      Env.matchW(ask, {
        Ask: x => x.resource,
        Pure: x => x.value,
        Raise: x => x.error,
        Halt: _x => null,
      }),
    ).toBe('db')
  })
})

// ===========================================================================
// matchOr (partial match with default)
// ===========================================================================

describe('matchOr (partial match with default)', () => {
  it('dispatches to provided handler when matched', () => {
    const j = Maybe.Just(42)
    expect(Maybe.matchOr(j, { Just: x => x.value }, _otherwise => -1)).toBe(42)
  })

  it('falls through to otherwise when no handler matches', () => {
    const n: Maybe<number> = Maybe.Nothing
    expect(Maybe.matchOr(n, { Just: x => x.value }, _otherwise => -1)).toBe(-1)
  })

  it('works with empty handlers — all go to fallback', () => {
    const j = Maybe.Just(42)
    expect(Maybe.matchOr(j, {}, _otherwise => -1)).toBe(-1)
  })

  it('works with full handlers — otherwise never called', () => {
    const n: Maybe<number> = Maybe.Nothing
    expect(
      Maybe.matchOr(
        n,
        { Just: x => x.value, Nothing: _x => 0 },
        _otherwise => -1,
      ),
    ).toBe(0)
  })

  it('works with arity-2', () => {
    const f = Result.Failure('oops')
    expect(
      Result.matchOr(f, { Success: x => x.value }, _otherwise => 'default'),
    ).toBe('default')
  })

  it('works with arity-3 partial', () => {
    const halt: Env<string, number, boolean> = Env.Halt
    expect(
      Env.matchOr(halt, { Ask: x => x.resource }, _otherwise => 'fallback'),
    ).toBe('fallback')
  })
})

// ===========================================================================
// matcher (curried data-last match)
// ===========================================================================

describe('matcher (curried data-last match)', () => {
  it('returns a function that dispatches correctly', () => {
    const f = Maybe.matcher({
      Just: (x: Just<unknown>) => x.value as number,
      Nothing: (_x: Nothing) => 0,
    })
    expect(f(Maybe.Just(42))).toBe(42)
    expect(f(Maybe.Nothing as Maybe<number>)).toBe(0)
  })

  it('returned function can be reused', () => {
    const toStr = Result.matcher({
      Success: (x: Success<unknown>) => String(x.value),
      Failure: (x: Failure<unknown>) => String(x.error),
    })
    expect(toStr(Result.Success('OK'))).toBe('OK')
    expect(toStr(Result.Failure(404))).toBe('404')
  })
})

// ===========================================================================
// matcherW (curried data-last widened match)
// ===========================================================================

describe('matcherW (curried data-last widened match)', () => {
  it('returns a function allowing different return types', () => {
    const f = Maybe.matcherW({
      Just: (x: Just<unknown>) => x.value,
      Nothing: (_x: Nothing) => 'nothing' as const,
    })
    expect(f(Maybe.Just(42))).toBe(42)
    expect(f(Maybe.Nothing as Maybe<number>)).toBe('nothing')
  })
})

// ===========================================================================
// Edge cases
// ===========================================================================

describe('edge cases', () => {
  it('constructors do not share state between calls', () => {
    const j1 = Maybe.Just(1)
    const j2 = Maybe.Just(2)
    expect(j1).not.toBe(j2)
    expect(j1).toEqual({ tag: 'Just', value: 1 })
    expect(j2).toEqual({ tag: 'Just', value: 2 })
  })

  it('objects with matching tag but wrong structure still pass guards', () => {
    // Guards only check the discriminant value, not the full shape
    const fake = { tag: 'Just' } // missing value field
    expect(Maybe.is.Just(fake as Maybe<number>)).toBe(true)
    expect(Maybe.is.memberOfUnion(fake)).toBe(true)
  })

  it('empty arrays and plain objects are rejected by memberOfUnion', () => {
    expect(Maybe.is.memberOfUnion({})).toBe(false)
    expect(Maybe.is.memberOfUnion([])).toBe(false)
  })
})
