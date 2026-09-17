import os

import httpx

from app.models.schemas import ConversationMessage, FAQEntry


class LLMClient:
    """Optional OpenAI-compatible generation adapter with a local fallback."""

    def __init__(self) -> None:
        self.api_key = os.getenv("LLM_API_KEY")
        self.endpoint = os.getenv("LLM_API_URL", "https://api.openai.com/v1/chat/completions")
        self.model = os.getenv("LLM_MODEL", "gpt-4o-mini")

    @property
    def configured(self) -> bool:
        return bool(self.api_key)

    async def answer(
        self,
        message: str,
        faq: FAQEntry,
        history: list[ConversationMessage],
    ) -> str | None:
        if not self.configured:
            return None
        messages = [
            {
                "role": "system",
                "content": "Answer the student's question using only the supplied FAQ context. If it is insufficient, say that support needs to review it.",
            },
            {"role": "system", "content": f"FAQ context:\nQuestion: {faq.question}\nAnswer: {faq.answer}"},
        ]
        messages.extend({"role": item.role, "content": item.content} for item in history[-6:] if item.role in {"user", "assistant"})
        messages.append({"role": "user", "content": message})
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    self.endpoint,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={"model": self.model, "messages": messages, "temperature": 0.2},
                )
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"]
                return content.strip() or None
        except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError):
            return None
