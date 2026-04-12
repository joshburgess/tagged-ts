/**
 * Type-level tests for tagged-ts (named/object-style constructors)
 *
 * These tests verify compile-time behavior:
 * - Correct usage compiles without errors
 * - Invalid usage is rejected via @ts-expect-error
 * - Types narrow properly through guards and match
 * - MkData auto-generates correct data maps
 * - Arity detection (IsLambda0-4) works correctly
 * - MemberSpec constrains the boolean map correctly
 *
 * This file is checked by `tsc --noEmit` but never executed at runtime.
 */

import type {
  IsLambda0,
  IsLambda1,
  IsLambda2,
  IsLambda3,
  IsLambda4,
} from '../../src/Lambda'
import type {
  Constructors,
  MemberSpec,
  MkData,
  TaggedLambda0,
  TaggedLambda1,
  TaggedLambda2,
  TaggedLambda3,
  TaggedLambda4,
  TaggedUnion,
} from '../../src/named'
import { mkTaggedUnion, mkTaggedUnionCustom } from '../../src/named'

// ---------------------------------------------------------------------------
// Utility: type-level assertion helpers
// ---------------------------------------------------------------------------

type IsTrue<T extends true> = T
type IsFalse<T extends false> = T
type IsEqual<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
type IsAssignable<A, B> = A extends B ? true : false

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
// MkData type tests
// ===========================================================================

// --- MkData generates correct data maps ---

type MaybeNumData = (MaybeLambda & { readonly A: number })['data']
const _justData: MaybeNumData['Just'] = { tag: 'Just', value: 42 }
const _nothingData: MaybeNumData['Nothing'] = { tag: 'Nothing' }

// @ts-expect-error - value must be number
const _badJustData: MaybeNumData['Just'] = { tag: 'Just', value: 'wrong' }

type ResultStrNumData = (ResultLambda & {
  readonly E: string
  readonly A: number
})['data']

const _successData: ResultStrNumData['Success'] = { tag: 'Success', value: 42 }
const _failureData: ResultStrNumData['Failure'] = {
  tag: 'Failure',
  error: 'oops',
}

// --- MkData with custom discriminant ---

type TrioNumData = (TrioLambda & { readonly A: number })['data']
const _firstData: TrioNumData['First'] = { kind: 'First', value: 42 }
const _thirdData: TrioNumData['Third'] = { kind: 'Third' }

// @ts-expect-error - value must be number
const _badFirstData: TrioNumData['First'] = { kind: 'First', value: 'wrong' }

// --- MkData for arity 0 ---

type CounterData = CounterActionLambda['data']
const _incData: CounterData['Increment'] = { type: 'Increment', amount: 5 }
const _rstData: CounterData['Reset'] = { type: 'Reset' }

// --- MkData for arity 3 ---

type EnvData = (EnvLambda & {
  readonly R: string
  readonly E: number
  readonly A: boolean
})['data']
const _askData: EnvData['Ask'] = { tag: 'Ask', resource: 'db' }
const _pureData: EnvData['Pure'] = { tag: 'Pure', value: true }
const _raiseData: EnvData['Raise'] = { tag: 'Raise', error: 42 }
const _haltData: EnvData['Halt'] = { tag: 'Halt' }

// --- MkData for arity 4 ---

type StreamData = (StreamLambda & {
  readonly S: string
  readonly R: number
  readonly E: boolean
  readonly A: bigint
})['data']
const _emitData: StreamData['Emit'] = { tag: 'Emit', state: 's', value: 0n }
const _failData: StreamData['Fail'] = { tag: 'Fail', error: true }
const _doneData: StreamData['Done'] = { tag: 'Done' }
const _acquireData: StreamData['Acquire'] = { tag: 'Acquire', resource: 1 }

// ===========================================================================
// IsLambda arity detection tests
// ===========================================================================

type _L0 = IsTrue<IsLambda0<CounterActionLambda>>
type _L0Not1 = IsFalse<IsLambda1<CounterActionLambda>>
type _L0Not2 = IsFalse<IsLambda2<CounterActionLambda>>

