"""
Vertex AI Gemini 直連模組
認證方式：GCP Service Account JSON 金鑰
API：aiplatform.googleapis.com (REST)
"""

import json
import os
from pathlib import Path

import requests
from dotenv import load_dotenv
from google.auth.transport.requests import Request as GoogleAuthRequest
from google.oauth2 import service_account

load_dotenv()

SCOPES = ["https://www.googleapis.com/auth/cloud-platform"]

# ── 快取憑證物件（module-level singleton） ──────────────────────────────
_credentials: service_account.Credentials | None = None
_project_id: str | None = None


def _get_credentials() -> tuple[service_account.Credentials, str]:
    """
    載入 Service Account 憑證（第一次呼叫時讀檔，之後直接重用並自動刷新 token）。
    """
    global _credentials, _project_id

    if _credentials is None:
        sa_path = os.getenv(
            "GOOGLE_APPLICATION_CREDENTIALS",
            "credentials/gen-lang-client-api-key.json",
        )
        if not Path(sa_path).exists():
            raise FileNotFoundError(
                f"找不到憑證檔案：{sa_path}\n"
                "請將 gen-lang-client-api-key.json 放入 credentials/ 目錄。"
            )

        with open(sa_path, "r", encoding="utf-8") as f:
            sa_data = json.load(f)

        _project_id = sa_data["project_id"]
        _credentials = service_account.Credentials.from_service_account_file(
            sa_path, scopes=SCOPES
        )

    # Token 過期時自動刷新
    if not _credentials.valid:
        _credentials.refresh(GoogleAuthRequest())

    return _credentials, _project_id  # type: ignore[return-value]


def call_gemini(system_prompt: str, user_message: str) -> str:
    """
    呼叫 Vertex AI Gemini API，回傳生成文字。

    Args:
        system_prompt: 客群 System Prompt（從 .md 檔載入）
        user_message:  包含文件內容的 Human 訊息

    Returns:
        模型生成的繁體中文摘要字串
    """
    creds, project_id = _get_credentials()

    model = os.getenv("LLM_MODEL", "gemini-2.5-flash-lite")
    location = os.getenv("VERTEX_AI_LOCATION", "global")

    endpoint = (
        f"https://aiplatform.googleapis.com/v1/projects/{project_id}"
        f"/locations/{location}/publishers/google/models/{model}:generateContent"
    )

    headers = {
        "Authorization": f"Bearer {creds.token}",
        "Content-Type": "application/json",
    }

    body = {
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": [
            {"role": "user", "parts": [{"text": user_message}]}
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 2048,
        },
    }

    resp = requests.post(endpoint, headers=headers, json=body, timeout=120)
    resp.raise_for_status()

    payload = resp.json()
    return payload["candidates"][0]["content"]["parts"][0]["text"]
