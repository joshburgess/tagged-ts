---
title: index.ts
nav_order: 1
parent: Modules
---

# index overview

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [Constructors (type alias)](#constructors-type-alias)
- [Guards (type alias)](#guards-type-alias)
- [Match (type alias)](#match-type-alias)
- [NullaryConstructorsMode (type alias)](#nullaryconstructorsmode-type-alias)
- [NullaryConstructorsMode_Constant (type alias)](#nullaryconstructorsmode_constant-type-alias)
- [NullaryConstructorsMode_Thunk (type alias)](#nullaryconstructorsmode_thunk-type-alias)
- [\_\_](#__)
- [constant](#constant)
- [mkConstructors](#mkconstructors)
- [mkGuards](#mkguards)
- [mkMatch](#mkmatch)
- [mkTaggedUnion](#mktaggedunion)
- [mkTaggedUnionBasic](#mktaggedunionbasic)
- [mkTaggedUnionCustom](#mktaggedunioncustom)
- [mkTaggedUnionRedux](#mktaggedunionredux)
- [thunk](#thunk)

---

# Constructors (type alias)

A type-level representation of a tagged union's generated data constructors

**Signature**

```ts
export type Constructors<
  TypeURI extends KeyOfTypeConstructorRegistry,
  T extends GetType<TypeURI>,
  DiscriminantKey extends StringKeyOf<T>,
  Mode extends NullaryConstructorsMode
> = {
  [MemberURI in DiscriminantValue<T, DiscriminantKey>]: {} extends Omit<
    DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>,
    DiscriminantKey
  > // has no fields other than the discriminant field
    ? TypeURI extends keyof TypeConstructorRegistry0
      ? Mode extends NullaryConstructorsMode_Constant
        ? TypeConstructorRegistry0[TypeURI][SpecType]
        : () => TypeConstructorRegistry0[TypeURI][SpecType]
      : TypeURI extends keyof TypeConstructorRegistry1<unknown>
      ? Mode extends NullaryConstructorsMode_Constant
        ? TypeConstructorRegistry1<never>[TypeURI][SpecType]
        : <A>() => TypeConstructorRegistry1<A>[TypeURI][SpecType]
      : TypeURI extends keyof TypeConstructorRegistry2<unknown, unknown>
      ? Mode extends NullaryConstructorsMode_Constant
        ? TypeConstructorRegistry2<never, never>[TypeURI][SpecType]
        : <E, A>() => TypeConstructorRegistry2<E, A>[TypeURI][SpecType]
      : TypeURI extends keyof TypeConstructorRegistry3<unknown, unknown, unknown>
      ? Mode extends NullaryConstructorsMode_Constant
        ? TypeConstructorRegistry3<never, never, never>[TypeURI][SpecType]
        : <R, E, A>() => TypeConstructorRegistry3<R, E, A>[TypeURI][SpecType]
      : TypeURI extends keyof TypeConstructorRegistry4<unknown, unknown, unknown, unknown>
      ? Mode extends NullaryConstructorsMode_Constant
        ? TypeConstructorRegistry4<never, never, never, never>[TypeURI][SpecType]
        : <S, R, E, A>() => TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecType]
      : never // has extra fields
    : TypeURI extends keyof TypeConstructorRegistry0
    ? (
        fields: {
          [Field in keyof Omit<DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>, DiscriminantKey>]: Omit<
            DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>,
            DiscriminantKey
          >[Field]
        }
      ) => TypeConstructorRegistry0[TypeURI][SpecType]
    : TypeURI extends keyof TypeConstructorRegistry1<unknown>
    ? <A>(
        fields: {
          [Field in keyof Omit<
            DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>,
            DiscriminantKey
          >]: unknown extends Omit<DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>, DiscriminantKey>[Field] // Could just be A
            ? MemberURI extends keyof TypeConstructorRegistry1<A>[TypeURI][SpecData]
              ? TypeConstructorRegistry1<A>[TypeURI][SpecData][MemberURI][Field &
                  keyof TypeConstructorRegistry1<A>[TypeURI][SpecData][MemberURI]] // `& keyof ...` hack, because stupid TS
              : never
            : Omit<DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>, DiscriminantKey>[Field]
        }
      ) => TypeConstructorRegistry1<A>[TypeURI][SpecType]
    : TypeURI extends keyof TypeConstructorRegistry2<unknown, unknown>
    ? <E, A>(
        fields: {
          [Field in keyof Omit<
            DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>,
            DiscriminantKey
          >]: unknown extends Omit<DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>, DiscriminantKey>[Field]
            ? MemberURI extends keyof TypeConstructorRegistry2<E, A>[TypeURI][SpecData]
              ? TypeConstructorRegistry2<E, A>[TypeURI][SpecData][MemberURI][Field &
                  keyof TypeConstructorRegistry2<E, A>[TypeURI][SpecData][MemberURI]] // `& keyof ...` hack, because stupid TS
              : never
            : Omit<DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>, DiscriminantKey>[Field]
        }
      ) => TypeConstructorRegistry2<E, A>[TypeURI][SpecType]
    : TypeURI extends keyof TypeConstructorRegistry3<unknown, unknown, unknown>
    ? <R, E, A>(
        fields: {
          [Field in keyof Omit<
            DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>,
            DiscriminantKey
          >]: unknown extends Omit<DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>, DiscriminantKey>[Field]
            ? MemberURI extends keyof TypeConstructorRegistry3<R, E, A>[TypeURI][SpecData]
              ? TypeConstructorRegistry3<R, E, A>[TypeURI][SpecData][MemberURI][Field &
                  keyof TypeConstructorRegistry3<R, E, A>[TypeURI][SpecData][MemberURI]] // `& keyof ...` hack, because stupid TS
              : never
            : Omit<DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>, DiscriminantKey>[Field]
        }
      ) => TypeConstructorRegistry3<R, E, A>[TypeURI][SpecType]
    : TypeURI extends keyof TypeConstructorRegistry4<unknown, unknown, unknown, unknown>
    ? <S, R, E, A>(
        fields: {
          [Field in keyof Omit<
            DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>,
            DiscriminantKey
          >]: unknown extends Omit<DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>, DiscriminantKey>[Field]
            ? MemberURI extends keyof TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecData]
              ? TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecData][MemberURI][Field &
                  keyof TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecData][MemberURI]] // `& keyof ...` hack, because stupid TS
              : never
            : Omit<DiscriminatedUnionMember<T, DiscriminantKey, MemberURI>, DiscriminantKey>[Field]
        }
      ) => TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecType]
    : never
}
```

Added in v0.0.1

# Guards (type alias)

A type-level representation of a tagged union's generated type guard predicates

**Signature**

```ts
export type Guards<
  TypeURI extends KeyOfTypeConstructorRegistry,
  T extends GetType<TypeURI>,
  DiscriminantKey extends StringKeyOf<T>
> = TypeURI extends keyof TypeConstructorRegistry0
  ? {
      [K in DiscriminantValue<T, DiscriminantKey>]: (
        x: TypeConstructorRegistry0[TypeURI][SpecType]
      ) => x is SelectUnionMember<DiscriminantKey, K, TypeConstructorRegistry0[TypeURI][SpecType]>
    } & {
      readonly memberOfUnion: <U extends unknown>(
        action: TypeConstructorRegistry0[TypeURI][SpecType] | U
      ) => action is TypeConstructorRegistry0[TypeURI][SpecType]
    }
  : TypeURI extends keyof TypeConstructorRegistry1<unknown>
  ? {
      [K in DiscriminantValue<T, DiscriminantKey>]: <A>(
        x: TypeConstructorRegistry1<A>[TypeURI][SpecType]
      ) => x is SelectUnionMember<DiscriminantKey, K, TypeConstructorRegistry1<A>[TypeURI][SpecType]>
    } & {
      readonly memberOfUnion: <A, U extends unknown>(
        action: TypeConstructorRegistry1<A>[TypeURI][SpecType] | U
      ) => action is TypeConstructorRegistry1<A>[TypeURI][SpecType]
    }
  : TypeURI extends keyof TypeConstructorRegistry2<unknown, unknown>
  ? {
      [K in DiscriminantValue<T, DiscriminantKey>]: <E, A>(
        x: TypeConstructorRegistry2<E, A>[TypeURI][SpecType]
      ) => x is SelectUnionMember<DiscriminantKey, K, TypeConstructorRegistry2<E, A>[TypeURI][SpecType]>
    } & {
      readonly memberOfUnion: <E, A, U extends unknown>(
        action: TypeConstructorRegistry2<E, A>[TypeURI][SpecType] | U
      ) => action is TypeConstructorRegistry2<E, A>[TypeURI][SpecType]
    }
  : TypeURI extends keyof TypeConstructorRegistry3<unknown, unknown, unknown>
  ? {
      [K in DiscriminantValue<T, DiscriminantKey>]: <R, E, A>(
        x: TypeConstructorRegistry3<R, E, A>[TypeURI][SpecType]
      ) => x is SelectUnionMember<DiscriminantKey, K, TypeConstructorRegistry3<R, E, A>[TypeURI][SpecType]>
    } & {
      readonly memberOfUnion: <R, E, A, U extends unknown>(
        action: TypeConstructorRegistry3<R, E, A>[TypeURI][SpecType] | U
      ) => action is TypeConstructorRegistry3<R, E, A>[TypeURI][SpecType]
    }
  : TypeURI extends keyof TypeConstructorRegistry4<unknown, unknown, unknown, unknown>
  ? {
      [K in DiscriminantValue<T, DiscriminantKey>]: <S, R, E, A>(
        x: TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecType]
      ) => x is SelectUnionMember<DiscriminantKey, K, TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecType]>
    } & {
      readonly memberOfUnion: <S, R, E, A, U extends unknown>(
        action: TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecType] | U
      ) => action is TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecType]
    }
  : never
```

Added in v0.0.1

# Match (type alias)

A type-level representation of a tagged union's generated `match` function

**Signature**

```ts
export type Match<
  TypeURI extends KeyOfTypeConstructorRegistry,
  T extends GetType<TypeURI>,
  DiscriminantKey extends StringKeyOf<T>
> = TypeURI extends keyof TypeConstructorRegistry0
  ? <B>(
      a: TypeConstructorRegistry0[TypeURI][SpecType],
      caseHandlers: {
        [K in DiscriminantValue<T, DiscriminantKey>]: (
          x: TypeConstructorRegistry0[TypeURI][SpecData][K & keyof TypeConstructorRegistry0[TypeURI][SpecData]]
        ) => B
      }
    ) => B
  : TypeURI extends keyof TypeConstructorRegistry1<unknown>
  ? <A, B>(
      a: TypeConstructorRegistry1<A>[TypeURI][SpecType],
      caseHandlers: {
        [K in DiscriminantValue<T, DiscriminantKey>]: (
          x: TypeConstructorRegistry1<A>[TypeURI][SpecData][K & keyof TypeConstructorRegistry1<A>[TypeURI][SpecData]]
        ) => B
      }
    ) => B
  : TypeURI extends keyof TypeConstructorRegistry2<unknown, unknown>
  ? <E, A, B>(
      a: TypeConstructorRegistry2<E, A>[TypeURI][SpecType],
      caseHandlers: {
        [K in DiscriminantValue<T, DiscriminantKey>]: (
          x: TypeConstructorRegistry2<E, A>[TypeURI][SpecData][K &
            keyof TypeConstructorRegistry2<E, A>[TypeURI][SpecData]]
        ) => B
      }
    ) => B
  : TypeURI extends keyof TypeConstructorRegistry3<unknown, unknown, unknown>
  ? <R, E, A, B>(
      a: TypeConstructorRegistry3<R, E, A>[TypeURI][SpecType],
      caseHandlers: {
        [K in DiscriminantValue<T, DiscriminantKey>]: (
          x: TypeConstructorRegistry3<R, E, A>[TypeURI][SpecData][K &
            keyof TypeConstructorRegistry3<R, E, A>[TypeURI][SpecData]]
        ) => B
      }
    ) => B
  : TypeURI extends keyof TypeConstructorRegistry4<unknown, unknown, unknown, unknown>
  ? <S, R, E, A, B>(
      caseHandlers: {
        [K in DiscriminantValue<T, DiscriminantKey>]: (
          x: TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecData][K &
            keyof TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecData]]
        ) => B
      }
    ) => (a: TypeConstructorRegistry4<S, R, E, A>[TypeURI][SpecType]) => B
  : never
```

Added in v0.0.1

# NullaryConstructorsMode (type alias)

A union of the valid options used to set the nullary constructors mode

**Signature**

```ts
export type NullaryConstructorsMode = NullaryConstructorsMode_Constant | NullaryConstructorsMode_Thunk
```

Added in v0.0.1

# NullaryConstructorsMode_Constant (type alias)

The `NullaryConstructorsMode` setting for 'constant' nullary constructors

**Signature**

```ts
export type NullaryConstructorsMode_Constant = typeof constant
```

Added in v0.0.1

# NullaryConstructorsMode_Thunk (type alias)

The `NullaryConstructorsMode` setting for 'thunk' nullary constructors

**Signature**

```ts
export type NullaryConstructorsMode_Thunk = typeof thunk
```

Added in v0.0.1

# \_\_

A value of type `__`, a Nominal type equivalent to the run-time type `void`

Used as a placeholder when interacting with the library's generation functions

**Signature**

```ts
export declare const __: __
```

Added in v0.0.1

# constant

Used as configuration to set the `NullaryConstructorsMode` to 'constant'

**Signature**

```ts
export declare const constant: 'constant'
```

Added in v0.0.1

# mkConstructors

Generates data constructors for the members of a tagged union

**Signature**

```ts
export declare const mkConstructors: <TypeURI extends never>() => <
  T extends GetSpec<TypeURI>['type'],
  DiscriminantKey extends StringKeyOf<T>,
  Mode extends NullaryConstructorsMode
>(
  config: { readonly discriminantKey: DiscriminantKey; readonly nullaryConstructorsMode: Mode },
  memberTagsRecord: Mode extends 'constant'
    ? {
        [K in DiscriminantValue<T, DiscriminantKey>]: {
          [Fields in keyof GetSpec<TypeURI>['data'][K & keyof GetSpec<TypeURI>['data']]]: __
        }
      }
    : { [K in DiscriminantValue<T, DiscriminantKey>]: __ }
) => Constructors<TypeURI, T, DiscriminantKey, Mode>
```

Added in v0.0.1

# mkGuards

Generates type guards for the members of a tagged union

**Signature**

```ts
export declare const mkGuards: <TypeURI extends never>() => <
  T extends GetSpec<TypeURI>['type'],
  DiscriminantKey extends StringKeyOf<T>
>(
  config: { readonly discriminantKey: DiscriminantKey },
  memberTagsRecord:
    | {
        [K in DiscriminantValue<T, DiscriminantKey>]: {
          [Fields in keyof GetSpec<TypeURI>['data'][K & keyof GetSpec<TypeURI>['data']]]: __
        }
      }
    | { [K in DiscriminantValue<T, DiscriminantKey>]: __ }
) => Guards<TypeURI, T, DiscriminantKey>
```

Added in v0.0.1

# mkMatch

Generates a `match` function that simulates pattern matching

NOTE: Some libraries call this `fold` or `cata` because of the similarity
to a "generalized fold"

**Signature**

```ts
export declare const mkMatch: <TypeURI extends never>() => <
  T extends GetSpec<TypeURI>['type'],
  DiscriminantKey extends StringKeyOf<T>
>(config: {
  readonly discriminantKey: DiscriminantKey
}) => Match<TypeURI, T, DiscriminantKey>
```

Added in v0.0.1

# mkTaggedUnion

Generates useful functions for working with a tagged union

The default, go-to generation function provided by the library

Discriminant key: `'tag'`

Nullary constructors mode: `'constant'`

Use `mkTaggedUnionBasic` instead if you're okay with nullary constructors being
functions instead of constants and/or you desire less boilerplate

**Signature**

```ts
export declare const mkTaggedUnion: <TypeURI extends never>() => <
  T extends GetSpec<TypeURI>['type'],
  DiscriminantKey extends 'tag' & keyof T
>(
  memberTagsRecord: {
    [K in DiscriminantValue<T, DiscriminantKey>]: {
      [Fields in keyof GetSpec<TypeURI>['data'][K & keyof GetSpec<TypeURI>['data']]]: __
    }
  }
) => Constructors<TypeURI, T, DiscriminantKey, 'constant'> & {
  is: Guards<TypeURI, T, DiscriminantKey>
  match: Match<TypeURI, T, DiscriminantKey>
}
```

Added in v0.0.1

# mkTaggedUnionBasic

Generates useful functions for working with a tagged union

An alternate version of `mkTaggedUnion` which represents nullary constructors
as functions (thunks) instead of constants, requiring less boilerplate

Discriminant key: `'tag'`

Nullary constructors mode: `'thunk'`

**Signature**

```ts
export declare const mkTaggedUnionBasic: <TypeURI extends never>() => <
  T extends GetSpec<TypeURI>['type'],
  DiscriminantKey extends 'tag' & keyof T
>(
  memberTagsRecord: { [K in DiscriminantValue<T, DiscriminantKey>]: __ }
) => Constructors<TypeURI, T, DiscriminantKey, 'thunk'> & {
  is: Guards<TypeURI, T, DiscriminantKey>
  match: Match<TypeURI, T, DiscriminantKey>
}
```

Added in v0.0.1

# mkTaggedUnionCustom

Generates useful functions for working with a tagged union

The most configurable version of this function offered by the library, most
useful to those who don't mind passing in a config each time & want maximum
flexibility

**Signature**

```ts
export declare const mkTaggedUnionCustom: <TypeURI extends never>() => <
  T extends GetSpec<TypeURI>['type'],
  DiscriminantKey extends StringKeyOf<T>,
  Mode extends NullaryConstructorsMode
>(
  config: { readonly discriminantKey: DiscriminantKey; readonly nullaryConstructorsMode: Mode },
  memberTagsRecord: Mode extends 'constant'
    ? {
        [K in DiscriminantValue<T, DiscriminantKey>]: {
          [Fields in keyof GetSpec<TypeURI>['data'][K & keyof GetSpec<TypeURI>['data']]]: __
        }
      }
    : { [K in DiscriminantValue<T, DiscriminantKey>]: __ }
) => Constructors<TypeURI, T, DiscriminantKey, Mode> & {
  is: Guards<TypeURI, T, DiscriminantKey>
  match: Match<TypeURI, T, DiscriminantKey>
}
```

Added in v0.0.1

# mkTaggedUnionRedux

Generates useful functions for working with a tagged union

A generation function preconfigured to the right defaults for working with
Redux-style actions & action creators

Discriminant key: `'type'`

Nullary constructors mode: `'thunk'`

**Signature**

```ts
export declare const mkTaggedUnionRedux: <TypeURI extends never>() => <
  T extends GetSpec<TypeURI>['type'],
  DiscriminantKey extends 'type' & keyof T
>(
  memberTagsRecord: { [K in DiscriminantValue<T, DiscriminantKey>]: __ }
) => Constructors<TypeURI, T, DiscriminantKey, 'thunk'> & {
  is: Guards<TypeURI, T, DiscriminantKey>
  match: Match<TypeURI, T, DiscriminantKey>
}
```

Added in v0.0.1

# thunk

Used as configuration to set the `NullaryConstructorsMode` to 'thunk'

**Signature**

```ts
export declare const thunk: 'thunk'
```

Added in v0.0.1
