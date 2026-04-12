/**
 * Example: Tree<A> — recursive ADT with positional constructors.
 *
 * Run with:  npx tsx examples/03-positional-tree.ts
 *
 * Demonstrates:
 *   - Positional constructor style: `Tree.Node(left, value, right)` rather
 *     than `Tree.Node({ left, value, right })`
 *   - A recursive tagged union (Tree<A> contains Tree<A>)
 *   - Folding the structure via `match` to compute sum, size, and depth
 *   - In-order traversal as another `match` fold
 *
 * Positional style is handy when the field names add no real information
 * (e.g. a binary tree's left / value / right). Named style is usually
 * better when the field names document intent (see 01-maybe / 02-result).
 */

import type { MkData, TaggedLambda1 } from '../src/positional'
import { mkTaggedUnion } from '../src/positional'

// ---------------------------------------------------------------------------
// 1. Declare Tree<A>
// ---------------------------------------------------------------------------

type Leaf = { readonly tag: 'Leaf' }
type Node<A> = {
  readonly tag: 'Node'
  readonly left: Tree<A>
  readonly value: A
  readonly right: Tree<A>
}
type Tree<A> = Leaf | Node<A>

interface TreeLambda extends TaggedLambda1 {
  readonly type: Tree<this['A']>
  readonly data: MkData<this['type']>
}

// Positional constructors: the second call takes a map of field-name tuples
// giving the positional argument order for each non-nullary member.
const Tree = mkTaggedUnion<TreeLambda>()({
  Leaf: [],
  Node: ['left', 'value', 'right'],
})

// ---------------------------------------------------------------------------
// 2. Build a small tree
// ---------------------------------------------------------------------------

//         5
//        / \
//       3   8
//      / \   \
//     1   4   9
const leaf: Tree<number> = Tree.Leaf
const tree: Tree<number> = Tree.Node(
  Tree.Node(Tree.Node(leaf, 1, leaf), 3, Tree.Node(leaf, 4, leaf)),
  5,
  Tree.Node(leaf, 8, Tree.Node(leaf, 9, leaf)),
)

// ---------------------------------------------------------------------------
// 3. Fold over the tree via recursive `match`
// ---------------------------------------------------------------------------

const sum = (t: Tree<number>): number =>
  Tree.match(t, {
    Leaf: () => 0,
    Node: ({ left, value, right }) => sum(left) + value + sum(right),
  })

const size = <A>(t: Tree<A>): number =>
  Tree.match(t, {
    Leaf: () => 0,
    Node: ({ left, right }) => 1 + size(left) + size(right),
  })

const depth = <A>(t: Tree<A>): number =>
  Tree.match(t, {
    Leaf: () => 0,
    Node: ({ left, right }) => 1 + Math.max(depth(left), depth(right)),
  })

console.log('sum  =', sum(tree)) // 30
console.log('size =', size(tree)) // 6
console.log('depth=', depth(tree)) // 3

// ---------------------------------------------------------------------------
// 4. In-order traversal via `match`
// ---------------------------------------------------------------------------

const inorder = <A>(t: Tree<A>): A[] =>
  Tree.match(t, {
    Leaf: () => [],
    Node: ({ left, value, right }) => [
      ...inorder(left),
      value,
      ...inorder(right),
    ],
  })

console.log('inorder:', inorder(tree)) // [1, 3, 4, 5, 8, 9]
