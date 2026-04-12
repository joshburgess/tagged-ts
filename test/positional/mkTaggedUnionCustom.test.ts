import { describe, expect, it } from 'vitest'
import type {
  MkData,
  TaggedLambda0,
  TaggedLambda1,
  TaggedLambda4,
} from '../../src/positional'
import { mkTaggedUnionCustom } from '../../src/positional'

// ===========================================================================
// Setup: Perhaps<A> (arity 1, custom discriminant '__Kind')
// ===========================================================================

type Nope = { readonly __Kind: 'Nope' }
type Yup<A> = { readonly __Kind: 'Yup'; readonly value: A }
type Perhaps<A> = Yup<A> | Nope

interface PerhapsLambda extends TaggedLambda1 {
  readonly type: Perhaps<this['A']>
  readonly data: MkData<this['type'], '__Kind'>
}

const Perhaps = mkTaggedUnionCustom<PerhapsLambda>()('__Kind', {
  Yup: ['value'],
  Nope: [],
})

// ===========================================================================
// Setup: GetResourcesForOrgActions<A> (arity 1, discriminant 'type')
// ===========================================================================

type GET_USERS<A> = {
  readonly type: 'GET_USERS'
  readonly meta: { readonly orgId: A }
}
type GET_EVENTS<A> = {
  readonly type: 'GET_EVENTS'
  readonly meta: { readonly orgId: A }
}
type GetResourcesForOrgActions<A> = GET_EVENTS<A> | GET_USERS<A>

interface GetResourcesForOrgActionsLambda extends TaggedLambda1 {
  readonly type: GetResourcesForOrgActions<this['A']>
  readonly data: MkData<this['type'], 'type'>
}

const GetResourcesForOrgActions =
  mkTaggedUnionCustom<GetResourcesForOrgActionsLambda>()('type', {
    GET_EVENTS: ['meta'],
    GET_USERS: ['meta'],
  })

// ===========================================================================
// Setup: Trio<A> (arity 1, custom discriminant 'kind')
// ===========================================================================

type First<A> = { readonly kind: 'First'; readonly value: A }
type Second<A> = { readonly kind: 'Second'; readonly value: A }
type Third<A> = { readonly kind: 'Third' }
type Trio<A> = First<A> | Second<A> | Third<A>

interface TrioLambda extends TaggedLambda1 {
  readonly type: Trio<this['A']>
  readonly data: MkData<this['type'], 'kind'>
}

const Trio = mkTaggedUnionCustom<TrioLambda>()('kind', {
  First: ['value'],
  Second: ['value'],
  Third: [],
})

// ===========================================================================
// Setup: CounterAction (arity 0, discriminant 'type')
// ===========================================================================

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
// Setup: Stream<S, R, E, A> (arity 4, discriminant 'kind')
// ===========================================================================

type Emit<S, A> = {
  readonly kind: 'Emit'
  readonly state: S
  readonly value: A
}
type Fail<E> = { readonly kind: 'Fail'; readonly error: E }
type Done = { readonly kind: 'Done' }
type Acquire<R> = { readonly kind: 'Acquire'; readonly resource: R }
type Stream<S, R, E, A> = Emit<S, A> | Fail<E> | Done | Acquire<R>

interface StreamLambda extends TaggedLambda4 {
  readonly type: Stream<this['S'], this['R'], this['E'], this['A']>
  readonly data: MkData<this['type'], 'kind'>
}

const Stream = mkTaggedUnionCustom<StreamLambda>()('kind', {
  Emit: ['state', 'value'],
  Fail: ['error'],
  Done: [],
  Acquire: ['resource'],
})

// ===========================================================================
// Perhaps<A> (custom discriminant '__Kind')
// ===========================================================================

