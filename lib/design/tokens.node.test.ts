import assert from 'node:assert/strict'
import test from 'node:test'
import { getTokens } from './tokens.ts'

test('accent background changes with accent in light mode', () => {
  const jade = getTokens({ theme: 'light', accent: 'jade' }).color.accentBg
  const navy = getTokens({ theme: 'light', accent: 'navy' }).color.accentBg
  assert.notEqual(jade, navy)
  assert.match(navy, /^rgba\(/)
})

test('accent background changes with accent in dark mode', () => {
  const jade = getTokens({ theme: 'dark', accent: 'jade' }).color.accentBg
  const plum = getTokens({ theme: 'dark', accent: 'plum' }).color.accentBg
  assert.notEqual(jade, plum)
  assert.match(plum, /^rgba\(/)
})

test('density changes row and padding values', () => {
  const compact = getTokens({ density: 'compact' }).density
  const comfy = getTokens({ density: 'comfy' }).density
  assert.ok(compact.row < comfy.row)
  assert.ok(compact.padY < comfy.padY)
  assert.ok(compact.padX < comfy.padX)
})
