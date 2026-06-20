const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
}

export async function exportXlsx(endpoint: string, filename: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('chawy_token') : ''
  const response = await fetch(`${getApiUrl()}/api/export/${endpoint}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  })

  if (!response.ok) {
    throw new Error('Export failed: ' + response.statusText)
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}
