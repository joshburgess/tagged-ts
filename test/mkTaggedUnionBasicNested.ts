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

const Result = mkTaggedUnionBasic<ResultNestedURI>()({
  SuccessNested: __,
  FailureNested: __,
})

describe('mkTaggedUnion', () => {
  it('properly generates the right API', () => {
    const hasSuccessConstructor = 'SuccessNested' in Result
    assert.strictEqual(hasSuccessConstructor, true)

    const hasFailureConstructor = 'FailureNested' in Result
    assert.strictEqual(hasFailureConstructor, true)

    const hasIsNamespace = 'is' in Result
    assert.strictEqual(hasIsNamespace, true)

    const hasSuccessTypeGuard = 'SuccessNested' in Result.is
    assert.strictEqual(hasSuccessTypeGuard, true)

    const hasFailureTypeGuard = 'FailureNested' in Result.is
    assert.strictEqual(hasFailureTypeGuard, true)

    const hasMemberOfUnionTypeGuard = 'memberOfUnion' in Result.is
    assert.strictEqual(hasMemberOfUnionTypeGuard, true)
  })

  it('has correct constructors', () => {
    const strSuccess = Result.SuccessNested({ value: { nested: 'OK' } })
    assert.deepStrictEqual(strSuccess, {
      tag: 'SuccessNested',
      value: { nested: 'OK' },
    })

    const numFailure = Result.FailureNested({ error: { nested: 404 } })
    assert.deepStrictEqual(numFailure, {
      tag: 'FailureNested',
      error: { nested: 404 },
    })
  })

  it('has correct guards', () => {
    const strSuccess = Result.SuccessNested({ value: { nested: 'OK' } })
    const numFailure = Result.FailureNested({ error: { nested: 500 } })

    const isSuccessTrue = Result.is.SuccessNested(strSuccess)
    const isSuccessFalse = Result.is.SuccessNested(numFailure)
    assert.strictEqual(isSuccessTrue, true)
    assert.strictEqual(isSuccessFalse, false)

    const isFailureTrue = Result.is.FailureNested(numFailure)
    const isFailureFalse = Result.is.FailureNested(strSuccess)
    assert.strictEqual(isFailureTrue, true)
    assert.strictEqual(isFailureFalse, false)

    const isMemberOfUnionTrueA = Result.is.memberOfUnion(numFailure)
    const isMemberOfUnionTrueB = Result.is.memberOfUnion(strSuccess)
    const isMemberOfUnionFalse = Result.is.memberOfUnion({
      unknown: 'unknown',
    })
    const isMemberOfUnionFalseWithCorrectDiscriminantKey = Result.is.memberOfUnion(
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
    const strSuccess = Result.SuccessNested<number, string>({
      value: { nested: 'OK' },
    })
    const numFailure = Result.FailureNested<number, string>({
      error: { nested: 500 },
    })

    const successIdentity = Result.match(strSuccess, {
      SuccessNested: x => x as ResultNested<number, string>,
      FailureNested: x => x as ResultNested<number, string>,
    })
    assert.deepStrictEqual(successIdentity, {
      tag: 'SuccessNested',
      value: { nested: 'OK' },
    })

    const successTag = Result.match(strSuccess, {
      SuccessNested: x => x.tag,
      FailureNested: x => x.tag,
    })
    assert.strictEqual(successTag, 'SuccessNested')

    const successValue = Result.match(strSuccess, {
      SuccessNested: x => x.value.nested,
      FailureNested: x => 'failed',
    })
    assert.strictEqual(successValue, 'OK')

    const failureIdentity = Result.match(numFailure, {
      SuccessNested: x => x as ResultNested<number, string>,
      FailureNested: x => x as ResultNested<number, string>,
    })
    assert.deepStrictEqual(failureIdentity, {
      tag: 'FailureNested',
      error: { nested: 500 },
    })

    const failureTag = Result.match(numFailure, {
      SuccessNested: x => x.tag,
      FailureNested: x => x.tag,
    })
    assert.strictEqual(failureTag, 'FailureNested')

    const failureValue = Result.match(numFailure, {
      SuccessNested: x => x.value.nested,
      FailureNested: x => 'failed',
    })
    assert.strictEqual(failureValue, 'failed')
  })
})
