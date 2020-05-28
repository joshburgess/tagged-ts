# tagged-ts

A tagged unions code generation library for *discriminating* tastes

## Installation

Install with `npm install tagged-ts` or `yarn add tagged-ts`

## Key Features

### 1. Works with  **polymorphic type constructors**

As far as I'm aware, this is currently the only TypeScript code generation library of this kind that fully supports working with union types using generics.

This means you can generate constructors, guards, a function simulating pattern matching, etc. for types like

```ts
type Maybe<A> = Just<A> | Nothing
```

and

```ts
type Result<E, A> = Failure<E> | Success<A>
```

without specializing the generic type params upon generation.

The generated utility functions will automatically have roughly the same type signatures that you'd write if you were defining them manually.

This means less boilerplate & less repetition in your codebase.

### 2. Supports modeling nullary data constructors as constants

Most libraries of this kind represent nullary data constructors, those which take no arguments, as thunks, functions which take no arguments and return the type of the tagged union. This isn't the end of the world, but these libraries use thunks instead of constants only because it's much easier to generate thunks, and it requires less run-time information.

However, most libraries offering hand written sum types model nullary constructors as constants, because this is both more convenient and more similar to what you find in languages that feature tagged unions as a native feature, like Haskell, PureScript, Elm, ReasonML/OCaml, F#, etc....

I think using constants is more ideal, and `tagged-ts` allows you to.

### 3. Configurable

While many people are happy with a one-size-fits-all approach for libraries like this, others desire more configurability. `tagged-ts` offers a few sensible default functions to select from as well as a more configurable function for customization.

Quick notes on each of the available generation functions:

- `mkTaggedUnion`

  - The default, go-to generation function provided by the library
  - Discriminant key: `'tag'`
  - Nullary constructors mode: `'constant'`
  - Use `mkTaggedUnionBasic` instead if you're okay with nullary constructors being functions instead of constants and/or you desire less boilerplate

- `mkTaggedUnionBasic`

  - An alternate version of `mkTaggedUnion` which represents nullary constructors as functions (thunks) instead of constants, requiring less boilerplate
  - Discriminant key: `'tag'`
  - Nullary constructors mode: `'thunk'`

- `mkTaggedUnionRedux`

  - A generation function preconfigured to the right defaults for working with Redux-style actions & action creators
  - Discriminant key: `'type'`
  - Nullary constructors mode: `'thunk'`

- `mkTaggedUnionCustom`

  - The most configurable version of this function offered by the library, most useful to those who don't mind passing in a config each time & want maximum flexibility
  - Discriminant key: Whatever string you want to use (Configurable)
  - Nullary constructors mode: `'constant' | 'thunk'` (Configurable)

## How It Works

Fully supporting polymorphic type constructors and correctly propagating the generic type params through all layers of the code generation without losing type information is difficult. In fact, I don't think it's possible to support sum types that take more than a single type param using the conventional techniques employed by other tagged unions libraries.

