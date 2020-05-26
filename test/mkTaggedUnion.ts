import * as assert from 'assert'
import { __, mkTaggedUnion } from '../src'
import { MkTypeConstructorSpec } from '../src/Registry'

type Nothing = { readonly tag: 'Nothing' }
type Just<A> = {
  readonly tag: 'Just'
  readonly value: A
}
type Maybe<A> = Just<A> | Nothing

type MaybeSpec<A> = MkTypeConstructorSpec<
  Maybe<A>,
  'tag',
  {
    readonly Just: Just<A>
    readonly Nothing: Nothing
  }
>

const maybeURI = 'Maybe'
type MaybeURI = typeof maybeURI

declare module '../src/Registry' {
  interface TypeConstructorRegistry1<A> {
    readonly [maybeURI]: MaybeSpec<A>
  }
}

const Maybe = mkTaggedUnion<MaybeURI>()({
  Just: { tag: __, value: __ },
  Nothing: { tag: __ },
})

describe('mkTaggedUnion', () => {
  it('properly generates the right API', () => {
    const hasJustConstructor = 'Just' in Maybe
    assert.strictEqual(hasJustConstructor, true)

    const hasNothingConstructor = 'Nothing' in Maybe
    assert.strictEqual(hasNothingConstructor, true)

    const hasIsNamespace = 'is' in Maybe
    assert.strictEqual(hasIsNamespace, true)

    const hasJustTypeGuard = 'Just' in Maybe.is
    assert.strictEqual(hasJustTypeGuard, true)

    const hasNothingTypeGuard = 'Nothing' in Maybe.is
    assert.strictEqual(hasNothingTypeGuard, true)

    const hasMemberOfUnionTypeGuard = 'memberOfUnion' in Maybe.is
    assert.strictEqual(hasMemberOfUnionTypeGuard, true)
  })

  it('has correct constructors', () => {
    const numJust = Maybe.Just({ value: 0 })
    assert.deepStrictEqual(numJust, { tag: 'Just', value: 0 })

    const numNothing: Maybe<number> = Maybe.Nothing
    assert.deepStrictEqual(numNothing, { tag: 'Nothing' })
  })

  it('has correct guards', () => {
    const numJust = Maybe.Just({ value: 0 })
    const numNothing: Maybe<number> = Maybe.Nothing

    const isJustTrue = Maybe.is.Just(numJust)
    const isJustFalse = Maybe.is.Just(numNothing)
    assert.strictEqual(isJustTrue, true)
    assert.strictEqual(isJustFalse, false)

    const isNothingTrue = Maybe.is.Nothing(numNothing)
    const isNothingFalse = Maybe.is.Nothing(numJust)
    assert.strictEqual(isNothingTrue, true)
    assert.strictEqual(isNothingFalse, false)

    const isMemberOfUnionTrueA = Maybe.is.memberOfUnion(numNothing)
    const isMemberOfUnionTrueB = Maybe.is.memberOfUnion(numJust)
    const isMemberOfUnionFalse = Maybe.is.memberOfUnion({ unknown: 'unknown' })
    const isMemberOfUnionFalseWithCorrectDiscriminantKey = Maybe.is.memberOfUnion(
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
    const numJust = Maybe.Just({ value: 99 })
    const numNothing: Maybe<number> = Maybe.Nothing

    const justIdentity = Maybe.match(numJust, {
      Just: x => x as Maybe<number>,
      Nothing: x => x as Maybe<number>,
    })
    assert.deepStrictEqual(justIdentity, { tag: 'Just', value: 99 })

    const justTag = Maybe.match(numJust, {
      Just: x => x.tag,
      Nothing: x => x.tag,
    })
    assert.strictEqual(justTag, 'Just')

    const justValue = Maybe.match(numJust, {
      Just: x => x.value,
      Nothing: x => 0,
    })
    assert.strictEqual(justValue, 99)

    const nothingIdentity = Maybe.match(numNothing, {
      Just: x => x as Maybe<number>,
      Nothing: x => x as Maybe<number>,
    })
    assert.deepStrictEqual(nothingIdentity, { tag: 'Nothing' })

    const nothingTag = Maybe.match(numNothing, {
      Just: x => x.tag,
      Nothing: x => x.tag,
    })
    assert.strictEqual(nothingTag, 'Nothing')

    const nothingValue = Maybe.match(numNothing, {
      Just: x => x.value,
      Nothing: x => 0,
    })
    assert.strictEqual(nothingValue, 0)
  })
})
