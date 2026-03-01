import json
import logging

import anthropic
from pydantic import BaseModel

from app.config import get_settings

logger = logging.getLogger(__name__)


class SuggestedActionItem(BaseModel):
    title: str
    description: str
    priority: str


class AnalysisResult(BaseModel):
    sentiment: str
    summary: str
    action_items: list[SuggestedActionItem]


def analyze_reflection(
    content: str,
    project_name: str | None = None,
    client_name: str | None = None,
) -> AnalysisResult:
    settings = get_settings()
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    context_parts: list[str] = []
    if project_name:
        context_parts.append(f"Project: {project_name}")
    if client_name:
        context_parts.append(f"Client: {client_name}")
    context_block = "\n".join(context_parts)

    system_prompt = (
        "You are an AI assistant that analyzes personal reflections. "
        "You will be given a reflection entry and optional context about "
        "the related project or client. Your job is to:\n"
        "1. Determine the overall sentiment (one or two words, e.g. "
        '"positive", "frustrated", "cautiously optimistic", "neutral")\n'
        "2. Write a concise summary (1-3 sentences capturing the key points)\n"
        "3. Suggest concrete action items based on the reflection "
        "(0-5 items, only if genuinely warranted)\n\n"
        "Respond with ONLY valid JSON in this exact format, no markdown "
        "fences, no extra text:\n"
        "{\n"
        '  "sentiment": "...",\n'
        '  "summary": "...",\n'
        '  "action_items": [\n'
        '    {"title": "...", "description": "...", "priority": "..."}\n'
        "  ]\n"
        "}\n\n"
        "Priority must be one of: low, medium, high, urgent.\n"
        "If no action items are warranted, return an empty list."
    )

    user_message = f"Reflection:\n{content}"
    if context_block:
        user_message = f"{context_block}\n\n{user_message}"

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    raw_text = response.content[0].text
    parsed = json.loads(raw_text)
    return AnalysisResult.model_validate(parsed)
