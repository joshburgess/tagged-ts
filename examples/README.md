# tagged-ts examples

Runnable examples demonstrating tagged-ts. Every file is self-contained —
just run it with `tsx`:

```sh
npx tsx examples/01-maybe.ts
```

Each example is also typechecked as part of `npm run typecheck` at the
repo root, so they cannot bit-rot when the library changes.

| File                        | Demonstrates                                                   |
| --------------------------- | -------------------------------------------------------------- |
| `01-maybe.ts`               | Basic arity-1 union, named constructors, `match` / `matchW` / `matchOr`, `show`, `tags` |
| `02-result.ts`              | Arity-2 `Result<E, A>` for error handling; chaining with `matchW` |
| `03-positional-tree.ts`     | Positional constructors via a recursive `Tree<A>`; folds, traversal, recursive `show` |
| `04-state-machine.ts`       | Custom discriminant key (`state`); finite-state transitions    |
| `05-parse-and-equals.ts`    | `parse` for safely hydrating `unknown` at a boundary; `equals` for dirty-check |
| `06-property-testing.ts`    | `mkArbitrary` + fast-check for property-based tests            |

## Imports

These examples import from `../src/...` because they live inside the
repo. In your own project you would import from the published package:

```ts
import { mkTaggedUnion } from 'tagged-ts/named'
import { mkTaggedUnion } from 'tagged-ts/positional'
import { mkArbitrary } from 'tagged-ts/fast-check'
```

## Which style should I use?

- **Named** (`tagged-ts/named`) — constructors take a single object with
  named fields: `Maybe.Just({ value: 42 })`. Preferred when field names
  carry meaning. Covered in `01`, `02`, `04`, `05`, `06`.
- **Positional** (`tagged-ts/positional`) — constructors take positional
  arguments: `Tree.Node(left, value, right)`. Preferred when field names
  add no information (classic ADT cases like lists and trees). Covered
  in `03`.

Both styles share the same runtime utilities (`match`, `show`, `equals`,
`parse`, `tags`, `is.*`) and the same type-level guarantees.
