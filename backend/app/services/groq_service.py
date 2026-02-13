"""
Groq AI service – mirrors the original groqService.ts
Uses the OpenAI-compatible REST API
"""

import httpx
from app.config import get_settings

API_BASE = "https://api.groq.com/openai/v1"
CHAT_ENDPOINT = f"{API_BASE}/chat/completions"
EMBEDDINGS_ENDPOINT = f"{API_BASE}/embeddings"


def _get_api_key() -> str:
    key = get_settings().GROQ_API_KEY
    if not key:
        raise RuntimeError("GROQ_API_KEY is not set")
    return key


async def chat_complete(
    messages: list[dict],
    model: str = "llama-3.3-70b-versatile",
    temperature: float = 0.2,
) -> str:
    api_key = _get_api_key()
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(
            CHAT_ENDPOINT,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": messages,
                "temperature": temperature,
            },
        )
        if resp.status_code != 200:
            raise RuntimeError(f"Groq chat failed: {resp.status_code} {resp.text}")
        data = resp.json()
        return data.get("choices", [{}])[0].get("message", {}).get("content", "")


async def embed_texts(
    texts: list[str],
    model: str = "text-embedding-3-small",
) -> list[list[float]]:
    if not texts:
        return []
    api_key = _get_api_key()
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            EMBEDDINGS_ENDPOINT,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={"model": model, "input": texts},
        )
        if resp.status_code != 200:
            raise RuntimeError(f"Groq embeddings failed: {resp.status_code} {resp.text}")
        data = resp.json()
        return [d["embedding"] for d in data.get("data", [])]
