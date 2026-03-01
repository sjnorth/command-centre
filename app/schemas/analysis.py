from pydantic import BaseModel

from app.schemas.action_items import ActionItemRead
from app.schemas.reflections import ReflectionRead


class AnalysisResponse(BaseModel):
    reflection: ReflectionRead
    action_items: list[ActionItemRead]
