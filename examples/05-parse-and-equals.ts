/**
 * Example: parse + equals for form field state hydration and dirty-check.
 *
 * Run with:  npx tsx examples/05-parse-and-equals.ts
 *
 * Demonstrates the two v0.6 runtime utilities that are most useful when
 * your union crosses a boundary:
 *   - `parse`: takes `unknown` (e.g. something from localStorage, an HTTP
 *     response, or a message event) and returns `Union | undefined`,
 *     doing a shallow structural check on the discriminant only.
 *   - `equals`: cycle-safe structural equality between two values of the
 *     same union. Useful for dirty-check on form state.
 *
 * Scenario: a form field that round-trips through localStorage and gets
 * compared against its original value to decide whether to enable a
 * "Save" button.
 */

import type { MkData, TaggedLambda1 } from '../src/named'
import { mkTaggedUnion } from '../src/named'

// ---------------------------------------------------------------------------
// 1. Field state: Empty | Typing (raw) | Valid (parsed) | Invalid (reason)
// ---------------------------------------------------------------------------

type Empty = { readonly tag: 'Empty' }
type Typing = { readonly tag: 'Typing'; readonly raw: string }
type Valid<A> = {
  readonly tag: 'Valid'
  readonly raw: string
  readonly parsed: A
}
type Invalid = {
  readonly tag: 'Invalid'
  readonly raw: string
  readonly reason: string
}
type Field<A> = Empty | Typing | Valid<A> | Invalid

interface FieldLambda extends TaggedLambda1 {
  readonly type: Field<this['A']>
  readonly data: MkData<this['type']>
}

const Field = mkTaggedUnion<FieldLambda>({
  Empty: false,
  Typing: true,
  Valid: true,
  Invalid: true,
})

// ---------------------------------------------------------------------------
// 2. A fake localStorage that forgets types across the boundary
// ---------------------------------------------------------------------------

const storage = new Map<string, string>()

const save = <A>(key: string, f: Field<A>): void => {
  storage.set(key, JSON.stringify(f))
}

// `parse` only validates the discriminant shape; the `parsed` payload is
// still just `unknown` at runtime. It is up to the caller to narrow or
// revalidate any inner data. For a well-known structural shape like
// Field<number>, this is exactly the check we want at the boundary.
const load = <A>(key: string): Field<A> | undefined => {
  const raw = storage.get(key)
  if (raw === undefined) return undefined
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return undefined
  }
  return Field.parse(parsed) as Field<A> | undefined
}

// ---------------------------------------------------------------------------
// 3. Round-trip some values through storage
// ---------------------------------------------------------------------------

const initial: Field<number> = Field.Valid({ raw: '42', parsed: 42 })
save('age', initial)

const reloaded = load<number>('age')
console.log('reloaded:', reloaded && Field.show(reloaded))

// Junk input is rejected — parse returns undefined rather than throwing.
storage.set('junk', JSON.stringify({ tag: 'NotARealField', oops: true }))
console.log('junk:', load<number>('junk')) // undefined

// ---------------------------------------------------------------------------
// 4. Dirty-check with `equals`
// ---------------------------------------------------------------------------

const isDirty = <A>(previous: Field<A>, current: Field<A>): boolean =>
  !Field.equals(previous, current)

const current: Field<number> = Field.Typing({ raw: '42' })
const edited: Field<number> = Field.Typing({ raw: '100' })
const sameAsInitial: Field<number> = Field.Valid({ raw: '42', parsed: 42 })

console.log('dirty vs edited     :', isDirty(initial, edited)) // true
console.log('dirty vs current    :', isDirty(initial, current)) // true
console.log('dirty vs sameAsInit :', isDirty(initial, sameAsInitial)) // false

// ---------------------------------------------------------------------------
// 5. The full picture — Save button state
// ---------------------------------------------------------------------------

const saveButton = <A>(original: Field<A>, current: Field<A>): string => {
  if (!isDirty(original, current)) return 'Save [disabled — no changes]'
  return Field.match(current, {
    Empty: () => 'Save [disabled — empty]',
    Typing: () => 'Save [disabled — still typing]',
    Invalid: ({ reason }) => `Save [disabled — ${reason}]`,
    Valid: () => 'Save [enabled]',
  })
}

console.log(saveButton(initial, initial)) // no changes
console.log(saveButton(initial, Field.Typing({ raw: '43' }))) // still typing
console.log(
  saveButton(initial, Field.Invalid({ raw: 'abc', reason: 'not a number' })),
) // not a number
console.log(saveButton(initial, Field.Valid({ raw: '43', parsed: 43 }))) // enabled
