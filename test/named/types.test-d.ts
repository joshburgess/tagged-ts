/**
 * Type-level tests for tagged-ts (named/object-style constructors).
 *
 * Run via `vitest typecheck` — this file is loaded by vitest's typecheck
 * mode (see `vitest.config.ts`) and also picked up by `tsc --noEmit` via
 * `tsconfig.json`'s `include: ["src", "test"]` setting. It is never
 * executed at runtime; `expectTypeOf` is a purely type-level assertion.
 *
 * Verifies compile-time behavior:
 * - Correct usage compiles without errors
 * - Invalid usage is rejected via @ts-expect-error
 * - Types narrow properly through guards and match
 * - MkData auto-generates correct data maps
 * - Arity detection (IsLambda0-4) works correctly
 * - MemberSpec constrains the boolean map correctly
 * - v0.6 surface: tags, show, equals, parse
 */

import { describe, expectTypeOf, test } from 'vitest'
import type {
  IsLambda0,
  IsLambda1,
  IsLambda2,
  IsLambda3,
  IsLambda4,
} from '../../src/Lambda'
import type {
  Constructors,
  Equals,
  Guards,
  Match,
  Matcher,
  MatcherW,
  MatchOr,
  MatchW,
  MemberSpec,
  MkData,
  Parse,
  Show,
  TaggedLambda0,
  TaggedLambda1,
  TaggedLambda2,
  TaggedLambda3,
  TaggedLambda4,
  TaggedUnion,
  Tags,
} from '../../src/named'
import { mkTaggedUnion, mkTaggedUnionCustom } from '../../src/named'

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
// Setup: Env<R, E, A> (arity 3, discriminant 'tag')
// ---------------------------------------------------------------------------

type Ask<R> = { readonly tag: 'Ask'; readonly resource: R }
type Pure<A> = { readonly tag: 'Pure'; readonly value: A }
type Raise<E> = { readonly tag: 'Raise'; readonly error: E }
type Halt = { readonly tag: 'Halt' }
type Env<R, E, A> = Ask<R> | Pure<A> | Raise<E> | Halt

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

// ---------------------------------------------------------------------------
// Setup: Stream<S, R, E, A> (arity 4, discriminant 'tag')
// ---------------------------------------------------------------------------

type Emit<S, A> = { readonly tag: 'Emit'; readonly state: S; readonly value: A }
type Fail<E> = { readonly tag: 'Fail'; readonly error: E }
type Done = { readonly tag: 'Done' }
type Acquire<R> = { readonly tag: 'Acquire'; readonly resource: R }
type Stream<S, R, E, A> = Emit<S, A> | Fail<E> | Done | Acquire<R>

interface StreamLambda extends TaggedLambda4 {
  readonly type: Stream<this['S'], this['R'], this['E'], this['A']>
  readonly data: MkData<this['type']>
}