type _L1 = IsTrue<IsLambda1<MaybeLambda>>
type _L1Not0 = IsFalse<IsLambda0<MaybeLambda>>
type _L1Not2 = IsFalse<IsLambda2<MaybeLambda>>

type _L2 = IsTrue<IsLambda2<ResultLambda>>
type _L2Not1 = IsFalse<IsLambda1<ResultLambda>>
type _L2Not3 = IsFalse<IsLambda3<ResultLambda>>

type _L3 = IsTrue<IsLambda3<EnvLambda>>
type _L3Not2 = IsFalse<IsLambda2<EnvLambda>>
type _L3Not4 = IsFalse<IsLambda4<EnvLambda>>

type _L4 = IsTrue<IsLambda4<StreamLambda>>
type _L4Not3 = IsFalse<IsLambda3<StreamLambda>>
type _L4Not0 = IsFalse<IsLambda0<StreamLambda>>

// ===========================================================================
// MemberSpec tests
// ===========================================================================

// --- MemberSpec computes the correct booleans ---

type MaybeMemberSpec = MemberSpec<MaybeLambda>
type _MaybeSpecJust = IsTrue<IsEqual<MaybeMemberSpec['Just'], true>>
type _MaybeSpecNothing = IsTrue<IsEqual<MaybeMemberSpec['Nothing'], false>>

type ResultMemberSpec = MemberSpec<ResultLambda>
type _ResultSpecSuccess = IsTrue<IsEqual<ResultMemberSpec['Success'], true>>
type _ResultSpecFailure = IsTrue<IsEqual<ResultMemberSpec['Failure'], true>>

type CounterSpec = MemberSpec<CounterActionLambda, 'type'>
type _CounterSpecInc = IsTrue<IsEqual<CounterSpec['Increment'], true>>
type _CounterSpecRst = IsTrue<IsEqual<CounterSpec['Reset'], false>>

type StreamSpec = MemberSpec<StreamLambda>
type _StreamSpecEmit = IsTrue<IsEqual<StreamSpec['Emit'], true>>
type _StreamSpecFail = IsTrue<IsEqual<StreamSpec['Fail'], true>>
type _StreamSpecDone = IsTrue<IsEqual<StreamSpec['Done'], false>>
type _StreamSpecAcq = IsTrue<IsEqual<StreamSpec['Acquire'], true>>

// ===========================================================================
// Constructors structural type tests
// ===========================================================================

// --- Nullary constructors are value types, not functions ---

type MaybeCtors = Constructors<MaybeLambda, 'tag'>

// Nothing constructor should NOT be a function
type _NothingIsNotFn = IsFalse<IsAssignable<MaybeCtors['Nothing'], Function>>

// Just constructor should be a function
type _JustIsFn = IsTrue<IsAssignable<MaybeCtors['Just'], Function>>

// Arity-4 nullary: Done should not be a function
type StreamCtors = Constructors<StreamLambda, 'tag'>
type _DoneIsNotFn = IsFalse<IsAssignable<StreamCtors['Done'], Function>>
type _EmitIsFn = IsTrue<IsAssignable<StreamCtors['Emit'], Function>>

// ===========================================================================
// Constructor type tests
// ===========================================================================

// --- Correct usage compiles ---

// Nullary constructor is a constant value, not a function
const nothing: Maybe<number> = Maybe.Nothing
const nothing2: Maybe<string> = Maybe.Nothing

// Constructor with fields infers generic type param
const justNum: Maybe<number> = Maybe.Just({ value: 42 })
const justStr: Maybe<string> = Maybe.Just({ value: 'hello' })

// Non-nullary constructors are always functions
const success: Result<string, number> = Result.Success({ value: 42 })
const failure: Result<string, number> = Result.Failure({ error: 'oops' })

// Arity-0: Increment takes fields, Reset is a constant
const inc: CounterAction = CounterAction.Increment({ amount: 5 })
const rst: CounterAction = CounterAction.Reset

// Arity-3: constructors and constants
const ask: Env<string, number, boolean> = Env.Ask({ resource: 'db' })
const pure: Env<string, number, boolean> = Env.Pure({ value: true })
const raise: Env<string, number, boolean> = Env.Raise({ error: 42 })
const halt: Env<string, number, boolean> = Env.Halt

