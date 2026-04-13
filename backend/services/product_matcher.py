"""
產品比對服務
根據市場訊號 × Persona，從 products.json 中選出最適合的產品（最多 3 筆）

計分邏輯：
  正分 = market_signals 與提取訊號的交集數量
  負分 = negative_signals 與提取訊號的交集數量
  淨分 = 正分 - 負分
  淨分 < 0 的產品直接排除（市場環境與產品邏輯矛盾）
  淨分 = 0 保留（無特定訊號命中，作為 fallback）
"""

import json
from functools import lru_cache
from pathlib import Path

PRODUCTS_PATH = Path(__file__).parent.parent / "data" / "products.json"


@lru_cache(maxsize=1)
def _load_products() -> list[dict]:
    return json.loads(PRODUCTS_PATH.read_text(encoding="utf-8"))


def match_products(
    signals: list[str],
    persona_tag: str,
    max_results: int = 3,
) -> list[dict]:
    """
    根據市場訊號與 Persona 選出最適合的產品。

    匹配邏輯（優先順序）：
    1. suitable_personas 包含此 persona（必要條件）
    2. 淨分 = 正訊號交集 - 負訊號交集，淨分 < 0 直接排除
    3. 依淨分降序排列，取前 max_results 筆
    """
    products = _load_products()
    signals_set = set(signals)

    scored: list[tuple[int, dict]] = []
    for product in products:
        # 必要條件：persona 符合
        if persona_tag not in product.get("suitable_personas", []):
            continue

        # 正向分數：與 market_signals 的交集
        positive_signals = set(product.get("market_signals", []))
        positive_score = len(signals_set & positive_signals)

        # 負向分數：與 negative_signals 的交集
        negative_signals = set(product.get("negative_signals", []))
        negative_score = len(signals_set & negative_signals)

        # 淨分：負分表示市場環境與產品邏輯矛盾，直接排除
        net_score = positive_score - negative_score
        if net_score < 0:
            continue

        scored.append((net_score, product))

    # 依淨分降序排列，取前 N 筆
    scored.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in scored[:max_results]]