const Stream = mkTaggedUnion<StreamLambda>({
  Emit: true,
  Fail: true,
  Done: false,
  Acquire: true,
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

// ===========================================================================
// MkData
// ===========================================================================

describe('MkData', () => {
  test('generates correct data map for arity-1 Maybe', () => {
    type MaybeNumData = (MaybeLambda & { readonly A: number })['data']
    expectTypeOf<MaybeNumData['Just']>().toEqualTypeOf<{
      readonly tag: 'Just'
      readonly value: number
    }>()
    expectTypeOf<MaybeNumData['Nothing']>().toEqualTypeOf<{
      readonly tag: 'Nothing'
    }>()

    const _justData: MaybeNumData['Just'] = { tag: 'Just', value: 42 }
    const _nothingData: MaybeNumData['Nothing'] = { tag: 'Nothing' }

    // @ts-expect-error - value must be number
    const _badJustData: MaybeNumData['Just'] = { tag: 'Just', value: 'wrong' }
  })

  test('generates correct data map for arity-2 Result', () => {
    type ResultStrNumData = (ResultLambda & {
      readonly E: string
      readonly A: number
    })['data']
    expectTypeOf<ResultStrNumData['Success']>().toEqualTypeOf<{
      readonly tag: 'Success'
      readonly value: number
    }>()
    expectTypeOf<ResultStrNumData['Failure']>().toEqualTypeOf<{
      readonly tag: 'Failure'
      readonly error: string
    }>()

    const _successData: ResultStrNumData['Success'] = {
      tag: 'Success',
      value: 42,
    }
    const _failureData: ResultStrNumData['Failure'] = {
      tag: 'Failure',
      error: 'oops',
    }
  })

  test('generates correct data map with custom discriminant (Trio kind)', () => {
    type TrioNumData = (TrioLambda & { readonly A: number })['data']
    expectTypeOf<TrioNumData['First']>().toEqualTypeOf<{
      readonly kind: 'First'
      readonly value: number
    }>()
    expectTypeOf<TrioNumData['Third']>().toEqualTypeOf<{
      readonly kind: 'Third'
    }>()

    const _firstData: TrioNumData['First'] = { kind: 'First', value: 42 }
    const _thirdData: TrioNumData['Third'] = { kind: 'Third' }

    // @ts-expect-error - value must be number
    const _badFirstData: TrioNumData['First'] = { kind: 'First', value: 'bad' }
  })

  test('generates correct data map for arity-0 CounterAction', () => {
    type CounterData = CounterActionLambda['data']
    expectTypeOf<CounterData['Increment']>().toEqualTypeOf<{
      readonly type: 'Increment'
      readonly amount: number
    }>()
    expectTypeOf<CounterData['Reset']>().toEqualTypeOf<{
      readonly type: 'Reset'
    }>()

    const _incData: CounterData['Increment'] = { type: 'Increment', amount: 5 }
    const _rstData: CounterData['Reset'] = { type: 'Reset' }
  })

  test('generates correct data map for arity-3 Env', () => {
    type EnvData = (EnvLambda & {
      readonly R: string
      readonly E: number
      readonly A: boolean
    })['data']
    expectTypeOf<EnvData['Ask']>().toEqualTypeOf<{
      readonly tag: 'Ask'
      readonly resource: string
    }>()
    expectTypeOf<EnvData['Pure']>().toEqualTypeOf<{
      readonly tag: 'Pure'
      readonly value: boolean
    }>()
    expectTypeOf<EnvData['Raise']>().toEqualTypeOf<{
      readonly tag: 'Raise'
      readonly error: number
    }>()
    expectTypeOf<EnvData['Halt']>().toEqualTypeOf<{ readonly tag: 'Halt' }>()

    const _askData: EnvData['Ask'] = { tag: 'Ask', resource: 'db' }
    const _pureData: EnvData['Pure'] = { tag: 'Pure', value: true }
    const _raiseData: EnvData['Raise'] = { tag: 'Raise', error: 42 }
    const _haltData: EnvData['Halt'] = { tag: 'Halt' }
  })

  test('generates correct data map for arity-4 Stream', () => {
    type StreamData = (StreamLambda & {
      readonly S: string
      readonly R: number
      readonly E: boolean
      readonly A: bigint
    })['data']
    expectTypeOf<StreamData['Emit']>().toEqualTypeOf<{
      readonly tag: 'Emit'
      readonly state: string
      readonly value: bigint
    }>()
    expectTypeOf<StreamData['Fail']>().toEqualTypeOf<{
      readonly tag: 'Fail'
      readonly error: boolean
    }>()
    expectTypeOf<StreamData['Done']>().toEqualTypeOf<{ readonly tag: 'Done' }>()
    expectTypeOf<StreamData['Acquire']>().toEqualTypeOf<{
      readonly tag: 'Acquire'
      readonly resource: number
    }>()

    const _emitData: StreamData['Emit'] = { tag: 'Emit', state: 's', value: 0n }
    const _failData: StreamData['Fail'] = { tag: 'Fail', error: true }
    const _doneData: StreamData['Done'] = { tag: 'Done' }
    const _acquireData: StreamData['Acquire'] = { tag: 'Acquire', resource: 1 }
  })
})

// ===========================================================================
// IsLambda arity detection
// ===========================================================================

describe('IsLambda arity detection', () => {
  test('CounterActionLambda is arity 0', () => {
    expectTypeOf<IsLambda0<CounterActionLambda>>().toEqualTypeOf<true>()
    expectTypeOf<IsLambda1<CounterActionLambda>>().toEqualTypeOf<false>()
    expectTypeOf<IsLambda2<CounterActionLambda>>().toEqualTypeOf<false>()
  })

  test('MaybeLambda is arity 1', () => {
    expectTypeOf<IsLambda1<MaybeLambda>>().toEqualTypeOf<true>()
    expectTypeOf<IsLambda0<MaybeLambda>>().toEqualTypeOf<false>()
    expectTypeOf<IsLambda2<MaybeLambda>>().toEqualTypeOf<false>()
  })

  test('ResultLambda is arity 2', () => {
    expectTypeOf<IsLambda2<ResultLambda>>().toEqualTypeOf<true>()
    expectTypeOf<IsLambda1<ResultLambda>>().toEqualTypeOf<false>()
    expectTypeOf<IsLambda3<ResultLambda>>().toEqualTypeOf<false>()
  })

  test('EnvLambda is arity 3', () => {
    expectTypeOf<IsLambda3<EnvLambda>>().toEqualTypeOf<true>()
    expectTypeOf<IsLambda2<EnvLambda>>().toEqualTypeOf<false>()
    expectTypeOf<IsLambda4<EnvLambda>>().toEqualTypeOf<false>()
  })

  test('StreamLambda is arity 4', () => {
    expectTypeOf<IsLambda4<StreamLambda>>().toEqualTypeOf<true>()
    expectTypeOf<IsLambda3<StreamLambda>>().toEqualTypeOf<false>()
    expectTypeOf<IsLambda0<StreamLambda>>().toEqualTypeOf<false>()
  })
})

// ===========================================================================
// MemberSpec
// ===========================================================================

describe('MemberSpec', () => {
  test('Maybe: Just has fields (true), Nothing does not (false)', () => {
    type MaybeMemberSpec = MemberSpec<MaybeLambda>
    expectTypeOf<MaybeMemberSpec['Just']>().toEqualTypeOf<true>()
    expectTypeOf<MaybeMemberSpec['Nothing']>().toEqualTypeOf<false>()
  })

  test('Result: both members have fields', () => {
    type ResultMemberSpec = MemberSpec<ResultLambda>
    expectTypeOf<ResultMemberSpec['Success']>().toEqualTypeOf<true>()
    expectTypeOf<ResultMemberSpec['Failure']>().toEqualTypeOf<true>()
  })

  test('CounterAction: custom discriminant "type" threaded through', () => {
    type CounterSpec = MemberSpec<CounterActionLambda, 'type'>
    expectTypeOf<CounterSpec['Increment']>().toEqualTypeOf<true>()
    expectTypeOf<CounterSpec['Reset']>().toEqualTypeOf<false>()
  })

  test('Stream: mixed nullary and non-nullary members', () => {
    type StreamSpec = MemberSpec<StreamLambda>
    expectTypeOf<StreamSpec['Emit']>().toEqualTypeOf<true>()
    expectTypeOf<StreamSpec['Fail']>().toEqualTypeOf<true>()
    expectTypeOf<StreamSpec['Done']>().toEqualTypeOf<false>()
    expectTypeOf<StreamSpec['Acquire']>().toEqualTypeOf<true>()
  })
})

// ===========================================================================
// Constructors — structural shape
// ===========================================================================

describe('Constructors structural shape', () => {
  test('Nullary Nothing is not a function, non-nullary Just is', () => {
    type MaybeCtors = Constructors<MaybeLambda, 'tag'>
    expectTypeOf<MaybeCtors['Nothing']>().not.toExtend<Function>()
    expectTypeOf<MaybeCtors['Just']>().toExtend<Function>()
  })

  test('Arity-4: Done is not a function, Emit is', () => {
    type StreamCtors = Constructors<StreamLambda, 'tag'>
    expectTypeOf<StreamCtors['Done']>().not.toExtend<Function>()
    expectTypeOf<StreamCtors['Emit']>().toExtend<Function>()
  })
})

// ===========================================================================
// Constructors — usage
// ===========================================================================

describe('Constructors — correct usage', () => {
  test('Nullary constructors are constant values (not functions)', () => {
    const nothing: Maybe<number> = Maybe.Nothing
    const nothing2: Maybe<string> = Maybe.Nothing
    expectTypeOf(nothing).toExtend<Maybe<number>>()
    expectTypeOf(nothing2).toExtend<Maybe<string>>()
  })

  test('Non-nullary constructor infers generic type param', () => {
    const justNum: Maybe<number> = Maybe.Just({ value: 42 })
    const justStr: Maybe<string> = Maybe.Just({ value: 'hello' })
    expectTypeOf(justNum).toExtend<Maybe<number>>()
    expectTypeOf(justStr).toExtend<Maybe<string>>()
  })

  test('Arity-2 Result constructors', () => {
    const success: Result<string, number> = Result.Success({ value: 42 })
    const failure: Result<string, number> = Result.Failure({ error: 'oops' })
    expectTypeOf(success).toExtend<Result<string, number>>()
    expectTypeOf(failure).toExtend<Result<string, number>>()
  })

  test('Arity-0 CounterAction: Increment takes fields, Reset is a constant', () => {
    const inc: CounterAction = CounterAction.Increment({ amount: 5 })
    const rst: CounterAction = CounterAction.Reset
    expectTypeOf(inc).toExtend<CounterAction>()
    expectTypeOf(rst).toExtend<CounterAction>()
  })

  test('Arity-3 Env constructors', () => {
    const ask: Env<string, number, boolean> = Env.Ask({ resource: 'db' })
    const pure: Env<string, number, boolean> = Env.Pure({ value: true })
    const raise: Env<string, number, boolean> = Env.Raise({ error: 42 })
    const halt: Env<string, number, boolean> = Env.Halt
    expectTypeOf(ask).toExtend<Env<string, number, boolean>>()
    expectTypeOf(pure).toExtend<Env<string, number, boolean>>()
    expectTypeOf(raise).toExtend<Env<string, number, boolean>>()
    expectTypeOf(halt).toExtend<Env<string, number, boolean>>()
  })

  test('Arity-4 Stream constructors', () => {
    const emit: Stream<string, number, boolean, bigint> = Stream.Emit({
      state: 's',
      value: 0n,
    })
    const fail: Stream<string, number, boolean, bigint> = Stream.Fail({
      error: true,
    })
    const done: Stream<string, number, boolean, bigint> = Stream.Done
    const acquire: Stream<string, number, boolean, bigint> = Stream.Acquire({
      resource: 1,
    })
    expectTypeOf(emit).toExtend<Stream<string, number, boolean, bigint>>()
    expectTypeOf(fail).toExtend<Stream<string, number, boolean, bigint>>()
    expectTypeOf(done).toExtend<Stream<string, number, boolean, bigint>>()
    expectTypeOf(acquire).toExtend<Stream<string, number, boolean, bigint>>()
  })

  test('Custom discriminant: Trio constructors', () => {
    const first: Trio<number> = Trio.First({ value: 42 })
    const third: Trio<number> = Trio.Third
    expectTypeOf(first).toExtend<Trio<number>>()
    expectTypeOf(third).toExtend<Trio<number>>()
  })
})

describe('Constructors — return full union, not specific member', () => {
  test('Just<A> constructor returns Maybe<A>', () => {
    expectTypeOf<ReturnType<typeof Maybe.Just<number>>>().toEqualTypeOf<
      Maybe<number>
    >()
  })

  test('Success constructor returns Result<E, A>', () => {
    expectTypeOf<
      ReturnType<typeof Result.Success<string, number>>
    >().toEqualTypeOf<Result<string, number>>()
  })

  test('Nullary Nothing is Maybe<never>', () => {
    expectTypeOf<typeof Maybe.Nothing>().toEqualTypeOf<Maybe<never>>()
  })
})

describe('Constructors — invalid usage rejected', () => {
  test('Maybe rejects wrong shapes', () => {
    // @ts-expect-error - Just requires a `value` field
    Maybe.Just({})

    // @ts-expect-error - Just requires an object with `value`, not a bare value
    Maybe.Just(42)

    // @ts-expect-error - Wrong field name
    Maybe.Just({ val: 42 })

    // @ts-expect-error - Nothing is a constant, not a function
    Maybe.Nothing()
  })

  test('Nullary constants reject function call', () => {
    // @ts-expect-error - Reset is a constant, not a function
    CounterAction.Reset()
    // @ts-expect-error - Halt is a constant, not a function
    Env.Halt()
    // @ts-expect-error - Done is a constant, not a function
    Stream.Done()
    // @ts-expect-error - Third is a constant, not a function
    Trio.Third()
  })

  test('Result rejects missing / wrong fields', () => {
    // @ts-expect-error - Success requires a `value` field
    Result.Success({})
    // @ts-expect-error - Failure requires an `error` field
    Result.Failure({})
    // @ts-expect-error - Wrong field name for Failure
    Result.Failure({ value: 'wrong' })
  })

  test('Env / Stream reject missing fields', () => {
    // @ts-expect-error - Ask requires a `resource` field
    Env.Ask({})
    // @ts-expect-error - Emit requires both `state` and `value`
    Stream.Emit({ state: 's' })
  })
})

// ===========================================================================
// Type guards
// ===========================================================================

describe('Type guards', () => {
  test('guards return booleans', () => {
    expectTypeOf(
      Maybe.is.Just(Maybe.Just({ value: 1 })),
    ).toEqualTypeOf<boolean>()
    expectTypeOf(Maybe.is.Nothing(Maybe.Nothing)).toEqualTypeOf<boolean>()
    expectTypeOf(
      Maybe.is.memberOfUnion(Maybe.Just({ value: 1 })),
    ).toEqualTypeOf<boolean>()
  })

  test('Maybe.is.Just narrows to Just<number>', () => {
    const m = Maybe.Just({ value: 1 }) as Maybe<number>
    if (Maybe.is.Just(m)) {
      expectTypeOf(m).toEqualTypeOf<Just<number>>()
      expectTypeOf(m.value).toEqualTypeOf<number>()
      expectTypeOf(m.tag).toEqualTypeOf<'Just'>()
    } else {
      expectTypeOf(m).toEqualTypeOf<Nothing>()
      expectTypeOf(m.tag).toEqualTypeOf<'Nothing'>()
    }
  })

  test('Result guards narrow exhaustively', () => {
    const r = Result.Success({ value: 1 }) as Result<string, number>
    if (Result.is.Success(r)) {
      expectTypeOf(r.value).toEqualTypeOf<number>()
    } else if (Result.is.Failure(r)) {
      expectTypeOf(r.error).toEqualTypeOf<string>()
    }
  })

  test('Env guards narrow exhaustively', () => {
    const e = Env.Halt as Env<string, number, boolean>
    if (Env.is.Ask(e)) {
      expectTypeOf(e.resource).toEqualTypeOf<string>()
    } else if (Env.is.Pure(e)) {
      expectTypeOf(e.value).toEqualTypeOf<boolean>()
    } else if (Env.is.Raise(e)) {
      expectTypeOf(e.error).toEqualTypeOf<number>()
    } else {
      expectTypeOf(e.tag).toEqualTypeOf<'Halt'>()
    }
  })

  test('Stream guards narrow exhaustively', () => {
    const s = Stream.Done as Stream<string, number, boolean, bigint>
    if (Stream.is.Emit(s)) {
      expectTypeOf(s.state).toEqualTypeOf<string>()
      expectTypeOf(s.value).toEqualTypeOf<bigint>()
    } else if (Stream.is.Fail(s)) {
      expectTypeOf(s.error).toEqualTypeOf<boolean>()
    } else if (Stream.is.Acquire(s)) {
      expectTypeOf(s.resource).toEqualTypeOf<number>()
    } else {
      expectTypeOf(s.tag).toEqualTypeOf<'Done'>()
    }
  })

  test('guards reject wrong property access after narrowing', () => {
    const m = Maybe.Just({ value: 1 }) as Maybe<number>
    if (Maybe.is.Just(m)) {
      // @ts-expect-error - Just doesn't have `error`
      m.error
    }
    if (Maybe.is.Nothing(m)) {
      // @ts-expect-error - Nothing doesn't have `value`
      m.value
    }

    const e = Env.Halt as Env<string, number, boolean>
    if (Env.is.Ask(e)) {
      // @ts-expect-error - Ask doesn't have `value`
      e.value
    }
    if (Env.is.Halt(e)) {
      // @ts-expect-error - Halt doesn't have `resource`
      e.resource
    }
  })
})

// ===========================================================================
// match
// ===========================================================================

describe('match', () => {
  test('returns the handler return type', () => {
    const matchStr = Maybe.match(Maybe.Just({ value: 42 }), {
      Just: x => String(x.value),
      Nothing: _x => 'nothing',
    })
    expectTypeOf(matchStr).toEqualTypeOf<string>()

    const matchNum = Maybe.match(Maybe.Just({ value: 42 }), {
      Just: x => x.value,
      Nothing: _x => 0,
    })
    expectTypeOf(matchNum).toEqualTypeOf<number>()
  })

  test('handlers receive correctly narrowed arguments', () => {
    Maybe.match(Maybe.Just({ value: 42 }), {
      Just: x => {
        expectTypeOf(x.value).toEqualTypeOf<number>()
        expectTypeOf(x.tag).toEqualTypeOf<'Just'>()
        return x.value
      },
      Nothing: x => {
        expectTypeOf(x.tag).toEqualTypeOf<'Nothing'>()
        return 0
      },
    })
  })

  test('arity-3 Env match', () => {
    Env.match(Env.Ask<string, number, boolean>({ resource: 'db' }), {
      Ask: x => {
        expectTypeOf(x.resource).toEqualTypeOf<string>()
        return x.resource
      },
      Pure: x => String(x.value),
      Raise: x => String(x.error),
      Halt: _x => 'halt',
    })
  })

  test('arity-4 Stream match', () => {
    Stream.match(
      Stream.Emit<string, number, boolean, bigint>({ state: 's', value: 0n }),
      {
        Emit: x => {
          expectTypeOf(x.state).toEqualTypeOf<string>()
          expectTypeOf(x.value).toEqualTypeOf<bigint>()
          return `${x.state}:${x.value}`
        },
        Fail: x => String(x.error),
        Done: _x => 'done',
        Acquire: x => String(x.resource),
      },
    )
  })

  test('requires exhaustive case handlers', () => {
    // @ts-expect-error - Missing 'Nothing' case handler
    Maybe.match(Maybe.Just({ value: 42 }), {
      Just: x => x.value,
    })

    // @ts-expect-error - Missing 'Just' case handler
    Maybe.match(Maybe.Just({ value: 42 }), {
      Nothing: _x => 0,
    })

    // @ts-expect-error - Missing 'Failure' case handler
    Result.match(Result.Success<string, number>({ value: 42 }), {
      Success: x => x.value,
    })

    // @ts-expect-error - Missing 'Halt' case handler for arity-3
    Env.match(Env.Ask<string, number, boolean>({ resource: 'db' }), {
      Ask: x => x.resource,
      Pure: x => String(x.value),
      Raise: x => String(x.error),
    })

    Stream.match(
      Stream.Emit<string, number, boolean, bigint>({ state: 's', value: 0n }),
      // @ts-expect-error - Missing 'Acquire' case handler for arity-4
      {
        Emit: x => String(x.value),
        Fail: x => String(x.error),
        Done: _x => 'done',
      },
    )
  })

  test('rejects wrong field access in handlers', () => {
    Maybe.match(Maybe.Just({ value: 42 }), {
      Just: x => {
        // @ts-expect-error - Just doesn't have `error` field
        return x.error
      },
      Nothing: _x => 0,
    })
  })
})

// ===========================================================================
// matchW (widened return type)
// ===========================================================================

describe('matchW', () => {
  test('return type is the union of handler return types', () => {
    const matchWResult = Maybe.matchW(Maybe.Just({ value: 42 }), {
      Just: x => x.value,
      Nothing: _x => 'nothing' as const,
    })
    expectTypeOf(matchWResult).toEqualTypeOf<number | 'nothing'>()
  })

  test('arity-2 Result matchW: union of both branches', () => {
    const resultMatchW = Result.matchW(
      Result.Success<string, number>({ value: 1 }),
      {
        Success: x => x.value,
        Failure: x => x.error,
      },
    )
    expectTypeOf(resultMatchW).toEqualTypeOf<number | string>()
  })

  test('arity-3 Env matchW: union of all four branches', () => {
    const envMatchW = Env.matchW(
      Env.Ask<string, number, boolean>({ resource: 'db' }),
      {
        Ask: x => x.resource,
        Pure: x => x.value,
        Raise: x => x.error,
        Halt: _x => null,
      },
    )
    expectTypeOf(envMatchW).toEqualTypeOf<string | boolean | number | null>()
  })
})

// ===========================================================================
// matchOr (partial match with default)
// ===========================================================================

describe('matchOr', () => {
  test('returns the combined handler / fallback type', () => {
    const matchOrResult = Maybe.matchOr(
      Maybe.Just({ value: 42 }),
      { Just: x => x.value },
      _otherwise => 0,
    )
    expectTypeOf(matchOrResult).toEqualTypeOf<number>()
  })

  test('partial handlers + fallback combine to a uniform return', () => {
    const matchOrPartial = Result.matchOr(
      Result.Success<string, number>({ value: 1 }),
      { Success: x => String(x.value) },
      _otherwise => 'default',
    )
    expectTypeOf(matchOrPartial).toEqualTypeOf<string>()
  })

  test('empty handler map falls through to the default', () => {
    const matchOrEmpty = Maybe.matchOr(
      Maybe.Just({ value: 42 }),
      {},
      _otherwise => -1,
    )
    expectTypeOf(matchOrEmpty).toEqualTypeOf<number>()
  })

  test('arity-3 Env matchOr', () => {
    const envMatchOr = Env.matchOr(
      Env.Ask<string, number, boolean>({ resource: 'db' }),
      { Ask: x => x.resource },
      _otherwise => 'fallback',
    )
    expectTypeOf(envMatchOr).toEqualTypeOf<string>()
  })
})

// ===========================================================================
// matcher (curried data-last match)
// ===========================================================================

describe('matcher', () => {
  test('returns a function of the union type', () => {
    const maybeMatcher = Maybe.matcher<number, string>({
      Just: x => String(x.value),
      Nothing: _x => 'nothing',
    })
    expectTypeOf(maybeMatcher).toEqualTypeOf<(a: Maybe<number>) => string>()

    const applied = maybeMatcher(Maybe.Just({ value: 42 }))
    expectTypeOf(applied).toEqualTypeOf<string>()
  })

  test('arity-2 Result matcher', () => {
    const resultMatcher = Result.matcher<string, number, string>({
      Success: x => String(x.value),
      Failure: x => x.error,
    })
    expectTypeOf(resultMatcher).toEqualTypeOf<
      (a: Result<string, number>) => string
    >()
  })
})

// ===========================================================================
// matcherW (curried data-last widened match)
// ===========================================================================

describe('matcherW', () => {
  test('allows different return types per handler', () => {
    const maybeMatcherW = Maybe.matcherW<
      number,
      {
        Just: (x: Just<number>) => number
        Nothing: (x: Nothing) => string
      }
    >({
      Just: x => x.value,
      Nothing: _x => 'nothing',
    })
    const applied = maybeMatcherW(Maybe.Just({ value: 42 }))
    expectTypeOf(applied).toEqualTypeOf<number | string>()
  })
})

// ===========================================================================
// memberOfUnion
// ===========================================================================

describe('memberOfUnion', () => {
  test('narrows unknown to Maybe<unknown>', () => {
    const x: unknown = null
    if (Maybe.is.memberOfUnion(x)) {
      // Narrowed: x is a Maybe (any A) — at minimum, .tag is one of the
      // declared member tags. Asserting the full Maybe<unknown> here would
      // require the guard to emit the generic-preserving shape, so we
      // assert the tighter property we can rely on.
      expectTypeOf(x.tag).toEqualTypeOf<'Just' | 'Nothing'>()
    }
  })

  test('narrows unknown to Env tag union', () => {
    const x: unknown = null
    if (Env.is.memberOfUnion(x)) {
      expectTypeOf(x.tag).toEqualTypeOf<'Ask' | 'Pure' | 'Raise' | 'Halt'>()
    }
  })

  test('narrows unknown to Stream tag union (arity-4)', () => {
    const x: unknown = null
    if (Stream.is.memberOfUnion(x)) {
      expectTypeOf(x.tag).toEqualTypeOf<'Emit' | 'Fail' | 'Done' | 'Acquire'>()
    }
  })
})

// ===========================================================================
// Generic type parameter preservation
// ===========================================================================

describe('generic type preservation', () => {
  test('Maybe constructors preserve T through wrappers', () => {
    function wrapInJust<T>(value: T): Maybe<T> {
      return Maybe.Just({ value })
    }
    expectTypeOf(wrapInJust(42)).toEqualTypeOf<Maybe<number>>()
    expectTypeOf(wrapInJust('hello')).toEqualTypeOf<Maybe<string>>()
  })

  test('Result constructors preserve E, A through wrappers', () => {
    function wrapInSuccess<E, A>(value: A): Result<E, A> {
      return Result.Success({ value })
    }
    function wrapInFailure<E, A>(error: E): Result<E, A> {
      return Result.Failure({ error })
    }
    const ok: Result<string, number> = wrapInSuccess<string, number>(42)
    const err: Result<string, number> = wrapInFailure<string, number>('oops')
    expectTypeOf(ok).toExtend<Result<string, number>>()
    expectTypeOf(err).toExtend<Result<string, number>>()
  })

  test('Env constructors preserve R, E, A through wrappers', () => {
    function wrapInAsk<R, E, A>(resource: R): Env<R, E, A> {
      return Env.Ask({ resource })
    }
    const askStr: Env<string, number, boolean> = wrapInAsk<
      string,
      number,
      boolean
    >('db')
    expectTypeOf(askStr).toExtend<Env<string, number, boolean>>()
  })

  test('Stream constructors preserve S, R, E, A through wrappers', () => {
    function wrapInEmit<S, R, E, A>(state: S, value: A): Stream<S, R, E, A> {
      return Stream.Emit({ state, value })
    }
    const emitVal: Stream<string, number, boolean, bigint> = wrapInEmit<
      string,
      number,
      boolean,
      bigint
    >('s', 0n)
    expectTypeOf(emitVal).toExtend<Stream<string, number, boolean, bigint>>()
  })
})

// ===========================================================================
// Assignment compatibility
// ===========================================================================

describe('assignment compatibility', () => {
  test('Just<A> is assignable to Maybe<A>', () => {
    const j: Maybe<number> = Maybe.Just({ value: 1 })
    expectTypeOf(j).toExtend<Maybe<number>>()
  })

  test('Maybe<string> is not assignable to Maybe<number>', () => {
    // @ts-expect-error - Maybe<string> ≠ Maybe<number>
    const wrongType: Maybe<number> = Maybe.Just({ value: 'string' })
  })
})

// ===========================================================================
// Variance: nullary members parameterize over any type args
// ===========================================================================

describe('variance — nullary members are universal', () => {
  test('Maybe.Nothing is Maybe<never>, assignable to any Maybe<A>', () => {
    expectTypeOf(Maybe.Nothing).toEqualTypeOf<Maybe<never>>()
    const n1: Maybe<number> = Maybe.Nothing
    const n2: Maybe<string> = Maybe.Nothing
    const n3: Maybe<boolean> = Maybe.Nothing
    expectTypeOf(n1).toExtend<Maybe<number>>()
    expectTypeOf(n2).toExtend<Maybe<string>>()
    expectTypeOf(n3).toExtend<Maybe<boolean>>()
  })

  test('Result<never, never> is assignable to any Result<E, A>', () => {
    const neverResult: Result<never, never> = Result.Success({
      value: undefined as never,
    })
    const neverToStr: Result<string, number> = neverResult
    expectTypeOf(neverToStr).toExtend<Result<string, number>>()
  })

  test('Env.Halt is assignable to Env<R, E, A> for any R, E, A', () => {
    expectTypeOf(Env.Halt).toEqualTypeOf<Env<never, never, never>>()
    const h1: Env<string, number, boolean> = Env.Halt
    const h2: Env<number, string, object> = Env.Halt
    expectTypeOf(h1).toExtend<Env<string, number, boolean>>()
    expectTypeOf(h2).toExtend<Env<number, string, object>>()
  })

  test('Stream.Done is assignable to Stream<S, R, E, A> for any S, R, E, A', () => {
    expectTypeOf(Stream.Done).toEqualTypeOf<
      Stream<never, never, never, never>
    >()
    const d1: Stream<string, number, boolean, bigint> = Stream.Done
    const d2: Stream<number, string, object, symbol> = Stream.Done
    expectTypeOf(d1).toExtend<Stream<string, number, boolean, bigint>>()
    expectTypeOf(d2).toExtend<Stream<number, string, object, symbol>>()
  })
})

// ===========================================================================
// TaggedUnion structural type
// ===========================================================================

describe('TaggedUnion structural type', () => {
  test('has correctly-typed feature fields, not just "present"', () => {
    type TU = TaggedUnion<MaybeLambda, 'tag'>
    expectTypeOf<TU['is']>().toEqualTypeOf<Guards<MaybeLambda, 'tag'>>()
    expectTypeOf<TU['match']>().toEqualTypeOf<Match<MaybeLambda, 'tag'>>()
    expectTypeOf<TU['matchW']>().toEqualTypeOf<MatchW<MaybeLambda, 'tag'>>()
    expectTypeOf<TU['matchOr']>().toEqualTypeOf<MatchOr<MaybeLambda, 'tag'>>()
    expectTypeOf<TU['matcher']>().toEqualTypeOf<Matcher<MaybeLambda, 'tag'>>()
    expectTypeOf<TU['matcherW']>().toEqualTypeOf<MatcherW<MaybeLambda, 'tag'>>()
    expectTypeOf<TU['tags']>().toEqualTypeOf<Tags<MaybeLambda>>()
    expectTypeOf<TU['show']>().toEqualTypeOf<Show<MaybeLambda>>()
    expectTypeOf<TU['equals']>().toEqualTypeOf<Equals<MaybeLambda>>()
    expectTypeOf<TU['parse']>().toEqualTypeOf<Parse<MaybeLambda>>()
  })

  test('constructor fields are present on TaggedUnion', () => {
    type TU = TaggedUnion<MaybeLambda, 'tag'>
    expectTypeOf<TU['Just']>().not.toBeNever()
    expectTypeOf<TU['Nothing']>().not.toBeNever()
  })
})

// ===========================================================================
// v0.6: tags
// ===========================================================================

describe('tags (v0.6)', () => {
  test('Maybe.tags element type is the exact literal tag union', () => {
    expectTypeOf<(typeof Maybe.tags)[number]>().toEqualTypeOf<
      'Just' | 'Nothing'
    >()
  })

  test('Result.tags element type covers both members', () => {
    expectTypeOf<(typeof Result.tags)[number]>().toEqualTypeOf<
      'Success' | 'Failure'
    >()
  })

  test('Env.tags element type covers all four arity-3 members', () => {
    expectTypeOf<(typeof Env.tags)[number]>().toEqualTypeOf<
      'Ask' | 'Pure' | 'Raise' | 'Halt'
    >()
  })

  test('Stream.tags element type covers all four arity-4 members', () => {
    expectTypeOf<(typeof Stream.tags)[number]>().toEqualTypeOf<
      'Emit' | 'Fail' | 'Done' | 'Acquire'
    >()
  })

  test('CounterAction.tags element type uses declared member names (custom DK)', () => {
    expectTypeOf<(typeof CounterAction.tags)[number]>().toEqualTypeOf<
      'Increment' | 'Reset'
    >()
  })

  test('Maybe.tags is a readonly array', () => {
    // @ts-expect-error - tags is readonly
    Maybe.tags.push('Bogus')
    // @ts-expect-error - tags[n] is readonly
    Maybe.tags[0] = 'Other'
  })
})

// ===========================================================================
// v0.6: show
// ===========================================================================

describe('show (v0.6)', () => {
  test('returns string', () => {
    expectTypeOf(Maybe.show).returns.toBeString()
    expectTypeOf(Result.show).returns.toBeString()
    expectTypeOf(Env.show).returns.toBeString()
    expectTypeOf(Stream.show).returns.toBeString()
    expectTypeOf(CounterAction.show).returns.toBeString()
  })

  test('accepts a value of the union type', () => {
    expectTypeOf(Maybe.show(Maybe.Just({ value: 1 }))).toEqualTypeOf<string>()
    expectTypeOf(
      Result.show(Result.Success<string, number>({ value: 1 })),
    ).toEqualTypeOf<string>()
  })

  test('rejects cross-union arguments', () => {
    // @ts-expect-error - Result value is not a Maybe
    Maybe.show(Result.Success<string, number>({ value: 1 }))
  })
})

// ===========================================================================
// v0.6: equals
// ===========================================================================

describe('equals (v0.6)', () => {
  test('Maybe.equals takes two Maybe<A> and returns boolean', () => {
    const eq = Maybe.equals(Maybe.Just({ value: 1 }), Maybe.Just({ value: 2 }))
    expectTypeOf(eq).toEqualTypeOf<boolean>()
  })

  test('Result.equals threads both type parameters', () => {
    const eq = Result.equals(
      Result.Success<string, number>({ value: 1 }),
      Result.Failure<string, number>({ error: 'e' }),
    )
    expectTypeOf(eq).toEqualTypeOf<boolean>()
  })

  test('rejects cross-union comparison', () => {
    Maybe.equals(
      Maybe.Just({ value: 1 }),
      // @ts-expect-error - Result is not a Maybe
      Result.Success<string, number>({ value: 1 }),
    )
  })

  test('CounterAction.equals works with custom discriminant', () => {
    const eq = CounterAction.equals(
      CounterAction.Increment({ amount: 1 }),
      CounterAction.Reset,
    )
    expectTypeOf(eq).toEqualTypeOf<boolean>()
  })
})

// ===========================================================================
// v0.6: parse
// ===========================================================================

describe('parse (v0.6)', () => {
  test('takes unknown, returns Maybe | undefined', () => {
    const x: unknown = null
    const parsed = Maybe.parse(x)
    expectTypeOf(parsed).toEqualTypeOf<Maybe<unknown> | undefined>()
  })

  test('Result.parse narrows through both type params', () => {
    const x: unknown = null
    const parsed = Result.parse(x)
    expectTypeOf(parsed).toEqualTypeOf<Result<unknown, unknown> | undefined>()
  })

  test('Env.parse (arity-3) returns Env | undefined', () => {
    const x: unknown = null
    const parsed = Env.parse(x)
    expectTypeOf(parsed).toEqualTypeOf<
      Env<unknown, unknown, unknown> | undefined
    >()
  })

  test('Stream.parse (arity-4) returns Stream | undefined', () => {
    const x: unknown = null
    const parsed = Stream.parse(x)
    expectTypeOf(parsed).toEqualTypeOf<
      Stream<unknown, unknown, unknown, unknown> | undefined
    >()
  })

  test('CounterAction.parse works with custom discriminant', () => {
    const x: unknown = null
    const parsed = CounterAction.parse(x)
    expectTypeOf(parsed).toEqualTypeOf<CounterAction | undefined>()
  })
})
