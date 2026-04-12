"""
產品比對服務
根據市場訊號 × Persona，從 products.json 中選出最適合的產品（最多 3 筆）
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
    1. suitable_personas 包含此 persona
    2. market_signals 與提取出的訊號有最多交集（交集數越多排越前）
    3. 最多回傳 max_results 筆
    """
    products = _load_products()
    signals_set = set(signals)

    scored: list[tuple[int, dict]] = []
    for product in products:
        # 必要條件：persona 符合
        if persona_tag not in product.get("suitable_personas", []):
            continue

        # 計算訊號交集分數
        product_signals = set(product.get("market_signals", []))
        score = len(signals_set & product_signals)

        # 即使分數為 0 也保留（確保至少有 fallback 推薦）
        scored.append((score, product))

    # 依分數降序排列，取前 N 筆
    scored.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in scored[:max_results]]
