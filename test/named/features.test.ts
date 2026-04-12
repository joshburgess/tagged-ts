import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { mkArbitrary } from '../../src/fast-check'
import type {
  MkData,
  TaggedLambda0,
  TaggedLambda1,
  TaggedLambda2,
} from '../../src/named'
import { mkTaggedUnion, mkTaggedUnionCustom } from '../../src/named'

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

const Maybe = mkTaggedUnion<MaybeLambda>({ Just: true, Nothing: false })

type Failure<E> = { readonly tag: 'Failure'; readonly error: E }
type Success<A> = { readonly tag: 'Success'; readonly value: A }
type Result<E, A> = Success<A> | Failure<E>

interface ResultLambda extends TaggedLambda2 {
  readonly type: Result<this['E'], this['A']>
  readonly data: MkData<this['type']>
}

const Result = mkTaggedUnion<ResultLambda>({ Success: true, Failure: true })

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

// ===========================================================================
// tags
// ===========================================================================

describe('tags', () => {
  it('returns all member tag strings', () => {
    expect(Maybe.tags).toEqual(['Just', 'Nothing'])
    expect(Result.tags).toEqual(['Success', 'Failure'])
    expect(CounterAction.tags).toEqual(['Increment', 'Reset'])
  })

  it('is frozen (readonly)', () => {
    expect(Object.isFrozen(Maybe.tags)).toBe(true)
  })

  it('preserves spec order', () => {
    const Ordered = mkTaggedUnion<MaybeLambda>({ Nothing: false, Just: true })
    expect(Ordered.tags).toEqual(['Nothing', 'Just'])
  })

  it('actually refuses mutation (not just Object.isFrozen)', () => {
    expect(() => {
      // biome-ignore lint/suspicious/noExplicitAny: exercising runtime freeze
      ;(Maybe.tags as any).push('Bogus')
    }).toThrow(TypeError)
  })

  it('returns the same reference each access (stable identity)', () => {
    expect(Maybe.tags).toBe(Maybe.tags)
  })
})

// ===========================================================================
// show
// ===========================================================================