// Arity-4: constructors and constants
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

// Custom discriminant
const first: Trio<number> = Trio.First({ value: 42 })
const third: Trio<number> = Trio.Third

// --- Constructors return the full union type, not the specific member ---

// Just returns Maybe<A>, forcing pattern matching
type _JustReturnsUnion = IsTrue<
  IsEqual<ReturnType<typeof Maybe.Just<number>>, Maybe<number>>
>

// Success returns Result<E, A>
type _SuccessReturnsUnion = IsTrue<
  IsEqual<
    ReturnType<typeof Result.Success<string, number>>,
    Result<string, number>
  >
>

// Nullary Nothing is Maybe<never>
type _NothingIsUnion = IsTrue<IsEqual<typeof Maybe.Nothing, Maybe<never>>>

// --- Invalid usage is rejected ---

// @ts-expect-error - Just requires a `value` field
Maybe.Just({})

// @ts-expect-error - Just requires an object with `value`, not a bare value
Maybe.Just(42)

// @ts-expect-error - Wrong field name
Maybe.Just({ val: 42 })

// @ts-expect-error - Nothing is a constant, not a function
Maybe.Nothing()

// @ts-expect-error - Reset is a constant, not a function
CounterAction.Reset()

// @ts-expect-error - Halt is a constant, not a function
Env.Halt()

// @ts-expect-error - Done is a constant, not a function
Stream.Done()

// @ts-expect-error - Third is a constant, not a function
Trio.Third()

// @ts-expect-error - Success requires a `value` field
Result.Success({})

// @ts-expect-error - Failure requires an `error` field
Result.Failure({})

// @ts-expect-error - Wrong field name for Failure
Result.Failure({ value: 'wrong' })

// @ts-expect-error - Ask requires a `resource` field
Env.Ask({})

// @ts-expect-error - Emit requires both `state` and `value`
Stream.Emit({ state: 's' })

// ===========================================================================
// Type guard tests
// ===========================================================================

// --- Guards exist and return booleans ---

const guardResult1: boolean = Maybe.is.Just(Maybe.Just({ value: 1 }))
const guardResult2: boolean = Maybe.is.Nothing(Maybe.Nothing)
const guardResult3: boolean = Maybe.is.memberOfUnion(Maybe.Just({ value: 1 }))

// --- Guards narrow types properly ---

function testMaybeNarrowing(m: Maybe<number>): number {
  if (Maybe.is.Just(m)) {
    const v: number = m.value
    return v
  }
  const t: 'Nothing' = m.tag
  return 0
}

function testResultNarrowing(r: Result<string, number>): string {
  if (Result.is.Success(r)) {
    const v: number = r.value
    return String(v)
  }
  if (Result.is.Failure(r)) {
    const e: string = r.error
    return e
  }
  return 'unreachable'
}

function testEnvNarrowing(e: Env<string, number, boolean>): string {
  if (Env.is.Ask(e)) {
    const r: string = e.resource
    return r
  }
  if (Env.is.Pure(e)) {
    const v: boolean = e.value
    return String(v)
  }
  if (Env.is.Raise(e)) {
    const err: number = e.error
    return String(err)
  }
  const t: 'Halt' = e.tag
  return 'halt'
}

function testStreamNarrowing(
  s: Stream<string, number, boolean, bigint>,
): string {
  if (Stream.is.Emit(s)) {
    const st: string = s.state
    const v: bigint = s.value
    return `${st}:${v}`
  }
  if (Stream.is.Fail(s)) {
    const err: boolean = s.error
    return String(err)
  }
  if (Stream.is.Acquire(s)) {
    const r: number = s.resource
    return String(r)
  }
  const t: 'Done' = s.tag
  return 'done'
}

// --- Guard rejects wrong property access after narrowing ---

function testGuardRejectsWrongAccess(m: Maybe<number>) {
  if (Maybe.is.Just(m)) {
    // @ts-expect-error - Just doesn't have `error` field
    m.error
  }
  if (Maybe.is.Nothing(m)) {
    // @ts-expect-error - Nothing doesn't have `value` field
    m.value
  }
}

