---
title: internal/Utils.ts
nav_order: 2
parent: Modules
---

# Utils overview

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [Nominal (interface)](#nominal-interface)

---

# Nominal (interface)

An interface used to construct (simulated) Nominal types

**Signature**

```ts
export interface Nominal<Identifier extends string, A> {
  readonly _Identifier: Identifier
  readonly _Symbol: unique symbol
  readonly _A: A
}
```

Added in v0.0.1