describe('show (named)', () => {
  it('formats nullary members as just the tag', () => {
    expect(Maybe.show(Maybe.Nothing)).toBe('Nothing')
    expect(CounterAction.show(CounterAction.Reset)).toBe('Reset')
  })

  it('formats non-nullary members with named fields', () => {
    expect(Maybe.show(Maybe.Just({ value: 42 }))).toBe('Just({ value: 42 })')
    expect(Maybe.show(Maybe.Just({ value: 'hi' }))).toBe(
      'Just({ value: "hi" })',
    )
  })

  it('formats multiple fields', () => {
    expect(Result.show(Result.Failure({ error: 'boom' }))).toBe(
      'Failure({ error: "boom" })',
    )
  })

  it('formats nested plain objects recursively', () => {
    expect(Maybe.show(Maybe.Just({ value: { a: 1, b: [2, 3] } }))).toBe(
      'Just({ value: { a: 1, b: [2, 3] } })',
    )
  })

  it('handles custom discriminant key', () => {
    expect(CounterAction.show(CounterAction.Increment({ amount: 3 }))).toBe(
      'Increment({ amount: 3 })',
    )
  })

  it('renders undefined field values', () => {
    // Runtime edge: user passes explicit undefined
    expect(
      Maybe.show(Maybe.Just({ value: undefined as unknown as number })),
    ).toBe('Just({ value: undefined })')
  })

  it('renders booleans and null', () => {
    expect(Maybe.show(Maybe.Just({ value: true as unknown as number }))).toBe(
      'Just({ value: true })',
    )
    expect(Maybe.show(Maybe.Just({ value: null as unknown as number }))).toBe(
      'Just({ value: null })',
    )
  })

  it('renders arrays with spaces', () => {
    expect(
      Maybe.show(Maybe.Just({ value: [1, 2, 3] as unknown as number })),
    ).toBe('Just({ value: [1, 2, 3] })')
  })

  it('JSON-escapes strings with quotes and backslashes', () => {
    expect(
      Maybe.show(Maybe.Just({ value: 'say "hi"' as unknown as number })),
    ).toBe('Just({ value: "say \\"hi\\"" })')
  })

  it('recursively renders nested members of the same union', () => {
    expect(
      Maybe.show(
        Maybe.Just({
          value: Maybe.Just({ value: 1 }) as unknown as number,
        }),
      ),
    ).toBe('Just({ value: Just({ value: 1 }) })')
  })

  it('renders a tagged union from a different shape as a plain object', () => {
    // CounterAction uses discriminant 'type' — not recognized as a Maybe
    // member, so it renders via the generic object formatter.
    expect(
      Maybe.show(
        Maybe.Just({
          value: CounterAction.Reset as unknown as number,
        }),
      ),
    ).toBe('Just({ value: { type: "Reset" } })')
  })

  it('renders bigint, symbol, function, -0', () => {
    expect(Maybe.show(Maybe.Just({ value: 42n as unknown as number }))).toBe(
      'Just({ value: 42n })',
    )
    expect(
      Maybe.show(Maybe.Just({ value: Symbol('x') as unknown as number })),
    ).toBe('Just({ value: Symbol(x) })')
    expect(
      Maybe.show(
        Maybe.Just({
          value: function foo() {} as unknown as number,
        }),
      ),
    ).toBe('Just({ value: [Function: foo] })')
    expect(Maybe.show(Maybe.Just({ value: -0 as unknown as number }))).toBe(
      'Just({ value: -0 })',
    )
  })

  it('renders Date, RegExp, Error', () => {
    expect(
      Maybe.show(
        Maybe.Just({
          value: new Date('2024-01-01T00:00:00.000Z') as unknown as number,
        }),
      ),
    ).toBe('Just({ value: Date("2024-01-01T00:00:00.000Z") })')

    expect(
      Maybe.show(Maybe.Just({ value: /foo/gi as unknown as number })),
    ).toBe('Just({ value: /foo/gi })')

    expect(
      Maybe.show(
        Maybe.Just({ value: new TypeError('boom') as unknown as number }),
      ),
    ).toBe('Just({ value: TypeError("boom") })')
  })

  it('renders Map and Set', () => {
    expect(
      Maybe.show(
        Maybe.Just({
          value: new Map([
            ['k', 1],
            ['j', 2],
          ]) as unknown as number,
        }),
      ),
    ).toBe('Just({ value: Map("k" => 1, "j" => 2) })')
    expect(
      Maybe.show(
        Maybe.Just({ value: new Set([1, 2, 3]) as unknown as number }),
      ),
    ).toBe('Just({ value: Set(1, 2, 3) })')
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
    expect(
      Maybe.show(Maybe.Just({ value: new Point(1, 2) as unknown as number })),
    ).toBe('Just({ value: Point { x: 1, y: 2 } })')
  })

  it('marks cyclic references with [Circular]', () => {
    const cyclic: { self?: unknown } = {}
    cyclic.self = cyclic
    expect(Maybe.show(Maybe.Just({ value: cyclic as unknown as number }))).toBe(
      'Just({ value: { self: [Circular] } })',
    )
  })

  it('renders empty plain object and empty array', () => {
    expect(Maybe.show(Maybe.Just({ value: {} as unknown as number }))).toBe(
      'Just({ value: {} })',
    )
    expect(Maybe.show(Maybe.Just({ value: [] as unknown as number }))).toBe(
      'Just({ value: [] })',
    )
  })

  it('renders shared references (DAG) without false [Circular]', () => {
    // Two fields point to the same object — not a cycle, both should
    // render in full.
    const shared = { n: 1 }
    expect(
      Maybe.show(
        Maybe.Just({
          value: { a: shared, b: shared } as unknown as number,
        }),
      ),
    ).toBe('Just({ value: { a: { n: 1 }, b: { n: 1 } } })')
  })

  it('recursively pretty-prints a recursive tagged union (JsonValue)', () => {
    type JNull = { readonly tag: 'JNull' }
    type JBool = { readonly tag: 'JBool'; readonly value: boolean }
    type JNum = { readonly tag: 'JNum'; readonly value: number }
    type JArr = { readonly tag: 'JArr'; readonly items: readonly JsonValue[] }
    type JObj = {
      readonly tag: 'JObj'
      readonly entries: ReadonlyArray<{
        readonly key: string
        readonly value: JsonValue
      }>
    }
    type JsonValue = JNull | JBool | JNum | JArr | JObj
    interface JsonLambda extends TaggedLambda0 {
      readonly type: JsonValue
      readonly data: MkData<this['type']>
    }
    const J = mkTaggedUnion<JsonLambda>({
      JNull: false,
      JBool: true,
      JNum: true,
      JArr: true,
      JObj: true,
    })
    const v: JsonValue = J.JObj({
      entries: [
        { key: 'n', value: J.JNum({ value: 1 }) },
        { key: 'ok', value: J.JBool({ value: true }) },
        {
          key: 'list',
          value: J.JArr({ items: [J.JNum({ value: 2 }), J.JNull] }),
        },
      ],
    })
    expect(J.show(v)).toBe(
      'JObj({ entries: [' +
        '{ key: "n", value: JNum({ value: 1 }) }, ' +
        '{ key: "ok", value: JBool({ value: true }) }, ' +
        '{ key: "list", value: JArr({ items: [JNum({ value: 2 }), JNull] }) }' +
        '] })',
    )
  })

  it('does not flag repeated nullary singletons as [Circular]', () => {
    // Reusing Maybe.Nothing (a nullary singleton) in multiple positions
    // of a plain-object container must not trip cycle detection.
    const n = Maybe.Nothing
    expect(
      Maybe.show(Maybe.Just({ value: { a: n, b: n } as unknown as number })),
    ).toBe('Just({ value: { a: Nothing, b: Nothing } })')
  })
})

