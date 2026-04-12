import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { mkArbitrary } from '../../src/fast-check'
import type {
  MkData,
  TaggedLambda0,
  TaggedLambda1,
  TaggedLambda2,
} from '../../src/positional'
import { mkTaggedUnion, mkTaggedUnionCustom } from '../../src/positional'

// ===========================================================================
// Setup
// ===========================================================================

type Nothing = { readonly tag: 'Nothing' }
type Just<A> = { readonly tag: 'Just'; readonly value: A }
type Maybe<A> = Just<A> | Nothing

interface MaybeLambda extends TaggedLambda1 {
  readonly type: Maybe<this['A']>
  readonly data: MkData<this['type']>
}

const Maybe = mkTaggedUnion<MaybeLambda>()({ Just: ['value'], Nothing: [] })

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

// A two-field variant to verify positional ordering in `show`.
type Emit<S, A> = {
  readonly tag: 'Emit'
  readonly state: S
  readonly value: A
}
type End = { readonly tag: 'End' }
type Stream<S, A> = Emit<S, A> | End

interface StreamLambda extends TaggedLambda2 {
  readonly type: Stream<this['E'], this['A']>
  readonly data: MkData<this['type']>
}

const Stream = mkTaggedUnion<StreamLambda>()({
  Emit: ['state', 'value'],
  End: [],
})

type Increment = { readonly type: 'Increment'; readonly amount: number }
type Reset = { readonly type: 'Reset' }
type CounterAction = Increment | Reset

interface CounterActionLambda extends TaggedLambda0 {
  readonly type: CounterAction
  readonly data: MkData<this['type'], 'type'>
}

const CounterAction = mkTaggedUnionCustom<CounterActionLambda>()('type', {
  Increment: ['amount'],
  Reset: [],
})

// ===========================================================================
// tags
// ===========================================================================

describe('tags', () => {
  it('returns all member tag strings', () => {
    expect(Maybe.tags).toEqual(['Just', 'Nothing'])
    expect(Stream.tags).toEqual(['Emit', 'End'])
    expect(CounterAction.tags).toEqual(['Increment', 'Reset'])
  })

  it('is frozen', () => {
    expect(Object.isFrozen(Stream.tags)).toBe(true)
  })

  it('throws on mutation attempt', () => {
    expect(() => {
      // biome-ignore lint/suspicious/noExplicitAny: exercising runtime freeze
      ;(Stream.tags as any).push('Bogus')
    }).toThrow(TypeError)
  })

  it('returns stable reference', () => {
    expect(Stream.tags).toBe(Stream.tags)
  })
})

// ===========================================================================
// show
// ===========================================================================

