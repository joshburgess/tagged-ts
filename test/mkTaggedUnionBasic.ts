import * as assert from 'assert'
import { __, mkTaggedUnionBasic } from '../src'
import { MkTypeConstructorSpec } from '../src/Registry'

type Failure<E> = { readonly tag: 'Failure'; readonly error: E }
type Success<A> = {
  readonly tag: 'Success'
  readonly value: A
}
type Result<E, A> = Success<A> | Failure<E>

type ResultSpec<E, A> = MkTypeConstructorSpec<
  Result<E, A>,
  'tag',
  {
    readonly Success: Success<A>
    readonly Failure: Failure<E>
  }
>

const resultURI = 'Result'
type ResultURI = typeof resultURI

declare module '../src/Registry' {
  interface TypeConstructorRegistry2<E, A> {
    readonly [resultURI]: ResultSpec<E, A>
  }
}

const Result = mkTaggedUnionBasic<ResultURI>()({
  Success: __,
  Failure: __,
})

describe('mkTaggedUnion', () => {
  it('properly generates the right API', () => {
    const hasSuccessConstructor = 'Success' in Result
    assert.strictEqual(hasSuccessConstructor, true)

    const hasFailureConstructor = 'Failure' in Result
    assert.strictEqual(hasFailureConstructor, true)

    const hasIsNamespace = 'is' in Result
    assert.strictEqual(hasIsNamespace, true)

    const hasSuccessTypeGuard = 'Success' in Result.is
    assert.strictEqual(hasSuccessTypeGuard, true)

    const hasFailureTypeGuard = 'Failure' in Result.is
    assert.strictEqual(hasFailureTypeGuard, true)

    const hasMemberOfUnionTypeGuard = 'memberOfUnion' in Result.is
    assert.strictEqual(hasMemberOfUnionTypeGuard, true)
  })

  it('has correct constructors', () => {
    const strSuccess = Result.Success({ value: 'OK' })
    assert.deepStrictEqual(strSuccess, { tag: 'Success', value: 'OK' })

    const numFailure = Result.Failure({ error: 404 })
    assert.deepStrictEqual(numFailure, { tag: 'Failure', error: 404 })
  })

  it('has correct guards', () => {
    const strSuccess = Result.Success({ value: 'OK' })
    const numFailure = Result.Failure({ error: 500 })

    const isSuccessTrue = Result.is.Success(strSuccess)
    const isSuccessFalse = Result.is.Success(numFailure)
    assert.strictEqual(isSuccessTrue, true)
    assert.strictEqual(isSuccessFalse, false)

    const isFailureTrue = Result.is.Failure(numFailure)
    const isFailureFalse = Result.is.Failure(strSuccess)
    assert.strictEqual(isFailureTrue, true)
    assert.strictEqual(isFailureFalse, false)

    const isMemberOfUnionTrueA = Result.is.memberOfUnion(numFailure)
    const isMemberOfUnionTrueB = Result.is.memberOfUnion(strSuccess)
    const isMemberOfUnionFalse = Result.is.memberOfUnion({
      unknown: 'unknown',
    })
    assert.strictEqual(isMemberOfUnionTrueA, true)
    assert.strictEqual(isMemberOfUnionTrueB, true)
    assert.strictEqual(isMemberOfUnionFalse, false)
  })

  it('has correct match function', () => {
    const strSuccess = Result.Success({ value: 'OK' })
    const numFailure = Result.Failure({ error: 500 })

    const successIdentity = Result.match(strSuccess, {
      Success: x => x as Result<number, string>,
      Failure: x => x as Result<number, string>,
    })
    assert.deepStrictEqual(successIdentity, { tag: 'Success', value: 'OK' })

    const successTag = Result.match(strSuccess, {
      Success: x => x.tag,
      Failure: x => x.tag,
    })
    assert.strictEqual(successTag, 'Success')

    const successValue = Result.match(strSuccess, {
      Success: x => x.value,
      Failure: x => 'failed',
    })
    assert.strictEqual(successValue, 'OK')

    const failureIdentity = Result.match(numFailure, {
      Success: x => x as Result<number, string>,
      Failure: x => x as Result<number, string>,
    })
    assert.deepStrictEqual(failureIdentity, { tag: 'Failure', error: 500 })

    const failureTag = Result.match(numFailure, {
      Success: x => x.tag,
      Failure: x => x.tag,
    })
    assert.strictEqual(failureTag, 'Failure')

    const failureValue = Result.match(numFailure, {
      Success: x => x.value,
      Failure: x => 'failed',
    })
    assert.strictEqual(failureValue, 'failed')
  })
})