// ===========================================================================
// equals
// ===========================================================================

describe('equals', () => {
  it('returns true for structurally identical members', () => {
    expect(
      Maybe.equals(Maybe.Just({ value: 42 }), Maybe.Just({ value: 42 })),
    ).toBe(true)
    expect(Maybe.equals(Maybe.Nothing, Maybe.Nothing)).toBe(true)
  })

  it('returns false for different discriminants', () => {
    expect(Maybe.equals(Maybe.Just({ value: 42 }), Maybe.Nothing)).toBe(false)
  })

  it('returns false for different field values', () => {
    expect(
      Maybe.equals(Maybe.Just({ value: 42 }), Maybe.Just({ value: 43 })),
    ).toBe(false)
  })

  it('compares nested objects structurally', () => {
    const a = Maybe.Just({ value: { a: 1, b: [1, 2, 3] } })
    const b = Maybe.Just({ value: { a: 1, b: [1, 2, 3] } })
    expect(Maybe.equals(a, b)).toBe(true)
  })

  it('detects nested array differences', () => {
    const a = Maybe.Just({ value: [1, 2, 3] as unknown as number })
    const b = Maybe.Just({ value: [1, 2, 4] as unknown as number })
    expect(Maybe.equals(a, b)).toBe(false)
  })

  it('handles NaN via Object.is', () => {
    expect(
      Maybe.equals(Maybe.Just({ value: NaN }), Maybe.Just({ value: NaN })),
    ).toBe(true)
  })

  it('handles mixed nullary and non-nullary', () => {
    expect(
      CounterAction.equals(
        CounterAction.Increment({ amount: 3 }),
        CounterAction.Increment({ amount: 3 }),
      ),
    ).toBe(true)
    expect(
      CounterAction.equals(
        CounterAction.Increment({ amount: 3 }),
        CounterAction.Reset,
      ),
    ).toBe(false)
  })

  it('distinguishes cross-type primitives (1 vs "1")', () => {
    expect(
      Maybe.equals(
        Maybe.Just({ value: 1 }),
        Maybe.Just({ value: '1' as unknown as number }),
      ),
    ).toBe(false)
  })

  it('distinguishes null from undefined', () => {
    expect(
      Maybe.equals(
        Maybe.Just({ value: null as unknown as number }),
        Maybe.Just({ value: undefined as unknown as number }),
      ),
    ).toBe(false)
  })

  it('distinguishes arrays of different lengths with matching prefix', () => {
    const a = Maybe.Just({ value: [1, 2] as unknown as number })
    const b = Maybe.Just({ value: [1, 2, 3] as unknown as number })
    expect(Maybe.equals(a, b)).toBe(false)
  })

  it('distinguishes same-size objects with different keys', () => {
    const a = Maybe.Just({ value: { a: 1 } as unknown as number })
    const b = Maybe.Just({ value: { b: 1 } as unknown as number })
    expect(Maybe.equals(a, b)).toBe(false)
  })

  it('treats arrays and plain objects with array-like keys as unequal', () => {
    const a = Maybe.Just({ value: [1, 2] as unknown as number })
    const b = Maybe.Just({
      value: { 0: 1, 1: 2, length: 2 } as unknown as number,
    })
    expect(Maybe.equals(a, b)).toBe(false)
  })

  it('falls back to reference equality for Date/Map/Set', () => {
    const d = new Date(0)
    expect(
      Maybe.equals(
        Maybe.Just({ value: d as unknown as number }),
        Maybe.Just({ value: d as unknown as number }),
      ),
    ).toBe(true)
    expect(
      Maybe.equals(
        Maybe.Just({ value: new Date(0) as unknown as number }),
        Maybe.Just({ value: new Date(0) as unknown as number }),
      ),
    ).toBe(false)

    const m = new Map([['k', 1]])
    expect(
      Maybe.equals(
        Maybe.Just({ value: m as unknown as number }),
        Maybe.Just({ value: m as unknown as number }),
      ),
    ).toBe(true)
    expect(
      Maybe.equals(
        Maybe.Just({ value: new Map([['k', 1]]) as unknown as number }),
        Maybe.Just({ value: new Map([['k', 1]]) as unknown as number }),
      ),
    ).toBe(false)
  })

  it('is symmetric', () => {
    const a = Maybe.Just({ value: { x: 1, y: [2, 3] } as unknown as number })
    const b = Maybe.Just({ value: { x: 1, y: [2, 3] } as unknown as number })
    expect(Maybe.equals(a, b)).toBe(Maybe.equals(b, a))
  })

  it('handles self-referential cyclic structures without stack overflow', () => {
    type Cyclic = { v: number; self?: Cyclic }
    const a: Cyclic = { v: 1 }
    a.self = a
    const b: Cyclic = { v: 1 }
    b.self = b
    expect(
      Maybe.equals(
        Maybe.Just({ value: a as unknown as number }),
        Maybe.Just({ value: b as unknown as number }),
      ),
    ).toBe(true)
  })

  it('detects field differences inside cyclic structures', () => {
    type Cyclic = { v: number; self?: Cyclic }
    const a: Cyclic = { v: 1 }
    a.self = a
    const b: Cyclic = { v: 2 }
    b.self = b
    expect(
      Maybe.equals(
        Maybe.Just({ value: a as unknown as number }),
        Maybe.Just({ value: b as unknown as number }),
      ),
    ).toBe(false)
  })

  it('returns false when one side has an extra own key beyond the spec', () => {
    // deepEquals compares by own keys on both sides; a stray key on one side
    // makes the key counts differ, so the values are unequal.
    const a = Maybe.Just({ value: 42 })
    const b = { ...a, bogus: 'extra' } as unknown as Maybe<number>
    expect(Maybe.equals(a, b)).toBe(false)
    expect(Maybe.equals(b, a)).toBe(false)
  })

  it('returns true when both sides share the same extra own key', () => {
    // Symmetric sanity check: two runtime values with matching stray keys
    // still compare equal. deepEquals is blind to the spec — it walks own keys.
    const a = {
      ...Maybe.Just({ value: 42 }),
      extra: 'x',
    } as unknown as Maybe<number>
    const b = {
      ...Maybe.Just({ value: 42 }),
      extra: 'x',
    } as unknown as Maybe<number>
    expect(Maybe.equals(a, b)).toBe(true)
  })

  it('handles deeply nested non-cyclic structures without stack overflow', () => {
    // Build a 1000-level linked list. deepEquals is recursive, so this
    // exercises the recursion depth in a realistic direction.
    type Node = { v: number; next: Node | null }
    const build = (n: number): Node => {
      let node: Node = { v: 0, next: null }
      for (let i = 1; i < n; i++) node = { v: i, next: node }
      return node
    }
    const a = build(1000)
    const b = build(1000)
    expect(
      Maybe.equals(
        Maybe.Just({ value: a as unknown as number }),
        Maybe.Just({ value: b as unknown as number }),
      ),
    ).toBe(true)
    // And detect a difference deep in the chain.
    const c = build(1000)
    let tail: Node | null = c
    while (tail?.next) tail = tail.next
    // mutate the deepest node
    if (tail) tail.v = 999
    expect(
      Maybe.equals(
        Maybe.Just({ value: a as unknown as number }),
        Maybe.Just({ value: c as unknown as number }),
      ),
    ).toBe(false)
  })

  it('handles mutually-referential cycles', () => {
    type Node = { v: number; next?: Node }
    const a1: Node = { v: 1 }
    const a2: Node = { v: 2 }
    a1.next = a2
    a2.next = a1
    const b1: Node = { v: 1 }
    const b2: Node = { v: 2 }
    b1.next = b2
    b2.next = b1
    expect(
      Maybe.equals(
        Maybe.Just({ value: a1 as unknown as number }),
        Maybe.Just({ value: b1 as unknown as number }),
      ),
    ).toBe(true)
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
    expect(Maybe.parse('Just')).toBeUndefined()
  })

  it('uses the custom discriminant key', () => {
    expect(CounterAction.parse({ type: 'Increment', amount: 1 })).toEqual({
      type: 'Increment',
      amount: 1,
    })
    expect(CounterAction.parse({ tag: 'Increment', amount: 1 })).toBeUndefined()
  })

  it('is shallow — does not validate field shapes', () => {
    // Documented limitation: only the tag is checked
    const result = Maybe.parse({ tag: 'Just' /* missing value */ })
    expect(result).toEqual({ tag: 'Just' })
  })

  it('returns undefined for arrays', () => {
    expect(Maybe.parse([])).toBeUndefined()
    expect(Maybe.parse(['Just', 42])).toBeUndefined()
  })

  it('returns undefined for non-string discriminant values', () => {
    expect(Maybe.parse({ tag: 42 })).toBeUndefined()
    expect(Maybe.parse({ tag: null })).toBeUndefined()
    expect(Maybe.parse({ tag: { nested: 'Just' } })).toBeUndefined()
  })

  it('rejects prototype-pollution: inherited tag must not count', () => {
    // Object with `tag` on prototype only — should NOT pass parse
    const malicious = Object.create({ tag: 'Just', value: 42 })
    expect(Maybe.parse(malicious)).toBeUndefined()
  })

  it('accepts Object.create(null) with own discriminant key', () => {
    const bare = Object.create(null)
    bare.tag = 'Just'
    bare.value = 42
    expect(Maybe.parse(bare)).toBe(bare)
  })

  it('round-trips: parse(constructed) returns the same reference', () => {
    const m = Maybe.Just({ value: 42 })
    expect(Maybe.parse(m)).toBe(m)
  })

  it('round-trips through JSON', () => {
    const m = Maybe.Just({ value: 42 })
    const roundTripped = Maybe.parse(JSON.parse(JSON.stringify(m)))
    expect(roundTripped).toEqual(m)
    expect(Maybe.equals(roundTripped as typeof m, m)).toBe(true)
  })
})