describe('Perhaps<A> (custom discriminant __Kind)', () => {
  it('generates the correct API shape', () => {
    expect(typeof Perhaps.Yup).toBe('function')
    expect(typeof Perhaps.Nope).toBe('object')
    expect(typeof Perhaps.is.Yup).toBe('function')
    expect(typeof Perhaps.is.Nope).toBe('function')
    expect(typeof Perhaps.is.memberOfUnion).toBe('function')
    expect(typeof Perhaps.match).toBe('function')
  })

  it('nullary constructor is a constant (reference identity)', () => {
    expect(Perhaps.Nope).toBe(Perhaps.Nope)
  })

  describe('constructors', () => {
    it('builds Yup with positional value', () => {
      expect(Perhaps.Yup(42)).toEqual({ __Kind: 'Yup', value: 42 })
    })

    it('Nope is a plain object', () => {
      expect(Perhaps.Nope).toEqual({ __Kind: 'Nope' })
    })
  })

  describe('guards', () => {
    const yup = Perhaps.Yup(0)
    const nope: Perhaps<number> = Perhaps.Nope

    it('correctly identifies members', () => {
      expect(Perhaps.is.Yup(yup)).toBe(true)
      expect(Perhaps.is.Yup(nope)).toBe(false)
      expect(Perhaps.is.Nope(nope)).toBe(true)
      expect(Perhaps.is.Nope(yup)).toBe(false)
    })

    it('memberOfUnion uses the custom discriminant key', () => {
      expect(Perhaps.is.memberOfUnion(yup)).toBe(true)
      expect(Perhaps.is.memberOfUnion(nope)).toBe(true)
      expect(Perhaps.is.memberOfUnion({ __Kind: 'unknown' })).toBe(false)
      expect(Perhaps.is.memberOfUnion({ tag: 'Yup' })).toBe(false)
    })
  })

  describe('match', () => {
    it('dispatches using the custom discriminant', () => {
      const yup = Perhaps.Yup(99)
      const nope: Perhaps<number> = Perhaps.Nope

      expect(Perhaps.match(yup, { Yup: x => x.value, Nope: _x => 0 })).toBe(99)
      expect(Perhaps.match(nope, { Yup: x => x.value, Nope: _x => 0 })).toBe(0)
    })

    it('identity handlers return the original value', () => {
      const yup = Perhaps.Yup(42)
      expect(
        Perhaps.match(yup, {
          Yup: x => x as Perhaps<number>,
          Nope: x => x as Perhaps<number>,
        }),
      ).toEqual(yup)
    })
  })
})

// ===========================================================================
// Redux-style actions (discriminant 'type')
// ===========================================================================

describe('Redux-style actions (discriminant type)', () => {
  it('generates the correct API shape', () => {
    expect(typeof GetResourcesForOrgActions.GET_EVENTS).toBe('function')
    expect(typeof GetResourcesForOrgActions.GET_USERS).toBe('function')
    expect(typeof GetResourcesForOrgActions.is.memberOfUnion).toBe('function')
  })

  describe('constructors', () => {
    it('injects the type discriminant with positional args', () => {
      expect(
        GetResourcesForOrgActions.GET_EVENTS({ orgId: 'testOrg' }),
      ).toEqual({ type: 'GET_EVENTS', meta: { orgId: 'testOrg' } })

      expect(GetResourcesForOrgActions.GET_USERS({ orgId: 'testOrg' })).toEqual(
        { type: 'GET_USERS', meta: { orgId: 'testOrg' } },
      )
    })
  })

  describe('guards', () => {
    const events = GetResourcesForOrgActions.GET_EVENTS({
      orgId: 'org1',
    })
    const users = GetResourcesForOrgActions.GET_USERS({
      orgId: 'org1',
    })

    it('correctly identifies members by type discriminant', () => {
      expect(GetResourcesForOrgActions.is.GET_EVENTS(events)).toBe(true)
      expect(GetResourcesForOrgActions.is.GET_EVENTS(users)).toBe(false)
      expect(GetResourcesForOrgActions.is.GET_USERS(users)).toBe(true)
    })

    it('memberOfUnion uses type discriminant', () => {
      expect(GetResourcesForOrgActions.is.memberOfUnion(events)).toBe(true)
      expect(GetResourcesForOrgActions.is.memberOfUnion(users)).toBe(true)
      expect(
        GetResourcesForOrgActions.is.memberOfUnion({ type: 'unknown' }),
      ).toBe(false)
      // Wrong discriminant key
      expect(
        GetResourcesForOrgActions.is.memberOfUnion({ tag: 'GET_EVENTS' }),
      ).toBe(false)
    })
  })

  describe('match', () => {
    it('dispatches by type discriminant', () => {
      const events = GetResourcesForOrgActions.GET_EVENTS({
        orgId: 'testOrg',
      })

      expect(
        GetResourcesForOrgActions.match(events, {
          GET_EVENTS: x => x.meta.orgId + ' events',
          GET_USERS: x => x.meta.orgId + ' users',
        }),
      ).toBe('testOrg events')
    })
  })
})