function testEnvGuardRejectsWrongAccess(e: Env<string, number, boolean>) {
  if (Env.is.Ask(e)) {
    // @ts-expect-error - Ask doesn't have `value` field
    e.value
  }
  if (Env.is.Halt(e)) {
    // @ts-expect-error - Halt doesn't have `resource` field
    e.resource
  }
}

// ===========================================================================
// Match function type tests
// ===========================================================================

// --- Match returns the correct type ---

const matchStr: string = Maybe.match(Maybe.Just({ value: 42 }), {
  Just: x => String(x.value),
  Nothing: _x => 'nothing',
})

const matchNum: number = Maybe.match(Maybe.Just({ value: 42 }), {
  Just: x => x.value,
  Nothing: _x => 0,
})

// --- Match case handlers receive correctly typed arguments ---

Maybe.match(Maybe.Just({ value: 42 }), {
  Just: x => {
    const v: number = x.value
    const t: 'Just' = x.tag
    return v
  },
  Nothing: x => {
    const t: 'Nothing' = x.tag
    return 0
  },
})

// --- Arity-3 match ---

Env.match(Env.Ask<string, number, boolean>({ resource: 'db' }), {
  Ask: x => {
    const r: string = x.resource
    return r
  },
  Pure: x => String(x.value),
  Raise: x => String(x.error),
  Halt: _x => 'halt',
})

// --- Arity-4 match ---

Stream.match(
  Stream.Emit<string, number, boolean, bigint>({ state: 's', value: 0n }),
  {
    Emit: x => {
      const st: string = x.state
      const v: bigint = x.value
      return `${st}:${v}`
    },
    Fail: x => String(x.error),
    Done: _x => 'done',
    Acquire: x => String(x.resource),
  },
)

// --- Match requires exhaustive case handlers ---

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

// --- Match rejects wrong field access in handlers ---

Maybe.match(Maybe.Just({ value: 42 }), {
  Just: x => {
    // @ts-expect-error - Just doesn't have `error` field
    return x.error
  },
  Nothing: _x => 0,
})

// ===========================================================================
// matchW (widened return type) tests
// ===========================================================================

// --- matchW allows different return types per handler ---

const matchWResult = Maybe.matchW(Maybe.Just({ value: 42 }), {
  Just: x => x.value,
  Nothing: _x => 'nothing' as const,
})

// Return type is the union of handler return types
type _MatchWType = IsTrue<IsEqual<typeof matchWResult, number | 'nothing'>>

// Arity-2 matchW: each handler can return a different type
const resultMatchW = Result.matchW(
  Result.Success<string, number>({ value: 1 }),
  {
    Success: x => x.value,
    Failure: x => x.error,
  },
)
// Verify both branches contribute to the return type
const _resultMatchWToNum: number = resultMatchW as number
const _resultMatchWToStr: string = resultMatchW as string

// Arity-3 matchW
const envMatchW = Env.matchW(
  Env.Ask<string, number, boolean>({ resource: 'db' }),
  {
    Ask: x => x.resource,
    Pure: x => x.value,
    Raise: x => x.error,
    Halt: _x => null,
  },
)
const _envMatchWToStr: string = envMatchW as string
const _envMatchWToNull: null = envMatchW as null

// ===========================================================================
// matchOr (partial match with default) tests
// ===========================================================================

// --- matchOr allows partial handlers with a fallback ---

const matchOrResult: number = Maybe.matchOr(
  Maybe.Just({ value: 42 }),
  { Just: x => x.value },
  _otherwise => 0,
)

// Only handle some cases, fallback covers the rest
const matchOrPartial: string = Result.matchOr(
  Result.Success<string, number>({ value: 1 }),
  { Success: x => String(x.value) },
  _otherwise => 'default',
)

// Empty handlers — everything goes to fallback
const matchOrEmpty: number = Maybe.matchOr(
  Maybe.Just({ value: 42 }),
  {},
  _otherwise => -1,
)

// Arity-3 matchOr
const envMatchOr: string = Env.matchOr(
  Env.Ask<string, number, boolean>({ resource: 'db' }),
  { Ask: x => x.resource },
  _otherwise => 'fallback',
)

// ===========================================================================
// matcher (curried data-last match) tests
// ===========================================================================