// ===========================================================================
// Property-based: dogfood the library's own fast-check integration
// ===========================================================================

describe('property tests (named)', () => {
  const arbMaybe = mkArbitrary<Maybe<number>>({
    Just: { value: fc.integer() },
    Nothing: {},
  })

  it('equals is reflexive for all generated values', () => {
    fc.assert(fc.property(arbMaybe, m => Maybe.equals(m, m)))
  })

  it('equals is symmetric for independently-generated equal values', () => {
    fc.assert(
      fc.property(arbMaybe, m => {
        // Clone via JSON to get a structurally equal but distinct value
        const clone = JSON.parse(JSON.stringify(m)) as typeof m
        return Maybe.equals(m, clone) === Maybe.equals(clone, m)
      }),
    )
  })

  it('parse accepts every generated value', () => {
    fc.assert(fc.property(arbMaybe, m => Maybe.parse(m) !== undefined))
  })

  it('show produces a non-empty string for every generated value', () => {
    fc.assert(
      fc.property(
        arbMaybe,
        m => typeof Maybe.show(m) === 'string' && Maybe.show(m).length > 0,
      ),
    )
  })

  it('show starts with a known tag', () => {
    fc.assert(
      fc.property(arbMaybe, m => {
        const s = Maybe.show(m)
        return Maybe.tags.some(tag => s === tag || s.startsWith(`${tag}(`))
      }),
    )
  })

  it('every generated value passes memberOfUnion guard', () => {
    fc.assert(fc.property(arbMaybe, m => Maybe.is.memberOfUnion(m)))
  })
})
