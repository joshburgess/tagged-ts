import * as assert from 'assert'
import { __, mkTaggedUnionRedux } from '../src'
import { MkTypeConstructorSpec } from '../src/Registry'

type GET_USERS<A> = {
  readonly type: 'GET_USERS'
  readonly meta: { readonly orgId: A }
}
type GET_EVENTS<A> = {
  readonly type: 'GET_EVENTS'
  readonly meta: { readonly orgId: A }
}
type GetResourcesForOrgActions<A> = GET_EVENTS<A> | GET_USERS<A>

type GetResourcesForOrgActionsSpec<A> = MkTypeConstructorSpec<
  GetResourcesForOrgActions<A>,
  'type',
  {
    readonly GET_EVENTS: GET_EVENTS<A>
    readonly GET_USERS: GET_USERS<A>
  }
>

const getResourcesForOrgActions = 'GetResourcesForOrgActions'
type GetResourcesForOrgActionsURI = typeof getResourcesForOrgActions

declare module '../src/Registry' {
  interface TypeConstructorRegistry1<A> {
    readonly [getResourcesForOrgActions]: GetResourcesForOrgActionsSpec<A>
  }
}

const GetResourcesForOrgActions = mkTaggedUnionRedux<
  GetResourcesForOrgActionsURI
>()({
  GET_EVENTS: __,
  GET_USERS: __,
})

describe('mkTaggedUnion', () => {
  it('properly generates the right API', () => {
    const hasGET_EVENTSConstructor = 'GET_EVENTS' in GetResourcesForOrgActions
    assert.strictEqual(hasGET_EVENTSConstructor, true)

    const hasGET_USERSConstructor = 'GET_USERS' in GetResourcesForOrgActions
    assert.strictEqual(hasGET_USERSConstructor, true)

    const hasIsNamespace = 'is' in GetResourcesForOrgActions
    assert.strictEqual(hasIsNamespace, true)

    const hasGET_EVENTSTypeGuard = 'GET_EVENTS' in GetResourcesForOrgActions.is
    assert.strictEqual(hasGET_EVENTSTypeGuard, true)

    const hasGET_USERSTypeGuard = 'GET_USERS' in GetResourcesForOrgActions.is
    assert.strictEqual(hasGET_USERSTypeGuard, true)

    const hasMemberOfUnionTypeGuard =
      'memberOfUnion' in GetResourcesForOrgActions.is
    assert.strictEqual(hasMemberOfUnionTypeGuard, true)
  })

  it('has correct constructors', () => {
    const strGET_EVENTS = GetResourcesForOrgActions.GET_EVENTS({
      meta: { orgId: 'testOrg' },
    })
    assert.deepStrictEqual(strGET_EVENTS, {
      type: 'GET_EVENTS',
      meta: { orgId: 'testOrg' },
    })

    const strGET_USERS = GetResourcesForOrgActions.GET_USERS({
      meta: { orgId: 'testOrg' },
    })
    assert.deepStrictEqual(strGET_USERS, {
      type: 'GET_USERS',
      meta: { orgId: 'testOrg' },
    })
  })

  it('has correct guards', () => {
    const strGET_EVENTS = GetResourcesForOrgActions.GET_EVENTS({
      meta: { orgId: 'testOrg' },
    })
    const strGET_USERS = GetResourcesForOrgActions.GET_USERS({
      meta: { orgId: 'testOrg' },
    })

    const isGET_EVENTSTrue = GetResourcesForOrgActions.is.GET_EVENTS(
      strGET_EVENTS,
    )
    const isGET_EVENTSFalse = GetResourcesForOrgActions.is.GET_EVENTS(
      strGET_USERS,
    )
    assert.strictEqual(isGET_EVENTSTrue, true)
    assert.strictEqual(isGET_EVENTSFalse, false)

    const isGET_USERSTrue = GetResourcesForOrgActions.is.GET_USERS(strGET_USERS)
    const isGET_USERSFalse = GetResourcesForOrgActions.is.GET_USERS(
      strGET_EVENTS,
    )
    assert.strictEqual(isGET_USERSTrue, true)
    assert.strictEqual(isGET_USERSFalse, false)

    const isMemberOfUnionTrueA = GetResourcesForOrgActions.is.memberOfUnion(
      strGET_USERS,
    )
    const isMemberOfUnionTrueB = GetResourcesForOrgActions.is.memberOfUnion(
      strGET_EVENTS,
    )
    const isMemberOfUnionFalse = GetResourcesForOrgActions.is.memberOfUnion({
      unknown: 'unknown',
    })
    const isMemberOfUnionFalseWithCorrectDiscriminantKey = GetResourcesForOrgActions.is.memberOfUnion(
      {
        type: 'unknown',
      },
    )
    assert.strictEqual(isMemberOfUnionTrueA, true)
    assert.strictEqual(isMemberOfUnionTrueB, true)
    assert.strictEqual(isMemberOfUnionFalse, false)
    assert.strictEqual(isMemberOfUnionFalseWithCorrectDiscriminantKey, false)
  })

  it('has correct match function', () => {
    const strGET_EVENTS = GetResourcesForOrgActions.GET_EVENTS({
      meta: { orgId: 'testOrg' },
    })
    const strGET_USERS = GetResourcesForOrgActions.GET_USERS({
      meta: { orgId: 'testOrg' },
    })

    const getEventsIdentity = GetResourcesForOrgActions.match(strGET_EVENTS, {
      GET_EVENTS: x => x as GetResourcesForOrgActions<string>,
      GET_USERS: x => x as GetResourcesForOrgActions<string>,
    })
    assert.deepStrictEqual(getEventsIdentity, {
      type: 'GET_EVENTS',
      meta: { orgId: 'testOrg' },
    })

    const getEventsTag = GetResourcesForOrgActions.match(strGET_EVENTS, {
      GET_EVENTS: x => x.type,
      GET_USERS: x => x.type,
    })
    assert.strictEqual(getEventsTag, 'GET_EVENTS')

    const getEventsStr = GetResourcesForOrgActions.match(strGET_EVENTS, {
      GET_EVENTS: x => x.meta.orgId + ' events',
      GET_USERS: x => x.meta.orgId + ' users',
    })
    assert.strictEqual(getEventsStr, 'testOrg events')

    const getUsersIdentity = GetResourcesForOrgActions.match(strGET_USERS, {
      GET_EVENTS: x => x as GetResourcesForOrgActions<string>,
      GET_USERS: x => x as GetResourcesForOrgActions<string>,
    })
    assert.deepStrictEqual(getUsersIdentity, {
      type: 'GET_USERS',
      meta: { orgId: 'testOrg' },
    })

    const getUsersTag = GetResourcesForOrgActions.match(strGET_USERS, {
      GET_EVENTS: x => x.type,
      GET_USERS: x => x.type,
    })
    assert.strictEqual(getUsersTag, 'GET_USERS')

    const getUsersStr = GetResourcesForOrgActions.match(strGET_USERS, {
      GET_EVENTS: x => x.meta.orgId + ' events',
      GET_USERS: x => x.meta.orgId + ' users',
    })
    assert.strictEqual(getUsersStr, 'testOrg users')
  })
})
