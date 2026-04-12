"""
KYC 合規適合度檢查
確保推薦產品的風險等級不超出 Persona 預設的最高可承受風險
不符合者：suitability_passed=False，改提供教育型說明
"""

# Persona 預設最高可承受風險等級（1=保守, 5=積極）
PERSONA_MAX_RISK: dict[str, int] = {
    "new_parents": 3,        # 保守～穩健
    "fresh_grads": 3,        # 保守～穩健（入門階段）
    "hnw_professionals": 5,  # 全部可承受
}

EDUCATION_CONTENT: dict[int, str] = {
    4: "此產品風險等級較高（RR4），建議先深入了解產品特性與市場波動風險，再評估是否符合您的投資目標。",
    5: "此產品屬高風險商品（RR5），包含槓桿或高波動特性，建議具備相關投資經驗後再考慮配置。",
}


def check_suitability(products: list[dict], persona_tag: str) -> list[dict]:
    """
    對產品清單進行 KYC 合規檢查，回傳含 suitability_passed 欄位的產品清單。
    """
    max_risk = PERSONA_MAX_RISK.get(persona_tag, 3)
    result = []

    for product in products:
        risk = product.get("risk_level", 1)
        passed = risk <= max_risk

        enriched = dict(product)
        enriched["suitability_passed"] = passed
        enriched["education_note"] = (
            EDUCATION_CONTENT.get(risk, "") if not passed else ""
        )
        result.append(enriched)

    return result
