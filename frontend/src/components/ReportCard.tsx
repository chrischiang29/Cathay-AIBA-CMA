import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { PersonaResult } from '../types'
import ProductCard from './ProductCard'

interface CardStyle {
  header: string
  border: string
  signalBg: string
}

const CARD_STYLES: Record<string, CardStyle> = {
  new_parents: {
    header: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    border: 'border-emerald-200',
    signalBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  hnw_professionals: {
    header: 'bg-gradient-to-br from-blue-600 to-blue-700',
    border: 'border-blue-200',
    signalBg: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  fresh_grads: {
    header: 'bg-gradient-to-br from-amber-400 to-orange-400',
    border: 'border-amber-200',
    signalBg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
}

const DEFAULT_STYLE: CardStyle = {
  header: 'bg-gradient-to-br from-gray-500 to-gray-600',
  border: 'border-gray-200',
  signalBg: 'bg-gray-50 text-gray-600 border-gray-200',
}

interface Props {
  result: PersonaResult
  loading?: boolean
}

export default function ReportCard({ result, loading = false }: Props) {
  const style = CARD_STYLES[result.tag] ?? DEFAULT_STYLE
  const hasRecommendations = result.recommendations && result.recommendations.length > 0
  const hasSignals = result.market_signals && result.market_signals.length > 0

  return (
    <div className={`flex flex-col rounded-xl border-2 ${style.border} overflow-hidden shadow-sm bg-white h-full`}>

      {/* ── Card Header ── */}
      <div className={`${style.header} text-white px-4 py-3 flex-shrink-0`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{result.icon}</span>
          <div>
            <h3 className="font-bold text-sm leading-tight">{result.label}</h3>
            {!loading && result.generated_at && (
              <p className="text-xs opacity-70 mt-0.5">
                {new Date(result.generated_at).toLocaleTimeString('zh-TW', {
                  hour: '2-digit', minute: '2-digit', second: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Scrollable Content Area ── */}
      <div className="flex-1 overflow-auto min-h-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-500" />
            <p className="text-xs text-gray-400">AI 生成中，請稍候…</p>
          </div>
        ) : result.status === 'error' ? (
          <div className="p-3 m-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-600">生成失敗</p>
            <p className="text-xs text-red-400 mt-1 break-all">{result.error}</p>
          </div>
        ) : (
          <div className="p-4">

            {/* ── 個人化摘要 ── */}
            <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-h3:text-sm prose-h3:mt-4 prose-h3:mb-1.5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.content}
              </ReactMarkdown>
            </div>

            {/* ── 市場訊號標籤 ── */}
            {hasSignals && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 mb-1.5">📡 偵測到的市場訊號</p>
                <div className="flex flex-wrap gap-1">
                  {result.market_signals.map((signal) => (
                    <span
                      key={signal}
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${style.signalBg}`}
                    >
                      {signal}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── 產品推薦區塊 ── */}
            {hasRecommendations && (
              <div className="mt-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-semibold text-gray-700">🎯 為您推薦</span>
                  <span className="text-xs text-gray-400">
                    ({result.recommendations.length} 筆產品)
                  </span>
                </div>
                <div className="space-y-2">
                  {result.recommendations.map((product, index) => (
                    <ProductCard
                      key={product.pid}
                      product={product}
                      rank={index + 1}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* ── Compliance Footer ── */}
      {!loading && result.status === 'success' && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <p className="text-xs text-gray-400">
            ⚠️ 本內容由 AI 生成，僅供參考，非正式投資顧問建議
          </p>
        </div>
      )}
    </div>
  )
}
