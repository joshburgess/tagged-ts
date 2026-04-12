# tagged-ts

Type-safe tagged unions with generated constructors, guards, and pattern matching for TypeScript.

## Installation

```sh
npm install tagged-ts
```

## Features

- **Polymorphic type constructors** — works with generic union types like `Maybe<A>`, `Result<E, A>`, and beyond (up to 4 type parameters)
- **Nullary constructors as constants** — `Maybe.Nothing` is a plain value, not a thunk
- **Custom discriminant keys** — use `'tag'`, `'type'`, `'kind'`, or any string
- **Type guards** — per-member guards that narrow the union, plus a `memberOfUnion` guard
- **Pattern matching** — exhaustive `match`, widened `matchW`, partial `matchOr`, and curried `matcher`/`matcherW` variants
- **Union return types** — constructors return the full union type (e.g. `Maybe<A>`), forcing pattern matching for safe access

## Quick Start

```ts
import type { MkData, TaggedLambda1 } from 'tagged-ts'
import { mkTaggedUnion } from 'tagged-ts'

// 1. Define your union type
type Nothing = { readonly tag: 'Nothing' }
type Just<A> = { readonly tag: 'Just'; readonly value: A }
type Maybe<A> = Just<A> | Nothing

// 2. Define a type lambda — this tells tagged-ts how your union relates
//    to its type parameters so it can generate correctly typed constructors
//    and pattern matching functions.
//
//    `this['A']` is a slot that gets filled in when constructors are called.
//    `MkData` auto-generates a mapping from each tag to its union member.
interface MaybeLambda extends TaggedLambda1 {
  readonly type: Maybe<this['A']>
  readonly data: MkData<this['type']>
}

// 3. Generate the tagged union
//    true  = has fields beyond the tag (generates a function constructor)
//    false = tag only (generates a constant value)
const Maybe = mkTaggedUnion<MaybeLambda>({ Just: true, Nothing: false })
```

### Usage

```ts
// Constructors — return the full union type, not the specific member,
// so you're forced to pattern match to access the contents
const j = Maybe.Just({ value: 42 })  // Maybe<number>
const n = Maybe.Nothing               // Maybe<never>

// Type guards — narrow the union to a specific member
if (Maybe.is.Just(j)) {
  console.log(j.value) // narrowed to Just<number>
}
Maybe.is.memberOfUnion(j) // true
Maybe.is.memberOfUnion({ other: 'thing' }) // false

// Pattern matching — exhaustive, all cases must return the same type
Maybe.match(j, {
  Just: x => x.value,
  Nothing: _x => 0,
}) // 42
```

## API

### `mkTaggedUnion<F>(members)`

Generates constructors, guards, and match functions for a tagged union. Uses `'tag'` as the discriminant key.

