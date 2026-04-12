"""
市場訊號提取服務
從 AI 生成的摘要中，呼叫 Gemini 提取市場訊號關鍵字清單
"""

import json
import re
from pathlib import Path
from .llm_service import call_gemini

EXTRACTOR_PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "reasoning_extractor.md"


def extract_market_signals(summary_text: str) -> list[str]:
    """
    從投研摘要文字中提取市場訊號關鍵字。

    Returns:
        關鍵字列表，例如 ["降息", "債券利好", "避險需求"]
    """
    template = EXTRACTOR_PROMPT_PATH.read_text(encoding="utf-8")
    prompt = template.replace("{summary_text}", summary_text[:3000])  # 控制 token

    try:
        raw = call_gemini(
            system_prompt="你是一個 JSON 輸出機器，只輸出 JSON 陣列，不輸出任何其他內容。",
            user_message=prompt,
        )

        # 清理 markdown code block（模型有時會包 ```json ... ```）
        cleaned = re.sub(r"```(?:json)?\s*|\s*```", "", raw).strip()
        signals = json.loads(cleaned)

        if isinstance(signals, list):
            return [str(s) for s in signals[:8]]  # 最多取 8 個

    except (json.JSONDecodeError, Exception):
        pass

    return []