// ===========================================================================
// Trio<A> (custom discriminant 'kind', mixed nullary/non-nullary)
// ===========================================================================

describe('Trio<A> (custom discriminant kind)', () => {
  it('generates mixed constant/function constructors', () => {
    expect(typeof Trio.First).toBe('function')
    expect(typeof Trio.Second).toBe('function')
    expect(typeof Trio.Third).toBe('object')
  })

  it('nullary Third is a constant (reference identity)', () => {
    expect(Trio.Third).toBe(Trio.Third)
  })

  describe('constructors', () => {
    it('builds members with positional args and kind discriminant', () => {
      expect(Trio.First(1)).toEqual({ kind: 'First', value: 1 })
      expect(Trio.Second(2)).toEqual({ kind: 'Second', value: 2 })
      expect(Trio.Third).toEqual({ kind: 'Third' })
    })
  })

  describe('guards', () => {
    it('uses the kind discriminant for checking', () => {
      const f = Trio.First(1)
      const t: Trio<number> = Trio.Third

      expect(Trio.is.First(f)).toBe(true)
      expect(Trio.is.Third(t)).toBe(true)
      expect(Trio.is.First(t)).toBe(false)
      expect(Trio.is.memberOfUnion(f)).toBe(true)
      expect(Trio.is.memberOfUnion({ kind: 'Unknown' })).toBe(false)
    })
  })

  describe('match', () => {
    it('dispatches by kind discriminant', () => {
      const f = Trio.First(42)
      expect(
        Trio.match(f, {
          First: x => x.value,
          Second: x => x.value,
          Third: _x => 0,
        }),
      ).toBe(42)
    })
  })
})

// ===========================================================================
// CounterAction (arity 0, discriminant 'type', mixed)
// ===========================================================================

describe('CounterAction (arity 0, discriminant type, mixed)', () => {
  it('Increment is a function, Reset is a constant', () => {
    expect(typeof CounterAction.Increment).toBe('function')
    expect(typeof CounterAction.Reset).toBe('object')
  })

  it('Reset constant has reference identity', () => {
    expect(CounterAction.Reset).toBe(CounterAction.Reset)
  })

  describe('constructors', () => {
    it('builds members correctly with positional args', () => {
      expect(CounterAction.Increment(5)).toEqual({
        type: 'Increment',
        amount: 5,
      })
      expect(CounterAction.Reset).toEqual({ type: 'Reset' })
    })
  })

  describe('guards and match', () => {
    it('guards work with arity-0 types', () => {
      const inc = CounterAction.Increment(1)
      expect(CounterAction.is.Increment(inc)).toBe(true)
      expect(CounterAction.is.Reset(CounterAction.Reset)).toBe(true)
      expect(CounterAction.is.memberOfUnion(inc)).toBe(true)
      expect(CounterAction.is.memberOfUnion(CounterAction.Reset)).toBe(true)
    })

    it('match works with arity-0 types', () => {
      const inc = CounterAction.Increment(7)
      expect(
        CounterAction.match(inc, {
          Increment: x => x.amount,
          Reset: _x => 0,
        }),
      ).toBe(7)
    })
  })
})

// ===========================================================================
// Stream<S, R, E, A> (arity 4, custom discriminant 'kind')
// ===========================================================================

