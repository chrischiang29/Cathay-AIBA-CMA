import pdfplumber
from io import BytesIO

MAX_CHARS = 50_000  # 避免超出 LLM token 限制


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """從 PDF bytes 提取純文字內容。"""
    text_parts: list[str] = []

    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        for i, page in enumerate(pdf.pages):
            page_text = page.extract_text()
            if page_text and page_text.strip():
                text_parts.append(f"--- 第 {i + 1} 頁 ---\n{page_text.strip()}")

    full_text = "\n\n".join(text_parts)

    if not full_text.strip():
        raise ValueError("無法從此 PDF 提取文字，可能為掃描版或加密檔案")

    if len(full_text) > MAX_CHARS:
        full_text = full_text[:MAX_CHARS] + "\n\n[⚠️ 文件內容過長，已截取前段以符合模型限制]"

    return full_text
