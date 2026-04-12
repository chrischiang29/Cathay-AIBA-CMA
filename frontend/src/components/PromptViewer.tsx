import { useState, useEffect } from 'react'
import { fetchAllPrompts } from '../api/client'
import type { PromptsResponse } from '../types'

const PERSONA_TAGS = ['new_parents', 'hnw_professionals', 'fresh_grads'] as const
type PersonaTag = typeof PERSONA_TAGS[number]

const TAB_ACTIVE: Record<PersonaTag, string> = {
  new_parents: 'bg-emerald-500 text-white border-emerald-500',
  hnw_professionals: 'bg-blue-600 text-white border-blue-600',
  fresh_grads: 'bg-amber-400 text-white border-amber-400',
}

const CONTENT_BORDER: Record<PersonaTag, string> = {
  new_parents: 'border-emerald-200 bg-emerald-50',
  hnw_professionals: 'border-blue-200 bg-blue-50',
  fresh_grads: 'border-amber-200 bg-amber-50',
}

const PROMPT_FILE: Record<PersonaTag, string> = {
  new_parents: 'new_parents.md',
  hnw_professionals: 'hnw_professionals.md',
  fresh_grads: 'fresh_grads.md',
}

export default function PromptViewer() {
  const [prompts, setPrompts] = useState<PromptsResponse>({})
  const [activeTab, setActiveTab] = useState<PersonaTag>('new_parents')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllPrompts()
      .then(setPrompts)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="mb-3 flex-shrink-0">
        <h2 className="text-sm font-bold text-gray-800">System Prompt 查看區</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          各客群提示詞，存於 <code className="bg-gray-100 px-1 rounded text-xs">backend/prompts/</code>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-2 flex-shrink-0">
        {PERSONA_TAGS.map((tag) => {
          const persona = prompts[tag]
          const isActive = activeTab === tag
          return (
            <button
              key={tag}
              onClick={() => setActiveTab(tag)}
              className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium border transition-all ${
                isActive
                  ? TAB_ACTIVE[tag]
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <span className="block text-base leading-tight">
                {persona?.icon ?? '…'}
              </span>
              <span className="block truncate leading-tight mt-0.5">
                {persona?.label ?? tag}
              </span>
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      <div
        className={`flex-1 min-h-0 rounded-xl border-2 overflow-hidden ${
          CONTENT_BORDER[activeTab]
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm gap-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full" />
            載入中…
          </div>
        ) : error ? (
          <div className="p-3 text-red-500 text-xs">
            <p className="font-medium">載入失敗</p>
            <p className="mt-1 text-red-400">{error}</p>
          </div>
        ) : (
          <pre className="p-3 text-xs text-gray-700 overflow-auto h-full whitespace-pre-wrap font-mono leading-relaxed">
            {prompts[activeTab]?.content ?? '（無內容）'}
          </pre>
        )}
      </div>

      {/* File path hint */}
      {!loading && !error && (
        <p className="mt-1.5 text-xs text-gray-400 flex-shrink-0">
          📁 backend/prompts/{PROMPT_FILE[activeTab]}
        </p>
      )}
    </div>
  )
}
