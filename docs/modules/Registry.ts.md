---
title: Registry.ts
nav_order: 3
parent: Modules
---

# Registry overview

Added in v0.2.0

---

<h2 class="text-delta">Table of contents</h2>

- [TypeConstructorRegistry0 (interface)](#typeconstructorregistry0-interface)
- [TypeConstructorRegistry1 (interface)](#typeconstructorregistry1-interface)
- [TypeConstructorRegistry2 (interface)](#typeconstructorregistry2-interface)
- [TypeConstructorRegistry3 (interface)](#typeconstructorregistry3-interface)
- [TypeConstructorRegistry4 (interface)](#typeconstructorregistry4-interface)
- [GetData (type alias)](#getdata-type-alias)
- [GetSpec (type alias)](#getspec-type-alias)
- [GetSpecField (type alias)](#getspecfield-type-alias)
- [GetType (type alias)](#gettype-type-alias)
- [KeyOfTypeConstructorRegistry (type alias)](#keyoftypeconstructorregistry-type-alias)
- [MkTypeConstructorSpec (type alias)](#mktypeconstructorspec-type-alias)
- [SpecData (type alias)](#specdata-type-alias)
- [SpecType (type alias)](#spectype-type-alias)
- [TypeConstructorRegistry (type alias)](#typeconstructorregistry-type-alias)

---

# TypeConstructorRegistry0 (interface)

A type-level Map for nullary type constructors,

or, in other words, those of kind: `*`

**Signature**

```ts
export interface TypeConstructorRegistry0 {}
```

Added in v0.2.0

# TypeConstructorRegistry1 (interface)

A type-level Map for type constructors taking 1 type param,

or, in other words, those of kind: `* -> *`

**Signature**

```ts
export interface TypeConstructorRegistry1<A> {}
```

Added in v0.2.0

# TypeConstructorRegistry2 (interface)

A type-level Map for type constructors taking 2 type params,

or, in other words, those of kind: `* -> * -> *`

**Signature**

```ts
export interface TypeConstructorRegistry2<E, A> {}
```

Added in v0.2.0

# TypeConstructorRegistry3 (interface)

A type-level Map for type constructors taking 3 type params,

or, in other words, those of kind: `* -> * -> * -> *`

**Signature**

```ts
export interface TypeConstructorRegistry3<R, E, A> {}
```

Added in v0.2.0

# TypeConstructorRegistry4 (interface)

A type-level Map for type constructors taking 4 type params,

or, in other words, those of kind: `* -> * -> * -> * -> *`

**Signature**

```ts
export interface TypeConstructorRegistry4<S, R, E, A> {}
```

Added in v0.2.0

# GetData (type alias)

A type-level utility that gets a the `data` portion of a type constructor
`Spec` when given a type constructor registry key

**Signature**

```ts
export type GetData<TypeURI extends KeyOfTypeConstructorRegistry> = GetSpecField<TypeURI, SpecData>
```

Added in v0.2.0

# GetSpec (type alias)

A type-level utility that gets the type constructor `Spec` associated with
a given key of an entry in one of the type constructor registries

**Signature**

```ts
export type GetSpec<TypeURI extends KeyOfTypeConstructorRegistry> = TypeURI extends keyof TypeConstructorRegistry0
  ? TypeConstructorRegistry0[TypeURI]
  : TypeURI extends keyof TypeConstructorRegistry1<unknown>
  ? TypeConstructorRegistry1<unknown>[TypeURI]
  : TypeURI extends keyof TypeConstructorRegistry2<unknown, unknown>
  ? TypeConstructorRegistry2<unknown, unknown>[TypeURI]
  : TypeURI extends keyof TypeConstructorRegistry3<unknown, unknown, unknown>
  ? TypeConstructorRegistry3<unknown, unknown, unknown>[TypeURI]
  : TypeURI extends keyof TypeConstructorRegistry4<unknown, unknown, unknown, unknown>
  ? TypeConstructorRegistry4<unknown, unknown, unknown, unknown>[TypeURI]
  : never
```

Added in v0.2.0

# GetSpecField (type alias)

A type-level utility that gets a portion of a type constructor `Spec` when
given a type constructor registry key and a `Spec` field, 'type' or 'data'

**Signature**

```ts
export type GetSpecField<TypeURI extends KeyOfTypeConstructorRegistry, SpecField extends SpecType | SpecData> = GetSpec<
  TypeURI
>[SpecField]
```

Added in v0.2.0

# GetType (type alias)

A type-level utility that gets a the `type` portion of a type constructor
`Spec` when given a type constructor registry key

**Signature**

```ts
export type GetType<TypeURI extends KeyOfTypeConstructorRegistry> = GetSpecField<TypeURI, SpecType>
```

Added in v0.2.0

# KeyOfTypeConstructorRegistry (type alias)

A union of all keys of the entries in the type constructor registries

**Signature**

```ts
export type KeyOfTypeConstructorRegistry = DistributiveKeyOf<TypeConstructorRegistry>
```

Added in v0.2.0

# MkTypeConstructorSpec (type alias)

A type-level utility that helps to construct a valid type constructor `Spec`

**Signature**

```ts
export type MkTypeConstructorSpec<
  Type extends object,
  DiscriminantKey extends StringKeyOf<Type>,
  Data extends {
    [K in DiscriminantValue<Type, DiscriminantKey>]: SelectUnionMember<
      DiscriminantKey,
      K,
      DiscriminatedUnionMember<Type, DiscriminantKey, K>
    >
  }
> = {
  readonly type: Type
  readonly data: Data
}
```

Added in v0.2.0

# SpecData (type alias)

A type-level literal string corresponding to the `data` field of a `Spec`

**Signature**

```ts
export type SpecData = 'data'
```

Added in v0.2.0

# SpecType (type alias)

A type-level literal string corresponding to the `type` field of a `Spec`

**Signature**

```ts
export type SpecType = 'type'
```

Added in v0.2.0

# TypeConstructorRegistry (type alias)

A union of all type constructor registries

**Signature**

```ts
export type TypeConstructorRegistry =
  | TypeConstructorRegistry0
  | TypeConstructorRegistry1<unknown>
  | TypeConstructorRegistry2<unknown, unknown>
  | TypeConstructorRegistry3<unknown, unknown, unknown>
  | TypeConstructorRegistry4<unknown, unknown, unknown, unknown>
```

Added in v0.2.0