describe('show (positional)', () => {
  it('formats nullary members as just the tag', () => {
    expect(Maybe.show(Maybe.Nothing)).toBe('Nothing')
    expect(Stream.show(Stream.End)).toBe('End')
  })

  it('formats single-field members with positional value', () => {
    expect(Maybe.show(Maybe.Just(42))).toBe('Just(42)')
    expect(Maybe.show(Maybe.Just('hi'))).toBe('Just("hi")')
  })

  it('formats multi-field members in declared order', () => {
    expect(Stream.show(Stream.Emit('s', 42))).toBe('Emit("s", 42)')
  })

  it('formats nested plain objects recursively', () => {
    expect(Maybe.show(Maybe.Just({ a: 1, b: [2, 3] }))).toBe(
      'Just({ a: 1, b: [2, 3] })',
    )
  })

  it('renders a tagged union nested inside another as a plain object', () => {
    // Nested member has no prototype distinction — formatValue sees it as plain
    // and renders its own `tag` key verbatim.
    expect(Maybe.show(Maybe.Just(Maybe.Just(1) as unknown as number))).toBe(
      'Just({ tag: "Just", value: 1 })',
    )
    expect(
      Maybe.show(Maybe.Just(Stream.Emit('s', 42) as unknown as number)),
    ).toBe('Just({ tag: "Emit", state: "s", value: 42 })')
  })

  it('handles custom discriminant key', () => {
    expect(CounterAction.show(CounterAction.Increment(3))).toBe('Increment(3)')
    expect(CounterAction.show(CounterAction.Reset)).toBe('Reset')
  })

  it('formats booleans and null', () => {
    expect(Maybe.show(Maybe.Just(true as unknown as number))).toBe('Just(true)')
    expect(Maybe.show(Maybe.Just(null as unknown as number))).toBe('Just(null)')
  })

  it('formats arrays with spaces', () => {
    expect(Maybe.show(Maybe.Just([1, 2, 3] as unknown as number))).toBe(
      'Just([1, 2, 3])',
    )
  })

  it('uses spec field order (not insertion order) when values arrive via spread', () => {
    // Directly construct an object with keys in the opposite order, then show.
    // show should still render in spec order: state, value
    const weird = { tag: 'Emit' as const, value: 42, state: 's' }
    expect(Stream.show(weird)).toBe('Emit("s", 42)')
  })

  it('omits fields present on the runtime value but missing from the spec', () => {
    // Defensive: if a value has extra keys, show only emits the declared ones
    const extra = {
      tag: 'Emit' as const,
      state: 's',
      value: 42,
      bogus: 'ignored',
    } as unknown as Stream<string, number>
    expect(Stream.show(extra)).toBe('Emit("s", 42)')
  })

  it('renders Date/RegExp/Error via rich formatter', () => {
    expect(
      Maybe.show(
        Maybe.Just(new Date('2024-01-01T00:00:00.000Z') as unknown as number),
      ),
    ).toBe('Just(Date("2024-01-01T00:00:00.000Z"))')
    expect(Maybe.show(Maybe.Just(/abc/i as unknown as number))).toBe(
      'Just(/abc/i)',
    )
    expect(Maybe.show(Maybe.Just(new Error('oops') as unknown as number))).toBe(
      'Just(Error("oops"))',
    )
  })

  it('renders Map and Set', () => {
    expect(Maybe.show(Maybe.Just(new Set([1, 2]) as unknown as number))).toBe(
      'Just(Set(1, 2))',
    )
    expect(
      Maybe.show(Maybe.Just(new Map([['k', 1]]) as unknown as number)),
    ).toBe('Just(Map("k" => 1))')
  })

  it('renders bigint, symbol, function', () => {
    expect(Maybe.show(Maybe.Just(42n as unknown as number))).toBe('Just(42n)')
    expect(Maybe.show(Maybe.Just(Symbol('x') as unknown as number))).toBe(
      'Just(Symbol(x))',
    )
    expect(Maybe.show(Maybe.Just(function foo() {} as unknown as number))).toBe(
      'Just([Function: foo])',
    )
  })

  it('renders class instances with constructor name', () => {
    class Point {
      x: number
      y: number
      constructor(x: number, y: number) {
        this.x = x
        this.y = y
      }
    }
    expect(Maybe.show(Maybe.Just(new Point(1, 2) as unknown as number))).toBe(
      'Just(Point { x: 1, y: 2 })',
    )
  })

  it('marks cyclic references with [Circular]', () => {
    const cyclic: { self?: unknown } = {}
    cyclic.self = cyclic
    expect(Maybe.show(Maybe.Just(cyclic as unknown as number))).toBe(
      'Just({ self: [Circular] })',
    )
  })
})

// ===========================================================================
// equals
// ===========================================================================

describe('equals', () => {
  it('returns true for structurally identical members', () => {
    expect(Maybe.equals(Maybe.Just(42), Maybe.Just(42))).toBe(true)
    expect(Maybe.equals(Maybe.Nothing, Maybe.Nothing)).toBe(true)
  })

  it('returns false for different discriminants', () => {
    expect(Maybe.equals(Maybe.Just(42), Maybe.Nothing)).toBe(false)
  })

  it('returns false for different field values', () => {
    expect(Maybe.equals(Maybe.Just(42), Maybe.Just(43))).toBe(false)
  })

  it('compares nested objects structurally', () => {
    const a = Maybe.Just({ a: 1, b: [1, 2, 3] })
    const b = Maybe.Just({ a: 1, b: [1, 2, 3] })
    expect(Maybe.equals(a, b)).toBe(true)
  })

  it('compares multi-field members positionally', () => {
    expect(Stream.equals(Stream.Emit('s', 42), Stream.Emit('s', 42))).toBe(true)
    expect(Stream.equals(Stream.Emit('s', 42), Stream.Emit('s', 43))).toBe(
      false,
    )
  })

  it('handles Result with error/value fields', () => {
    expect(Result.equals(Result.Success(1), Result.Failure('e'))).toBe(false)
    expect(Result.equals(Result.Failure('e'), Result.Failure('e'))).toBe(true)
  })
})

