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

### 1. Define your union type

```ts
type Nothing = { readonly tag: 'Nothing' }
type Just<A> = { readonly tag: 'Just'; readonly value: A }
type Maybe<A> = Just<A> | Nothing
```

### 2. Define a type lambda

```ts
import type { MkData, TaggedLambda1 } from 'tagged-ts'

interface MaybeLambda extends TaggedLambda1 {
  readonly type: Maybe<this['A']>
  readonly data: MkData<this['type']>
}
```

### 3. Generate the tagged union

```ts
import { mkTaggedUnion } from 'tagged-ts'

const Maybe = mkTaggedUnion<MaybeLambda>({ Just: true, Nothing: false })
```

The boolean values indicate whether each member has fields beyond the discriminant (`true` = function constructor, `false` = constant value).

### 4. Use it

```ts
// Constructors
const j = Maybe.Just({ value: 42 })  // Maybe<number>
const n = Maybe.Nothing               // Maybe<never>

// Type guards
if (Maybe.is.Just(j)) {
  console.log(j.value) // narrowed to Just<number>
}
Maybe.is.memberOfUnion(j) // true
Maybe.is.memberOfUnion({ other: 'thing' }) // false

// Pattern matching
Maybe.match(j, {
  Just: x => x.value,
  Nothing: _x => 0,
}) // 42
```

## API

### `mkTaggedUnion<F>(members)`

Generates constructors, guards, and match functions for a tagged union using `'tag'` as the discriminant key.

```ts
const Maybe = mkTaggedUnion<MaybeLambda>({ Just: true, Nothing: false })
```

### `mkTaggedUnionCustom<F>()(discriminant, members)`

Same as `mkTaggedUnion`, but with a custom discriminant key. Uses a double-call pattern so TypeScript can infer the key type.

```ts
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
```

### Match Variants

#### `match(value, handlers)` — Exhaustive pattern match

All cases must be handled. All handlers must return the same type.

```ts
Maybe.match(value, {
  Just: x => x.value,
  Nothing: _x => 0,
})
```

#### `matchW(value, handlers)` — Widened return type

Like `match`, but each handler can return a different type. The result is the union of all handler return types.

```ts
Maybe.matchW(value, {
  Just: x => x.value,     // number
  Nothing: _x => 'none',  // string
}) // number | string
```

#### `matchOr(value, handlers, otherwise)` — Partial match with default

Only provide handlers for the cases you care about. Unmatched cases fall through to the default.

```ts
Maybe.matchOr(
  value,
  { Just: x => x.value },
  _otherwise => 0,
)
```

#### `matcher(handlers)` — Curried data-last match

Returns a reusable function. Designed for use in pipelines / function composition.

```ts
const extractValue = Maybe.matcher<number, number>({
  Just: x => x.value,
  Nothing: _x => 0,
})

// Use in a pipeline
extractValue(Maybe.Just({ value: 42 })) // 42
```

#### `matcherW(handlers)` — Curried data-last widened match

Like `matcher`, but each handler can return a different type.

### Type Guards

Each generated union has an `is` namespace containing:

- **Per-member guards** — `Maybe.is.Just(x)`, `Maybe.is.Nothing(x)` — narrow the type
- **`memberOfUnion(x)`** — checks whether a value belongs to the union at all

### MemberSpec

The boolean object passed to `mkTaggedUnion` / `mkTaggedUnionCustom` is constrained by the `MemberSpec` type:

- `true` = the member has fields beyond the discriminant key (generates a function constructor)
- `false` = the member has only the discriminant key (generates a constant value)

TypeScript enforces the correct mapping — you can't mark a member with extra fields as `false` or a nullary member as `true`.

## Higher Arities

tagged-ts supports union types with 0 to 4 type parameters via `TaggedLambda0` through `TaggedLambda4`:

| Lambda | Kind | Type params | Slots |
|--------|------|-------------|-------|
| `TaggedLambda0` | `*` | 0 | — |
| `TaggedLambda1` | `* -> *` | 1 | `A` |
| `TaggedLambda2` | `* -> * -> *` | 2 | `E`, `A` |
| `TaggedLambda3` | `* -> * -> * -> *` | 3 | `R`, `E`, `A` |
| `TaggedLambda4` | `* -> * -> * -> * -> *` | 4 | `S`, `R`, `E`, `A` |

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

Result.Success({ value: 42 })     // Result<unknown, number>
Result.Failure({ error: 'oops' }) // Result<string, unknown>
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
```

## How It Works

tagged-ts uses **type lambdas** to simulate higher-kinded types in TypeScript. Instead of a global registry with declaration merging, you define a local interface that extends `TaggedLambda1` (or the appropriate arity) and overrides `type` and `data` using `this`-based type parameter slots.

`MkData<T, DK>` auto-generates the data constructor map from your union type — it uses `Extract` and mapped types to produce a record mapping each discriminant value to its corresponding union member. This eliminates the need to manually write the data map.

At runtime, `mkTaggedUnion` and `mkTaggedUnionCustom` read the boolean member spec to generate constructors (functions for `true`, frozen objects for `false`), type guards, and pattern matching functions. The types ensure full type safety across all of these.

## License

MIT