The trick to making it work is taking a page out of the [`fp-ts`](https://github.com/gcanti/fp-ts) playbook and using type-level maps and "Declaration Merging" (Module Augmentation & Interface Merging) to our advantage. Declaration Merging: [https://www.typescriptlang.org/docs/handbook/declaration-merging.html](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)

In `fp-ts`, the modification of type-level maps is used to facilitate a sort of type system hack that allows TypeScript to model higher kinded types & higher kinded polymorphism. For those familiar with ReasonML/OCaml, this technique is very similar to the approach using "open"/extensible GADTs outlined in the ["Lightweight higher-kinded polymorphism"](https://www.cl.cam.ac.uk/~jdy22/papers/lightweight-higher-kinded-polymorphism.pdf) paper.

In `tagged-ts`, the type-level maps represent a mapping from a unique identifier, a string or symbol, to a type constructor specification, referred to as a `Spec` in the source code. This allows us to correctly plumb generics through all the internal machinery of the library. There are 5 type-level maps in total, one for each Kind:

```ts
/**
 * A type-level Map for nullary type constructors,
 *
 * or, in other words, those of kind: `*`
 *
 * @since 0.0.1
 */
export interface TypeConstructorRegistry0 {}

/**
 * A type-level Map for type constructors taking 1 type param,
 *
 * or, in other words, those of kind: `* -> *`
 *
 * @since 0.0.1
 */
export interface TypeConstructorRegistry1<A> {}

/**
 * A type-level Map for type constructors taking 2 type params,
 *
 * or, in other words, those of kind: `* -> * -> *`
 *
 * @since 0.0.1
 */
export interface TypeConstructorRegistry2<E, A> {}

/**
 * A type-level Map for type constructors taking 3 type params,
 *
 * or, in other words, those of kind: `* -> * -> * -> *`
 *
 * @since 0.0.1
 */
export interface TypeConstructorRegistry3<R, E, A> {}

/**
 * A type-level Map for type constructors taking 4 type params,
 *
 * or, in other words, those of kind: `* -> * -> * -> * -> *`
 *
 * @since 0.0.1
 */
export interface TypeConstructorRegistry4<S, R, E, A> {}

/**
 * A union of all type constructor registries
 *
 * @since 0.0.1
 */
export type TypeConstructorRegistry =
  | TypeConstructorRegistry0
  | TypeConstructorRegistry1<unknown>
  | TypeConstructorRegistry2<unknown, unknown>
  | TypeConstructorRegistry3<unknown, unknown, unknown>
  | TypeConstructorRegistry4<unknown, unknown, unknown, unknown>
```

We use declaration merging to add new type constructor `Specs` to the appropriate `TypeConstructorRegistry` type-level map.

Here's an example of what constructing the `Spec` for `Maybe<A>` and adding it to `TypeConstructorRegistry1<A>`  would look like:

```ts
import { TypeConstructorRegistry1 } from 'tagged-ts/lib/Registry'

type Nothing = { readonly tag: 'Nothing' }
type Just<A> = {
  readonly tag: 'Just'
  readonly value: A
}
type Maybe<A> = Just<A> | Nothing

interface MaybeSpec<A> {
  readonly type: Maybe<A>
  readonly data: {
    readonly Just: Just<A>
    readonly Nothing: Nothing
  }
}

declare module 'tagged-ts/lib/Registry' {
  interface TypeConstructorRegistry1<A> {
    readonly Maybe: MaybeSpec<A>
  }
}
```

Alternatively, instead of writing the `Spec` by hand, we can construct the `Spec` using the `MkTypeConstructorSpec` type-level utility, which will not allow you to make a mistake.

```ts
import { MkTypeConstructorSpec } from 'tagged-ts/lib/Registry'

type MaybeSpec<A> = MkTypeConstructorSpec<
  // gets assigned to the `type` field of the spec
  Maybe<A>,
  // used to ensure the correct types are being passed in the next type param
  'tag',
  // gets assigned to the `data` field of the spec
  {
    readonly Just: Just<A>
    readonly Nothing: Nothing
  }
>
```

After adding an entry to the appropriate registry, we can use the generation functions.

Example of using the default `mkTaggedUnion`:

```ts
import { __, mkTaggedUnion } from 'tagged-ts'

// `__` is used as a general purpose placeholder for when keys are needed at
// run-time, but values are not
export const Maybe = mkTaggedUnion<'Maybe'>()({
  Just: { tag: __, value: __ },
  Nothing: { tag: __ },
})

// annotation required because Maybe.Nothing could be assigned to any Maybe<A>
const numMayA: Maybe<number> = Maybe.Nothing

// const numMayB: Maybe<number>
const numMayB = Maybe.Just({ value: 0 })

// Maybe.Just inference before called
// (property) Just: <A>(fields: {
//     readonly value: A;
// }) => Maybe<A>

// Maybe.Just inference after given value
// (property) Just: <number>(fields: {
//     readonly value: number;
// }) => Maybe<number>
```

Instead, we could use the more configurable `mkTaggedCustom`. Example:

```ts
import { __, mkTaggedUnionCustom, thunk } from 'tagged-ts'
import { TypeConstructorRegistry1 } from 'tagged-ts/lib/Registry'

// using '__TYPE__' as the discriminant key now
type Nope = { readonly __TYPE__: 'Nope' }
type Yup<A> = {
  readonly __TYPE__: 'Yup'
  readonly value: A
}
type Perhaps<A> = Yup<A> | Nope

type PerhapsSpec<A> = MkTypeConstructorSpec<
  Perhaps<A>,
  '__TYPE__',
  {
    readonly Yup: Yup<A>
    readonly Nope: Nope
  }
>

declare module 'tagged-ts/lib/Registry' {
  interface TypeConstructorRegistry1<A> {
    readonly Perhaps: PerhapsSpec<A>
  }
}

// configure discriminant key & nullary constructors mode
const customConfig = {
  discriminantKey: '__TYPE__',
  nullaryConstructorsMode: thunk // or just 'thunk' written manually,
} as const

// less boilerplate run-time information is needed in 'thunk' mode
export const Perhaps = mkTaggedUnionCustom<'Perhaps'>()(customConfig, {
  Yup: __,
  Nope: __,
})

// nullary constructors are thunks now
// perhapsA: Perhaps<string>
const perhapsA = Perhaps.Nope<string>()

// perhapsB: Perhaps<string>
const perhapsB = Perhaps.Yup({ value: 'indeed' })
```

Examples of using the other functions generated for you:

```ts
// Using the `match` function:
// const transformed: { result: number }
const transformed = Perhaps.match(perhapsB, {
  Nope: () => ({ result: 0 }),
  Yup: ({ value }) => ({ result: value.length }),
})

// Using type guards:
// const yes: boolean
const yes = Perhaps.is.Nope(perhapsA)
// const no: boolean
const no = Perhaps.is.Yup(perhapsA)
// const no: boolean
const alsoNo = Perhaps.is.memberOfUnion({ somethingElse: 'unknown' })
```

## Generated Docs

Like the `fp-ts` ecosystem libraries, this library is using [`doc-ts`](https://github.com/gcanti/docs-ts) to generate documentation from JSDoc comments in the source code. These generated docs are not currently being hosted anywhere, but they are availble in the `docs` directory. I may host them somewhere in the future.

Generated docs:

- [Main API](https://github.com/joshburgess/tagged-ts/blob/master/docs/modules/index.ts.md)
- [Registry API](https://github.com/joshburgess/tagged-ts/blob/master/docs/modules/Registry.ts.md)

## Coming Soon

Better documentation and more features are coming soon.
