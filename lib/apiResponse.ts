export type ApiErrorPayload = {
  success: false
  error: {
    code: string
    message: string
  }
}

export type ApiSuccessPayload<T> = {
  success: true
  data: T
}

export async function readApiResponse<T>(response: Response): Promise<T> {
  const payload = await response.json() as ApiSuccessPayload<T> | ApiErrorPayload | T

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'error' in payload
        ? typeof payload.error === 'string'
          ? payload.error
          : payload.error.message
        : `Request failed with status ${response.status}`
    throw new Error(message)
  }

  if (
    typeof payload === 'object' &&
    payload !== null &&
    'success' in payload &&
    payload.success === true &&
    'data' in payload
  ) {
    return payload.data
  }

  // Backward compatibility while older API instances are still running.
  return payload as T
}
