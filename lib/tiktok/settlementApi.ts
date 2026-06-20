// lib/tiktok/settlementApi.ts
// TikTok Shop Finance API — settlement record fetching.
// All secrets stay server-side; never import this file from client components.

import { createHmac } from 'node:crypto'

export const TIKTOK_API_BASE = 'https://open-api.tiktok.com'

/** Single settlement record from TikTok Finance API (normalized) */
export type SettlementRecord = {
  orderId: string
  settlementTime: number      // unix timestamp
  grossAmount: number         // original order amount (THB)
  totalFee: number            // sum of all platform fees
  netIncome: number           // grossAmount - totalFee
  settlementRef: string       // ISO date range string used as internal reference
}

/** Params the caller must supply */
export type FetchSettlementsParams = {
  appKey: string
  appSecret: string
  accessToken: string
  startTime: number           // unix timestamp (seconds)
  endTime: number             // unix timestamp (seconds)
  pageSize?: number           // default 20, max 20
}

/**
 * Build TikTok Shop API HMAC-SHA256 signature.
 *
 * Algorithm:
 *   1. Collect all params except `sign` and `access_token`
 *   2. Sort keys alphabetically
 *   3. Concatenate: appSecret + key1 + val1 + key2 + val2 + ... + appSecret
 *   4. HMAC-SHA256 the string with appSecret as key → hex uppercase
 */
export function buildTiktokSign(
  params: Record<string, string | number>,
  appSecret: string,
): string {
  const sorted = Object.entries(params)
    .filter(([k]) => k !== 'sign' && k !== 'access_token')
    .sort(([a], [b]) => a.localeCompare(b))

  const base = sorted.reduce(
    (acc, [k, v]) => acc + k + String(v),
    appSecret,
  ) + appSecret

  return createHmac('sha256', appSecret).update(base).digest('hex').toUpperCase()
}

/**
 * Fetch settlement records from TikTok Finance API.
 * Returns normalized SettlementRecord[].
 * Throws on non-zero TikTok error code.
 */
export async function fetchSettlements(
  params: FetchSettlementsParams,
): Promise<SettlementRecord[]> {
  if (!params.accessToken) throw new Error('accessToken is required')
  const pageSize = Math.min(params.pageSize ?? 20, 20)

  const timestamp = Math.floor(Date.now() / 1000)

  const queryParams: Record<string, string | number> = {
    app_key:    params.appKey,
    timestamp,
    page_size:  pageSize,
    start_time: params.startTime,
    end_time:   params.endTime,
  }

  const sign = buildTiktokSign(queryParams, params.appSecret)

  const url = new URL(`${TIKTOK_API_BASE}/finance/settlement/search`)
  url.searchParams.set('app_key',      params.appKey)
  url.searchParams.set('access_token', params.accessToken)
  url.searchParams.set('timestamp',    String(timestamp))
  url.searchParams.set('sign',         sign)

  const body = {
    start_time: params.startTime,
    end_time:   params.endTime,
    page_size:  pageSize,
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)
  let res: Response
  try {
    res = await fetch(url.toString(), {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
      signal:  controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }

  if (!res.ok) throw new Error(`TikTok API HTTP ${res.status}`)

  const json = (await res.json()) as {
    code: number
    message: string
    data?: {
      settlement_list?: Array<{
        order_id:          string
        settlement_time:   number
        settlement_amount: number
        total_fee:         number
        net_income:        number
      }>
    }
  }

  if (typeof json?.code !== 'number') {
    throw new Error('Invalid TikTok API response format')
  }
  if (json.code !== 0) {
    console.error(`[TikTok] API error ${json.code}: ${json.message}`)
    throw new Error(`Failed to fetch settlements (code ${json.code})`)
  }

  const list = json.data?.settlement_list ?? []
  const ref = `${new Date(params.startTime * 1000).toISOString().slice(0, 10)}_${new Date(params.endTime * 1000).toISOString().slice(0, 10)}`

  return list.map(item => ({
    orderId:        item.order_id,
    settlementTime: item.settlement_time,
    grossAmount:    item.settlement_amount,
    totalFee:       item.total_fee,
    netIncome:      item.net_income,
    settlementRef:  ref,
  }))
}
