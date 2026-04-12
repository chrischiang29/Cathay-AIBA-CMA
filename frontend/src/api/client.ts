import type { GenerateResponse, PromptsResponse } from '../types'

const API_BASE = '/api'

export async function fetchAllPrompts(): Promise<PromptsResponse> {
  const res = await fetch(`${API_BASE}/prompts`)
  if (!res.ok) throw new Error(`載入提示詞失敗：${res.statusText}`)
  return res.json() as Promise<PromptsResponse>
}

export async function generateReports(file: File): Promise<GenerateResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error((errorData as { detail?: string }).detail ?? '報告生成失敗')
  }

  return res.json() as Promise<GenerateResponse>
}