// --- matcher returns a function ---

const maybeMatcher: (a: Maybe<number>) => string = Maybe.matcher<
  number,
  string
>({
  Just: x => String(x.value),
  Nothing: _x => 'nothing',
})

// Application works
const matcherApplied: string = maybeMatcher(Maybe.Just({ value: 42 }))

// Arity-2 curried
const resultMatcher = Result.matcher<string, number, string>({
  Success: x => String(x.value),
  Failure: x => x.error,
})

// ===========================================================================
// matcherW (curried data-last widened match) tests
// ===========================================================================

// --- matcherW allows different return types ---

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

// ===========================================================================
// memberOfUnion guard tests
// ===========================================================================

function testMemberOfUnion(x: unknown) {
  if (Maybe.is.memberOfUnion(x)) {
    const t: string = x.tag
  }
}

function testEnvMemberOfUnion(x: unknown) {
  if (Env.is.memberOfUnion(x)) {
    const t: string = x.tag
  }
}

// ===========================================================================
// Generic type parameter preservation
// ===========================================================================

function wrapInJust<T>(value: T): Maybe<T> {
  return Maybe.Just({ value })
}

const wrappedNum: Maybe<number> = wrapInJust(42)
const wrappedStr: Maybe<string> = wrapInJust('hello')

function wrapInSuccess<E, A>(value: A): Result<E, A> {
  return Result.Success({ value })
}

function wrapInFailure<E, A>(error: E): Result<E, A> {
  return Result.Failure({ error })
}

const ok: Result<string, number> = wrapInSuccess(42)
const err: Result<string, number> = wrapInFailure('oops')

function wrapInAsk<R, E, A>(resource: R): Env<R, E, A> {
  return Env.Ask({ resource })
}

const askStr: Env<string, number, boolean> = wrapInAsk('db')

function wrapInEmit<S, R, E, A>(state: S, value: A): Stream<S, R, E, A> {
  return Stream.Emit({ state, value })
}

const emitVal: Stream<string, number, boolean, bigint> = wrapInEmit('s', 0n)

// ===========================================================================
// Type assignment compatibility
// ===========================================================================

// Just<A> is assignable to Maybe<A>
const j: Maybe<number> = Maybe.Just({ value: 1 })

// Nothing is assignable to Maybe<A> for any A
const n1: Maybe<number> = Maybe.Nothing
const n2: Maybe<string> = Maybe.Nothing
const n3: Maybe<boolean> = Maybe.Nothing

// Halt is assignable to Env<R, E, A> for any R, E, A
const h1: Env<string, number, boolean> = Env.Halt
const h2: Env<number, string, object> = Env.Halt

// Done is assignable to Stream<S, R, E, A> for any S, R, E, A
const d1: Stream<string, number, boolean, bigint> = Stream.Done
const d2: Stream<number, string, object, symbol> = Stream.Done

// @ts-expect-error - Maybe<string> is not assignable to Maybe<number>
const wrongType: Maybe<number> = Maybe.Just({ value: 'string' })

// ===========================================================================
// Variance and edge cases with never/unknown
// ===========================================================================

// Maybe<never> is assignable to Maybe<A> for any A (covariance)
const neverMaybe: Maybe<never> = Maybe.Nothing
const neverToNum: Maybe<number> = neverMaybe

// Result<never, never> is assignable to Result<E, A> for any E, A
const neverResult: Result<never, never> = Result.Success({
  value: undefined as never,
})
const neverToStr: Result<string, number> = neverResult

// Match return type widens correctly
const matchWidened: number = Maybe.match(Maybe.Just({ value: 42 }), {
  Just: _x => 42 as number,
  Nothing: _x => 0,
})

// TaggedUnion structural test
type _TU = TaggedUnion<MaybeLambda, 'tag'>
type _TUHasIs = _TU['is']
type _TUHasMatch = _TU['match']
type _TUHasMatchW = _TU['matchW']
type _TUHasMatchOr = _TU['matchOr']
type _TUHasMatcher = _TU['matcher']
type _TUHasMatcherW = _TU['matcherW']
type _TUHasJust = _TU['Just']
type _TUHasNothing = _TU['Nothing']