`F` is a type lambda interface that you define (see [Quick Start](#quick-start)). `members` is an object mapping each tag to `true` (has fields, generates a function) or `false` (tag-only, generates a constant).

```ts
const Maybe = mkTaggedUnion<MaybeLambda>({ Just: true, Nothing: false })

Maybe.Just({ value: 42 })  // function constructor
Maybe.Nothing               // constant value
Maybe.is.Just(x)            // type guard
Maybe.match(x, { ... })     // pattern matching
```

### `mkTaggedUnionCustom<F>()(discriminant, members)`

Same as `mkTaggedUnion`, but lets you choose a custom discriminant key instead of `'tag'`. Uses a double-call pattern (`()()`) so TypeScript can infer the key type separately from the lambda.

```ts
type Increment = { readonly type: 'Increment'; readonly amount: number }
type Reset = { readonly type: 'Reset' }
type CounterAction = Increment | Reset

interface CounterActionLambda extends TaggedLambda0 {
  readonly type: CounterAction
  readonly data: MkData<this['type'], 'type'>  // pass 'type' as the discriminant key
}

const CounterAction = mkTaggedUnionCustom<CounterActionLambda>()('type', {
  Increment: true,
  Reset: false,
})

CounterAction.Increment({ amount: 1 }) // CounterAction
CounterAction.Reset                     // CounterAction
```

### Match Variants

All examples below assume `Maybe` from the [Quick Start](#quick-start) and:

```ts
const value: Maybe<number> = Maybe.Just({ value: 42 })
```

#### `match(value, handlers)` — Exhaustive match

All cases must be handled. All handlers must return the same type.

```ts
Maybe.match(value, {
  Just: x => x.value,
  Nothing: _x => 0,
}) // 42
```

#### `matchW(value, handlers)` — Widened return type

Like `match`, but each handler can return a different type. The result type is the union of all handler return types. (The `W` stands for "widen".)

```ts
Maybe.matchW(value, {
  Just: x => x.value,     // number
  Nothing: _x => 'none',  // string
}) // number | string
```

#### `matchOr(value, handlers, otherwise)` — Partial match with default

Only handle the cases you care about. Unmatched cases fall through to `otherwise`.

```ts
Maybe.matchOr(
  value,
  { Just: x => x.value },
  _otherwise => 0,         // called for Nothing (and any other unhandled case)
) // 42
```

#### `matcher(handlers)` — Curried match

Returns a reusable matching function. Takes the value last, making it useful in pipelines and function composition.

The type parameters are `<A, B>` where `A` is the type parameter of the union and `B` is the return type. These must be provided explicitly because TypeScript can't infer them from the handlers alone.

```ts
const extractValue = Maybe.matcher<number, number>({
  Just: x => x.value,
  Nothing: _x => 0,
})

extractValue(Maybe.Just({ value: 42 })) // 42
extractValue(Maybe.Nothing)              // 0
```

#### `matcherW(handlers)` — Curried widened match

Like `matcher`, but each handler can return a different type.

```ts
const describe = Maybe.matcherW<number, number | string>({
  Just: x => x.value,      // number
  Nothing: _x => 'empty',  // string
})

describe(Maybe.Just({ value: 42 })) // number | string
```

### Type Guards

Each generated union has an `is` namespace with a guard for every member, plus a `memberOfUnion` guard that checks if any tag matches.

```ts
const x: Maybe<number> = Maybe.Just({ value: 42 })

// Per-member guards — narrow the union to a specific member
if (Maybe.is.Just(x)) {
  x.value // x is narrowed to Just<number>
}

if (Maybe.is.Nothing(x)) {
  // x is narrowed to Nothing
}

// Union membership guard — checks if a value has a valid tag
Maybe.is.memberOfUnion(x)                // true
Maybe.is.memberOfUnion({ tag: 'Just' })  // true (has a matching tag)
Maybe.is.memberOfUnion({ foo: 'bar' })   // false (no 'tag' field)
```

### MemberSpec

The boolean object passed to `mkTaggedUnion` / `mkTaggedUnionCustom` is constrained by the `MemberSpec` type:

- `true` = the member has fields beyond the discriminant key (generates a function constructor)
- `false` = the member has only the discriminant key (generates a constant value)

TypeScript enforces the correct mapping at the type level. You'll get a type error if you mark a member with extra fields as `false` or a tag-only member as `true`.

## Higher Arities

tagged-ts supports union types with 0 to 4 type parameters. Use the `TaggedLambda` interface that matches your union's number of type parameters:

| Lambda | Type params | Slots | Example |
|--------|-------------|-------|---------|
| `TaggedLambda0` | 0 | — | `CounterAction` |
| `TaggedLambda1` | 1 | `A` | `Maybe<A>` |
| `TaggedLambda2` | 2 | `E`, `A` | `Result<E, A>` |
| `TaggedLambda3` | 3 | `R`, `E`, `A` | `Reader<R, E, A>` |
| `TaggedLambda4` | 4 | `S`, `R`, `E`, `A` | `Stream<S, R, E, A>` |

The slot names (`A`, `E`, `R`, `S`) are conventions — `A` for the main value, `E` for errors, `R` for environment/resources, `S` for state — but you can use them however you like. They're just named positions.

### Arity-2 Example: `Result<E, A>`

```ts
import type { MkData, TaggedLambda2 } from 'tagged-ts'
import { mkTaggedUnion } from 'tagged-ts'

type Failure<E> = { readonly tag: 'Failure'; readonly error: E }
type Success<A> = { readonly tag: 'Success'; readonly value: A }
type Result<E, A> = Success<A> | Failure<E>

interface ResultLambda extends TaggedLambda2 {
  readonly type: Result<this['E'], this['A']>
  readonly data: MkData<this['type']>
}

const Result = mkTaggedUnion<ResultLambda>({ Success: true, Failure: true })

// Each constructor only constrains the type params it uses.
// The other params default to `unknown`.
Result.Success({ value: 42 })     // Result<unknown, number>
Result.Failure({ error: 'oops' }) // Result<string, unknown>

// Pattern matching resolves everything
Result.match(Result.Success({ value: 42 }), {
  Success: x => x.value,
  Failure: x => x.error,
}) // number | string — use matchW if you want this, or match for a single type
```

### Arity-4 Example: `Stream<S, R, E, A>`

```ts
import type { MkData, TaggedLambda4 } from 'tagged-ts'
import { mkTaggedUnion } from 'tagged-ts'

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

Stream.Emit({ state: 0, value: 'hello' })  // Stream<number, unknown, unknown, string>
Stream.Done                                  // Stream<never, never, never, never>

Stream.match(Stream.Acquire({ resource: 'db' }), {
  Emit: x => `emit: ${x.value}`,
  Fail: x => `fail: ${x.error}`,
  Done: _x => 'done',
  Acquire: x => `acquire: ${x.resource}`,
}) // string
```

## How It Works

TypeScript doesn't natively support higher-kinded types (i.e., types that are themselves generic, like "a union that takes a type parameter"). tagged-ts works around this using **type lambdas** — interfaces that carry type parameter slots and compute the full union type from them.

When you write:

```ts
interface MaybeLambda extends TaggedLambda1 {
  readonly type: Maybe<this['A']>
  readonly data: MkData<this['type']>
}
```

You're defining a type-level function: "given a type `A`, produce `Maybe<A>` and its corresponding data constructor map." The `this['A']` slot acts as a deferred type parameter that gets filled in when constructors are called or match functions are used.

**`MkData<T, DK>`** automatically generates a record mapping each discriminant value to its corresponding union member using `Extract` and mapped types. For `Maybe<A>`, it produces `{ Nothing: Nothing; Just: Just<A> }`. This eliminates the need to manually define a separate data map.

**At runtime**, `mkTaggedUnion` reads the boolean member spec and generates:
- **Constructors**: functions (for `true`) that spread the input and add the tag, or frozen singleton objects (for `false`)
- **Type guards**: functions that check the discriminant field
- **Pattern matching**: functions that dispatch on the tag to the appropriate handler

## License

MIT
