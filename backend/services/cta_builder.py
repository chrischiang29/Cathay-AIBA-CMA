"""
CTA 卡片建構器
將通過合規檢查的產品，組合成前端可直接渲染的 CTA 卡片物件
包含：個人化文案、阿發直購連結（product_url）、推理依據說明
"""


def build_cta_cards(
    products: list[dict],
    persona_tag: str,
    market_signals: list[str],
) -> list[dict]:
    """
    組合最終的 CTA 卡片物件清單。

    Returns:
        前端渲染用的卡片物件，每筆包含：
        - pid, name, short_name, type, region, asset_class
        - risk_level, highlight, description
        - cta_label: 個人化按鈕文案
        - product_url: 阿發/官網直購連結
        - suitability_passed: 合規通過與否
        - education_note: 不合規時的教育說明
        - reasoning_hint: AI 推理依據（簡短摘要）
    """
    cards = []

    for product in products:
        # 取出此 persona 的 CTA 文案（fallback 到通用）
        cta_labels = product.get("cta_label", {})
        cta_label = (
            cta_labels.get(persona_tag)
            or cta_labels.get("hnw_professionals")
            or "立即了解"
        )

        # 取出此 persona 的購買模式
        cta_modes = product.get("cta_mode", {})
        cta_mode = cta_modes.get(persona_tag, "single")

        # 生成推理依據說明
        matched_signals = list(
            set(market_signals) & set(product.get("market_signals", []))
        )
        if matched_signals:
            reasoning_hint = f"根據文件中的 {'、'.join(matched_signals[:3])} 訊號，此產品與當前市場環境高度契合。"
        else:
            reasoning_hint = f"此產品符合您的投資屬性，適合在當前市場環境下配置。"

        card = {
            "pid": product["pid"],
            "name": product["name"],
            "short_name": product.get("short_name", product["name"]),
            "type": product.get("type", ""),
            "region": product.get("region", ""),
            "asset_class": product.get("asset_class", ""),
            "risk_level": product.get("risk_level", 1),
            "highlight": product.get("highlight", ""),
            "description": product.get("description", ""),
            "cta_label": cta_label,
            "cta_mode": cta_mode,
            "product_url": product.get("product_url", "#"),
            "suitability_passed": product.get("suitability_passed", True),
            "education_note": product.get("education_note", ""),
            "reasoning_hint": reasoning_hint,
        }
        cards.append(card)

    return cards
