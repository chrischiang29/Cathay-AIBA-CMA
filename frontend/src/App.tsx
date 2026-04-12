import { useState } from 'react'
import PromptViewer from './components/PromptViewer'
import DocumentUploader from './components/DocumentUploader'
import ReportCard from './components/ReportCard'
import { generateReports } from './api/client'
import type { GenerateResponse, PersonaResult } from './types'

const PERSONA_TAGS = ['new_parents', 'hnw_professionals', 'fresh_grads'] as const

// 載入中佔位資料，讓三張卡片在生成中時就先顯示
const LOADING_PLACEHOLDERS: Record<string, PersonaResult> = {
  new_parents: {
    tag: 'new_parents', label: '新手爸媽', icon: '👨‍👩‍👧',
    color: 'green', content: '', status: 'success', generated_at: '',
  },
  hnw_professionals: {
    tag: 'hnw_professionals', label: '高淨值專業人士', icon: '💼',
    color: 'blue', content: '', status: 'success', generated_at: '',
  },
  fresh_grads: {
    tag: 'fresh_grads', label: '社會新鮮人', icon: '🚀',
    color: 'yellow', content: '', status: 'success', generated_at: '',
  },
}

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [response, setResponse] = useState<GenerateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!selectedFile || isGenerating) return
    setIsGenerating(true)
    setError(null)
    setResponse(null)

    try {
      const result = await generateReports(selectedFile)
      setResponse(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : '發生未知錯誤')
    } finally {
      setIsGenerating(false)
    }
  }

  const successCount = response
    ? PERSONA_TAGS.filter((t) => response.results[t]?.status === 'success').length
    : 0

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" style={{ height: '100vh' }}>
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3 shadow-sm flex-shrink-0">
        <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 via-teal-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-black text-base shadow">
          C
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900 leading-tight">
            CUBE GenAI 投研顧問
          </h1>
          <p className="text-xs text-gray-400">
            超個人化投研摘要系統 · LangChain + Vertex AI
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
            三客群同步對比
          </span>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel: Prompt Viewer ── */}
        <aside className="w-72 bg-white border-r border-gray-200 p-4 flex flex-col overflow-hidden flex-shrink-0">
          <PromptViewer />
        </aside>

        {/* ── Right Panel ── */}
        <main className="flex-1 flex flex-col overflow-hidden p-5 gap-4 min-w-0">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-shrink-0">
            <h2 className="text-sm font-bold text-gray-800 mb-3">
              上傳文件
              <span className="ml-2 text-xs font-normal text-gray-400">
                支援研報、House View、產品說明書（PDF）
              </span>
            </h2>

            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <DocumentUploader
                  onFileSelect={setSelectedFile}
                  disabled={isGenerating}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={!selectedFile || isGenerating}
                className={`flex-shrink-0 px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                  !selectedFile || isGenerating
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600 hover:shadow-md active:scale-95'
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                    生成中…
                  </span>
                ) : (
                  <>▶ 同步產出三客群報告</>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex gap-2">
                <span>❌</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Report Comparison Area */}
          {(isGenerating || response) ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h2 className="text-sm font-bold text-gray-800">
                  三客群報告對比
                  {response && (
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      · {response.document_name}
                    </span>
                  )}
                </h2>
                {response && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    successCount === 3
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    {successCount} / 3 成功
                  </span>
                )}
              </div>

              {/* 3-Column Cards */}
              <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
                {PERSONA_TAGS.map((tag) => {
                  const result = response?.results[tag] ?? LOADING_PLACEHOLDERS[tag]
                  return (
                    <ReportCard
                      key={tag}
                      result={result}
                      loading={isGenerating && !response}
                    />
                  )
                })}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
              <div className="text-5xl">📊</div>
              <p className="text-sm font-medium">上傳 PDF 後點擊「同步產出三客群報告」</p>
              <p className="text-xs">
                系統將同時為
                <span className="text-emerald-500 mx-1">新手爸媽</span>、
                <span className="text-blue-500 mx-1">高淨值專業人士</span>、
                <span className="text-amber-500 mx-1">社會新鮮人</span>
                生成個人化投研摘要
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
