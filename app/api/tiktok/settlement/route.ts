// app/api/tiktok/settlement/route.ts
// Server-side proxy for TikTok Finance API settlement records.
// TIKTOK_APP_KEY and TIKTOK_APP_SECRET must be set in .env.local

import { NextRequest, NextResponse } from 'next/server'
import { fetchSettlements } from '@/lib/tiktok/settlementApi'

export async function GET(req: NextRequest) {
  const appKey = process.env.TIKTOK_APP_KEY
  const appSecret = process.env.TIKTOK_APP_SECRET

  if (!appKey || !appSecret) {
    console.error('[TikTok] Missing TIKTOK_APP_KEY or TIKTOK_APP_SECRET in environment')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 },
    )
  }

  const { searchParams } = req.nextUrl
  const accessToken = (searchParams.get('access_token') ?? '').trim()
  const startTimeStr = searchParams.get('start_time')
  const endTimeStr = searchParams.get('end_time')

  if (!accessToken) {
    return NextResponse.json({ error: 'access_token is required' }, { status: 400 })
  }

  // Default: last 14 days
  const now = Math.floor(Date.now() / 1000)
  const startTime = startTimeStr ? Number(startTimeStr) : now - 14 * 24 * 60 * 60
  const endTime = endTimeStr ? Number(endTimeStr) : now

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    return NextResponse.json(
      { error: 'start_time and end_time must be unix timestamps' },
      { status: 400 },
    )
  }

  if (startTime >= endTime) {
    return NextResponse.json({ error: 'start_time must be before end_time' }, { status: 400 })
  }

  try {
    const settlements = await fetchSettlements({
      appKey,
      appSecret,
      accessToken,
      startTime,
      endTime,
    })
    return NextResponse.json({ settlements })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
