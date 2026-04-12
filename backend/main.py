from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from dotenv import load_dotenv

from services.pdf_service import extract_text_from_pdf
from services.orchestrator import generate_all_personas
from services.prompt_loader import load_all_prompts, load_prompt, PERSONA_CONFIG

load_dotenv()

app = FastAPI(
    title="CUBE GenAI 投研顧問 API",
    description="基於 LangChain + Vertex AI 的超個人化投研摘要系統",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """服務健康檢查。"""
    return {"status": "ok", "version": "1.0.0"}


@app.get("/api/prompts")
async def get_all_prompts():
    """回傳所有客群的 System Prompt 內容（前端查看用）。"""
    try:
        prompts = load_all_prompts()
        return JSONResponse(content=prompts)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"載入提示詞失敗：{str(e)}")


@app.get("/api/prompts/{tag}")
async def get_prompt_by_tag(tag: str):
    """回傳指定客群的 System Prompt 內容。"""
    if tag not in PERSONA_CONFIG:
        raise HTTPException(
            status_code=404,
            detail=f"找不到客群標籤 '{tag}'。有效標籤：{list(PERSONA_CONFIG.keys())}",
        )
    try:
        content = load_prompt(tag)
        config = PERSONA_CONFIG[tag]
        return {
            "tag": tag,
            "label": config["label"],
            "icon": config["icon"],
            "color": config["color"],
            "content": content,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate")
async def generate_reports(file: UploadFile = File(...)):
    """
    上傳 PDF 文件，同步為三個客群生成個人化投研摘要。

    - 接受格式：PDF（.pdf）
    - 回傳：三個客群的個人化報告對比
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="只接受 .pdf 格式的檔案")

    file_bytes = await file.read()

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="上傳的檔案為空")

    # Step 1: 提取 PDF 文字
    try:
        document_text = extract_text_from_pdf(file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"PDF 解析失敗：{str(e)}")

    # Step 2: 三客群並發生成
    results = await generate_all_personas(document_text, file.filename)

    return {
        "status": "success",
        "document_name": file.filename,
        "results": results,
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
