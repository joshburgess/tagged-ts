/**
 * Example: RequestState — an async request state machine.
 *
 * Run with:  npx tsx examples/04-state-machine.ts
 *
 * Demonstrates:
 *   - Using a tagged union as a finite-state machine
 *   - Custom discriminant key (`state` instead of `tag`) via `mkTaggedUnionCustom`
 *   - Exhaustive transitions via `match`
 *   - Guarded access to state-specific fields via `is.X`
 *
 * States:
 *   Idle ─► Loading ─► Success (with data)
 *               └────► Failure (with error)
 *   Success/Failure ─► Idle (reset)
 */

import type { MkData, TaggedLambda1 } from '../src/named'
import { mkTaggedUnionCustom } from '../src/named'

// ---------------------------------------------------------------------------
// 1. Declare the state machine
// ---------------------------------------------------------------------------

type Idle = { readonly state: 'Idle' }
type Loading = { readonly state: 'Loading'; readonly startedAt: number }
type Success<A> = { readonly state: 'Success'; readonly data: A }
type Failure = { readonly state: 'Failure'; readonly message: string }
type RequestState<A> = Idle | Loading | Success<A> | Failure

interface RequestStateLambda extends TaggedLambda1 {
  readonly type: RequestState<this['A']>
  readonly data: MkData<this['type'], 'state'>
}

const RequestState = mkTaggedUnionCustom<RequestStateLambda>()('state', {
  Idle: false,
  Loading: true,
  Success: true,
  Failure: true,
})

// ---------------------------------------------------------------------------
// 2. Pure transition functions — each returns the next state
// ---------------------------------------------------------------------------

const start = <A>(s: RequestState<A>): RequestState<A> =>
  RequestState.match(s, {
    Idle: () => RequestState.Loading({ startedAt: Date.now() }),
    // Already running — starting again would lose the startedAt timestamp.
    Loading: x => x,
    // Starting over from a terminal state is allowed.
    Success: () => RequestState.Loading({ startedAt: Date.now() }),
    Failure: () => RequestState.Loading({ startedAt: Date.now() }),
  })

const resolve = <A>(s: RequestState<A>, data: A): RequestState<A> =>
  RequestState.match(s, {
    // Only a Loading request can resolve; anything else is ignored.
    Loading: () => RequestState.Success({ data }),
    Idle: x => x,
    Success: x => x,
    Failure: x => x,
  })

const reject = <A>(s: RequestState<A>, message: string): RequestState<A> =>
  RequestState.match(s, {
    Loading: () => RequestState.Failure({ message }),
    Idle: x => x,
    Success: x => x,
    Failure: x => x,
  })

const reset = <A>(_s: RequestState<A>): RequestState<A> => RequestState.Idle

// ---------------------------------------------------------------------------
// 3. Render a state
// ---------------------------------------------------------------------------

const render = <A>(s: RequestState<A>): string =>
  RequestState.match(s, {
    Idle: () => '[idle]',
    Loading: ({ startedAt }) => `[loading since ${startedAt}]`,
    Success: ({ data }) => `[success: ${JSON.stringify(data)}]`,
    Failure: ({ message }) => `[failure: ${message}]`,
  })

// ---------------------------------------------------------------------------
// 4. Drive the machine
// ---------------------------------------------------------------------------

const trace = <A>(label: string, s: RequestState<A>): RequestState<A> => {
  console.log(label.padEnd(14), render(s))
  return s
}

let s: RequestState<{ name: string }> = RequestState.Idle
s = trace('initial', s)
s = trace('start', start(s))
s = trace('resolve', resolve(s, { name: 'Ada' }))
s = trace('reset', reset(s))
s = trace('start again', start(s))
s = trace('reject', reject(s, 'timeout'))

// ---------------------------------------------------------------------------
// 5. Guarded access — `is.Success` narrows to the Success variant
// ---------------------------------------------------------------------------

if (RequestState.is.Success(s)) {
  // TS knows s.data is of the inner type here
  console.log('data:', s.data)
} else if (RequestState.is.Failure(s)) {
  console.log('final error:', s.message)
} else {
  console.log('still running or idle:', s.state)
}