describe('Stream<S, R, E, A> (arity 4, custom discriminant kind)', () => {
  it('generates the correct API shape', () => {
    expect(typeof Stream.Emit).toBe('function')
    expect(typeof Stream.Fail).toBe('function')
    expect(typeof Stream.Done).toBe('object')
    expect(typeof Stream.Acquire).toBe('function')
    expect(typeof Stream.match).toBe('function')
  })

  it('Done constant has reference identity', () => {
    expect(Stream.Done).toBe(Stream.Done)
  })

  describe('constructors', () => {
    it('builds arity-4 members with positional args', () => {
      expect(Stream.Emit('s', 42)).toEqual({
        kind: 'Emit',
        state: 's',
        value: 42,
      })
      expect(Stream.Fail(true)).toEqual({
        kind: 'Fail',
        error: true,
      })
      expect(Stream.Done).toEqual({ kind: 'Done' })
      expect(Stream.Acquire(1)).toEqual({
        kind: 'Acquire',
        resource: 1,
      })
    })
  })

  describe('guards', () => {
    it('correctly identifies arity-4 members', () => {
      const emit = Stream.Emit('s', 42)
      const done: Stream<string, number, boolean, number> = Stream.Done

      expect(Stream.is.Emit(emit)).toBe(true)
      expect(Stream.is.Done(done)).toBe(true)
      expect(Stream.is.Emit(done)).toBe(false)
      expect(Stream.is.memberOfUnion(emit)).toBe(true)
      expect(Stream.is.memberOfUnion(done)).toBe(true)
      expect(Stream.is.memberOfUnion({ kind: 'Unknown' })).toBe(false)
    })
  })

  describe('match', () => {
    it('dispatches arity-4 members correctly', () => {
      const emit = Stream.Emit('s', 42)
      expect(
        Stream.match(emit, {
          Emit: x => `${x.state}:${x.value}`,
          Fail: x => String(x.error),
          Done: _x => 'done',
          Acquire: x => String(x.resource),
        }),
      ).toBe('s:42')
    })
  })
})

// ===========================================================================
// matchW with custom discriminants
// ===========================================================================

describe('matchW with custom discriminants', () => {
  it('allows different return types with custom discriminant', () => {
    const yup = Perhaps.Yup(42)
    const nope: Perhaps<number> = Perhaps.Nope

    expect(Perhaps.matchW(yup, { Yup: x => x.value, Nope: _x => 'nope' })).toBe(
      42,
    )
    expect(
      Perhaps.matchW(nope, { Yup: x => x.value, Nope: _x => 'nope' }),
    ).toBe('nope')
  })

  it('works with arity-4 custom discriminant', () => {
    const emit = Stream.Emit('s', 42)
    expect(
      Stream.matchW(emit, {
        Emit: x => x.value,
        Fail: x => String(x.error),
        Done: _x => null,
        Acquire: x => x.resource,
      }),
    ).toBe(42)
  })
})

// ===========================================================================
// matchOr with custom discriminants
// ===========================================================================

describe('matchOr with custom discriminants', () => {
  it('partial match with custom discriminant', () => {
    const yup = Perhaps.Yup(42)
    const nope: Perhaps<number> = Perhaps.Nope

    expect(Perhaps.matchOr(yup, { Yup: x => x.value }, _otherwise => -1)).toBe(
      42,
    )
    expect(Perhaps.matchOr(nope, { Yup: x => x.value }, _otherwise => -1)).toBe(
      -1,
    )
  })

  it('partial match with arity-4', () => {
    const done: Stream<string, number, boolean, number> = Stream.Done
    expect(Stream.matchOr(done, { Emit: x => x.value }, _otherwise => -1)).toBe(
      -1,
    )
  })
})

// ===========================================================================
// matcher / matcherW with custom discriminants
// ===========================================================================

describe('matcher / matcherW with custom discriminants', () => {
  it('matcher returns a reusable function', () => {
    type PerhapsNum = Perhaps<number>
    const f = Perhaps.matcher({
      Yup: (x: Yup<unknown>) => x.value,
      Nope: (_x: Nope) => 0,
    })
    expect(f(Perhaps.Yup(99))).toBe(99)
    expect(f(Perhaps.Nope as PerhapsNum)).toBe(0)
  })

  it('matcherW allows different return types', () => {
    type PerhapsNum = Perhaps<number>
    const f = Perhaps.matcherW({
      Yup: (x: Yup<unknown>) => x.value,
      Nope: (_x: Nope) => 'nope' as const,
    })
    expect(f(Perhaps.Yup(99))).toBe(99)
    expect(f(Perhaps.Nope as PerhapsNum)).toBe('nope')
  })
})
