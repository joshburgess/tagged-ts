# tagged-ts

Type-safe tagged unions with generated constructors, guards, and pattern matching for TypeScript.

## Installation

```sh
npm install tagged-ts
```

## Features

- **Two constructor styles** — choose between named (object) and positional (tuple) constructors via separate import paths
- **Polymorphic type constructors** — works with generic union types like `Maybe<A>`, `Result<E, A>`, and beyond (up to 4 type parameters)
- **Nullary constructors as constants** — `Maybe.Nothing` is a plain value, not a thunk
- **Custom discriminant keys** — use `'tag'`, `'type'`, `'kind'`, or any string
- **Type guards** — per-member guards that narrow the union, plus a `memberOfUnion` guard
- **Pattern matching** — exhaustive `match`, widened `matchW`, partial `matchOr`, and curried `matcher`/`matcherW` variants
- **Union return types** — constructors return the full union type (e.g. `Maybe<A>`), forcing pattern matching for safe access

## Modules

tagged-ts provides two constructor styles as separate submodules. Pick the one that fits your codebase — they share the same guards, match functions, and type machinery under the hood.

| Import path | Constructor style | Example |
|---|---|---|
| `tagged-ts/named` | Object with named fields | `Maybe.Just({ value: 42 })` |
| `tagged-ts/positional` | Positional arguments | `Maybe.Just(42)` |

The root `tagged-ts` module exports only shared types (type lambdas, `MkData`, etc.). To create tagged unions, import from one of the submodules.

## Quick Start: Named Constructors

```ts
import type { MkData, TaggedLambda1 } from 'tagged-ts/named'
import { mkTaggedUnion } from 'tagged-ts/named'

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

Maybe.Just({ value: 42 })  // Maybe<number>
Maybe.Nothing               // Maybe<never>
```

## Quick Start: Positional Constructors

```ts
import type { MkData, TaggedLambda1 } from 'tagged-ts/positional'
import { mkTaggedUnion } from 'tagged-ts/positional'

// 1 & 2. Same union type and type lambda as above
type Nothing = { readonly tag: 'Nothing' }
type Just<A> = { readonly tag: 'Just'; readonly value: A }
type Maybe<A> = Just<A> | Nothing

interface MaybeLambda extends TaggedLambda1 {
  readonly type: Maybe<this['A']>
  readonly data: MkData<this['type']>
}

// 3. Generate the tagged union
//    ['field1', 'field2', ...] = positional arg order (generates a function constructor)
//    [] = tag only (generates a constant value)
//
//    Uses a double-call pattern: mkTaggedUnion<F>()(spec)
//    The second call takes the spec as `const` so TypeScript can infer
//    the field name tuples and use them to type the positional args.
const Maybe = mkTaggedUnion<MaybeLambda>()({ Just: ['value'], Nothing: [] })

Maybe.Just(42)   // Maybe<number>
Maybe.Nothing    // Maybe<never>
```

## Named vs. Positional: Tradeoffs

Both styles produce identical runtime values — a `Just` created with `{ value: 42 }` and one created with `(42)` are the same `{ tag: 'Just', value: 42 }` object. The difference is purely in the constructor call syntax.

### Named constructors (`tagged-ts/named`)

**Pros:**
- Self-documenting at call sites — field names are visible: `Result.Failure({ error: 'not found' })`
- No ambiguity with multi-field members — `Stream.Emit({ state: s, value: v })` makes it clear which arg is which
- Order-independent — fields can be passed in any order
- Simpler member spec — just `true`/`false` booleans
- Simpler `mkTaggedUnion` call — single call: `mkTaggedUnion<F>(spec)`

**Cons:**
- More verbose — especially for single-field members like `Just({ value: 42 })` vs `Just(42)`
- Extra braces and field names at every call site

### Positional constructors (`tagged-ts/positional`)

**Pros:**
- Concise — `Just(42)`, `Failure('not found')`, mirrors how constructors work in ML-family languages
- Natural for single-field members — reads like a regular function call
- Familiar to users of Haskell, OCaml, Rust, etc.

