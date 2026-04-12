export interface PersonaPrompt {
  tag: string
  label: string
  icon: string
  color: string
  content: string
}

export interface ProductRecommendation {
  pid: string
  name: string
  short_name: string
  type: string
  region: string
  asset_class: string
  risk_level: number          // 1~5
  highlight: string
  description: string
  cta_label: string           // 個人化按鈕文案
  cta_mode: string            // "single" | "regular"
  product_url: string         // 阿發/官網直購連結
  suitability_passed: boolean // KYC 合規通過
  education_note: string      // 不合規時的教育說明
  reasoning_hint: string      // AI 推理依據
}

export interface PersonaResult {
  tag: string
  label: string
  icon: string
  color: string
  content: string
  market_signals: string[]
  recommendations: ProductRecommendation[]
  status: 'success' | 'error'
  error?: string
  generated_at: string
}

export interface GenerateResponse {
  status: string
  document_name: string
  results: Record<string, PersonaResult>
}

export type PromptsResponse = Record<string, PersonaPrompt>
