from pathlib import Path
from typing import TypedDict

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


class PersonaConfig(TypedDict):
    label: str
    file: str
    icon: str
    color: str


PERSONA_CONFIG: dict[str, PersonaConfig] = {
    "new_parents": {
        "label": "新手爸媽",
        "file": "new_parents.md",
        "icon": "👨‍👩‍👧",
        "color": "green",
    },
    "hnw_professionals": {
        "label": "高淨值專業人士",
        "file": "hnw_professionals.md",
        "icon": "💼",
        "color": "blue",
    },
    "fresh_grads": {
        "label": "社會新鮮人",
        "file": "fresh_grads.md",
        "icon": "🚀",
        "color": "yellow",
    },
}


def load_prompt(tag: str) -> str:
    """從 .md 檔案讀取指定客群的系統提示詞。"""
    config = PERSONA_CONFIG.get(tag)
    if not config:
        raise ValueError(f"未知的客群標籤：{tag}。有效標籤：{list(PERSONA_CONFIG.keys())}")

    file_path = PROMPTS_DIR / config["file"]
    if not file_path.exists():
        raise FileNotFoundError(f"找不到提示詞檔案：{file_path}")

    return file_path.read_text(encoding="utf-8")


def load_all_prompts() -> dict:
    """讀取所有客群的提示詞，回傳完整結構。"""
    result = {}
    for tag, config in PERSONA_CONFIG.items():
        result[tag] = {
            "tag": tag,
            "label": config["label"],
            "icon": config["icon"],
            "color": config["color"],
            "content": load_prompt(tag),
        }
    return result
