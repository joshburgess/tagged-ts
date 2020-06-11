import * as assert from 'assert'
import { __, mkTaggedUnionBasic } from '../src'
import { MkTypeConstructorSpec } from '../src/Registry'

type FailureNested<E> = {
  readonly tag: 'FailureNested'
  readonly error: { readonly nested: E }
}
type SuccessNested<A> = {
  readonly tag: 'SuccessNested'
  readonly value: { readonly nested: A }
}
type ResultNested<E, A> = SuccessNested<A> | FailureNested<E>

type ResultNestedSpec<E, A> = MkTypeConstructorSpec<
  ResultNested<E, A>,
  'tag',
  {
    readonly SuccessNested: SuccessNested<A>
    readonly FailureNested: FailureNested<E>
  }
>

const resultNestedURI = 'ResultNested'
type ResultNestedURI = typeof resultNestedURI

declare module '../src/Registry' {
  interface TypeConstructorRegistry2<E, A> {
    readonly [resultNestedURI]: ResultNestedSpec<E, A>
  }
}

const ResultNested = mkTaggedUnionBasic<ResultNestedURI>()({
  SuccessNested: __,
  FailureNested: __,
})

describe('mkTaggedUnion', () => {
  it('properly generates the right API', () => {
    const hasSuccessConstructor = 'SuccessNested' in ResultNested
    assert.strictEqual(hasSuccessConstructor, true)

    const hasFailureConstructor = 'FailureNested' in ResultNested
    assert.strictEqual(hasFailureConstructor, true)

    const hasIsNamespace = 'is' in ResultNested
    assert.strictEqual(hasIsNamespace, true)

    const hasSuccessTypeGuard = 'SuccessNested' in ResultNested.is
    assert.strictEqual(hasSuccessTypeGuard, true)

    const hasFailureTypeGuard = 'FailureNested' in ResultNested.is
    assert.strictEqual(hasFailureTypeGuard, true)

    const hasMemberOfUnionTypeGuard = 'memberOfUnion' in ResultNested.is
    assert.strictEqual(hasMemberOfUnionTypeGuard, true)
  })

  it('has correct constructors', () => {
    const strSuccess = ResultNested.SuccessNested({ value: { nested: 'OK' } })
    assert.deepStrictEqual(strSuccess, {
      tag: 'SuccessNested',
      value: { nested: 'OK' },
    })

    const numFailure = ResultNested.FailureNested({ error: { nested: 404 } })
    assert.deepStrictEqual(numFailure, {
      tag: 'FailureNested',
      error: { nested: 404 },
    })
  })

  it('has correct guards', () => {
    const strSuccess = ResultNested.SuccessNested({ value: { nested: 'OK' } })
    const numFailure = ResultNested.FailureNested({ error: { nested: 500 } })

    const isSuccessTrue = ResultNested.is.SuccessNested(strSuccess)
    const isSuccessFalse = ResultNested.is.SuccessNested(numFailure)
    assert.strictEqual(isSuccessTrue, true)
    assert.strictEqual(isSuccessFalse, false)

    const isFailureTrue = ResultNested.is.FailureNested(numFailure)
    const isFailureFalse = ResultNested.is.FailureNested(strSuccess)
    assert.strictEqual(isFailureTrue, true)
    assert.strictEqual(isFailureFalse, false)

    const isMemberOfUnionTrueA = ResultNested.is.memberOfUnion(numFailure)
    const isMemberOfUnionTrueB = ResultNested.is.memberOfUnion(strSuccess)
    const isMemberOfUnionFalse = ResultNested.is.memberOfUnion({
      unknown: 'unknown',
    })
    const isMemberOfUnionFalseWithCorrectDiscriminantKey = ResultNested.is.memberOfUnion(
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
    const strSuccess = ResultNested.SuccessNested<number, string>({
      value: { nested: 'OK' },
    })
    const numFailure = ResultNested.FailureNested<number, string>({
      error: { nested: 500 },
    })

    const successIdentity = ResultNested.match(strSuccess, {
      SuccessNested: x => x as ResultNested<number, string>,
      FailureNested: x => x as ResultNested<number, string>,
    })
    assert.deepStrictEqual(successIdentity, {
      tag: 'SuccessNested',
      value: { nested: 'OK' },
    })

    const successTag = ResultNested.match(strSuccess, {
      SuccessNested: x => x.tag,
      FailureNested: x => x.tag,
    })
    assert.strictEqual(successTag, 'SuccessNested')

    const successValue = ResultNested.match(strSuccess, {
      SuccessNested: x => x.value.nested,
      FailureNested: x => 'failed',
    })
    assert.strictEqual(successValue, 'OK')

    const failureIdentity = ResultNested.match(numFailure, {
      SuccessNested: x => x as ResultNested<number, string>,
      FailureNested: x => x as ResultNested<number, string>,
    })
    assert.deepStrictEqual(failureIdentity, {
      tag: 'FailureNested',
      error: { nested: 500 },
    })

    const failureTag = ResultNested.match(numFailure, {
      SuccessNested: x => x.tag,
      FailureNested: x => x.tag,
    })
    assert.strictEqual(failureTag, 'FailureNested')

    const failureValue = ResultNested.match(numFailure, {
      SuccessNested: x => x.value.nested,
      FailureNested: x => 'failed',
    })
    assert.strictEqual(failureValue, 'failed')
  })
})
