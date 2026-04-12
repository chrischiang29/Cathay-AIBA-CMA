"""
三客群並發編排層（含導購 CTA）

流程：
  Step 1. call_gemini → 個人化摘要（現有）
  Step 2. extract_market_signals → 從摘要提取市場訊號（新增）
  Step 3. match_products → 訊號 × Persona 選品（新增）
  Step 4. check_suitability → KYC 合規阻斷（新增）
  Step 5. build_cta_cards → 組合 CTA 卡片物件（新增）
"""

import asyncio
from datetime import datetime
from typing import Any

from .llm_service import call_gemini
from .prompt_loader import load_prompt, PERSONA_CONFIG
from .reasoning_service import extract_market_signals
from .product_matcher import match_products
from .suitability_check import check_suitability
from .cta_builder import build_cta_cards

_HUMAN_TEMPLATE = """\
請根據以下文件內容，依照你的角色設定，為你的目標客群產出個人化投研摘要與產品推薦。

【文件名稱】{document_name}

【文件內容】
{document_text}

請嚴格遵守你的角色設定、語氣約束、輸出格式規範，並以繁體中文回覆。"""


async def _generate_for_persona(
    tag: str,
    document_text: str,
    document_name: str,
) -> dict[str, Any]:
    """為單一客群非同步生成個人化報告 + 導購 CTA。"""
    config = PERSONA_CONFIG[tag]
    try:
        system_prompt = load_prompt(tag)
        user_message = _HUMAN_TEMPLATE.format(
            document_name=document_name,
            document_text=document_text,
        )

        # Step 1: 個人化摘要生成
        summary = await asyncio.to_thread(call_gemini, system_prompt, user_message)

        # Step 2: 從摘要提取市場訊號
        signals = await asyncio.to_thread(extract_market_signals, summary)

        # Step 3: 產品比對
        matched = match_products(signals, tag, max_results=3)

        # Step 4: KYC 合規檢查
        checked = check_suitability(matched, tag)

        # Step 5: 組合 CTA 卡片
        cta_cards = build_cta_cards(checked, tag, signals)

        return {
            "tag": tag,
            "label": config["label"],
            "icon": config["icon"],
            "color": config["color"],
            "content": summary,
            "market_signals": signals,
            "recommendations": cta_cards,
            "status": "success",
            "generated_at": datetime.now().isoformat(),
        }

    except Exception as e:
        return {
            "tag": tag,
            "label": config["label"],
            "icon": config["icon"],
            "color": config["color"],
            "content": "",
            "market_signals": [],
            "recommendations": [],
            "status": "error",
            "error": str(e),
            "generated_at": datetime.now().isoformat(),
        }


async def generate_all_personas(
    document_text: str,
    document_name: str,
) -> dict[str, Any]:
    """同時觸發三個客群的報告生成（並發）。"""
    tasks = [
        _generate_for_persona(tag, document_text, document_name)
        for tag in PERSONA_CONFIG
    ]
    results = await asyncio.gather(*tasks)
    return {result["tag"]: result for result in results}
