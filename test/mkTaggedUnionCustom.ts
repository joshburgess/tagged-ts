import * as assert from 'assert'
import { __, mkTaggedUnionCustom, thunk } from '../src'
import { MkTypeConstructorSpec } from '../src/Registry'

type Nope = { readonly __Kind: 'Nope' }
type Yup<A> = {
  readonly __Kind: 'Yup'
  readonly value: A
}
type Perhaps<A> = Yup<A> | Nope

type PerhapsSpec<A> = MkTypeConstructorSpec<
  Perhaps<A>,
  '__Kind',
  {
    readonly Yup: Yup<A>
    readonly Nope: Nope
  }
>

const perhapsURI = 'Perhaps'
type PerhapsURI = typeof perhapsURI

declare module '../src/Registry' {
  interface TypeConstructorRegistry1<A> {
    readonly [perhapsURI]: PerhapsSpec<A>
  }
}

const customConfig = {
  discriminantKey: '__Kind',
  nullaryConstructorsMode: thunk,
} as const

const Perhaps = mkTaggedUnionCustom<PerhapsURI>()(customConfig, {
  Yup: __,
  Nope: __,
})

describe('mkTaggedUnion', () => {
  it('properly generates the right API', () => {
    const hasYupConstructor = 'Yup' in Perhaps
    assert.strictEqual(hasYupConstructor, true)

    const hasNopeConstructor = 'Nope' in Perhaps
    assert.strictEqual(hasNopeConstructor, true)

    const hasIsNamespace = 'is' in Perhaps
    assert.strictEqual(hasIsNamespace, true)

    const hasYupTypeGuard = 'Yup' in Perhaps.is
    assert.strictEqual(hasYupTypeGuard, true)

    const hasNopeTypeGuard = 'Nope' in Perhaps.is
    assert.strictEqual(hasNopeTypeGuard, true)

    const hasMemberOfUnionTypeGuard = 'memberOfUnion' in Perhaps.is
    assert.strictEqual(hasMemberOfUnionTypeGuard, true)
  })

  it('has correct constructors', () => {
    const numYup = Perhaps.Yup({ value: 0 })
    assert.deepStrictEqual(numYup, { __Kind: 'Yup', value: 0 })

    const numNope = Perhaps.Nope<number>()
    assert.deepStrictEqual(numNope, { __Kind: 'Nope' })
  })

  it('has correct guards', () => {
    const numYup = Perhaps.Yup({ value: 0 })
    const numNope = Perhaps.Nope<number>()

    const isYupTrue = Perhaps.is.Yup(numYup)
    const isYupFalse = Perhaps.is.Yup(numNope)
    assert.strictEqual(isYupTrue, true)
    assert.strictEqual(isYupFalse, false)

    const isNopeTrue = Perhaps.is.Nope(numNope)
    const isNopeFalse = Perhaps.is.Nope(numYup)
    assert.strictEqual(isNopeTrue, true)
    assert.strictEqual(isNopeFalse, false)

    const isMemberOfUnionTrueA = Perhaps.is.memberOfUnion(numNope)
    const isMemberOfUnionTrueB = Perhaps.is.memberOfUnion(numYup)
    const isMemberOfUnionFalse = Perhaps.is.memberOfUnion({
      unknown: 'unknown',
    })
    const isMemberOfUnionFalseWithCorrectDiscriminantKey = Perhaps.is.memberOfUnion(
      {
        __Kind: 'unknown',
      },
    )
    assert.strictEqual(isMemberOfUnionTrueA, true)
    assert.strictEqual(isMemberOfUnionTrueB, true)
    assert.strictEqual(isMemberOfUnionFalse, false)
    assert.strictEqual(isMemberOfUnionFalseWithCorrectDiscriminantKey, false)
  })

  it('has correct match function', () => {
    const numYup = Perhaps.Yup({ value: 99 })
    const numNope = Perhaps.Nope<number>()

    const yupIdentity = Perhaps.match(numYup, {
      Yup: x => x as Perhaps<number>,
      Nope: x => x as Perhaps<number>,
    })
    assert.deepStrictEqual(yupIdentity, { __Kind: 'Yup', value: 99 })

    const yupTag = Perhaps.match(numYup, {
      Yup: x => x.__Kind,
      Nope: x => x.__Kind,
    })
    assert.strictEqual(yupTag, 'Yup')

    const yupValue = Perhaps.match(numYup, {
      Yup: x => x.value,
      Nope: x => 0,
    })
    assert.strictEqual(yupValue, 99)

    const nopeIdentity = Perhaps.match(numNope, {
      Yup: x => x as Perhaps<number>,
      Nope: x => x as Perhaps<number>,
    })
    assert.deepStrictEqual(nopeIdentity, { __Kind: 'Nope' })

    const nopeTag = Perhaps.match(numNope, {
      Yup: x => x.__Kind,
      Nope: x => x.__Kind,
    })
    assert.strictEqual(nopeTag, 'Nope')

    const nopeValue = Perhaps.match(numNope, {
      Yup: x => x.value,
      Nope: x => 0,
    })
    assert.strictEqual(nopeValue, 0)
  })
})