**Cons:**
- Relies on argument order — with multi-field members, you need to know the field order: `Stream.Emit('s', 42)` — is that `(state, value)` or `(value, state)`?
- Spec must list field names — arrays like `['state', 'value']` that define the positional order
- Double-call pattern — `mkTaggedUnion<F>()(spec)` is needed so TypeScript can infer the field name tuples as `const`

### Which should I use?

- If your union members mostly have **one field each**, positional is cleaner: `Just(42)`, `Left('err')`, `Right(ok)`
- If your members have **multiple fields**, named is safer and more readable: `Emit({ state: s, value: v })`
- If you want the simplest possible setup, named avoids the double-call pattern and field name arrays
- If you want ML/Haskell-style ergonomics, positional gets you closer

You can use different styles in different parts of your codebase — the runtime values are interchangeable.

## Usage

All examples below use the named style. The positional style works identically for guards, matching, and all other operations — only the constructor calls differ.

```ts
import type { MkData, TaggedLambda1 } from 'tagged-ts/named'
import { mkTaggedUnion } from 'tagged-ts/named'

type Nothing = { readonly tag: 'Nothing' }
type Just<A> = { readonly tag: 'Just'; readonly value: A }
type Maybe<A> = Just<A> | Nothing

interface MaybeLambda extends TaggedLambda1 {
  readonly type: Maybe<this['A']>
  readonly data: MkData<this['type']>
}

const Maybe = mkTaggedUnion<MaybeLambda>({ Just: true, Nothing: false })
```

### Constructors

Constructors return the full union type, not the specific member, so you're forced to pattern match to access the contents.

```ts
const j = Maybe.Just({ value: 42 })  // Maybe<number>
const n = Maybe.Nothing               // Maybe<never>
```

### Type Guards

Each generated union has an `is` namespace with a guard for every member, plus a `memberOfUnion` guard that checks if any tag matches.

```ts
// Per-member guards — narrow the union to a specific member
if (Maybe.is.Just(j)) {
  console.log(j.value) // narrowed to Just<number>
}

if (Maybe.is.Nothing(j)) {
  // narrowed to Nothing
}

// Union membership guard — checks if a value has a valid tag
Maybe.is.memberOfUnion(j)                // true
Maybe.is.memberOfUnion({ tag: 'Just' })  // true (has a matching tag)
Maybe.is.memberOfUnion({ foo: 'bar' })   // false (no 'tag' field)
```

### Pattern Matching

#### `match(value, handlers)` — Exhaustive match

All cases must be handled. All handlers must return the same type.

```ts
Maybe.match(j, {
  Just: x => x.value,
  Nothing: _x => 0,
}) // 42
```

#### `matchW(value, handlers)` — Widened return type

Like `match`, but each handler can return a different type. The result type is the union of all handler return types. (The `W` stands for "widen".)

```ts
Maybe.matchW(j, {
  Just: x => x.value,     // number
  Nothing: _x => 'none',  // string
}) // number | string
```

#### `matchOr(value, handlers, otherwise)` — Partial match with default

Only handle the cases you care about. Unmatched cases fall through to `otherwise`.

```ts
Maybe.matchOr(
  j,
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

## API

### `tagged-ts/named`

#### `mkTaggedUnion<F>(members)`

Generates constructors, guards, and match functions for a tagged union using named (object-style) constructors. Uses `'tag'` as the discriminant key.

`F` is a type lambda interface. `members` is an object mapping each tag to `true` (has fields, generates a function taking a single object) or `false` (tag-only, generates a constant).

```ts
const Maybe = mkTaggedUnion<MaybeLambda>({ Just: true, Nothing: false })

