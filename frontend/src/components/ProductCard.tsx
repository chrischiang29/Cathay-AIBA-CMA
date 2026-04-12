import type { ProductRecommendation } from '../types'

const RISK_LABEL: Record<number, string> = {
  1: 'RR1 保守',
  2: 'RR2 穩健',
  3: 'RR3 穩健積極',
  4: 'RR4 積極',
  5: 'RR5 高積極',
}

const RISK_COLOR: Record<number, string> = {
  1: 'bg-green-100 text-green-700',
  2: 'bg-emerald-100 text-emerald-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-orange-100 text-orange-700',
  5: 'bg-red-100 text-red-700',
}

const TYPE_ICON: Record<string, string> = {
  bond_fund: '🏦',
  etf_leverage: '⚡',
  etf_dividend: '💰',
  etf_equity: '📈',
  etf_esg: '🌱',
  equity_fund: '📊',
  reit_fund: '🏢',
}

interface Props {
  product: ProductRecommendation
  rank: number   // 1, 2, 3 顯示推薦順序
}

export default function ProductCard({ product, rank }: Props) {
  const icon = TYPE_ICON[product.type] ?? '💹'
  const riskLabel = RISK_LABEL[product.risk_level] ?? `RR${product.risk_level}`
  const riskColor = RISK_COLOR[product.risk_level] ?? 'bg-gray-100 text-gray-600'

  return (
    <div className={`rounded-lg border mt-2 overflow-hidden ${
      product.suitability_passed
        ? 'border-gray-200 bg-white'
        : 'border-amber-200 bg-amber-50'
    }`}>
      {/* Product Header */}
      <div className="px-3 py-2 flex items-start gap-2">
        <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-gray-800 leading-tight">
              {product.short_name}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${riskColor}`}>
              {riskLabel}
            </span>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {product.region}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 leading-tight">{product.highlight}</p>
        </div>
        <span className="text-xs font-bold text-gray-300 flex-shrink-0">#{rank}</span>
      </div>

      {/* Reasoning Hint */}
      <div className="px-3 pb-2">
        <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 leading-relaxed">
          💡 {product.reasoning_hint}
        </p>
      </div>

      {/* Not suitable warning */}
      {!product.suitability_passed && product.education_note && (
        <div className="px-3 pb-2">
          <p className="text-xs text-amber-700 bg-amber-100 rounded px-2 py-1 leading-relaxed">
            ⚠️ {product.education_note}
          </p>
        </div>
      )}

      {/* CTA Button */}
      <div className="px-3 pb-3">
        {product.suitability_passed ? (
          <a
            href={product.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2 px-3 rounded-lg text-xs font-semibold
              bg-gradient-to-r from-emerald-500 to-teal-500 text-white
              hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm
              hover:shadow-md active:scale-95"
          >
            {product.cta_mode === 'regular' ? '📅 ' : '⚡ '}
            {product.cta_label}
            <span className="ml-1 opacity-70">↗</span>
          </a>
        ) : (
          <a
            href={product.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2 px-3 rounded-lg text-xs font-semibold
              bg-gray-100 text-gray-500 border border-gray-200
              hover:bg-gray-200 transition-all"
          >
            📖 了解產品內容
            <span className="ml-1 opacity-70">↗</span>
          </a>
        )}
      </div>

      {/* Compliance note */}
      <div className="px-3 pb-2">
        <p className="text-xs text-gray-400 leading-tight">
          ⚠️ AI 推薦僅供參考，非正式投顧建議，投資前請詳閱公開說明書
        </p>
      </div>
    </div>
  )
}
