import * as assert from 'assert'
import { __, mkTaggedUnion } from '../src'
import { MkTypeConstructorSpec } from '../src/Registry'

type NothingNested = { readonly tag: 'NothingNested' }
type JustNested<A> = {
  readonly tag: 'JustNested'
  readonly value: { readonly nested: A }
}
type MaybeNested<A> = JustNested<A> | NothingNested

type MaybeSpecNested<A> = MkTypeConstructorSpec<
  MaybeNested<A>,
  'tag',
  {
    readonly JustNested: JustNested<A>
    readonly NothingNested: NothingNested
  }
>

const maybeNestedURI = 'MaybeNested'
type MaybeNestedURI = typeof maybeNestedURI

declare module '../src/Registry' {
  interface TypeConstructorRegistry1<A> {
    readonly [maybeNestedURI]: MaybeSpecNested<A>
  }
}

const MaybeNested = mkTaggedUnion<MaybeNestedURI>()({
  JustNested: { tag: __, value: __ },
  NothingNested: { tag: __ },
})

describe('mkTaggedUnion', () => {
  it('properly generates the right API', () => {
    const hasJustConstructor = 'JustNested' in MaybeNested
    assert.strictEqual(hasJustConstructor, true)

    const hasNothingConstructor = 'NothingNested' in MaybeNested
    assert.strictEqual(hasNothingConstructor, true)

    const hasIsNamespace = 'is' in MaybeNested
    assert.strictEqual(hasIsNamespace, true)

    const hasJustTypeGuard = 'JustNested' in MaybeNested.is
    assert.strictEqual(hasJustTypeGuard, true)

    const hasNothingTypeGuard = 'NothingNested' in MaybeNested.is
    assert.strictEqual(hasNothingTypeGuard, true)

    const hasMemberOfUnionTypeGuard = 'memberOfUnion' in MaybeNested.is
    assert.strictEqual(hasMemberOfUnionTypeGuard, true)
  })

  it('has correct constructors', () => {
    const numJust = MaybeNested.JustNested({ value: { nested: 0 } })
    assert.deepStrictEqual(numJust, { tag: 'JustNested', value: { nested: 0 } })

    const numNothing: MaybeNested<number> = MaybeNested.NothingNested
    assert.deepStrictEqual(numNothing, { tag: 'NothingNested' })
  })

  it('has correct guards', () => {
    const numJust = MaybeNested.JustNested({ value: { nested: 0 } })
    const numNothing: MaybeNested<number> = MaybeNested.NothingNested

    const isJustTrue = MaybeNested.is.JustNested(numJust)
    const isJustFalse = MaybeNested.is.JustNested(numNothing)
    assert.strictEqual(isJustTrue, true)
    assert.strictEqual(isJustFalse, false)

    const isNothingTrue = MaybeNested.is.NothingNested(numNothing)
    const isNothingFalse = MaybeNested.is.NothingNested(numJust)
    assert.strictEqual(isNothingTrue, true)
    assert.strictEqual(isNothingFalse, false)

    const isMemberOfUnionTrueA = MaybeNested.is.memberOfUnion(numNothing)
    const isMemberOfUnionTrueB = MaybeNested.is.memberOfUnion(numJust)
    const isMemberOfUnionFalse = MaybeNested.is.memberOfUnion({
      unknown: 'unknown',
    })
    const isMemberOfUnionFalseWithCorrectDiscriminantKey = MaybeNested.is.memberOfUnion(
      {
        tag: 'unknown',
      },
    )
    assert.strictEqual(isMemberOfUnionTrueA, true)
    assert.strictEqual(isMemberOfUnionTrueB, true)
    assert.strictEqual(isMemberOfUnionFalse, false)
    assert.strictEqual(isMemberOfUnionFalseWithCorrectDiscriminantKey, false)
  })

  it('has correct match function', () => {
    const numJust = MaybeNested.JustNested({ value: { nested: 99 } })
    const numNothing: MaybeNested<number> = MaybeNested.NothingNested

    const justIdentity = MaybeNested.match(numJust, {
      JustNested: x => x as MaybeNested<number>,
      NothingNested: x => x as MaybeNested<number>,
    })
    assert.deepStrictEqual(justIdentity, {
      tag: 'JustNested',
      value: { nested: 99 },
    })

    const justTag = MaybeNested.match(numJust, {
      JustNested: x => x.tag,
      NothingNested: x => x.tag,
    })
    assert.strictEqual(justTag, 'JustNested')

    const justValue = MaybeNested.match(numJust, {
      JustNested: x => x.value.nested,
      NothingNested: x => 0,
    })
    assert.strictEqual(justValue, 99)

    const nothingIdentity = MaybeNested.match(numNothing, {
      JustNested: x => x as MaybeNested<number>,
      NothingNested: x => x as MaybeNested<number>,
    })
    assert.deepStrictEqual(nothingIdentity, { tag: 'NothingNested' })

    const nothingTag = MaybeNested.match(numNothing, {
      JustNested: x => x.tag,
      NothingNested: x => x.tag,
    })
    assert.strictEqual(nothingTag, 'NothingNested')

    const nothingValue = MaybeNested.match(numNothing, {
      JustNested: x => x.value.nested,
      NothingNested: x => 0,
    })
    assert.strictEqual(nothingValue, 0)
  })
})