// ===========================================================================
// parse
// ===========================================================================

describe('parse', () => {
  it('returns the value when discriminant matches a known tag', () => {
    const x = Maybe.parse({ tag: 'Just', value: 42 })
    expect(x).toEqual({ tag: 'Just', value: 42 })
  })

  it('parses nullary members', () => {
    expect(Maybe.parse({ tag: 'Nothing' })).toEqual({ tag: 'Nothing' })
  })

  it('returns undefined for unknown tags', () => {
    expect(Maybe.parse({ tag: 'Bogus' })).toBeUndefined()
  })

  it('returns undefined for missing discriminant', () => {
    expect(Maybe.parse({ value: 42 })).toBeUndefined()
  })

  it('returns undefined for non-objects', () => {
    expect(Maybe.parse(null)).toBeUndefined()
    expect(Maybe.parse(undefined)).toBeUndefined()
    expect(Maybe.parse(42)).toBeUndefined()
  })

  it('uses the custom discriminant key', () => {
    expect(CounterAction.parse({ type: 'Increment', amount: 1 })).toEqual({
      type: 'Increment',
      amount: 1,
    })
    expect(CounterAction.parse({ tag: 'Increment', amount: 1 })).toBeUndefined()
  })

  it('is shallow — does not validate field shapes', () => {
    const result = Maybe.parse({ tag: 'Just' /* missing value */ })
    expect(result).toEqual({ tag: 'Just' })
  })

  it('returns undefined for arrays', () => {
    expect(Maybe.parse([])).toBeUndefined()
    expect(Maybe.parse(['Just', 42])).toBeUndefined()
  })

  it('rejects inherited discriminant (prototype pollution guard)', () => {
    const malicious = Object.create({ tag: 'Just', value: 42 })
    expect(Maybe.parse(malicious)).toBeUndefined()
  })

  it('rejects non-string discriminant values', () => {
    expect(Maybe.parse({ tag: 42 })).toBeUndefined()
    expect(Maybe.parse({ tag: true })).toBeUndefined()
  })

  it('accepts Object.create(null) with own discriminant', () => {
    const bare = Object.create(null)
    bare.tag = 'Just'
    expect(Maybe.parse(bare)).toBe(bare)
  })
})

// ===========================================================================
// Property-based: dogfood the library's own fast-check integration
// ===========================================================================

describe('property tests (positional)', () => {
  const arbStream = mkArbitrary<Stream<string, number>>({
    Emit: { state: fc.string(), value: fc.integer() },
    End: {},
  })

  it('equals is reflexive', () => {
    fc.assert(fc.property(arbStream, s => Stream.equals(s, s)))
  })

  it('equals is symmetric on JSON clones', () => {
    fc.assert(
      fc.property(arbStream, s => {
        const clone = JSON.parse(JSON.stringify(s)) as typeof s
        return Stream.equals(s, clone) === Stream.equals(clone, s)
      }),
    )
  })

  it('parse accepts every generated value', () => {
    fc.assert(fc.property(arbStream, s => Stream.parse(s) !== undefined))
  })

  it('show produces a string starting with a known tag', () => {
    fc.assert(
      fc.property(arbStream, s => {
        const str = Stream.show(s)
        return Stream.tags.some(tag => str === tag || str.startsWith(`${tag}(`))
      }),
    )
  })

  it('every generated value passes memberOfUnion guard', () => {
    fc.assert(fc.property(arbStream, s => Stream.is.memberOfUnion(s)))
  })
})