Maybe.Just({ value: 42 })  // function constructor
Maybe.Nothing               // constant value
Maybe.is.Just(x)            // type guard
Maybe.match(x, { ... })     // pattern matching
```

#### `mkTaggedUnionCustom<F>()(discriminant, members)`

Same as `mkTaggedUnion`, but lets you choose a custom discriminant key instead of `'tag'`. Uses a double-call pattern so TypeScript can infer the key type separately from the lambda.

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

CounterAction.Increment({ amount: 1 }) // CounterAction
CounterAction.Reset                     // CounterAction
```

### `tagged-ts/positional`

#### `mkTaggedUnion<F>()(members)`

Generates constructors, guards, and match functions for a tagged union using positional constructors. Uses `'tag'` as the discriminant key.

`F` is a type lambda interface. `members` is an object mapping each tag to an array of field names (defining the positional argument order) or `[]` (tag-only, generates a constant).

Uses a double-call pattern — `mkTaggedUnion<F>()(spec)` — so TypeScript can infer the field name tuples as literal types.

```ts
const Maybe = mkTaggedUnion<MaybeLambda>()({ Just: ['value'], Nothing: [] })

Maybe.Just(42)              // function constructor (positional)
Maybe.Nothing               // constant value
Maybe.is.Just(x)            // type guard
Maybe.match(x, { ... })     // pattern matching
```

#### `mkTaggedUnionCustom<F>()(discriminant, members)`

Same as `mkTaggedUnion`, but with a custom discriminant key.

```ts
const CounterAction = mkTaggedUnionCustom<CounterActionLambda>()('type', {
  Increment: ['amount'],
  Reset: [],
})

CounterAction.Increment(1) // CounterAction
CounterAction.Reset         // CounterAction
```

### MemberSpec

The spec object passed to `mkTaggedUnion` / `mkTaggedUnionCustom` is constrained by the `MemberSpec` type, which differs between modules:

| Module | Non-nullary | Nullary | Example |
|---|---|---|---|
| `tagged-ts/named` | `true` | `false` | `{ Just: true, Nothing: false }` |
| `tagged-ts/positional` | `['field1', 'field2']` | `[]` | `{ Just: ['value'], Nothing: [] }` |

TypeScript enforces the correct mapping at the type level. You'll get a type error if you mark a member incorrectly (e.g., marking a member with extra fields as `false`/`[]` or a tag-only member as `true`/`['nonexistent']`).

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
import type { MkData, TaggedLambda2 } from 'tagged-ts/named'
import { mkTaggedUnion } from 'tagged-ts/named'

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

Or with positional constructors:

```ts
import type { MkData, TaggedLambda2 } from 'tagged-ts/positional'
import { mkTaggedUnion } from 'tagged-ts/positional'

// Same type definitions and lambda...

const Result = mkTaggedUnion<ResultLambda>()({ Success: ['value'], Failure: ['error'] })

Result.Success(42)      // Result<unknown, number>
Result.Failure('oops')  // Result<string, unknown>
```

### Arity-4 Example: `Stream<S, R, E, A>`

```ts
import type { MkData, TaggedLambda4 } from 'tagged-ts/named'
import { mkTaggedUnion } from 'tagged-ts/named'

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

Or with positional constructors:

```ts
import type { MkData, TaggedLambda4 } from 'tagged-ts/positional'
import { mkTaggedUnion } from 'tagged-ts/positional'

// Same type definitions and lambda...

const Stream = mkTaggedUnion<StreamLambda>()({
  Emit: ['state', 'value'],
  Fail: ['error'],
  Done: [],
  Acquire: ['resource'],
})

Stream.Emit(0, 'hello')  // Stream<number, unknown, unknown, string>
Stream.Done               // Stream<never, never, never, never>
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

**At runtime**, `mkTaggedUnion` reads the member spec and generates:
- **Constructors**: functions that build tagged objects (from a single named-fields object or from positional args, depending on the module), or frozen singleton objects for nullary members
- **Type guards**: functions that check the discriminant field
- **Pattern matching**: functions that dispatch on the tag to the appropriate handler

Both modules share the same guard and match implementation internally — only the constructor-building logic differs.

## License

[MIT](./LICENSE)
